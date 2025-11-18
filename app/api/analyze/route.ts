import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { aiService } from '@/lib/ai-service';
import { analyzeReadability, detectRepetitiveWords, analyzeTension } from '@/lib/readability';

// POST /api/analyze - 分析内容
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { type, content, novelId, chapterId } = body as {
      type: 'consistency' | 'readability' | 'repetition' | 'tension';
      content?: string;
      novelId?: string;
      chapterId?: string;
    };

    if (type === 'consistency') {
      // 一致性检查
      if (!content || !novelId) {
        return NextResponse.json(
          { error: 'content and novelId are required for consistency check' },
          { status: 400 }
        );
      }

      const novel = await prisma.novel.findUnique({
        where: { id: novelId },
        include: {
          characters: true,
          worldSettings: true,
          memories: {
            where: { importance: { gte: 5 } },
          },
          plotPoints: true,
        },
      });

      if (!novel) {
        return NextResponse.json({ error: 'Novel not found' }, { status: 404 });
      }

      const context = {
        novelId,
        relevantCharacters: novel.characters,
        relevantMemories: novel.memories,
        worldSettings: novel.worldSettings,
        plotPoints: novel.plotPoints,
      };

      const checks = await aiService.checkConsistency(content, context);
      return NextResponse.json({ checks });
    }

    if (type === 'readability') {
      // 可读性分析
      if (!content) {
        return NextResponse.json({ error: 'content is required' }, { status: 400 });
      }

      const metrics = analyzeReadability(content);
      return NextResponse.json({ metrics });
    }

    if (type === 'repetition') {
      // 重复词检测
      if (!content) {
        return NextResponse.json({ error: 'content is required' }, { status: 400 });
      }

      const repetitiveWords = detectRepetitiveWords(content);
      return NextResponse.json({ repetitiveWords });
    }

    if (type === 'tension') {
      // 情节张力分析
      if (!novelId) {
        return NextResponse.json({ error: 'novelId is required' }, { status: 400 });
      }

      const chapters = await prisma.chapter.findMany({
        where: { novelId },
        select: {
          number: true,
          content: true,
        },
        orderBy: { number: 'asc' },
      });

      const tensionCurve = analyzeTension(
        chapters.map(c => ({ number: c.number, content: c.content || '' }))
      );

      return NextResponse.json({ tensionCurve });
    }

    return NextResponse.json({ error: 'Invalid analysis type' }, { status: 400 });
  } catch (error: any) {
    console.error('Analysis error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to analyze content' },
      { status: 500 }
    );
  }
}
