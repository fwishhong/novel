import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/world-settings
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const novelId = searchParams.get('novelId');

    if (!novelId) {
      return NextResponse.json({ error: 'novelId is required' }, { status: 400 });
    }

    const settings = await prisma.worldSetting.findMany({
      where: { novelId },
      orderBy: { importance: 'desc' },
    });

    return NextResponse.json(settings);
  } catch (error) {
    console.error('Error fetching world settings:', error);
    return NextResponse.json({ error: 'Failed to fetch world settings' }, { status: 500 });
  }
}

// POST /api/world-settings
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { novelId, category, title, description, importance } = body;

    if (!novelId || !category || !title) {
      return NextResponse.json(
        { error: 'novelId, category, and title are required' },
        { status: 400 }
      );
    }

    const setting = await prisma.worldSetting.create({
      data: {
        novelId,
        category,
        title,
        description,
        importance: importance || 5,
      },
    });

    return NextResponse.json(setting, { status: 201 });
  } catch (error) {
    console.error('Error creating world setting:', error);
    return NextResponse.json({ error: 'Failed to create world setting' }, { status: 500 });
  }
}

// PATCH /api/world-settings
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, ...data } = body;

    if (!id) {
      return NextResponse.json({ error: 'id is required' }, { status: 400 });
    }

    const setting = await prisma.worldSetting.update({
      where: { id },
      data,
    });

    return NextResponse.json(setting);
  } catch (error) {
    console.error('Error updating world setting:', error);
    return NextResponse.json({ error: 'Failed to update world setting' }, { status: 500 });
  }
}
