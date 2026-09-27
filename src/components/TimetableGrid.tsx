'use client';

import { useState } from 'react';
import { Teacher, TimetableEntry, SpecialProgramme, ReliefNeed, SystemSettings } from '@/types';
import { PERIOD_TIMINGS, calculateLongestStreakWithPeriod } from '@/lib/relief-utils';
import { AlertTriangle, Plus, Search, UserCheck, ShieldAlert, Sparkles, Filter } from 'lucide-react';

interface TimetableGridProps {
  teachers: Teacher[];
  timetableEntries: TimetableEntry[];
  specialProgrammes: SpecialProgramme[];
  reliefNeeds: ReliefNeed[];
  settings: SystemSettings;
  selectedDay: string;
  onOpenReliefFinder: (teacherId: string, periodNumber: number) => void;
}

export default function TimetableGrid({
  teachers,
  timetableEntries,
  specialProgrammes,
  reliefNeeds,
  settings,
  selectedDay,
  onOpenReliefFinder,
}: TimetableGridProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('All');
  const [partTimeFilter, setPartTimeFilter] = useState('All');

  const departments = ['All', ...Array.from(new Set(teachers.map((t) => t.department)))];

  // Filter teachers based on search query, department, and part-time status
  const filteredTeachers = teachers.filter((t) => {
    const matchesSearch = t.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDept = departmentFilter === 'All' || t.department === departmentFilter;
    const matchesPT =
      partTimeFilter === 'All' ||
      (partTimeFilter === 'PartTime' && t.partTime) ||
      (partTimeFilter === 'FullTime' && !t.partTime);
    return matchesSearch && matchesDept && matchesPT;
  });

  return (
    <div className="space-y-4">
      {/* Search & Filter Header Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search teacher by name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="flex items-center gap-2">
            <Filter className="w-3.5 h-3.5 text-slate-400 hidden sm:block" />
            <select
              value={departmentFilter}
              onChange={(e) => setDepartmentFilter(e.target.value)}
              className="bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
            >
              {departments.map((d) => (
                <option key={d} value={d}>
                  {d === 'All' ? 'All Depts' : d}
                </option>
              ))}
            </select>

            <select
              value={partTimeFilter}
              onChange={(e) => setPartTimeFilter(e.target.value)}
              className="bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
            >
              <option value="All">All Types</option>
              <option value="FullTime">Full-Time</option>
              <option value="PartTime">Part-Time</option>
            </select>
          </div>
        </div>

        <div className="flex items-center gap-4 text-xs text-slate-400">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-indigo-500" />
            <span>Class</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
            <span>Special Event</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
            <span>Relief Duty</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-slate-800" />
            <span>Free</span>
          </div>
        </div>
      </div>

      {/* Grid Table Container */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-x-auto shadow-xl">
        <table className="w-full text-left border-collapse min-w-[1200px]">
          <thead>
            <tr className="bg-slate-950 border-b border-slate-800 text-slate-400 text-[11px] font-semibold uppercase tracking-wider">
              <th className="p-3 w-48 sticky left-0 z-20 bg-slate-950 border-r border-slate-800">
                Teacher ({filteredTeachers.length})
              </th>
              <th className="p-2 text-center border-r border-slate-800/60 w-16">Load</th>
              {PERIOD_TIMINGS.map((pt) => (
                <th
                  key={pt.period}
                  className="p-2 text-center border-r border-slate-800/60 font-mono text-[10px]"
                >
                  <div>P{pt.period}</div>
                  <div className="text-slate-500 font-normal">{pt.startTime}</div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 text-xs">
            {filteredTeachers.map((teacher) => {
              // Get teacher's classes for selected day
              const teacherEntries = timetableEntries.filter(
                (e) => e.teacherId === teacher.id && e.dayOfWeek === selectedDay
              );
              // Get teacher's special programmes
              const teacherProgrammes = specialProgrammes.filter(
                (sp) => sp.teacherId === teacher.id
              );
              // Get teacher's assigned relief needs
              const teacherReliefs = reliefNeeds.filter(
                (rn) => rn.assignedReliefTeacherId === teacher.id
              );

              // Calculate total periods for this teacher today
              const classPeriods = teacherEntries.map((e) => e.periodNumber);
              const spPeriods = teacherProgrammes
                .map((sp) => sp.periodNumber)
                .filter((p): p is number => p !== null && p !== undefined);
              const reliefPeriods = teacherReliefs.map((r) => r.periodNumber);

              const allBusyPeriods = Array.from(
                new Set([...classPeriods, ...spPeriods, ...reliefPeriods])
              );
              const totalPeriodsToday = allBusyPeriods.length;

              // Streak calculation
              const longestStreak = calculateLongestStreakWithPeriod(allBusyPeriods, 0);

              const isTotalExceeded = totalPeriodsToday >= settings.maxTotalPeriodsDay;
              const isStreakExceeded = longestStreak >= settings.maxConsecutivePeriodsDay;

              return (
                <tr key={teacher.id} className="hover:bg-slate-800/40 transition-colors">
                  {/* Teacher Column */}
                  <td className="p-3 font-medium sticky left-0 z-10 bg-slate-900 border-r border-slate-800 flex items-center justify-between">
                    <div>
                      <div className="font-semibold text-slate-100">{teacher.name}</div>
                      <div className="text-[10px] text-slate-400">
                        {teacher.department} {teacher.partTime && '• PT'}
                      </div>
                    </div>

                    {(isTotalExceeded || isStreakExceeded) && (
                      <div
                        className="flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded bg-amber-500/10 border border-amber-500/30 text-amber-400"
                        title={
                          isTotalExceeded
                            ? `Heavy Load Warning: ${totalPeriodsToday}/${settings.maxTotalPeriodsDay} periods`
                            : `Streak Warning: ${longestStreak}/${settings.maxConsecutivePeriodsDay} consecutive`
                        }
                      >
                        <AlertTriangle className="w-3 h-3 text-amber-400" />
                      </div>
                    )}
                  </td>

                  {/* Daily Load Count */}
                  <td className="p-2 text-center border-r border-slate-800/60 font-mono text-xs">
                    <span
                      className={`px-2 py-0.5 rounded-full font-bold text-[11px] ${
                        isTotalExceeded
                          ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                          : 'bg-slate-800 text-slate-300'
                      }`}
                    >
                      {totalPeriodsToday}
                    </span>
                  </td>

                  {/* Period 1..12 Cells */}
                  {PERIOD_TIMINGS.map((pt) => {
                    const entry = teacherEntries.find((e) => e.periodNumber === pt.period);
                    const sp = teacherProgrammes.find((s) => s.periodNumber === pt.period);
                    const relief = teacherReliefs.find((r) => r.periodNumber === pt.period);

                    return (
                      <td
                        key={pt.period}
                        className="p-1 border-r border-slate-800/60 text-center align-middle h-14"
                      >
                        {entry ? (
                          <div className="h-full bg-indigo-950/80 border border-indigo-500/30 rounded-lg p-1 text-[10px] flex flex-col justify-center items-center">
                            <span className="font-bold text-indigo-200">{entry.classLevel}</span>
                            <span className="text-indigo-400 truncate max-w-[70px]">{entry.room}</span>
                          </div>
                        ) : sp ? (
                          <div className="h-full bg-amber-950/80 border border-amber-500/30 rounded-lg p-1 text-[10px] flex flex-col justify-center items-center">
                            <span className="font-bold text-amber-200 truncate max-w-[70px]">
                              {sp.eventName}
                            </span>
                            <span className="text-amber-400">Special</span>
                          </div>
                        ) : relief ? (
                          <div className="h-full bg-emerald-950/80 border border-emerald-500/30 rounded-lg p-1 text-[10px] flex flex-col justify-center items-center">
                            <span className="font-bold text-emerald-200">Relief: {relief.classLevel}</span>
                            <span className="text-emerald-400">{relief.room}</span>
                          </div>
                        ) : (
                          <div className="h-full group relative flex items-center justify-center">
                            <span className="text-[10px] text-slate-600 group-hover:hidden">Free</span>
                            <button
                              onClick={() => onOpenReliefFinder(teacher.id, pt.period)}
                              className="hidden group-hover:flex items-center gap-1 text-[10px] bg-indigo-600 hover:bg-indigo-500 text-white font-medium px-2 py-1 rounded transition-colors shadow"
                              title={`Assign ${teacher.name} to relief for Period ${pt.period}`}
                            >
                              <Plus className="w-3 h-3" /> Relief
                            </button>
                          </div>
                        )}
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
