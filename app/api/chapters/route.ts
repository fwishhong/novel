import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/chapters
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const novelId = searchParams.get('novelId');

    if (!novelId) {
      return NextResponse.json({ error: 'novelId is required' }, { status: 400 });
    }

    const chapters = await prisma.chapter.findMany({
      where: { novelId },
      include: {
        scenes: {
          include: {
            characters: true,
          },
          orderBy: { order: 'asc' },
        },
        plotPoints: true,
      },
      orderBy: { number: 'asc' },
    });

    return NextResponse.json(chapters);
  } catch (error) {
    console.error('Error fetching chapters:', error);
    return NextResponse.json({ error: 'Failed to fetch chapters' }, { status: 500 });
  }
}

// POST /api/chapters
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { novelId, title, outline, content } = body;

    if (!novelId || !title) {
      return NextResponse.json(
        { error: 'novelId and title are required' },
        { status: 400 }
      );
    }

    // 获取当前最大章节号
    const lastChapter = await prisma.chapter.findFirst({
      where: { novelId },
      orderBy: { number: 'desc' },
    });

    const nextNumber = lastChapter ? lastChapter.number + 1 : 1;

    // 计算字数
    const wordCount = content ? content.length : 0;

    const chapter = await prisma.chapter.create({
      data: {
        novelId,
        number: nextNumber,
        title,
        outline,
        content,
        wordCount,
      },
      include: {
        scenes: true,
        plotPoints: true,
      },
    });

    return NextResponse.json(chapter, { status: 201 });
  } catch (error) {
    console.error('Error creating chapter:', error);
    return NextResponse.json({ error: 'Failed to create chapter' }, { status: 500 });
  }
}
