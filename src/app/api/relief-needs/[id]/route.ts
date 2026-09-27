import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { assignedReliefTeacherId, status, finalRemarks } = body;

    const data: any = {};
    if (assignedReliefTeacherId !== undefined) {
      data.assignedReliefTeacherId = assignedReliefTeacherId;
      data.status = assignedReliefTeacherId ? 'Assigned' : 'Pending';
    }
    if (status !== undefined) {
      data.status = status;
    }
    if (finalRemarks !== undefined) {
      data.finalRemarks = finalRemarks;
    }

    const updated = await prisma.reliefNeed.update({
      where: { id },
      data,
      include: {
        absentTeacher: true,
        assignedReliefTeacher: true,
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error('Error updating relief need:', error);
    return NextResponse.json({ error: 'Failed to update relief need' }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await prisma.reliefNeed.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting relief need:', error);
    return NextResponse.json({ error: 'Failed to delete relief need' }, { status: 500 });
  }
}
