'use client';

import { useState, useEffect } from 'react';
import { Teacher, TimetableEntry, SpecialProgramme, ReliefNeed, SystemSettings } from '@/types';
import TimetableGrid from '@/components/TimetableGrid';
import ReliefFinderModal from '@/components/ReliefFinderModal';
import { Calendar, RefreshCw, UserCheck } from 'lucide-react';

export default function MasterTimetablePage() {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [timetableEntries, setTimetableEntries] = useState<TimetableEntry[]>([]);
  const [specialProgrammes, setSpecialProgrammes] = useState<SpecialProgramme[]>([]);
  const [reliefNeeds, setReliefNeeds] = useState<ReliefNeed[]>([]);
  const [settings, setSettings] = useState<SystemSettings>({
    id: 'default',
    maxConsecutivePeriodsDay: 6,
    maxTotalPeriodsDay: 9,
    maxReliefPeriodsWeek: 5,
  });

  const [selectedDay, setSelectedDay] = useState<string>('Monday');
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Modal State
  const [isFinderOpen, setIsFinderOpen] = useState(false);
  const [prefilledNeed, setPrefilledNeed] = useState<ReliefNeed | null>(null);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const [tRes, ttRes, spRes, rnRes, sRes] = await Promise.all([
        fetch('/api/teachers'),
        fetch(`/api/timetable?dayOfWeek=${selectedDay}`),
        fetch('/api/special-programmes'),
        fetch('/api/relief-needs'),
        fetch('/api/settings'),
      ]);

      if (tRes.ok) setTeachers(await tRes.json());
      if (ttRes.ok) setTimetableEntries(await ttRes.json());
      if (spRes.ok) setSpecialProgrammes(await spRes.json());
      if (rnRes.ok) setReliefNeeds(await rnRes.json());
      if (sRes.ok) setSettings(await sRes.json());
    } catch (err) {
      console.error('Error loading master timetable:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [selectedDay]);

  const handleOpenFinderForFreePeriod = (teacherId: string, periodNumber: number) => {
    const todayStr = new Date().toISOString().split('T')[0];
    const dummyNeed: ReliefNeed = {
      id: '',
      absentTeacherId: teacherId,
      date: todayStr,
      periodNumber,
      classLevel: 'P1',
      room: '1 Faith',
      status: 'Pending',
      finalRemarks: '',
    };
    setPrefilledNeed(dummyNeed);
    setIsFinderOpen(true);
  };

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

  return (
    <div className="space-y-6 pb-12">
      {/* Page Header & Day Selector */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl">
        <div>
          <h1 className="text-xl font-black text-slate-100 flex items-center gap-2">
            <Calendar className="w-6 h-6 text-indigo-400" />
            Consolidated Deployment Master Timetable
          </h1>
          <p className="text-xs text-slate-400">
            Master 12-period deployment grid across all staff with load warning triggers
          </p>
        </div>

        {/* Day Selector Tabs */}
        <div className="flex items-center gap-1.5 bg-slate-950 p-1.5 rounded-xl border border-slate-800">
          {days.map((day) => (
            <button
              key={day}
              onClick={() => setSelectedDay(day)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                selectedDay === day
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {day}
            </button>
          ))}
        </div>
      </div>

      {/* Timetable Grid View */}
      {isLoading ? (
        <div className="p-12 text-center bg-slate-900 border border-slate-800 rounded-2xl">
          <RefreshCw className="w-8 h-8 text-indigo-400 animate-spin mx-auto mb-2" />
          <p className="text-sm font-semibold text-slate-300">Loading Master Timetable for {selectedDay}...</p>
        </div>
      ) : (
        <TimetableGrid
          teachers={teachers}
          timetableEntries={timetableEntries}
          specialProgrammes={specialProgrammes}
          reliefNeeds={reliefNeeds}
          settings={settings}
          selectedDay={selectedDay}
          onOpenReliefFinder={handleOpenFinderForFreePeriod}
        />
      )}

      {/* Relief Finder Modal */}
      <ReliefFinderModal
        isOpen={isFinderOpen}
        onClose={() => setIsFinderOpen(false)}
        teachers={teachers}
        initialReliefNeed={prefilledNeed}
        onSuccess={fetchData}
      />
    </div>
  );
}
