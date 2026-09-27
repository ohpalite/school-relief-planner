'use client';

import { useState } from 'react';
import Papa from 'papaparse';
import * as XLSX from 'xlsx';
import {
  FileSpreadsheet,
  UploadCloud,
  CheckCircle2,
  AlertCircle,
  Download,
  FileText,
  Table,
  RefreshCw,
  Sparkles,
} from 'lucide-react';

export default function DataUploader() {
  const [activeTab, setActiveTab] = useState<'timetable' | 'special_programmes' | 'teachers'>('timetable');
  const [file, setFile] = useState<File | null>(null);
  const [parsedData, setParsedData] = useState<any[]>([]);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [uploadResult, setUploadResult] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      processFile(selectedFile);
    }
  };

  const processFile = (fileToProcess: File) => {
    setFile(fileToProcess);
    setUploadResult(null);
    setErrorMsg(null);

    const fileName = fileToProcess.name.toLowerCase();

    if (fileName.endsWith('.csv')) {
      Papa.parse(fileToProcess, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          setParsedData(results.data);
        },
        error: (err) => {
          setErrorMsg(`CSV Parse Error: ${err.message}`);
        },
      });
    } else if (fileName.endsWith('.xlsx') || fileName.endsWith('.xls')) {
      const reader = new FileReader();
      reader.onload = (evt) => {
        try {
          const bstr = evt.target?.result;
          const wb = XLSX.read(bstr, { type: 'binary' });
          const wsname = wb.SheetNames[0];
          const ws = wb.Sheets[wsname];
          const data = XLSX.utils.sheet_to_json(ws);
          setParsedData(data);
        } catch (err: any) {
          setErrorMsg(`Excel Parse Error: ${err.message}`);
        }
      };
      reader.readAsBinaryString(fileToProcess);
    } else {
      setErrorMsg('Unsupported file format. Please upload a .csv or .xlsx file.');
    }
  };

  const handleCommitImport = async () => {
    if (parsedData.length === 0) {
      alert('No parsed data to import.');
      return;
    }

    try {
      setIsUploading(true);
      setErrorMsg(null);
      setUploadResult(null);

      const res = await fetch('/api/ingest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: activeTab,
          records: parsedData,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setUploadResult(data.message);
        setParsedData([]);
        setFile(null);
      } else {
        setErrorMsg(data.error || 'Failed to import data');
      }
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || 'Error processing upload');
    } finally {
      setIsUploading(false);
    }
  };

  // Helper to generate sample CSV download
  const downloadSampleCSV = (type: 'timetable' | 'special_programmes') => {
    let csvContent = '';
    let fileName = '';

    if (type === 'timetable') {
      fileName = 'sample_timetable_import.csv';
      csvContent =
        'Teacher,Day,Period,Class,Room,Remarks,Activity\n' +
        'Ali,Monday,1,P1,1 Faith,Go to 1 Faith.,English\n' +
        'Ali,Monday,6,P6,SBB 6,Go to SBB 6.,Mathematics\n' +
        'Amirul,Tuesday,3,P3,3 Hope,Go to 3 Hope.,Science\n' +
        'Fatimah,Monday,4,P4,4 Love,Go to 4 Love.,Science\n' +
        'Fatimah,Monday,5,P5,SBB4,Go to SBB4.,Science\n';
    } else {
      fileName = 'sample_special_programmes.csv';
      csvContent =
        'Teacher,Date,Period,StartTime,EndTime,Event,Class\n' +
        'Ali,2026-09-28,6,10:15,11:15,Science Workshop,P5\n' +
        'Amirul,2026-09-28,4,09:15,09:45,Staff Briefing,\n' +
        'Fatimah,2026-09-29,1,07:45,08:45,Morning Assembly,P4\n';
    }

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', fileName);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Category Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
        <button
          onClick={() => {
            setActiveTab('timetable');
            setParsedData([]);
            setFile(null);
          }}
          className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all ${
            activeTab === 'timetable'
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
              : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
          }`}
        >
          <Table className="w-4 h-4" /> Timetable Entries Upload
        </button>

        <button
          onClick={() => {
            setActiveTab('special_programmes');
            setParsedData([]);
            setFile(null);
          }}
          className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all ${
            activeTab === 'special_programmes'
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
              : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
          }`}
        >
          <Sparkles className="w-4 h-4" /> Special Programmes Upload
        </button>
      </div>

      {/* Drag and Drop Zone & Sample Downloads */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
              <UploadCloud className="w-5 h-5 text-indigo-400" />
              Upload {activeTab === 'timetable' ? 'School Timetable' : 'Special Programme Schedules'}
            </h3>
            <p className="text-xs text-slate-400">
              Drag & drop CSV or Excel spreadsheet files to populate deploying schedules automatically
            </p>
          </div>

          <button
            onClick={() => downloadSampleCSV(activeTab as any)}
            className="text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-indigo-400" />
            <span>Download Sample CSV</span>
          </button>
        </div>

        {/* Upload Box */}
        <label className="border-2 border-dashed border-slate-800 hover:border-indigo-500/50 bg-slate-950/60 hover:bg-slate-950 rounded-2xl p-8 flex flex-col items-center justify-center cursor-pointer transition-all group">
          <UploadCloud className="w-10 h-10 text-indigo-400 mb-2 group-hover:scale-110 transition-transform" />
          <span className="text-sm font-semibold text-slate-200">
            {file ? file.name : 'Click to browse or drag & drop CSV / Excel file'}
          </span>
          <span className="text-xs text-slate-500 mt-1">Supports .csv, .xlsx, .xls (PapaParse & XLSX)</span>
          <input type="file" accept=".csv, .xlsx, .xls" onChange={handleFileChange} className="hidden" />
        </label>

        {/* Status Alerts */}
        {uploadResult && (
          <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-400 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{uploadResult}</span>
          </div>
        )}

        {errorMsg && (
          <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}
      </div>

      {/* Live Data Preview Table */}
      {parsedData.length > 0 && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-bold text-slate-200 flex items-center gap-2">
              <Table className="w-4 h-4 text-indigo-400" />
              Parsed Preview ({parsedData.length} Rows Ready to Commit)
            </h4>
            <button
              onClick={handleCommitImport}
              disabled={isUploading}
              className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs rounded-xl flex items-center gap-2 shadow-md shadow-indigo-600/20 disabled:opacity-50 transition-all"
            >
              <CheckCircle2 className={`w-4 h-4 ${isUploading ? 'animate-spin' : ''}`} />
              <span>{isUploading ? 'Importing Data...' : 'Confirm & Ingest Records'}</span>
            </button>
          </div>

          <div className="overflow-x-auto max-h-80 border border-slate-800 rounded-xl">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-950 border-b border-slate-800 text-slate-400 font-semibold uppercase tracking-wider text-[10px]">
                  {Object.keys(parsedData[0] || {}).map((key) => (
                    <th key={key} className="p-2.5 border-r border-slate-800">
                      {key}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono text-[11px]">
                {parsedData.slice(0, 15).map((row, idx) => (
                  <tr key={idx} className="hover:bg-slate-800/40">
                    {Object.values(row).map((val: any, vIdx) => (
                      <td key={vIdx} className="p-2.5 border-r border-slate-800/60 truncate max-w-[200px]">
                        {String(val ?? '')}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {parsedData.length > 15 && (
            <p className="text-[11px] text-slate-500 italic text-center">
              Showing first 15 rows of {parsedData.length} total rows.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
