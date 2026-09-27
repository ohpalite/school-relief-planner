export interface PeriodTiming {
  period: number;
  startTime: string;
  endTime: string;
  durationMinutes: number;
}

export const PERIOD_TIMINGS: PeriodTiming[] = [
  { period: 1, startTime: "07:45", endTime: "08:15", durationMinutes: 30 },
  { period: 2, startTime: "08:15", endTime: "08:45", durationMinutes: 30 },
  { period: 3, startTime: "08:45", endTime: "09:15", durationMinutes: 30 },
  { period: 4, startTime: "09:15", endTime: "09:45", durationMinutes: 30 },
  { period: 5, startTime: "09:45", endTime: "10:15", durationMinutes: 30 },
  { period: 6, startTime: "10:15", endTime: "10:45", durationMinutes: 30 },
  { period: 7, startTime: "10:45", endTime: "11:15", durationMinutes: 30 },
  { period: 8, startTime: "11:15", endTime: "11:45", durationMinutes: 30 },
  { period: 9, startTime: "11:45", endTime: "12:15", durationMinutes: 30 },
  { period: 10, startTime: "12:15", endTime: "12:40", durationMinutes: 25 },
  { period: 11, startTime: "12:40", endTime: "13:05", durationMinutes: 25 },
  { period: 12, startTime: "13:05", endTime: "13:30", durationMinutes: 25 },
];

/**
 * Standardized Recess Remark function based on period number, class level, and day of week.
 */
export function getRecessRemark(
  periodNumber: number,
  level: string,
  dayOfWeek: string
): string {
  const normLevel = level ? level.trim().toUpperCase() : "";
  const normDay = dayOfWeek ? dayOfWeek.trim().toUpperCase() : "";
  const isMonday = normDay === "MONDAY" || normDay === "MON" || normDay === "1";

  const remarks: string[] = [];

  if (periodNumber === 3) {
    if (normLevel === "P3" || normLevel === "P5") {
      remarks.push("Send for recess at 9:15am.");
    }
  }

  if (periodNumber === 4) {
    if ((normLevel === "P4" || normLevel === "P5" || normLevel === "P6") && isMonday) {
      remarks.push("Pick up from hall at 9:15am. (Mondays Only)");
    }
    if (normLevel === "P1" || normLevel === "P6") {
      remarks.push("Send for recess at 9:45am.");
    }
  }

  if (periodNumber === 5) {
    if (normLevel === "P3" || normLevel === "P5") {
      remarks.push("Pick up from recess at 9:45am.");
    }
    if (normLevel === "P2" || normLevel === "P4") {
      remarks.push("Send for recess at 10:15am.");
    }
  }

  if (periodNumber === 6) {
    if (normLevel === "P1" || normLevel === "P6") {
      remarks.push("Pick up from recess at 10:15am.");
    }
  }

  if (periodNumber === 7) {
    if (normLevel === "P2" || normLevel === "P4") {
      remarks.push("Pick up from recess at 10:45am.");
    }
  }

  return remarks.join(" ");
}

/**
 * Combines venue remarks and recess instructions into final remarks.
 */
export function generateFinalRemarks(
  venueRemarks: string,
  recessRemark: string
): string {
  const cleanVenue = venueRemarks ? venueRemarks.trim() : "";
  const cleanRecess = recessRemark ? recessRemark.trim() : "";

  if (cleanVenue && cleanRecess) {
    return `${cleanVenue} ${cleanRecess}`;
  }
  return cleanVenue || cleanRecess || "";
}

/**
 * Helper to get day name from a YYYY-MM-DD date string.
 */
export function getDayOfWeekFromDate(dateStr: string): string {
  if (!dateStr) return "Monday";
  const dateObj = new Date(dateStr);
  if (isNaN(dateObj.getTime())) return "Monday";
  const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  return days[dateObj.getDay()];
}

/**
 * Helper to calculate unbroken consecutive block if candidate period is added.
 */
export function calculateLongestStreakWithPeriod(
  busyPeriods: number[],
  candidatePeriod: number
): number {
  const set = new Set([...busyPeriods, candidatePeriod]);
  let maxStreak = 0;
  let currentStreak = 0;

  for (let p = 1; p <= 12; p++) {
    if (set.has(p)) {
      currentStreak++;
      if (currentStreak > maxStreak) {
        maxStreak = currentStreak;
      }
    } else {
      currentStreak = 0;
    }
  }

  return maxStreak;
}
