'use client';

import { useState, useEffect } from 'react';
import { SystemSettings } from '@/types';
import { PERIOD_TIMINGS } from '@/lib/relief-utils';
import { Settings, ShieldCheck, Clock, CheckCircle2, Save, Sparkles } from 'lucide-react';

export default function SettingsPage() {
  const [maxConsecutivePeriodsDay, setMaxConsecutivePeriodsDay] = useState<number>(6);
  const [maxTotalPeriodsDay, setMaxTotalPeriodsDay] = useState<number>(9);
  const [maxReliefPeriodsWeek, setMaxReliefPeriodsWeek] = useState<number>(5);

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [saveMsg, setSaveMsg] = useState<string | null>(null);

  const fetchSettings = async () => {
    try {
      setIsLoading(true);
      const res = await fetch('/api/settings');
      if (res.ok) {
        const data: SystemSettings = await res.json();
        setMaxConsecutivePeriodsDay(data.maxConsecutivePeriodsDay);
        setMaxTotalPeriodsDay(data.maxTotalPeriodsDay);
        setMaxReliefPeriodsWeek(data.maxReliefPeriodsWeek);
      }
    } catch (err) {
      console.error('Error fetching settings:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSaving(true);
      setSaveMsg(null);

      const res = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          maxConsecutivePeriodsDay,
          maxTotalPeriodsDay,
          maxReliefPeriodsWeek,
        }),
      });

      if (res.ok) {
        setSaveMsg('Settings updated successfully!');
        setTimeout(() => setSaveMsg(null), 3000);
      } else {
        alert('Failed to save settings');
      }
    } catch (err) {
      console.error(err);
      alert('Error updating settings');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Page Header */}
      <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl">
        <h1 className="text-xl font-black text-slate-100 flex items-center gap-2">
          <Settings className="w-6 h-6 text-indigo-400" />
          Rule Configuration & Parameter Setup
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Define school welfare constraints and inspect standardized lesson timing logic
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Settings Form */}
        <div className="lg:col-span-1 bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
          <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
            <ShieldCheck className="w-5 h-5 text-indigo-400" />
            <h2 className="font-bold text-slate-100 text-base">Welfare Constraint Rules</h2>
          </div>

          <form onSubmit={handleSave} className="space-y-5">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Max Daily Periods Limit (`maxTotalPeriodsDay`)
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="number"
                  min={1}
                  max={12}
                  value={maxTotalPeriodsDay}
                  onChange={(e) => setMaxTotalPeriodsDay(parseInt(e.target.value, 10))}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-sm text-slate-100 focus:outline-none focus:border-indigo-500 font-mono font-bold"
                />
                <span className="text-xs text-slate-400 whitespace-nowrap">periods / day</span>
              </div>
              <p className="text-[11px] text-slate-500 mt-1">Default: 9 periods max per teacher in 1 day</p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Max Consecutive Teaching Streak (`maxConsecutivePeriodsDay`)
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="number"
                  min={1}
                  max={12}
                  value={maxConsecutivePeriodsDay}
                  onChange={(e) => setMaxConsecutivePeriodsDay(parseInt(e.target.value, 10))}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-sm text-slate-100 focus:outline-none focus:border-indigo-500 font-mono font-bold"
                />
                <span className="text-xs text-slate-400 whitespace-nowrap">periods max</span>
              </div>
              <p className="text-[11px] text-slate-500 mt-1">Default: 6 unbroken periods max</p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Max Weekly Relief Quota (`maxReliefPeriodsWeek`)
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="number"
                  min={1}
                  max={20}
                  value={maxReliefPeriodsWeek}
                  onChange={(e) => setMaxReliefPeriodsWeek(parseInt(e.target.value, 10))}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-sm text-slate-100 focus:outline-none focus:border-indigo-500 font-mono font-bold"
                />
                <span className="text-xs text-slate-400 whitespace-nowrap">reliefs / week</span>
              </div>
              <p className="text-[11px] text-slate-500 mt-1">Default: 5 relief assignments per week</p>
            </div>

            {saveMsg && (
              <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-lg text-emerald-400 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" />
                <span>{saveMsg}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={isSaving}
              className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-2.5 px-4 rounded-xl text-xs shadow-md shadow-indigo-600/20 transition-all flex items-center justify-center gap-2"
            >
              <Save className="w-4 h-4" />
              <span>{isSaving ? 'Saving Parameters...' : 'Save Configuration'}</span>
            </button>
          </form>
        </div>

        {/* Reference Timings & Recess Rules */}
        <div className="lg:col-span-2 space-y-6">
          {/* Period Timings Table */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
              <Clock className="w-5 h-5 text-indigo-400" />
              <h2 className="font-bold text-slate-100 text-base">Standardized Lesson Period Timings</h2>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-950 text-slate-400 border-b border-slate-800 font-semibold uppercase tracking-wider text-[10px]">
                    <th className="p-2.5">Period</th>
                    <th className="p-2.5">Start Time</th>
                    <th className="p-2.5">End Time</th>
                    <th className="p-2.5">Duration</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-mono text-[11px]">
                  {PERIOD_TIMINGS.map((pt) => (
                    <tr key={pt.period} className="hover:bg-slate-800/40">
                      <td className="p-2.5 font-bold text-indigo-400">Period {pt.period}</td>
                      <td className="p-2.5 text-slate-200">{pt.startTime}</td>
                      <td className="p-2.5 text-slate-200">{pt.endTime}</td>
                      <td className="p-2.5 text-slate-400">{pt.durationMinutes} mins</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Recess Remarks Logic Mapping Table */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
              <Sparkles className="w-5 h-5 text-amber-400" />
              <h2 className="font-bold text-slate-100 text-base">Recess Remarks Rule Logic Reference</h2>
            </div>

            <div className="space-y-2 text-xs">
              <div className="p-2.5 bg-slate-950 border border-slate-800 rounded-lg flex items-center justify-between">
                <span className="font-mono text-indigo-400">Period 3 • P3, P5</span>
                <span className="text-amber-300 font-semibold">"Send for recess at 9:15am."</span>
              </div>
              <div className="p-2.5 bg-slate-950 border border-slate-800 rounded-lg flex items-center justify-between">
                <span className="font-mono text-indigo-400">Period 4 • P4, P5, P6 (Monday Only)</span>
                <span className="text-amber-300 font-semibold">"Pick up from hall at 9:15am. (Mondays Only)"</span>
              </div>
              <div className="p-2.5 bg-slate-950 border border-slate-800 rounded-lg flex items-center justify-between">
                <span className="font-mono text-indigo-400">Period 4 • P1, P6</span>
                <span className="text-amber-300 font-semibold">"Send for recess at 9:45am."</span>
              </div>
              <div className="p-2.5 bg-slate-950 border border-slate-800 rounded-lg flex items-center justify-between">
                <span className="font-mono text-indigo-400">Period 5 • P3, P5</span>
                <span className="text-amber-300 font-semibold">"Pick up from recess at 9:45am."</span>
              </div>
              <div className="p-2.5 bg-slate-950 border border-slate-800 rounded-lg flex items-center justify-between">
                <span className="font-mono text-indigo-400">Period 5 • P2, P4</span>
                <span className="text-amber-300 font-semibold">"Send for recess at 10:15am."</span>
              </div>
              <div className="p-2.5 bg-slate-950 border border-slate-800 rounded-lg flex items-center justify-between">
                <span className="font-mono text-indigo-400">Period 6 • P1, P6</span>
                <span className="text-amber-300 font-semibold">"Pick up from recess at 10:15am."</span>
              </div>
              <div className="p-2.5 bg-slate-950 border border-slate-800 rounded-lg flex items-center justify-between">
                <span className="font-mono text-indigo-400">Period 7 • P2, P4</span>
                <span className="text-amber-300 font-semibold">"Pick up from recess at 10:45am."</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
