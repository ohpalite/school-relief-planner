'use client';

import { useState } from 'react';
import { ReliefNeed, Teacher } from '@/types';
import { PERIOD_TIMINGS } from '@/lib/relief-utils';
import {
  UserCheck,
  Clock,
  MapPin,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Trash2,
  Edit3,
  Printer,
  Copy,
  Check,
  Search,
} from 'lucide-react';

interface ReliefNeedsListProps {
  reliefNeeds: ReliefNeed[];
  teachers: Teacher[];
  onOpenFinderForNeed: (need: ReliefNeed) => void;
  onRefresh: () => void;
}

export default function ReliefNeedsList({
  reliefNeeds,
  teachers,
  onOpenFinderForNeed,
  onRefresh,
}: ReliefNeedsListProps) {
  const [filterStatus, setFilterStatus] = useState<'All' | 'Pending' | 'Assigned'>('All');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const filteredNeeds = reliefNeeds.filter((need) => {
    if (filterStatus === 'Pending') return need.status === 'Pending';
    if (filterStatus === 'Assigned') return need.status === 'Assigned';
    return true;
  });

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this relief request?')) return;
    try {
      const res = await fetch(`/api/relief-needs/${id}`, { method: 'DELETE' });
      if (res.ok) {
        onRefresh();
      } else {
        alert('Failed to delete relief request');
      }
    } catch (err) {
      console.error(err);
      alert('Error deleting relief request');
    }
  };

  const handleCopyRemarks = (need: ReliefNeed) => {
    const text = `[Relief Instruction] Period ${need.periodNumber} (${need.classLevel} - ${need.room}) | Relief Teacher: ${need.assignedReliefTeacher?.name || 'Unassigned'} | Remarks: ${need.finalRemarks}`;
    navigator.clipboard.writeText(text);
    setCopiedId(need.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
            <UserCheck className="w-5 h-5 text-indigo-400" />
            Active Relief Deployments & Requests
          </h3>
          <p className="text-xs text-slate-400">
            Monitor pending cover requests and view automated logistical remarks for assigned teachers
          </p>
        </div>

        <div className="flex items-center gap-2 bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
          <button
            onClick={() => setFilterStatus('All')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
              filterStatus === 'All' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            All ({reliefNeeds.length})
          </button>
          <button
            onClick={() => setFilterStatus('Pending')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
              filterStatus === 'Pending' ? 'bg-amber-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Pending ({reliefNeeds.filter((n) => n.status === 'Pending').length})
          </button>
          <button
            onClick={() => setFilterStatus('Assigned')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
              filterStatus === 'Assigned' ? 'bg-emerald-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Assigned ({reliefNeeds.filter((n) => n.status === 'Assigned').length})
          </button>
        </div>
      </div>

      {filteredNeeds.length === 0 ? (
        <div className="p-8 text-center bg-slate-950/50 rounded-xl border border-slate-800/80 text-slate-400 text-sm">
          No relief requests found matching status "{filterStatus}".
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3">
          {filteredNeeds.map((need) => {
            const timing = PERIOD_TIMINGS.find((p) => p.period === need.periodNumber);
            const isAssigned = need.status === 'Assigned';

            return (
              <div
                key={need.id}
                className="bg-slate-950/70 border border-slate-800 hover:border-slate-700 rounded-xl p-4 transition-all flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
              >
                {/* Left Side Info */}
                <div className="space-y-1.5 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span
                      className={`text-xs font-bold px-2.5 py-0.5 rounded-full border ${
                        isAssigned
                          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                          : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                      }`}
                    >
                      {isAssigned ? 'Assigned' : 'Pending Relief'}
                    </span>

                    <span className="font-bold text-slate-100 text-sm">
                      Period {need.periodNumber} ({timing?.startTime} - {timing?.endTime})
                    </span>

                    <span className="text-xs font-semibold px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                      {need.classLevel}
                    </span>

                    <span className="text-xs font-semibold px-2 py-0.5 rounded bg-slate-800 text-slate-300 flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-slate-400" /> {need.room}
                    </span>
                  </div>

                  <div className="text-xs text-slate-400">
                    Absent Teacher:{' '}
                    <strong className="text-slate-200">{need.absentTeacher?.name || 'Unknown'}</strong>
                    {isAssigned && (
                      <span className="ml-3">
                        Relief Assigned:{' '}
                        <strong className="text-emerald-400">{need.assignedReliefTeacher?.name}</strong>
                      </span>
                    )}
                  </div>

                  {/* Automated Remarks Banner */}
                  <div className="mt-2 bg-slate-900 border border-slate-800 rounded-lg p-2.5 text-xs">
                    <span className="text-indigo-400 font-semibold uppercase tracking-wider block text-[10px] mb-0.5">
                      Logistical Instruction (`finalRemarks`):
                    </span>
                    <p className="text-slate-200 font-medium">{need.finalRemarks}</p>
                  </div>
                </div>

                {/* Right Side Actions */}
                <div className="flex items-center gap-2 self-end md:self-center">
                  <button
                    onClick={() => handleCopyRemarks(need)}
                    className="p-2 text-slate-400 hover:text-slate-100 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-lg text-xs flex items-center gap-1 transition-colors"
                    title="Copy instructions to clipboard"
                  >
                    {copiedId === need.id ? (
                      <Check className="w-4 h-4 text-emerald-400" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                    <span className="hidden sm:inline">{copiedId === need.id ? 'Copied' : 'Copy'}</span>
                  </button>

                  {!isAssigned ? (
                    <button
                      onClick={() => onOpenFinderForNeed(need)}
                      className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs rounded-lg flex items-center gap-1 shadow-sm transition-colors"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Find Relief Teacher</span>
                    </button>
                  ) : (
                    <button
                      onClick={() => onOpenFinderForNeed(need)}
                      className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium text-xs border border-slate-700 rounded-lg flex items-center gap-1 transition-colors"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      <span>Reassign</span>
                    </button>
                  )}

                  <button
                    onClick={() => handleDelete(need.id)}
                    className="p-2 text-slate-500 hover:text-red-400 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-lg transition-colors"
                    title="Delete relief request"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
