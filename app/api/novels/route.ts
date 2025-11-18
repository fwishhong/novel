import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/novels - 获取所有小说
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get('userId') || 'default-user';

    const novels = await prisma.novel.findMany({
      where: { userId },
      include: {
        _count: {
          select: {
            chapters: true,
            characters: true,
          },
        },
      },
      orderBy: { updatedAt: 'desc' },
    });

    return NextResponse.json(novels);
  } catch (error) {
    console.error('Error fetching novels:', error);
    return NextResponse.json({ error: 'Failed to fetch novels' }, { status: 500 });
  }
}

// POST /api/novels - 创建新小说
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, genre, description, outline, userId = 'default-user' } = body;

    if (!title) {
      return NextResponse.json({ error: 'Title is required' }, { status: 400 });
    }

    // 创建用户（如果不存在）
    await prisma.user.upsert({
      where: { id: userId },
      update: {},
      create: {
        id: userId,
        email: 'user@example.com',
        name: 'Default User',
      },
    });

    const novel = await prisma.novel.create({
      data: {
        title,
        genre,
        description,
        outline,
        userId,
      },
    });

    return NextResponse.json(novel, { status: 201 });
  } catch (error) {
    console.error('Error creating novel:', error);
    return NextResponse.json({ error: 'Failed to create novel' }, { status: 500 });
  }
}
