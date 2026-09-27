import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const teachers = await prisma.teacher.findMany({
      orderBy: { name: 'asc' },
      include: {
        _count: {
          select: {
            timetableEntries: true,
            specialProgrammes: true,
            assignedReliefs: true,
          },
        },
      },
    });

    return NextResponse.json(teachers);
  } catch (error) {
    console.error('Error fetching teachers:', error);
    return NextResponse.json({ error: 'Failed to fetch teachers' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, department, partTime } = body;

    if (!name) {
      return NextResponse.json({ error: 'Teacher name is required' }, { status: 400 });
    }

    const teacher = await prisma.teacher.create({
      data: {
        name,
        department: department || 'General',
        partTime: Boolean(partTime),
      },
    });

    return NextResponse.json(teacher, { status: 201 });
  } catch (error: any) {
    console.error('Error creating teacher:', error);
    if (error.code === 'P2002') {
      return NextResponse.json({ error: 'Teacher with this name already exists' }, { status: 400 });
    }
    return NextResponse.json({ error: 'Failed to create teacher' }, { status: 500 });
  }
}
