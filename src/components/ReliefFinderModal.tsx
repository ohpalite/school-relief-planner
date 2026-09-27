'use client';

import { useState, useEffect } from 'react';
import { Teacher, ReliefNeed, CandidateEvaluation, SystemSettings } from '@/types';
import { PERIOD_TIMINGS, getRecessRemark, generateFinalRemarks, getDayOfWeekFromDate } from '@/lib/relief-utils';
import {
  UserCheck,
  X,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Sparkles,
  Clock,
  MapPin,
  Calendar,
  Users,
  ChevronDown,
  ChevronUp,
  FileText,
  ShieldAlert,
  ArrowRight,
} from 'lucide-react';

interface ReliefFinderModalProps {
  isOpen: boolean;
  onClose: () => void;
  teachers: Teacher[];
  initialReliefNeed?: ReliefNeed | null;
  onSuccess?: () => void;
}

export default function ReliefFinderModal({
  isOpen,
  onClose,
  teachers,
  initialReliefNeed,
  onSuccess,
}: ReliefFinderModalProps) {
  const [absentTeacherId, setAbsentTeacherId] = useState<string>('');
  const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [periodNumber, setPeriodNumber] = useState<number>(4);
  const [classLevel, setClassLevel] = useState<string>('P6');
  const [room, setRoom] = useState<string>('SBB 6');
  const [customRemarks, setCustomRemarks] = useState<string>('');
  const [isEditingRemarks, setIsEditingRemarks] = useState<boolean>(false);

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [finderResult, setFinderResult] = useState<{
    eligibleCandidates: CandidateEvaluation[];
    ineligibleCandidates: CandidateEvaluation[];
    settings?: SystemSettings;
    dayOfWeek?: string;
  } | null>(null);

  const [showIneligible, setShowIneligible] = useState<boolean>(false);
  const [selectedCandidate, setSelectedCandidate] = useState<CandidateEvaluation | null>(null);
  const [isAssigning, setIsAssigning] = useState<boolean>(false);

  // Derive day of week and automated remarks live
  const dayOfWeek = getDayOfWeekFromDate(date);
  const autoRecess = getRecessRemark(periodNumber, classLevel, dayOfWeek);
  
  // Find selected absent teacher details to pre-fill venue remark if available
  const selectedAbsentTeacher = teachers.find((t) => t.id === absentTeacherId);

  const calculatedVenueRemarks = `Go to ${room}.`;
  const autoCombinedRemarks = generateFinalRemarks(calculatedVenueRemarks, autoRecess);
  const displayFinalRemarks = isEditingRemarks ? customRemarks : autoCombinedRemarks;

  useEffect(() => {
    if (initialReliefNeed) {
      setAbsentTeacherId(initialReliefNeed.absentTeacherId);
      setDate(initialReliefNeed.date);
      setPeriodNumber(initialReliefNeed.periodNumber);
      setClassLevel(initialReliefNeed.classLevel);
      setRoom(initialReliefNeed.room);
      setCustomRemarks(initialReliefNeed.finalRemarks);
      setIsEditingRemarks(true);
    } else if (teachers.length > 0 && !absentTeacherId) {
      setAbsentTeacherId(teachers[0].id);
    }
  }, [initialReliefNeed, teachers]);

  // Run Relief Finder API engine call
  const handleRunReliefFinder = async () => {
    if (!date || !periodNumber || !absentTeacherId) {
      alert('Please select an absent teacher, date, and period number.');
      return;
    }

    try {
      setIsLoading(true);
      setFinderResult(null);
      setSelectedCandidate(null);

      const params = new URLSearchParams({
        date,
        periodNumber: periodNumber.toString(),
        absentTeacherId,
      });

      const res = await fetch(`/api/relief-finder?${params.toString()}`);
      const data = await res.json();

      if (res.ok) {
        setFinderResult(data);
        if (data.eligibleCandidates.length > 0) {
          setSelectedCandidate(data.eligibleCandidates[0]);
        }
      } else {
        alert(data.error || 'Failed to run Relief Finder');
      }
    } catch (err) {
      console.error(err);
      alert('Error running Relief Finder');
    } finally {
      setIsLoading(false);
    }
  };

  // Confirm Assignment & Save Relief Need record
  const handleAssignTeacher = async (candidate?: CandidateEvaluation) => {
    const candidateToAssign = candidate || selectedCandidate;
    if (!candidateToAssign) {
      alert('Please select an eligible relief teacher first.');
      return;
    }

    try {
      setIsAssigning(true);

      let reliefNeedId = initialReliefNeed?.id;

      // 1. Create Relief Need if not created yet
      if (!reliefNeedId) {
        const createRes = await fetch('/api/relief-needs', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            absentTeacherId,
            date,
            periodNumber,
            classLevel,
            room,
            customRemarks: displayFinalRemarks,
          }),
        });
        const createdData = await createRes.json();
        if (!createRes.ok) {
          throw new Error(createdData.error || 'Failed to create relief request');
        }
        reliefNeedId = createdData.id;
      }

      // 2. Assign Relief Teacher
      const assignRes = await fetch(`/api/relief-needs/${reliefNeedId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          assignedReliefTeacherId: candidateToAssign.teacher.id,
          status: 'Assigned',
          finalRemarks: displayFinalRemarks,
        }),
      });

      if (assignRes.ok) {
        alert(`Successfully assigned ${candidateToAssign.teacher.name} for Period ${periodNumber}!`);
        if (onSuccess) onSuccess();
        onClose();
      } else {
        const errData = await assignRes.json();
        alert(errData.error || 'Failed to complete assignment');
      }
    } catch (err: any) {
      console.error(err);
      alert(err.message || 'Error processing assignment');
    } finally {
      setIsAssigning(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 w-full max-w-4xl rounded-2xl shadow-2xl overflow-hidden my-8 max-h-[90vh] flex flex-col">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-800 bg-slate-900/90 flex items-center justify-between sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center">
              <UserCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-100">Relief Finder & Automated Assignment</h2>
              <p className="text-xs text-slate-400">
                Filter available teachers against welfare constraints & auto-generate logistical remarks
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content - Scrollable */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {/* Step 1: Absence & Period Parameters */}
          <div className="bg-slate-950/70 rounded-xl p-4 border border-slate-800/80 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-indigo-400" /> Step 1: Relief Class Parameters
              </h3>
              <span className="text-xs text-indigo-400 font-medium">Day: {dayOfWeek}</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Absent Teacher</label>
                <select
                  value={absentTeacherId}
                  onChange={(e) => setAbsentTeacherId(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-indigo-500"
                >
                  <option value="">Select Absent Teacher...</option>
                  {teachers.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name} ({t.department})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Date</label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Period Number</label>
                <select
                  value={periodNumber}
                  onChange={(e) => setPeriodNumber(parseInt(e.target.value, 10))}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-indigo-500"
                >
                  {PERIOD_TIMINGS.map((pt) => (
                    <option key={pt.period} value={pt.period}>
                      Period {pt.period} ({pt.startTime} - {pt.endTime})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Class Level</label>
                <select
                  value={classLevel}
                  onChange={(e) => setClassLevel(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-indigo-500"
                >
                  {['P1', 'P2', 'P3', 'P4', 'P5', 'P6'].map((lvl) => (
                    <option key={lvl} value={lvl}>
                      {lvl}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Room / Venue</label>
                <input
                  type="text"
                  value={room}
                  onChange={(e) => setRoom(e.target.value)}
                  placeholder="e.g. SBB 6 or 1 Faith"
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="flex items-end">
                <button
                  onClick={handleRunReliefFinder}
                  disabled={isLoading || !absentTeacherId}
                  className="w-full bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white font-semibold py-2 px-4 rounded-lg text-sm shadow-md shadow-indigo-600/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <Sparkles className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                  <span>{isLoading ? 'Running Engine...' : 'Run Relief Finder'}</span>
                </button>
              </div>
            </div>
          </div>

          {/* Automated Remarks Preview Card */}
          <div className="bg-indigo-950/40 border border-indigo-500/30 rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-indigo-400" />
                <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-300">
                  Automated Logistical Remarks (`finalRemarks`)
                </h4>
              </div>
              <button
                onClick={() => setIsEditingRemarks(!isEditingRemarks)}
                className="text-xs text-indigo-400 hover:underline"
              >
                {isEditingRemarks ? 'Use Auto Rules' : 'Custom Edit'}
              </button>
            </div>

            {isEditingRemarks ? (
              <textarea
                value={customRemarks}
                onChange={(e) => setCustomRemarks(e.target.value)}
                rows={2}
                className="w-full bg-slate-900 border border-indigo-500/40 rounded-lg p-2.5 text-sm text-slate-100 focus:outline-none"
              />
            ) : (
              <div className="bg-slate-900/80 p-3 rounded-lg border border-indigo-500/20">
                <p className="text-sm font-semibold text-white">{displayFinalRemarks}</p>
                {autoRecess ? (
                  <p className="text-xs text-amber-300 mt-1 flex items-center gap-1">
                    <Sparkles className="w-3 h-3" /> Recess Rule Triggered: {autoRecess}
                  </p>
                ) : null}
              </div>
            )}
          </div>

          {/* Step 2: Relief Finder Engine Results */}
          {finderResult && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2">
                  <UserCheck className="w-4 h-4 text-emerald-400" />
                  Eligible Relief Teachers ({finderResult.eligibleCandidates.length} Available)
                </h3>
                <span className="text-xs text-slate-400">
                  Ranked by lowest daily workload
                </span>
              </div>

              {finderResult.eligibleCandidates.length === 0 ? (
                <div className="p-6 text-center bg-amber-500/10 border border-amber-500/20 rounded-xl text-amber-200">
                  <AlertTriangle className="w-8 h-8 mx-auto mb-2 text-amber-400" />
                  <p className="font-semibold text-sm">No Eligible Relief Teachers Found</p>
                  <p className="text-xs text-amber-300/80 mt-1">
                    All teachers have existing classes, special programmes, or would exceed welfare limits (max {finderResult.settings?.maxTotalPeriodsDay} periods/day, {finderResult.settings?.maxConsecutivePeriodsDay} consecutive).
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {finderResult.eligibleCandidates.map((candidate) => {
                    const isSelected = selectedCandidate?.teacher.id === candidate.teacher.id;
                    const isRankOne = candidate.rank === 1;

                    return (
                      <div
                        key={candidate.teacher.id}
                        onClick={() => setSelectedCandidate(candidate)}
                        className={`p-4 rounded-xl border transition-all cursor-pointer relative ${
                          isSelected
                            ? 'bg-indigo-900/40 border-indigo-500 shadow-md shadow-indigo-500/10'
                            : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                        }`}
                      >
                        {isRankOne && (
                          <span className="absolute -top-2.5 right-3 bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full shadow">
                            Top Recommendation #1
                          </span>
                        )}

                        <div className="flex items-start justify-between">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="w-6 h-6 rounded-full bg-slate-800 text-slate-300 font-mono text-xs flex items-center justify-center font-bold">
                                #{candidate.rank}
                              </span>
                              <h4 className="font-bold text-slate-100 text-sm">{candidate.teacher.name}</h4>
                            </div>
                            <p className="text-xs text-slate-400 ml-8">
                              Dept: {candidate.teacher.department} • {candidate.teacher.partTime ? 'Part-Time' : 'Full-Time'}
                            </p>
                          </div>

                          <span className="text-xs px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-medium flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" /> Eligible
                          </span>
                        </div>

                        <div className="mt-3 grid grid-cols-2 gap-2 text-xs border-t border-slate-800/80 pt-2.5">
                          <div className="text-slate-400">
                            Current Today Load:{' '}
                            <span className="font-semibold text-slate-200">
                              {candidate.currentDailyPeriods} / {finderResult.settings?.maxTotalPeriodsDay} periods
                            </span>
                          </div>
                          <div className="text-slate-400">
                            Streak if assigned:{' '}
                            <span className="font-semibold text-slate-200">
                              {candidate.longestStreakIfAssigned} / {finderResult.settings?.maxConsecutivePeriodsDay} periods
                            </span>
                          </div>
                        </div>

                        <div className="mt-3 flex items-center justify-end">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleAssignTeacher(candidate);
                            }}
                            disabled={isAssigning}
                            className="text-xs bg-indigo-600 hover:bg-indigo-500 text-white font-semibold px-3 py-1.5 rounded-lg flex items-center gap-1 shadow-sm transition-colors"
                          >
                            <span>Assign {candidate.teacher.name}</span>
                            <ArrowRight className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Ineligible Teachers Accordion */}
              {finderResult.ineligibleCandidates.length > 0 && (
                <div className="border border-slate-800 rounded-xl overflow-hidden bg-slate-950/40 mt-4">
                  <button
                    onClick={() => setShowIneligible(!showIneligible)}
                    className="w-full px-4 py-3 flex items-center justify-between text-xs font-semibold text-slate-400 hover:text-slate-200 hover:bg-slate-900/50"
                  >
                    <span className="flex items-center gap-2">
                      <ShieldAlert className="w-4 h-4 text-amber-500" />
                      View Ineligible Teachers ({finderResult.ineligibleCandidates.length}) & Audit Reasons
                    </span>
                    {showIneligible ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </button>

                  {showIneligible && (
                    <div className="p-4 border-t border-slate-800 space-y-2 max-h-60 overflow-y-auto">
                      {finderResult.ineligibleCandidates.map((cand) => (
                        <div
                          key={cand.teacher.id}
                          className="flex items-start justify-between text-xs p-2.5 rounded-lg bg-slate-900/80 border border-slate-800"
                        >
                          <div>
                            <span className="font-bold text-slate-200">{cand.teacher.name}</span>
                            <span className="text-slate-400 ml-2 font-mono">({cand.teacher.department})</span>
                            <ul className="mt-1 space-y-0.5">
                              {cand.reasons.map((r, i) => (
                                <li key={i} className="text-red-400 flex items-center gap-1">
                                  <XCircle className="w-3 h-3 shrink-0" /> {r}
                                </li>
                              ))}
                            </ul>
                          </div>
                          <span className="text-[10px] uppercase font-bold text-red-400 bg-red-500/10 border border-red-500/20 px-2 py-0.5 rounded">
                            Ineligible
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 border-t border-slate-800 bg-slate-900 flex items-center justify-between">
          <div className="text-xs text-slate-400">
            {selectedCandidate ? (
              <span>
                Selected: <strong className="text-white">{selectedCandidate.teacher.name}</strong> for Period {periodNumber}
              </span>
            ) : (
              <span>Select a teacher above to assign</span>
            )}
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-lg text-xs font-semibold text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={() => handleAssignTeacher()}
              disabled={!selectedCandidate || isAssigning}
              className="px-5 py-2 rounded-lg text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 transition-colors flex items-center gap-1.5 shadow-md shadow-emerald-600/20"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{isAssigning ? 'Saving...' : 'Confirm Assignment'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
