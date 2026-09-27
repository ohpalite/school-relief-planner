'use client';

import { useState, useEffect } from 'react';
import { Teacher, TimetableEntry, SpecialProgramme, ReliefNeed, SystemSettings } from '@/types';
import RecessRemarksTesterCard from '@/components/RecessRemarksTesterCard';
import ReliefNeedsList from '@/components/ReliefNeedsList';
import ReliefFinderModal from '@/components/ReliefFinderModal';
import Link from 'next/link';
import {
  UserCheck,
  Users,
  Calendar,
  Clock,
  ShieldCheck,
  Plus,
  Sparkles,
  FileSpreadsheet,
  Settings,
  ArrowRight,
  AlertTriangle,
} from 'lucide-react';

export default function DashboardPage() {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [reliefNeeds, setReliefNeeds] = useState<ReliefNeed[]>([]);
  const [settings, setSettings] = useState<SystemSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Modal State
  const [isFinderOpen, setIsFinderOpen] = useState(false);
  const [activeNeedForModal, setActiveNeedForModal] = useState<ReliefNeed | null>(null);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const [tRes, rRes, sRes] = await Promise.all([
        fetch('/api/teachers'),
        fetch('/api/relief-needs'),
        fetch('/api/settings'),
      ]);

      if (tRes.ok) setTeachers(await tRes.json());
      if (rRes.ok) setReliefNeeds(await rRes.json());
      if (sRes.ok) setSettings(await sRes.json());
    } catch (err) {
      console.error('Error loading dashboard data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const openFinder = (need?: ReliefNeed) => {
    setActiveNeedForModal(need || null);
    setIsFinderOpen(true);
  };

  const pendingCount = reliefNeeds.filter((n) => n.status === 'Pending').length;
  const assignedCount = reliefNeeds.filter((n) => n.status === 'Assigned').length;

  return (
    <div className="space-y-8 pb-12">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-gradient-to-r from-slate-900 via-slate-900/90 to-indigo-950/40 p-6 rounded-2xl border border-slate-800 shadow-xl">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 text-xs font-semibold border border-indigo-500/20">
              Singapore School Deployment Standard
            </span>
            <span className="text-xs text-slate-400 font-mono">
              Today: {new Date().toISOString().split('T')[0]}
            </span>
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight">
            School Relief Planning & Deployment Platform
          </h1>
          <p className="text-xs text-slate-400 max-w-2xl">
            Automated substitute teacher matching with teacher welfare constraint checking (max 9 periods/day, max 6 consecutive) and automated logistical remarks logic.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => openFinder()}
            className="px-4 py-2.5 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white font-semibold text-xs rounded-xl shadow-lg shadow-indigo-600/20 flex items-center gap-2 transition-all"
          >
            <Sparkles className="w-4 h-4" />
            <span>Launch Relief Finder</span>
          </button>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Total Staff</span>
            <div className="text-2xl font-black text-slate-100 mt-1">{teachers.length}</div>
            <span className="text-[11px] text-slate-500">Deployable Teachers</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center">
            <Users className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-amber-400">Pending Relief</span>
            <div className="text-2xl font-black text-amber-400 mt-1">{pendingCount}</div>
            <span className="text-[11px] text-amber-500/80">Needs Substitute Assignment</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center">
            <AlertTriangle className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-emerald-400">Assigned Covers</span>
            <div className="text-2xl font-black text-emerald-400 mt-1">{assignedCount}</div>
            <span className="text-[11px] text-emerald-500/80">Active Relief Deployments</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center">
            <UserCheck className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Welfare Limits</span>
            <div className="text-sm font-bold text-slate-200 mt-1">
              Max {settings?.maxTotalPeriodsDay || 9} Periods/Day
            </div>
            <span className="text-[11px] text-slate-500">Max {settings?.maxConsecutivePeriodsDay || 6} Consecutive</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center">
            <ShieldCheck className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Recess Rules Interactive Tester Card */}
      <RecessRemarksTesterCard />

      {/* Active Relief Requests & Deployment Section */}
      <ReliefNeedsList
        reliefNeeds={reliefNeeds}
        teachers={teachers}
        onOpenFinderForNeed={openFinder}
        onRefresh={fetchData}
      />

      {/* Quick Navigation Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link
          href="/timetable"
          className="bg-slate-900 border border-slate-800 hover:border-indigo-500/40 p-6 rounded-2xl shadow-xl transition-all group"
        >
          <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
            <Calendar className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-slate-100 text-base mb-1 group-hover:text-indigo-400 transition-colors">
            Consolidated Deployment Master Grid
          </h3>
          <p className="text-xs text-slate-400">
            Master timetable view for all 43 teachers across 12 periods, highlighting load warnings & free periods.
          </p>
        </Link>

        <Link
          href="/ingest"
          className="bg-slate-900 border border-slate-800 hover:border-indigo-500/40 p-6 rounded-2xl shadow-xl transition-all group"
        >
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
            <FileSpreadsheet className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-slate-100 text-base mb-1 group-hover:text-emerald-400 transition-colors">
            Data Upload & Ingestion
          </h3>
          <p className="text-xs text-slate-400">
            Upload CSV or Excel timetable files and special programme schedules with drag-and-drop parser.
          </p>
        </Link>

        <Link
          href="/settings"
          className="bg-slate-900 border border-slate-800 hover:border-indigo-500/40 p-6 rounded-2xl shadow-xl transition-all group"
        >
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
            <Settings className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-slate-100 text-base mb-1 group-hover:text-amber-400 transition-colors">
            System Rules & Parameters Setup
          </h3>
          <p className="text-xs text-slate-400">
            Configure maximum total daily periods, consecutive blocks limit, and weekly relief quotas.
          </p>
        </Link>
      </div>

      {/* Relief Finder Modal Drawer */}
      <ReliefFinderModal
        isOpen={isFinderOpen}
        onClose={() => setIsFinderOpen(false)}
        teachers={teachers}
        initialReliefNeed={activeNeedForModal}
        onSuccess={fetchData}
      />
    </div>
  );
}
