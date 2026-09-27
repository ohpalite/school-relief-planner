'use client';

import { useState, useEffect } from 'react';
import { Teacher, ReliefNeed } from '@/types';
import ReliefNeedsList from '@/components/ReliefNeedsList';
import ReliefFinderModal from '@/components/ReliefFinderModal';
import { UserCheck, Sparkles, Plus, RefreshCw } from 'lucide-react';

export default function ReliefPage() {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [reliefNeeds, setReliefNeeds] = useState<ReliefNeed[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Modal State
  const [isFinderOpen, setIsFinderOpen] = useState(false);
  const [selectedNeed, setSelectedNeed] = useState<ReliefNeed | null>(null);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const [tRes, rRes] = await Promise.all([
        fetch('/api/teachers'),
        fetch('/api/relief-needs'),
      ]);

      if (tRes.ok) setTeachers(await tRes.json());
      if (rRes.ok) setReliefNeeds(await rRes.json());
    } catch (err) {
      console.error('Error fetching relief data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const openFinder = (need?: ReliefNeed) => {
    setSelectedNeed(need || null);
    setIsFinderOpen(true);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl">
        <div>
          <h1 className="text-xl font-black text-slate-100 flex items-center gap-2">
            <UserCheck className="w-6 h-6 text-indigo-400" />
            Relief Finder & Deployment Hub
          </h1>
          <p className="text-xs text-slate-400">
            Automated substitute teacher search engine with welfare constraints and recess instructions
          </p>
        </div>

        <button
          onClick={() => openFinder()}
          className="px-4 py-2.5 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white font-semibold text-xs rounded-xl shadow-lg shadow-indigo-600/20 flex items-center gap-2 transition-all"
        >
          <Sparkles className="w-4 h-4" />
          <span>New Relief Request & Finder</span>
        </button>
      </div>

      {/* Main Content */}
      {isLoading ? (
        <div className="p-12 text-center bg-slate-900 border border-slate-800 rounded-2xl">
          <RefreshCw className="w-8 h-8 text-indigo-400 animate-spin mx-auto mb-2" />
          <p className="text-sm font-semibold text-slate-300">Loading Relief Requests...</p>
        </div>
      ) : (
        <ReliefNeedsList
          reliefNeeds={reliefNeeds}
          teachers={teachers}
          onOpenFinderForNeed={openFinder}
          onRefresh={fetchData}
        />
      )}

      {/* Relief Finder Modal */}
      <ReliefFinderModal
        isOpen={isFinderOpen}
        onClose={() => setIsFinderOpen(false)}
        teachers={teachers}
        initialReliefNeed={selectedNeed}
        onSuccess={fetchData}
      />
    </div>
  );
}
