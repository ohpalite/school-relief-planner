'use client';

import DataUploader from '@/components/DataUploader';
import { FileSpreadsheet } from 'lucide-react';

export default function IngestPage() {
  return (
    <div className="space-y-6 pb-12">
      {/* Page Header */}
      <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl">
        <h1 className="text-xl font-black text-slate-100 flex items-center gap-2">
          <FileSpreadsheet className="w-6 h-6 text-indigo-400" />
          Timetable & Special Programme Data Ingestion
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Upload school timetable master spreadsheets and special programme events using PapaParse & XLSX handlers
        </p>
      </div>

      {/* Uploader Component */}
      <DataUploader />
    </div>
  );
}
