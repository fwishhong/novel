import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { aiService } from '@/lib/ai-service';
import { GenerationRequest } from '@/types';

// POST /api/generate - AI 内容生成
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      type,
      prompt,
      novelId,
      chapterNumber,
      tone,
      length,
      characterIds,
    } = body as {
      type: 'chapter' | 'scene' | 'dialogue' | 'outline' | 'continue' | 'polish';
      prompt: string;
      novelId: string;
      chapterNumber?: number;
      tone?: string;
      length?: 'short' | 'medium' | 'long';
      characterIds?: string[];
    };

    if (!novelId || !prompt) {
      return NextResponse.json(
        { error: 'novelId and prompt are required' },
        { status: 400 }
      );
    }

    // 获取小说及相关数据
    const novel = await prisma.novel.findUnique({
      where: { id: novelId },
      include: {
        characters: true,
        worldSettings: {
          where: { importance: { gte: 5 } },
        },
        memories: {
          where: { importance: { gte: 5 } },
          take: 10,
          orderBy: { importance: 'desc' },
        },
        plotPoints: {
          where: { status: { in: ['setup', 'developing'] } },
        },
      },
    });

    if (!novel) {
      return NextResponse.json({ error: 'Novel not found' }, { status: 404 });
    }

    // 获取相关角色
    let relevantCharacters = novel.characters;
    if (characterIds && characterIds.length > 0) {
      relevantCharacters = novel.characters.filter(c => characterIds.includes(c.id));
    }

    // 获取最近的章节内容作为上下文
    let recentContent = '';
    if (chapterNumber) {
      const recentChapters = await prisma.chapter.findMany({
        where: {
          novelId,
          number: { lte: chapterNumber },
        },
        orderBy: { number: 'desc' },
        take: 2,
      });

      recentContent = recentChapters
        .reverse()
        .map(c => `第${c.number}章 ${c.title}\n${c.content || c.outline || ''}`)
        .join('\n\n');
    }

    // 构建生成上下文
    const context = {
      novelId,
      chapterNumber,
      recentContent: recentContent.slice(-3000), // 限制长度
      relevantCharacters: relevantCharacters.slice(0, 10),
      relevantMemories: novel.memories,
      worldSettings: novel.worldSettings,
      plotPoints: novel.plotPoints,
    };

    const generationRequest: GenerationRequest = {
      type: type === 'outline' || type === 'continue' || type === 'polish' ? 'chapter' : type,
      prompt,
      context,
      tone,
      length: length || 'medium',
    };

    let result = '';

    // 根据类型调用不同的生成方法
    switch (type) {
      case 'outline':
        result = await aiService.generateOutline(prompt, context);
        break;
      case 'continue':
        const existingContent = body.existingContent || '';
        result = await aiService.continueWriting(existingContent, prompt, context);
        break;
      case 'polish':
        const contentToPolish = body.content || '';
        result = await aiService.polishContent(contentToPolish);
        break;
      case 'dialogue':
        if (!characterIds || characterIds.length === 0) {
          return NextResponse.json(
            { error: 'characterIds required for dialogue generation' },
            { status: 400 }
          );
        }
        const character = relevantCharacters[0];
        result = await aiService.generateDialogue(character, prompt, context);
        break;
      case 'scene':
        result = await aiService.generateScene(prompt, relevantCharacters, context);
        break;
      default:
        result = await aiService.generateChapter(generationRequest);
    }

    return NextResponse.json({ content: result });
  } catch (error: any) {
    console.error('Generation error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to generate content' },
      { status: 500 }
    );
  }
}
