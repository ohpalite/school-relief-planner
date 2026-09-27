import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getDayOfWeekFromDate, calculateLongestStreakWithPeriod } from '@/lib/relief-utils';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const date = searchParams.get('date');
    const periodNumber = searchParams.get('periodNumber');
    const absentTeacherId = searchParams.get('absentTeacherId');

    if (!date || !periodNumber) {
      return NextResponse.json(
        { error: 'date and periodNumber query parameters are required' },
        { status: 400 }
      );
    }

    const targetPeriod = parseInt(periodNumber, 10);
    const dayOfWeek = getDayOfWeekFromDate(date);

    // 1. Fetch system settings
    let settings = await prisma.systemSettings.findUnique({
      where: { id: 'default' },
    });
    if (!settings) {
      settings = {
        id: 'default',
        maxConsecutivePeriodsDay: 6,
        maxTotalPeriodsDay: 9,
        maxReliefPeriodsWeek: 5,
        updatedAt: new Date(),
      };
    }

    // 2. Fetch all teachers (except absent teacher)
    const teachers = await prisma.teacher.findMany({
      where: absentTeacherId ? { id: { not: absentTeacherId } } : {},
      orderBy: { name: 'asc' },
    });

    // 3. Fetch all timetable entries for this day of week
    const dayTimetableEntries = await prisma.timetableEntry.findMany({
      where: { dayOfWeek },
    });

    // 4. Fetch all special programmes for this date
    const dateSpecialProgrammes = await prisma.specialProgramme.findMany({
      where: { date },
    });

    // 5. Fetch all assigned relief needs for this date
    const dateReliefNeeds = await prisma.reliefNeed.findMany({
      where: {
        date,
        status: 'Assigned',
        assignedReliefTeacherId: { not: null },
      },
    });

    // Calculate candidate evaluations for each teacher
    const candidateEvaluations = teachers.map((teacher) => {
      const reasons: string[] = [];

      // A. Existing classes on this day of week
      const teacherTimetable = dayTimetableEntries.filter((e) => e.teacherId === teacher.id);
      const existingClassInTargetPeriod = teacherTimetable.find(
        (e) => e.periodNumber === targetPeriod
      );
      const hasExistingClass = !!existingClassInTargetPeriod;
      let existingClassDetail = '';
      if (hasExistingClass) {
        existingClassDetail = `${existingClassInTargetPeriod?.classLevel} in ${existingClassInTargetPeriod?.room} (${existingClassInTargetPeriod?.activityName})`;
        reasons.push(`Already has class: ${existingClassDetail}`);
      }

      // B. Special programme on this date
      const teacherProgrammes = dateSpecialProgrammes.filter(
        (p) => p.teacherId === teacher.id
      );
      const specialInTargetPeriod = teacherProgrammes.find(
        (p) => p.periodNumber === targetPeriod || (!p.periodNumber && p.eventName)
      );
      const hasSpecialProgramme = !!specialInTargetPeriod;
      let specialProgrammeDetail = '';
      if (hasSpecialProgramme) {
        specialProgrammeDetail = specialInTargetPeriod?.eventName || 'Special Activity';
        reasons.push(`On Special Programme: ${specialProgrammeDetail}`);
      }

      // C. Calculate current daily period load
      const ttPeriods = teacherTimetable.map((e) => e.periodNumber);
      const spPeriods = teacherProgrammes
        .map((p) => p.periodNumber)
        .filter((p): p is number => p !== null && p !== undefined);
      const reliefPeriodsToday = dateReliefNeeds
        .filter((r) => r.assignedReliefTeacherId === teacher.id)
        .map((r) => r.periodNumber);

      const allBusyPeriodsToday = Array.from(
        new Set([...ttPeriods, ...spPeriods, ...reliefPeriodsToday])
      );
      const currentDailyPeriods = allBusyPeriodsToday.length;

      // D. Check daily max limit
      const wouldTotalDailyPeriods = currentDailyPeriods + 1;
      const exceedsDailyMax = wouldTotalDailyPeriods > settings.maxTotalPeriodsDay;
      if (exceedsDailyMax) {
        reasons.push(
          `Exceeds daily max limit (${wouldTotalDailyPeriods}/${settings.maxTotalPeriodsDay} periods)`
        );
      }

      // E. Check consecutive periods streak
      const longestStreakIfAssigned = calculateLongestStreakWithPeriod(
        allBusyPeriodsToday,
        targetPeriod
      );
      const exceedsConsecutiveMax =
        longestStreakIfAssigned > settings.maxConsecutivePeriodsDay;
      if (exceedsConsecutiveMax) {
        reasons.push(
          `Exceeds consecutive limit (${longestStreakIfAssigned}/${settings.maxConsecutivePeriodsDay} unbroken periods)`
        );
      }

      // F. Weekly relief count check
      const currentWeeklyReliefs = dateReliefNeeds.filter(
        (r) => r.assignedReliefTeacherId === teacher.id
      ).length;
      const exceedsWeeklyReliefMax =
        currentWeeklyReliefs + 1 > settings.maxReliefPeriodsWeek;
      if (exceedsWeeklyReliefMax) {
        reasons.push(
          `Exceeds weekly relief quota (${currentWeeklyReliefs + 1}/${settings.maxReliefPeriodsWeek} reliefs)`
        );
      }

      // Overall eligibility
      const isEligible =
        !hasExistingClass &&
        !hasSpecialProgramme &&
        !exceedsDailyMax &&
        !exceedsConsecutiveMax &&
        !exceedsWeeklyReliefMax;

      if (isEligible) {
        reasons.push(`Fully eligible. Current daily load: ${currentDailyPeriods} periods.`);
      }

      return {
        teacher,
        isEligible,
        hasExistingClass,
        existingClassDetail,
        hasSpecialProgramme,
        specialProgrammeDetail,
        currentDailyPeriods,
        exceedsDailyMax,
        longestStreakIfAssigned,
        exceedsConsecutiveMax,
        currentWeeklyReliefs,
        exceedsWeeklyReliefMax,
        reasons,
      };
    });

    // Filter eligible candidates and rank them by lowest workload
    const eligibleCandidates = candidateEvaluations
      .filter((c) => c.isEligible)
      .sort((a, b) => {
        if (a.currentDailyPeriods !== b.currentDailyPeriods) {
          return a.currentDailyPeriods - b.currentDailyPeriods;
        }
        if (a.currentWeeklyReliefs !== b.currentWeeklyReliefs) {
          return a.currentWeeklyReliefs - b.currentWeeklyReliefs;
        }
        return a.teacher.name.localeCompare(b.teacher.name);
      })
      .map((c, index) => ({
        ...c,
        rank: index + 1,
      }));

    // Ineligible candidates sorted by name
    const ineligibleCandidates = candidateEvaluations
      .filter((c) => !c.isEligible)
      .sort((a, b) => a.teacher.name.localeCompare(b.teacher.name));

    return NextResponse.json({
      targetDate: date,
      targetPeriod,
      dayOfWeek,
      settings,
      eligibleCandidates,
      ineligibleCandidates,
      totalTeachers: teachers.length,
      eligibleCount: eligibleCandidates.length,
    });
  } catch (error) {
    console.error('Error running Relief Finder engine:', error);
    return NextResponse.json(
      { error: 'Failed to run Relief Finder engine' },
      { status: 500 }
    );
  }
}
