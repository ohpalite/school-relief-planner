'use client';

import { useState } from 'react';
import { PERIOD_TIMINGS, getRecessRemark, generateFinalRemarks } from '@/lib/relief-utils';
import { Info, Sparkles, MapPin, Clock, Calendar } from 'lucide-react';

export default function RecessRemarksTesterCard() {
  const [period, setPeriod] = useState<number>(4);
  const [level, setLevel] = useState<string>('P6');
  const [day, setDay] = useState<string>('Monday');
  const [venueRemarks, setVenueRemarks] = useState<string>('Go to SBB 6.');

  const recessRemark = getRecessRemark(period, level, day);
  const finalCombined = generateFinalRemarks(venueRemarks, recessRemark);

  const selectedTiming = PERIOD_TIMINGS.find((p) => p.period === period);

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl relative overflow-hidden">
      <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />

      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-indigo-500/20 text-indigo-400 flex items-center justify-center">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-semibold text-slate-100 text-base">Automated Recess & Venue Remarks Engine</h3>
            <p className="text-xs text-slate-400">Live preview of logistical instructions generated for relief assignments</p>
          </div>
        </div>
        <span className="text-xs font-mono bg-indigo-500/10 text-indigo-400 px-2.5 py-1 rounded-md border border-indigo-500/20">
          Rule engine v1.0
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-5">
        <div>
          <label className="block text-xs font-medium text-slate-400 mb-1.5 flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" /> Period Number
          </label>
          <select
            value={period}
            onChange={(e) => setPeriod(parseInt(e.target.value, 10))}
            className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-indigo-500"
          >
            {PERIOD_TIMINGS.map((pt) => (
              <option key={pt.period} value={pt.period}>
                Period {pt.period} ({pt.startTime} - {pt.endTime})
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-400 mb-1.5 flex items-center gap-1">
            <Info className="w-3.5 h-3.5" /> Class Level
          </label>
          <select
            value={level}
            onChange={(e) => setLevel(e.target.value)}
            className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-indigo-500"
          >
            {['P1', 'P2', 'P3', 'P4', 'P5', 'P6'].map((lvl) => (
              <option key={lvl} value={lvl}>
                {lvl}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-400 mb-1.5 flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5" /> Day of Week
          </label>
          <select
            value={day}
            onChange={(e) => setDay(e.target.value)}
            className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-indigo-500"
          >
            {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'].map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-400 mb-1.5 flex items-center gap-1">
            <MapPin className="w-3.5 h-3.5" /> Venue Remarks
          </label>
          <input
            type="text"
            value={venueRemarks}
            onChange={(e) => setVenueRemarks(e.target.value)}
            placeholder="e.g. Go to SBB 6."
            className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-indigo-500"
          />
        </div>
      </div>

      {/* Result Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-950/70 rounded-xl p-4 border border-slate-800/80">
        <div>
          <span className="text-xs uppercase tracking-wider font-semibold text-slate-400 block mb-1">
            Recess Rule Output
          </span>
          {recessRemark ? (
            <p className="text-sm font-medium text-amber-300 bg-amber-500/10 border border-amber-500/20 px-3 py-2 rounded-lg">
              "{recessRemark}"
            </p>
          ) : (
            <p className="text-xs text-slate-500 italic py-2">
              No specific recess instruction triggered for Period {period}, {level} on {day}.
            </p>
          )}
        </div>

        <div>
          <span className="text-xs uppercase tracking-wider font-semibold text-indigo-400 block mb-1">
            Concatenated Final Remark (`finalRemarks`)
          </span>
          <p className="text-sm font-bold text-white bg-indigo-950/80 border border-indigo-500/30 px-3 py-2 rounded-lg shadow-sm">
            "{finalCombined || 'Go to assigned room.'}"
          </p>
        </div>
      </div>
    </div>
  );
}
