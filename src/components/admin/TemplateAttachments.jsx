'use client';

// Attachments for an email an admin is writing for a customer.
//
// Shared by all three places an admin writes email copy — the standalone
// template library, the campaign wizard, and the campaign detail editor — so
// the caps, the accepted types and the behaviour can't drift between them.
//
// Files upload under the CUSTOMER'S namespace, because the template belongs to
// them. That is what keeps the server's ownership check meaningful instead of
// something to work around.

import { useState, useRef } from 'react';
import { Loader2, Paperclip, FileText, X } from 'lucide-react';
import { uploadCustomerTemplateAttachment } from '@/lib/adminCampaignApi';

// Matches the server's allowed list, which in turn matches the customer's own
// template builder.
export const ACCEPTED_TYPES =
  '.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.jpg,.jpeg,.png,.gif,.txt,.csv,.html,.htm';

export const MAX_ATTACHMENTS = 5;
export const MAX_TOTAL_BYTES = 20 * 1024 * 1024;

export const formatBytes = (n = 0) => {
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${Math.round(n / 1024)} KB`;
  return `${(n / (1024 * 1024)).toFixed(1)} MB`;
};

/**
 * @param {string}   customerId  whose account the files are stored under
 * @param {object[]} value       current attachments
 * @param {Function} onChange    receives the new attachments array
 * @param {boolean} [compact]    tighter spacing, for inline use in a wizard step
 */
export default function TemplateAttachments({ customerId, value = [], onChange, compact = false }) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const fileRef = useRef(null);

  const totalBytes = value.reduce((s, a) => s + (a.size || 0), 0);

  const addFiles = async (files) => {
    setError('');
    const list = Array.from(files || []);
    if (!list.length) return;

    if (value.length + list.length > MAX_ATTACHMENTS) {
      setError(`Up to ${MAX_ATTACHMENTS} files per email`);
      return;
    }
    const incoming = list.reduce((s, f) => s + f.size, 0);
    if (totalBytes + incoming > MAX_TOTAL_BYTES) {
      setError(`Total size cannot exceed ${formatBytes(MAX_TOTAL_BYTES)}`);
      return;
    }
    if (!customerId) {
      setError('Pick the customer first — files are stored in their account');
      return;
    }

    setUploading(true);
    try {
      const uploaded = [];
      for (const file of list) {
        uploaded.push(await uploadCustomerTemplateAttachment(customerId, file));
      }
      onChange([...value, ...uploaded]);
    } catch (e) {
      setError(e.message);
    } finally {
      setUploading(false);
      // Cleared so re-picking the same file fires onChange again.
      if (fileRef.current) fileRef.current.value = '';
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <label className={`block font-medium text-gray-600 ${compact ? 'text-[11px]' : 'text-xs'}`}>
          Attachments
          <span className="text-gray-400 font-normal">
            {' '}({value.length}/{MAX_ATTACHMENTS} · {formatBytes(totalBytes)} of {formatBytes(MAX_TOTAL_BYTES)})
          </span>
        </label>
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          disabled={uploading || value.length >= MAX_ATTACHMENTS}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-semibold border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-40 transition-colors"
        >
          {uploading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Paperclip className="w-3 h-3" />}
          Add file
        </button>
      </div>

      <input
        ref={fileRef}
        type="file"
        multiple
        hidden
        accept={ACCEPTED_TYPES}
        onChange={(e) => addFiles(e.target.files)}
      />

      {error && <p className="text-xs text-red-600 mb-1">{error}</p>}

      {value.length === 0 ? (
        <p className="text-[11px] text-gray-400">
          PDF, HTML, Word, Excel, PowerPoint, images, TXT and CSV.
        </p>
      ) : (
        <div className="border border-gray-100 rounded-lg divide-y">
          {value.map((a) => (
            <div key={a.blobName} className="flex items-center justify-between gap-3 px-2.5 py-1.5">
              <div className="flex items-center gap-2 min-w-0">
                <FileText className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                <span className="text-xs text-gray-800 truncate">{a.originalName || a.fileName}</span>
                <span className="text-[11px] text-gray-400 shrink-0">{formatBytes(a.size)}</span>
              </div>
              <button
                type="button"
                onClick={() => onChange(value.filter((x) => x.blobName !== a.blobName))}
                className="text-gray-400 hover:text-red-600 shrink-0"
                aria-label={`Remove ${a.originalName || a.fileName}`}
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
