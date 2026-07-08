'use client';
import { useState, useRef } from 'react';
import AdminGuard from '@/components/AdminGuard';
import {
  Upload, FileSpreadsheet, CheckCircle, AlertCircle, Loader2,
  X, ListChecks, Database,
} from 'lucide-react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

// Mirrors the backend's required columns (kept here only to inform the admin in the UI).
const REQUIRED_COLUMNS = ['First Name', 'email', 'phone', 'Mailing Country', 'GTM Industry'];

function LeadsUpload() {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState(null); // { totalRows, imported, skipped, skippedRows }
  const [error, setError] = useState('');
  const inputRef = useRef(null);

  const pickFile = (f) => {
    setError('');
    setResult(null);
    if (!f) return;
    const ok = /\.(xlsx|xls|csv)$/i.test(f.name);
    if (!ok) {
      setError('Please choose an Excel or CSV file (.xlsx, .xls, or .csv).');
      return;
    }
    setFile(f);
  };

  const handleUpload = async () => {
    if (!file) return;
    setUploading(true);
    setError('');
    setResult(null);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const token = localStorage.getItem('token');
      const res = await fetch(`${API_URL}/leads/import-healthcare`, {
        method: 'POST',
        // NOTE: do NOT set Content-Type — the browser sets the multipart boundary itself.
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      const json = await res.json();

      if (!res.ok || !json.success) {
        throw new Error(json.message || 'Upload failed. Please try again.');
      }
      setResult(json);
    } catch (err) {
      setError(err.message || 'Something went wrong during the upload.');
    } finally {
      setUploading(false);
    }
  };

  const reset = () => {
    setFile(null);
    setResult(null);
    setError('');
    if (inputRef.current) inputRef.current.value = '';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto px-6 py-10">
        {/* Header */}
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center">
            <Database className="w-5 h-5 text-white" strokeWidth={1.5} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Upload Lead Data</h1>
            <p className="text-sm text-gray-500">Healthcare leads — admin only. Bad rows are skipped automatically.</p>
          </div>
        </div>

        {/* Required-columns notice */}
        <div className="mt-6 bg-white border border-gray-200 rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-3">
            <ListChecks className="w-4 h-4 text-gray-400" strokeWidth={1.5} />
            <h2 className="text-sm font-bold text-gray-900">Required columns</h2>
          </div>
          <p className="text-xs text-gray-500 mb-3">
            Your file must contain these columns, and every row must have a non-empty value for each.
            Rows missing any of them are skipped (the file is rejected only if a column is missing entirely).
          </p>
          <div className="flex flex-wrap gap-2">
            {REQUIRED_COLUMNS.map((c) => (
              <span key={c} className="px-2.5 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-medium">
                {c}
              </span>
            ))}
          </div>
        </div>

        {/* Dropzone / file picker */}
        <div
          className="mt-6 bg-white border-2 border-dashed border-gray-200 rounded-2xl p-8 text-center transition-colors hover:border-blue-300"
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault();
            pickFile(e.dataTransfer.files?.[0]);
          }}
        >
          <input
            ref={inputRef}
            type="file"
            accept=".xlsx,.xls,.csv"
            className="hidden"
            onChange={(e) => pickFile(e.target.files?.[0])}
          />

          {!file ? (
            <>
              <div className="w-12 h-12 mx-auto rounded-xl bg-blue-50 flex items-center justify-center mb-3">
                <Upload className="w-6 h-6 text-blue-600" strokeWidth={1.5} />
              </div>
              <p className="text-sm text-gray-700 font-medium">Drag an Excel or CSV file here, or</p>
              <button
                onClick={() => inputRef.current?.click()}
                className="mt-3 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl transition-colors"
              >
                Choose file
              </button>
              <p className="mt-3 text-xs text-gray-400">Accepted: .xlsx, .xls, .csv</p>
            </>
          ) : (
            <div className="flex items-center justify-center gap-3">
              <FileSpreadsheet className="w-6 h-6 text-emerald-600" strokeWidth={1.5} />
              <span className="text-sm font-medium text-gray-900">{file.name}</span>
              <button onClick={reset} className="p-1 text-gray-400 hover:text-gray-700" title="Remove">
                <X className="w-4 h-4" strokeWidth={1.5} />
              </button>
            </div>
          )}
        </div>

        {/* Action */}
        {file && (
          <button
            onClick={handleUpload}
            disabled={uploading}
            className="mt-4 w-full py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white text-sm font-semibold rounded-xl transition-colors flex items-center justify-center gap-2"
          >
            {uploading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" strokeWidth={1.5} />
                Validating &amp; importing…
              </>
            ) : (
              <>
                <Upload className="w-4 h-4" strokeWidth={1.5} />
                Upload &amp; import
              </>
            )}
          </button>
        )}

        {/* Error */}
        {error && (
          <div className="mt-4 bg-red-50 border border-red-200 rounded-2xl p-4 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" strokeWidth={1.5} />
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        {/* Result */}
        {result && (
          <div className="mt-6 bg-white border border-gray-200 rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-4">
              <CheckCircle className="w-5 h-5 text-emerald-600" strokeWidth={1.5} />
              <h2 className="text-sm font-bold text-gray-900">Import complete</h2>
            </div>

            <div className="grid grid-cols-3 gap-3 mb-5">
              <div className="bg-gray-50 rounded-xl p-4 text-center">
                <p className="text-2xl font-bold text-gray-900">{result.totalRows}</p>
                <p className="text-xs text-gray-500 mt-1">Total rows</p>
              </div>
              <div className="bg-emerald-50 rounded-xl p-4 text-center">
                <p className="text-2xl font-bold text-emerald-700">{result.imported}</p>
                <p className="text-xs text-emerald-600 mt-1">Imported</p>
              </div>
              <div className="bg-amber-50 rounded-xl p-4 text-center">
                <p className="text-2xl font-bold text-amber-700">{result.skipped}</p>
                <p className="text-xs text-amber-600 mt-1">Skipped</p>
              </div>
            </div>

            {result.skippedRows?.length > 0 && (
              <div>
                <h3 className="text-xs font-bold text-gray-700 uppercase tracking-wide mb-2">Skipped rows</h3>
                <div className="border border-gray-200 rounded-xl overflow-hidden max-h-80 overflow-y-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50 sticky top-0">
                      <tr>
                        <th className="px-4 py-2 text-left text-xs font-semibold text-gray-500 w-20">Row</th>
                        <th className="px-4 py-2 text-left text-xs font-semibold text-gray-500">Reason</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {result.skippedRows.map((s, i) => (
                        <tr key={i}>
                          <td className="px-4 py-2 text-gray-900 font-medium">{s.row}</td>
                          <td className="px-4 py-2 text-gray-600">{s.reason}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            <button
              onClick={reset}
              className="mt-5 px-5 py-2.5 border border-gray-200 hover:bg-gray-50 text-gray-700 text-sm font-semibold rounded-xl transition-colors"
            >
              Upload another file
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default function LeadsUploadPage() {
  return (
    <AdminGuard>
      <LeadsUpload />
    </AdminGuard>
  );
}
