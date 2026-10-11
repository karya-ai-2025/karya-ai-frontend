'use client';

import { useState } from 'react';
import Link from 'next/link';
import * as XLSX from 'xlsx';
import { UploadCloud, FileSpreadsheet, Loader2, CheckCircle, AlertTriangle, Briefcase } from 'lucide-react';
import AdminGuard from '@/components/AdminGuard';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api';

export default function AdminJobsPage() {
  const [fileName, setFileName] = useState('');
  const [rows, setRows] = useState([]);
  const [parseError, setParseError] = useState('');
  const [importing, setImporting] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  const handleFile = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    setParseError(''); setError(''); setResult(null); setRows([]); setFileName(file.name);
    try {
      const buf = await file.arrayBuffer();
      const wb = XLSX.read(buf, { type: 'array' });
      const sheet = wb.Sheets[wb.SheetNames[0]];
      const parsed = XLSX.utils.sheet_to_json(sheet, { defval: '' });
      const withTitle = parsed.filter((r) => String(r['Job Title'] || r['Title'] || '').trim());
      if (withTitle.length === 0) {
        setParseError('No rows with a "Job Title" found. Check the header row.');
        return;
      }
      setRows(withTitle);
    } catch (err) {
      setParseError('Could not read this file. Make sure it is a valid .xlsx / .csv.');
    }
  };

  const doImport = async () => {
    if (rows.length === 0) return;
    setImporting(true); setError(''); setResult(null);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API}/jobs/import`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ rows })
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message || 'Import failed');
      setResult(data.data);
    } catch (err) {
      setError(err.message || 'Import failed');
    } finally {
      setImporting(false);
    }
  };

  const sample = rows[0];

  return (
    <AdminGuard>
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-11 h-11 rounded-xl bg-indigo-50 flex items-center justify-center">
              <Briefcase className="w-6 h-6 text-indigo-600" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-gray-900">Import jobs</h1>
              <p className="text-gray-500 text-sm">Upload your Excel sheet — experience & salary are converted to numbers automatically.</p>
            </div>
          </div>

          {/* Upload box */}
          <label className="block bg-white border-2 border-dashed border-gray-300 rounded-2xl p-8 text-center cursor-pointer hover:border-indigo-400 transition-colors">
            <UploadCloud className="w-10 h-10 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-700 font-medium">Click to choose an Excel file</p>
            <p className="text-gray-400 text-sm mt-1">.xlsx or .csv — headers: Job Title, Location, Experience, Salary, Key Skills, …</p>
            <input type="file" accept=".xlsx,.xls,.csv" className="hidden" onChange={handleFile} />
          </label>

          {parseError && (
            <div className="mt-4 flex items-center gap-2 bg-red-50 border border-red-200 rounded-xl p-3 text-sm text-red-600">
              <AlertTriangle className="w-4 h-4 shrink-0" /> {parseError}
            </div>
          )}

          {/* Preview + import */}
          {rows.length > 0 && (
            <div className="mt-5 bg-white border border-gray-200 rounded-2xl p-5">
              <div className="flex items-center gap-2 text-gray-800">
                <FileSpreadsheet className="w-5 h-5 text-indigo-500" />
                <span className="font-semibold">{fileName}</span>
                <span className="text-gray-500">— {rows.length} job{rows.length === 1 ? '' : 's'} found</span>
              </div>

              {sample && (
                <div className="mt-3 text-sm text-gray-600 bg-gray-50 border border-gray-100 rounded-lg p-3">
                  <p className="text-[11px] font-semibold text-gray-400 uppercase mb-1">First row preview</p>
                  <p><b>{sample['Job Title'] || sample['Title']}</b>{sample['Location'] ? ` · ${sample['Location']}` : ''}</p>
                  {sample['Experience'] && <p className="text-gray-500">Experience: {sample['Experience']}</p>}
                  {sample['Salary'] && <p className="text-gray-500">Salary: {sample['Salary']}</p>}
                </div>
              )}

              <button
                onClick={doImport}
                disabled={importing}
                className="mt-4 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-300 text-white font-semibold rounded-xl inline-flex items-center gap-2"
              >
                {importing ? (<><Loader2 className="w-4 h-4 animate-spin" /> Importing…</>) : `Import ${rows.length} job${rows.length === 1 ? '' : 's'}`}
              </button>
            </div>
          )}

          {error && (
            <div className="mt-4 flex items-center gap-2 bg-red-50 border border-red-200 rounded-xl p-3 text-sm text-red-600">
              <AlertTriangle className="w-4 h-4 shrink-0" /> {error}
            </div>
          )}

          {result && (
            <div className="mt-4 bg-green-50 border border-green-200 rounded-xl p-4">
              <div className="flex items-center gap-2 text-green-700 font-semibold">
                <CheckCircle className="w-5 h-5" /> Imported successfully
              </div>
              <p className="text-sm text-green-700 mt-1">
                {result.created} new · {result.updated} updated · {result.skipped > 0 ? `${result.skipped} skipped` : 'none skipped'}
              </p>
              <p className="text-sm text-gray-600 mt-2">
                Jobs are now live. Note: they appear on the <b>expert app</b> (acerstone) at <code>/jobs</code>.
              </p>
            </div>
          )}
        </div>
      </div>
    </AdminGuard>
  );
}
