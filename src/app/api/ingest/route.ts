import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { type, records } = body; // type: 'timetable' | 'special_programmes' | 'teachers'

    if (!records || !Array.isArray(records) || records.length === 0) {
      return NextResponse.json({ error: 'No valid records provided' }, { status: 400 });
    }

    let importedCount = 0;
    let createdTeachers = 0;

    // Helper map for teacher name -> id lookup
    const existingTeachers = await prisma.teacher.findMany();
    const teacherMap = new Map<string, string>();
    existingTeachers.forEach((t) => teacherMap.set(t.name.toLowerCase().trim(), t.id));

    const getOrCreateTeacherId = async (nameStr: string): Promise<string> => {
      const cleanName = nameStr.trim();
      const lower = cleanName.toLowerCase();
      if (teacherMap.has(lower)) {
        return teacherMap.get(lower)!;
      }
      const newTeacher = await prisma.teacher.create({
        data: {
          name: cleanName,
          department: 'General',
          partTime: false,
        },
      });
      teacherMap.set(lower, newTeacher.id);
      createdTeachers++;
      return newTeacher.id;
    };

    if (type === 'timetable') {
      for (const row of records) {
        const teacherName = row.teacherName || row.Teacher || row.Name || row.name;
        const dayOfWeek = row.dayOfWeek || row.Day || row.day;
        const periodNumber = parseInt(row.periodNumber || row.Period || row.period, 10);
        const classLevel = row.classLevel || row.Class || row.Level || row.level || 'P1';
        const room = row.room || row.Room || row.venue || 'Classroom';
        const venueRemarks = row.venueRemarks || row.Remarks || row.remarks || `Go to ${room}.`;
        const activityName = row.activityName || row.Activity || `${classLevel} Subject`;

        if (teacherName && dayOfWeek && !isNaN(periodNumber)) {
          const teacherId = await getOrCreateTeacherId(teacherName);
          await prisma.timetableEntry.create({
            data: {
              teacherId,
              dayOfWeek: dayOfWeek.trim(),
              periodNumber,
              activityName: activityName.trim(),
              classLevel: classLevel.trim(),
              room: room.trim(),
              venueRemarks: venueRemarks.trim(),
            },
          });
          importedCount++;
        }
      }
    } else if (type === 'special_programmes') {
      for (const row of records) {
        const teacherName = row.teacherName || row.Teacher || row.name;
        const date = row.date || row.Date;
        const eventName = row.eventName || row.Event || row.Activity || row.event;
        const periodNumber = row.periodNumber || row.Period ? parseInt(row.periodNumber || row.Period, 10) : null;
        const startTime = row.startTime || row.StartTime || null;
        const endTime = row.endTime || row.EndTime || null;
        const classLevel = row.classLevel || row.Class || null;

        if (teacherName && date && eventName) {
          const teacherId = await getOrCreateTeacherId(teacherName);
          await prisma.specialProgramme.create({
            data: {
              teacherId,
              date: date.trim(),
              periodNumber: periodNumber && !isNaN(periodNumber) ? periodNumber : null,
              startTime: startTime ? startTime.trim() : null,
              endTime: endTime ? endTime.trim() : null,
              eventName: eventName.trim(),
              classLevel: classLevel ? classLevel.trim() : null,
            },
          });
          importedCount++;
        }
      }
    } else if (type === 'teachers') {
      for (const row of records) {
        const name = row.name || row.Name;
        const department = row.department || row.Department || 'General';
        const partTime = Boolean(row.partTime || row.PartTime);

        if (name) {
          await getOrCreateTeacherId(name);
          importedCount++;
        }
      }
    }

    return NextResponse.json({
      success: true,
      importedCount,
      createdTeachers,
      message: `Successfully imported ${importedCount} ${type} records.`,
    });
  } catch (error) {
    console.error('Error ingesting data:', error);
    return NextResponse.json({ error: 'Failed to ingest data' }, { status: 500 });
  }
}
