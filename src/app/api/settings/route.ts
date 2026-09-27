import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    let settings = await prisma.systemSettings.findUnique({
      where: { id: 'default' },
    });

    if (!settings) {
      settings = await prisma.systemSettings.create({
        data: {
          id: 'default',
          maxConsecutivePeriodsDay: 6,
          maxTotalPeriodsDay: 9,
          maxReliefPeriodsWeek: 5,
        },
      });
    }

    return NextResponse.json(settings);
  } catch (error) {
    console.error('Error fetching settings:', error);
    return NextResponse.json({ error: 'Failed to fetch settings' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { maxConsecutivePeriodsDay, maxTotalPeriodsDay, maxReliefPeriodsWeek } = body;

    const settings = await prisma.systemSettings.upsert({
      where: { id: 'default' },
      update: {
        maxConsecutivePeriodsDay: parseInt(maxConsecutivePeriodsDay, 10) || 6,
        maxTotalPeriodsDay: parseInt(maxTotalPeriodsDay, 10) || 9,
        maxReliefPeriodsWeek: parseInt(maxReliefPeriodsWeek, 10) || 5,
      },
      create: {
        id: 'default',
        maxConsecutivePeriodsDay: parseInt(maxConsecutivePeriodsDay, 10) || 6,
        maxTotalPeriodsDay: parseInt(maxTotalPeriodsDay, 10) || 9,
        maxReliefPeriodsWeek: parseInt(maxReliefPeriodsWeek, 10) || 5,
      },
    });

    return NextResponse.json(settings);
  } catch (error) {
    console.error('Error updating settings:', error);
    return NextResponse.json({ error: 'Failed to update settings' }, { status: 500 });
  }
}
