import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const date = searchParams.get('date');
    const teacherId = searchParams.get('teacherId');

    const where: any = {};
    if (date) where.date = date;
    if (teacherId) where.teacherId = teacherId;

    const programmes = await prisma.specialProgramme.findMany({
      where,
      include: {
        teacher: {
          select: { id: true, name: true, department: true },
        },
      },
      orderBy: { date: 'desc' },
    });

    return NextResponse.json(programmes);
  } catch (error) {
    console.error('Error fetching special programmes:', error);
    return NextResponse.json({ error: 'Failed to fetch special programmes' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { teacherId, date, periodNumber, startTime, endTime, eventName, classLevel } = body;

    if (!teacherId || !date || !eventName) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const programme = await prisma.specialProgramme.create({
      data: {
        teacherId,
        date,
        periodNumber: periodNumber ? parseInt(periodNumber, 10) : null,
        startTime: startTime || null,
        endTime: endTime || null,
        eventName,
        classLevel: classLevel || null,
      },
      include: {
        teacher: true,
      },
    });

    return NextResponse.json(programme, { status: 201 });
  } catch (error) {
    console.error('Error creating special programme:', error);
    return NextResponse.json({ error: 'Failed to create special programme' }, { status: 500 });
  }
}
