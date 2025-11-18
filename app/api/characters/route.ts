import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/characters - 获取角色列表
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const novelId = searchParams.get('novelId');

    if (!novelId) {
      return NextResponse.json({ error: 'novelId is required' }, { status: 400 });
    }

    const characters = await prisma.character.findMany({
      where: { novelId },
      include: {
        relationships: {
          include: {
            toCharacter: true,
          },
        },
        relationshipsTo: {
          include: {
            fromCharacter: true,
          },
        },
        developmentEvents: {
          orderBy: { createdAt: 'desc' },
        },
        _count: {
          select: {
            appearances: true,
          },
        },
      },
      orderBy: { createdAt: 'asc' },
    });

    return NextResponse.json(characters);
  } catch (error) {
    console.error('Error fetching characters:', error);
    return NextResponse.json({ error: 'Failed to fetch characters' }, { status: 500 });
  }
}

// POST /api/characters - 创建新角色
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      novelId,
      name,
      age,
      gender,
      personality,
      background,
      appearance,
      abilities,
      goals,
      speechPattern,
      importance,
      status,
    } = body;

    if (!novelId || !name) {
      return NextResponse.json(
        { error: 'novelId and name are required' },
        { status: 400 }
      );
    }

    const character = await prisma.character.create({
      data: {
        novelId,
        name,
        age,
        gender,
        personality,
        background,
        appearance,
        abilities,
        goals,
        speechPattern,
        importance: importance || 'main',
        status: status || 'alive',
      },
    });

    return NextResponse.json(character, { status: 201 });
  } catch (error) {
    console.error('Error creating character:', error);
    return NextResponse.json({ error: 'Failed to create character' }, { status: 500 });
  }
}
