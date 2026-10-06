'use client';

// "Additional filters" — the lead-table attributes that aren't in the main
// filter box.
//
// The lead database holds far more per contact than the main box filters on:
// account segment, t-shirt size, GTM sector and sub-industry, city, state,
// postcode, job title, employee count, and whether there is a reachable email
// or phone. This panel exposes all of it without crowding the primary search.
//
// Collapsed by default, with a count badge so it is obvious when hidden
// filters are narrowing the results — a filter you can't see is worse than no
// filter at all.
//
// Dropdown values come from the data itself (/leads/filters/options) with a
// row count beside each, so nothing is offered that returns zero leads.

import { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { SlidersHorizontal, ChevronDown, X, Loader2, RefreshCw } from 'lucide-react';

/** Every key this panel owns. Used to count, clear and strip them. */
export const ADDITIONAL_FILTER_KEYS = [
  'accountSegment', 'tShirtSize', 'gtmSector', 'gtmSubIndustry',
  'city', 'state', 'zip', 'jobTitle',
  'minEmployees', 'maxEmployees', 'hasEmail', 'hasPhone',
];

export const emptyAdditionalFilters = () =>
  ADDITIONAL_FILTER_KEYS.reduce((acc, k) => {
    acc[k] = (k === 'hasEmail' || k === 'hasPhone') ? false : '';
    return acc;
  }, {});

/** How many of these filters are actually set. */
export const countAdditionalFilters = (f = {}) =>
  ADDITIONAL_FILTER_KEYS.filter((k) => {
    const v = f[k];
    return typeof v === 'boolean' ? v : String(v ?? '').trim() !== '';
  }).length;

const DROPDOWNS = [
  { key: 'accountSegment',  label: 'Account segment',   optionKey: 'accountSegment' },
  { key: 'tShirtSize',      label: 'Company size band', optionKey: 'tShirtSize' },
  { key: 'gtmSector',       label: 'GTM sector',        optionKey: 'gtmSector' },
  { key: 'gtmSubIndustry',  label: 'GTM sub-industry',  optionKey: 'gtmSubIndustry' },
];

const TEXTS = [
  { key: 'city',     label: 'City',         placeholder: 'Bengaluru' },
  { key: 'state',    label: 'State',        placeholder: 'Karnataka' },
  { key: 'zip',      label: 'Postcode',     placeholder: '560001' },
  { key: 'jobTitle', label: 'Job title has', placeholder: 'director, head of' },
];

/**
 * One filter, one field — label above its control, full width.
 *
 * Deliberately the same shape as the main "Lead Search Criteria" box above
 * this panel, so the two read as one form rather than two different widgets.
 *
 * A set filter gets a dot beside its label: with the panel scrolling, the
 * header count alone doesn't tell you *which* filters are on.
 */
function Field({ label, hint, active, children }) {
  return (
    <div className="mb-3 last:mb-0">
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {active && <span className="inline-block w-1.5 h-1.5 rounded-full bg-indigo-500 mr-1.5 align-middle" />}
        {label}
        {hint && <span className="ml-2 text-xs text-gray-400 font-normal">{hint}</span>}
      </label>
      {children}
    </div>
  );
}

export default function AdditionalFilters({ value, onChange, apiBaseUrl, authHeader }) {
  const [open, setOpen] = useState(false);
  const [options, setOptions] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const active = useMemo(() => countAdditionalFilters(value), [value]);

  // Callers pass authHeader as a fresh object literal (or getAuthHeader()),
  // so its identity changes on every render. Kept in a ref rather than a
  // dependency: as a dependency it re-ran this effect on every render, whose
  // cleanup then cancelled the in-flight request before it could resolve —
  // options never arrived, loading never cleared, and every control stayed
  // disabled behind "Loading options…".
  const authRef = useRef(authHeader);
  authRef.current = authHeader;

  // Guards the fetch instead of `loading` state, so starting the request
  // cannot itself retrigger the effect.
  const requested = useRef(false);

  const loadOptions = useCallback(async () => {
    requested.current = true;
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`${apiBaseUrl}/leads/filters/options`, {
        headers: { ...(authRef.current || {}) },
      });
      const d = await res.json().catch(() => ({}));
      if (!res.ok || !d.success) {
        throw new Error(d.message || `Could not load filter options (HTTP ${res.status})`);
      }
      setOptions(d.data);
    } catch (e) {
      setError(e.message || 'Could not load filter options');
      requested.current = false; // let Retry try again
    } finally {
      setLoading(false);
    }
  }, [apiBaseUrl]);

  // Fetched once, the first time the panel is opened — the values change only
  // when the lead table is re-imported.
  useEffect(() => {
    if (open && !requested.current) loadOptions();
  }, [open, loadOptions]);

  const set = (key) => (e) => {
    const v = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    onChange({ ...value, [key]: v });
  };

  const clearAll = () => onChange({ ...value, ...emptyAdditionalFilters() });

  return (
    <div className="border border-gray-200 rounded-xl overflow-hidden bg-white">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="w-full flex items-center justify-between gap-3 px-4 py-3 hover:bg-gray-50 transition-colors"
      >
        <span className="flex items-center gap-2 text-sm font-semibold text-gray-800">
          <SlidersHorizontal className="w-4 h-4 text-gray-400" />
          Additional filters
          {active > 0 && (
            <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-indigo-100 text-indigo-700">
              {active}
            </span>
          )}
        </span>
        <span className="flex items-center gap-2">
          {active > 0 && (
            <span
              role="button"
              tabIndex={0}
              onClick={(e) => { e.stopPropagation(); clearAll(); }}
              onKeyDown={(e) => { if (e.key === 'Enter') { e.stopPropagation(); clearAll(); } }}
              className="flex items-center gap-1 text-[11px] font-semibold text-gray-500 hover:text-red-600"
            >
              <X className="w-3 h-3" /> Clear
            </span>
          )}
          <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${open ? 'rotate-180' : ''}`} />
        </span>
      </button>

      {open && (
        <div className="border-t border-gray-100">
          {(loading || error) && (
            <div className="px-4 pt-3">
              {loading && (
                <p className="text-xs text-gray-400 flex items-center gap-2">
                  <Loader2 className="w-3.5 h-3.5 animate-spin" /> Loading options from the lead data…
                </p>
              )}
              {error && !loading && (
                <div className="flex items-center justify-between gap-3 p-2.5 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-xs text-red-700">{error}</p>
                  <button
                    type="button"
                    onClick={loadOptions}
                    className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-semibold border border-red-200 bg-white text-red-700 hover:bg-red-50 shrink-0"
                  >
                    <RefreshCw className="w-3 h-3" /> Retry
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Label above control, full width, one field per row — the same
              shape as the main search box above, so the two read as one form.
              The panel scrolls rather than the page. */}
          <div className="max-h-[22rem] overflow-y-auto px-4 py-3">
            {DROPDOWNS.map((d) => (
              <Field key={d.key} label={d.label} active={!!value[d.key]}>
                {/* Disabled only while the request is genuinely in flight —
                    never left disabled by a failed or cancelled load. */}
                <select
                  value={value[d.key] || ''}
                  onChange={set(d.key)}
                  disabled={loading}
                  className="w-full px-2 py-1.5 border border-gray-300 rounded-md bg-white disabled:bg-gray-50 disabled:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="">Any</option>
                  {(options?.[d.optionKey] || []).map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label} ({o.count.toLocaleString()})
                    </option>
                  ))}
                </select>
              </Field>
            ))}

            {TEXTS.map((t) => (
              <Field key={t.key} label={t.label} active={!!String(value[t.key] || '').trim()}>
                <input
                  type="text"
                  value={value[t.key] || ''}
                  onChange={set(t.key)}
                  placeholder={t.placeholder}
                  className="w-full px-2 py-1.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </Field>
            ))}

            <Field
              label="Employee count"
              hint={options?.employeeRange
                ? `${options.employeeRange.min.toLocaleString()}–${options.employeeRange.max.toLocaleString()} in the data`
                : null}
              active={!!(value.minEmployees || value.maxEmployees)}
            >
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min="0"
                  value={value.minEmployees || ''}
                  onChange={set('minEmployees')}
                  placeholder="Min"
                  className="w-full px-2 py-1.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <span className="text-gray-400 text-sm shrink-0">to</span>
                <input
                  type="number"
                  min="0"
                  value={value.maxEmployees || ''}
                  onChange={set('maxEmployees')}
                  placeholder="Max"
                  className="w-full px-2 py-1.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </Field>

            <Field label="Must have" active={!!(value.hasEmail || value.hasPhone)}>
              <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
                <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={!!value.hasEmail}
                    onChange={set('hasEmail')}
                    className="w-4 h-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                  />
                  An email address
                </label>
                <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={!!value.hasPhone}
                    onChange={set('hasPhone')}
                    className="w-4 h-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                  />
                  A phone number
                </label>
              </div>
            </Field>
          </div>

          <p className="text-[11px] text-gray-400 px-4 py-2.5 border-t border-gray-100 bg-gray-50">
            These narrow the main search — they never widen it. Leave anything blank to ignore it.
          </p>
        </div>
      )}
    </div>
  );
}
