import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/novels/[id] - 获取单个小说详情
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const novel = await prisma.novel.findUnique({
      where: { id },
      include: {
        characters: {
          include: {
            relationships: {
              include: {
                toCharacter: true,
              },
            },
          },
        },
        chapters: {
          include: {
            scenes: {
              include: {
                characters: true,
              },
            },
            plotPoints: true,
          },
          orderBy: { number: 'asc' },
        },
        worldSettings: {
          orderBy: { importance: 'desc' },
        },
        memories: {
          include: {
            relatedCharacters: true,
          },
          orderBy: { importance: 'desc' },
        },
        timelines: {
          orderBy: { createdAt: 'asc' },
        },
        plotPoints: {
          orderBy: { importance: 'desc' },
        },
      },
    });

    if (!novel) {
      return NextResponse.json({ error: 'Novel not found' }, { status: 404 });
    }

    return NextResponse.json(novel);
  } catch (error) {
    console.error('Error fetching novel:', error);
    return NextResponse.json({ error: 'Failed to fetch novel' }, { status: 500 });
  }
}

// PATCH /api/novels/[id] - 更新小说
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    const novel = await prisma.novel.update({
      where: { id },
      data: body,
    });

    return NextResponse.json(novel);
  } catch (error) {
    console.error('Error updating novel:', error);
    return NextResponse.json({ error: 'Failed to update novel' }, { status: 500 });
  }
}

// DELETE /api/novels/[id] - 删除小说
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    await prisma.novel.delete({
      where: { id },
    });

    return NextResponse.json({ message: 'Novel deleted successfully' });
  } catch (error) {
    console.error('Error deleting novel:', error);
    return NextResponse.json({ error: 'Failed to delete novel' }, { status: 500 });
  }
}
