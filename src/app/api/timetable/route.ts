import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const dayOfWeek = searchParams.get('dayOfWeek');
    const teacherId = searchParams.get('teacherId');

    const where: any = {};
    if (dayOfWeek) where.dayOfWeek = dayOfWeek;
    if (teacherId) where.teacherId = teacherId;

    const entries = await prisma.timetableEntry.findMany({
      where,
      include: {
        teacher: {
          select: { id: true, name: true, department: true, partTime: true },
        },
      },
      orderBy: [
        { dayOfWeek: 'asc' },
        { periodNumber: 'asc' },
      ],
    });

    return NextResponse.json(entries);
  } catch (error) {
    console.error('Error fetching timetable:', error);
    return NextResponse.json({ error: 'Failed to fetch timetable' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { teacherId, dayOfWeek, periodNumber, activityName, classLevel, room, venueRemarks } = body;

    if (!teacherId || !dayOfWeek || !periodNumber || !classLevel || !room) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const entry = await prisma.timetableEntry.create({
      data: {
        teacherId,
        dayOfWeek,
        periodNumber: parseInt(periodNumber, 10),
        activityName: activityName || 'Class',
        classLevel,
        room,
        venueRemarks: venueRemarks || `Go to ${room}.`,
      },
      include: {
        teacher: true,
      },
    });

    return NextResponse.json(entry, { status: 201 });
  } catch (error) {
    console.error('Error creating timetable entry:', error);
    return NextResponse.json({ error: 'Failed to create timetable entry' }, { status: 500 });
  }
}
