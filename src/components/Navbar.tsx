'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import {
  Calendar,
  Clock,
  Database,
  FileSpreadsheet,
  LayoutDashboard,
  RefreshCw,
  Settings,
  UserCheck,
  Users,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';

export default function Navbar() {
  const pathname = usePathname();
  const [isSeeding, setIsSeeding] = useState(false);
  const [seedMessage, setSeedMessage] = useState<string | null>(null);

  const navItems = [
    { name: 'Dashboard', href: '/', icon: LayoutDashboard },
    { name: 'Master Timetable', href: '/timetable', icon: Calendar },
    { name: 'Relief Finder', href: '/relief', icon: UserCheck },
    { name: 'Data Upload', href: '/ingest', icon: FileSpreadsheet },
    { name: 'Teachers', href: '/teachers', icon: Users },
    { name: 'Rules & Settings', href: '/settings', icon: Settings },
  ];

  const handleSeedDatabase = async () => {
    if (!confirm('Re-seed database with standard teacher timetables and sample relief needs?')) {
      return;
    }

    try {
      setIsSeeding(true);
      setSeedMessage(null);
      const res = await fetch('/api/seed', { method: 'POST' });
      const data = await res.json();
      if (res.ok) {
        setSeedMessage(`Seeded ${data.teachersCount} teachers successfully!`);
        setTimeout(() => {
          window.location.reload();
        }, 1200);
      } else {
        alert(data.error || 'Failed to seed database');
      }
    } catch (err) {
      console.error(err);
      alert('Error seeding database');
    } finally {
      setIsSeeding(false);
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-slate-900/95 backdrop-blur border-b border-slate-800 text-slate-100 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-blue-500 to-emerald-400 flex items-center justify-center shadow-md shadow-indigo-500/20 group-hover:scale-105 transition-transform">
              <UserCheck className="w-6 h-6 text-white" />
            </div>
            <div>
              <span className="font-bold text-lg tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-300 bg-clip-text text-transparent">
                ReliefPulse
              </span>
              <span className="hidden sm:inline-block ml-2 text-xs px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 font-mono border border-indigo-500/20">
                School Planner
              </span>
            </div>
          </Link>

          {/* Navigation Items */}
          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/80'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>

          {/* Quick Actions & Seed Button */}
          <div className="flex items-center gap-3">
            {seedMessage ? (
              <span className="flex items-center gap-1.5 text-xs text-emerald-400 bg-emerald-950/60 border border-emerald-500/30 px-3 py-1.5 rounded-lg">
                <CheckCircle2 className="w-3.5 h-3.5" />
                {seedMessage}
              </span>
            ) : null}

            <button
              onClick={handleSeedDatabase}
              disabled={isSeeding}
              className="flex items-center gap-2 text-xs font-medium px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors shadow-sm disabled:opacity-50"
              title="Reset and populate database with default 43 teachers & timetables"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-indigo-400 ${isSeeding ? 'animate-spin' : ''}`} />
              <span>{isSeeding ? 'Seeding...' : 'Seed Sample Data'}</span>
            </button>
          </div>
        </div>

        {/* Mobile Navigation Sub-bar */}
        <div className="md:hidden flex items-center justify-around py-2 border-t border-slate-800 text-xs">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex flex-col items-center gap-1 px-2 py-1 rounded ${
                  isActive ? 'text-indigo-400 font-semibold' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </header>
  );
}
