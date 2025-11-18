import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/memories
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const novelId = searchParams.get('novelId');

    if (!novelId) {
      return NextResponse.json({ error: 'novelId is required' }, { status: 400 });
    }

    const memories = await prisma.memory.findMany({
      where: { novelId },
      include: {
        relatedCharacters: true,
      },
      orderBy: { importance: 'desc' },
    });

    return NextResponse.json(memories);
  } catch (error) {
    console.error('Error fetching memories:', error);
    return NextResponse.json({ error: 'Failed to fetch memories' }, { status: 500 });
  }
}

// POST /api/memories
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { novelId, type, content, context, importance, chapterNumber, characterIds } = body;

    if (!novelId || !type || !content) {
      return NextResponse.json(
        { error: 'novelId, type, and content are required' },
        { status: 400 }
      );
    }

    const memory = await prisma.memory.create({
      data: {
        novelId,
        type,
        content,
        context,
        importance: importance || 5,
        chapterNumber,
        relatedCharacters: characterIds
          ? {
              connect: characterIds.map((id: string) => ({ id })),
            }
          : undefined,
      },
      include: {
        relatedCharacters: true,
      },
    });

    return NextResponse.json(memory, { status: 201 });
  } catch (error) {
    console.error('Error creating memory:', error);
    return NextResponse.json({ error: 'Failed to create memory' }, { status: 500 });
  }
}
