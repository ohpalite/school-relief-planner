export interface Teacher {
  id: string;
  name: string;
  department: string;
  partTime: boolean;
  createdAt?: string;
  updatedAt?: string;
  _count?: {
    timetableEntries?: number;
    specialProgrammes?: number;
    assignedReliefs?: number;
  };
}

export interface TimetableEntry {
  id: string;
  teacherId: string;
  teacher?: Teacher;
  dayOfWeek: string;
  periodNumber: number;
  activityName: string;
  classLevel: string;
  room: string;
  venueRemarks: string;
}

export interface SpecialProgramme {
  id: string;
  teacherId: string;
  teacher?: Teacher;
  date: string;
  periodNumber?: number | null;
  startTime?: string | null;
  endTime?: string | null;
  eventName: string;
  classLevel?: string | null;
}

export interface ReliefNeed {
  id: string;
  absentTeacherId: string;
  absentTeacher?: Teacher;
  date: string;
  periodNumber: number;
  classLevel: string;
  room: string;
  assignedReliefTeacherId?: string | null;
  assignedReliefTeacher?: Teacher | null;
  status: 'Pending' | 'Assigned';
  finalRemarks: string;
  createdAt?: string;
}

export interface SystemSettings {
  id: string;
  maxConsecutivePeriodsDay: number;
  maxTotalPeriodsDay: number;
  maxReliefPeriodsWeek: number;
}

export interface CandidateEvaluation {
  teacher: Teacher;
  isEligible: boolean;
  hasExistingClass: boolean;
  existingClassDetail?: string;
  hasSpecialProgramme: boolean;
  specialProgrammeDetail?: string;
  currentDailyPeriods: number;
  exceedsDailyMax: boolean;
  longestStreakIfAssigned: number;
  exceedsConsecutiveMax: boolean;
  currentWeeklyReliefs: number;
  exceedsWeeklyReliefMax: boolean;
  reasons: string[];
  rank?: number;
}
