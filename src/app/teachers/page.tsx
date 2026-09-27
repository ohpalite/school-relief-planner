'use client';

import { useState, useEffect } from 'react';
import { Teacher } from '@/types';
import { Users, Search, Plus, Filter, UserCheck, RefreshCw, X } from 'lucide-react';

export default function TeachersPage() {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [deptFilter, setDeptFilter] = useState('All');
  const [isLoading, setIsLoading] = useState(true);

  // New Teacher Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newName, setNewName] = useState('');
  const [newDept, setNewDept] = useState('English');
  const [newPartTime, setNewPartTime] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  const fetchTeachers = async () => {
    try {
      setIsLoading(true);
      const res = await fetch('/api/teachers');
      if (res.ok) {
        setTeachers(await res.json());
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTeachers();
  }, []);

  const handleAddTeacher = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;

    try {
      setIsCreating(true);
      const res = await fetch('/api/teachers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newName.trim(),
          department: newDept,
          partTime: newPartTime,
        }),
      });

      if (res.ok) {
        setNewName('');
        setIsModalOpen(false);
        fetchTeachers();
      } else {
        const errData = await res.json();
        alert(errData.error || 'Failed to add teacher');
      }
    } catch (err) {
      console.error(err);
      alert('Error adding teacher');
    } finally {
      setIsCreating(false);
    }
  };

  const departments = ['All', ...Array.from(new Set(teachers.map((t) => t.department)))];

  const filtered = teachers.filter((t) => {
    const matchesSearch = t.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDept = deptFilter === 'All' || t.department === deptFilter;
    return matchesSearch && matchesDept;
  });

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl">
        <div>
          <h1 className="text-xl font-black text-slate-100 flex items-center gap-2">
            <Users className="w-6 h-6 text-indigo-400" />
            Teacher Staff Directory ({teachers.length})
          </h1>
          <p className="text-xs text-slate-400">
            Manage deployable teaching staff, departments, and employment status
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs rounded-xl shadow-lg shadow-indigo-600/20 flex items-center gap-2 transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Teacher</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search by teacher name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-950 border border-slate-700 rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter className="w-3.5 h-3.5 text-slate-400" />
          <select
            value={deptFilter}
            onChange={(e) => setDeptFilter(e.target.value)}
            className="bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
          >
            {departments.map((d) => (
              <option key={d} value={d}>
                {d === 'All' ? 'All Departments' : d}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Teachers Directory Grid */}
      {isLoading ? (
        <div className="p-12 text-center bg-slate-900 border border-slate-800 rounded-2xl">
          <RefreshCw className="w-8 h-8 text-indigo-400 animate-spin mx-auto mb-2" />
          <p className="text-sm font-semibold text-slate-300">Loading Staff Directory...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filtered.map((t) => (
            <div
              key={t.id}
              className="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-2xl p-4 shadow-lg flex flex-col justify-between space-y-3 transition-all"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-bold text-slate-100 text-sm">{t.name}</h3>
                  <span className="text-xs text-indigo-400 font-medium">{t.department}</span>
                </div>
                <span
                  className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${
                    t.partTime
                      ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                      : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                  }`}
                >
                  {t.partTime ? 'Part-Time' : 'Full-Time'}
                </span>
              </div>

              <div className="text-xs text-slate-400 border-t border-slate-800 pt-2 flex items-center justify-between">
                <span>Timetable Entries:</span>
                <span className="font-bold text-slate-200 font-mono">
                  {t._count?.timetableEntries || 0}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Teacher Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-md rounded-2xl shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-bold text-slate-100 text-base">Add New Teacher</h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddTeacher} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-400 mb-1 font-medium">Teacher Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. John Tan"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-slate-100 focus:outline-none focus:border-indigo-500 text-sm"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-medium">Department</label>
                <select
                  value={newDept}
                  onChange={(e) => setNewDept(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-slate-100 focus:outline-none focus:border-indigo-500 text-sm"
                >
                  {['English', 'Mathematics', 'Science', 'Mother Tongue', 'PE / CCA', 'Aesthetics', 'General'].map(
                    (d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    )
                  )}
                </select>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="partTime"
                  checked={newPartTime}
                  onChange={(e) => setNewPartTime(e.target.checked)}
                  className="w-4 h-4 rounded border-slate-700 bg-slate-950 text-indigo-600"
                />
                <label htmlFor="partTime" className="text-slate-300 font-medium">
                  Part-Time Teacher
                </label>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-lg text-slate-400 bg-slate-800 hover:bg-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isCreating}
                  className="px-5 py-2 rounded-lg text-white bg-indigo-600 hover:bg-indigo-500 font-semibold"
                >
                  {isCreating ? 'Saving...' : 'Save Teacher'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
