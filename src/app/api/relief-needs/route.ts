import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getRecessRemark, generateFinalRemarks, getDayOfWeekFromDate } from '@/lib/relief-utils';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const date = searchParams.get('date');
    const status = searchParams.get('status');

    const where: any = {};
    if (date) where.date = date;
    if (status) where.status = status;

    const reliefNeeds = await prisma.reliefNeed.findMany({
      where,
      include: {
        absentTeacher: { select: { id: true, name: true, department: true } },
        assignedReliefTeacher: { select: { id: true, name: true, department: true } },
      },
      orderBy: [
        { date: 'desc' },
        { periodNumber: 'asc' },
      ],
    });

    return NextResponse.json(reliefNeeds);
  } catch (error) {
    console.error('Error fetching relief needs:', error);
    return NextResponse.json({ error: 'Failed to fetch relief needs' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { absentTeacherId, date, periodNumber, classLevel: inputLevel, room: inputRoom, customRemarks } = body;

    if (!absentTeacherId || !date || !periodNumber) {
      return NextResponse.json({ error: 'absentTeacherId, date, and periodNumber are required' }, { status: 400 });
    }

    const pNum = parseInt(periodNumber, 10);
    const dayOfWeek = getDayOfWeekFromDate(date);

    // Look up absent teacher's timetable entry for venueRemarks and defaults
    const ttEntry = await prisma.timetableEntry.findFirst({
      where: {
        teacherId: absentTeacherId,
        dayOfWeek: dayOfWeek,
        periodNumber: pNum,
      },
    });

    const classLevel = inputLevel || (ttEntry ? ttEntry.classLevel : 'P1');
    const room = inputRoom || (ttEntry ? ttEntry.room : 'General Classroom');
    const venueRemarks = ttEntry ? ttEntry.venueRemarks : `Go to ${room}.`;

    // Generate automated recess remark based on periodNumber, classLevel, and dayOfWeek
    const recessRemark = getRecessRemark(pNum, classLevel, dayOfWeek);

    // Concatenate venueRemarks + recessRemark (unless user provided explicit custom override)
    const finalRemarks = customRemarks || generateFinalRemarks(venueRemarks, recessRemark);

    const reliefNeed = await prisma.reliefNeed.create({
      data: {
        absentTeacherId,
        date,
        periodNumber: pNum,
        classLevel,
        room,
        status: 'Pending',
        finalRemarks,
      },
      include: {
        absentTeacher: true,
        assignedReliefTeacher: true,
      },
    });

    return NextResponse.json(reliefNeed, { status: 201 });
  } catch (error) {
    console.error('Error creating relief need:', error);
    return NextResponse.json({ error: 'Failed to create relief need' }, { status: 500 });
  }
}
