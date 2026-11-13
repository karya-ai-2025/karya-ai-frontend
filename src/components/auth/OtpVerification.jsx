'use client';

import { useState, useEffect, useRef } from 'react';
import { Loader2, ShieldCheck, RotateCw, AlertTriangle } from 'lucide-react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api';
const OTP_LENGTH = 6;
const RESEND_COOLDOWN = 60; // must match otpResendWaitSeconds() on the server

/**
 * Six-digit email verification, shown straight after registration.
 *
 * The account already exists at this point — this step confirms the address is
 * real and reachable before the user is let into onboarding.
 */
export default function OtpVerification({ email, name, onVerified, onSkip }) {
  const [digits, setDigits] = useState(Array(OTP_LENGTH).fill(''));
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [cooldown, setCooldown] = useState(RESEND_COOLDOWN);
  const inputs = useRef([]);

  useEffect(() => { inputs.current[0]?.focus(); }, []);

  useEffect(() => {
    if (cooldown <= 0) return undefined;
    const t = setInterval(() => setCooldown((c) => (c <= 1 ? 0 : c - 1)), 1000);
    return () => clearInterval(t);
  }, [cooldown]);

  const code = digits.join('');

  const setDigit = (i, v) => {
    // Keep only the last character typed, so overtyping replaces rather than appends.
    const ch = v.replace(/\D/g, '').slice(-1);
    setDigits((d) => {
      const next = [...d];
      next[i] = ch;
      return next;
    });
    setError('');
    if (ch && i < OTP_LENGTH - 1) inputs.current[i + 1]?.focus();
  };

  const onKeyDown = (i, e) => {
    if (e.key === 'Backspace' && !digits[i] && i > 0) inputs.current[i - 1]?.focus();
    if (e.key === 'ArrowLeft' && i > 0) inputs.current[i - 1]?.focus();
    if (e.key === 'ArrowRight' && i < OTP_LENGTH - 1) inputs.current[i + 1]?.focus();
  };

  // Codes are usually copied from the email, so paste has to fill every box.
  const onPaste = (e) => {
    const text = (e.clipboardData.getData('text') || '').replace(/\D/g, '').slice(0, OTP_LENGTH);
    if (!text) return;
    e.preventDefault();
    const next = Array(OTP_LENGTH).fill('');
    text.split('').forEach((c, idx) => { next[idx] = c; });
    setDigits(next);
    inputs.current[Math.min(text.length, OTP_LENGTH - 1)]?.focus();
  };

  const submit = async (value = code) => {
    if (value.length !== OTP_LENGTH) { setError(`Enter all ${OTP_LENGTH} digits`); return; }
    setBusy(true);
    setError('');
    setNotice('');
    try {
      const res = await fetch(`${API_URL}/auth/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email, otp: value }),
      });
      const json = await res.json();
      if (!res.ok || json.success === false) throw new Error(json.message || 'Verification failed');
      onVerified?.();
    } catch (e) {
      setError(e.message || 'Verification failed');
      setDigits(Array(OTP_LENGTH).fill(''));
      inputs.current[0]?.focus();
    } finally {
      setBusy(false);
    }
  };

  // Verify as soon as the last digit lands — no reason to make them click.
  useEffect(() => {
    if (code.length === OTP_LENGTH && !busy) submit(code);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [code]);

  const resend = async () => {
    if (cooldown > 0) return;
    setBusy(true);
    setError('');
    try {
      const res = await fetch(`${API_URL}/auth/resend-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email }),
      });
      const json = await res.json();
      if (!res.ok || json.success === false) throw new Error(json.message || 'Could not resend');
      setNotice('A new code is on its way.');
      setCooldown(RESEND_COOLDOWN);
      setDigits(Array(OTP_LENGTH).fill(''));
      inputs.current[0]?.focus();
    } catch (e) {
      setError(e.message || 'Could not resend the code');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="text-center">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50">
          <ShieldCheck className="h-7 w-7 text-blue-600" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900">Verify your email</h1>
        <p className="mt-2 text-sm text-gray-600">
          We sent a {OTP_LENGTH}-digit code to <strong className="text-gray-900">{email}</strong>.
          {name ? ` Welcome, ${name.split(' ')[0]}.` : ''}
        </p>
      </div>

      <div className="mt-7 flex justify-center gap-2" onPaste={onPaste}>
        {digits.map((d, i) => (
          <input
            key={i}
            ref={(el) => { inputs.current[i] = el; }}
            value={d}
            onChange={(e) => setDigit(i, e.target.value)}
            onKeyDown={(e) => onKeyDown(i, e)}
            disabled={busy}
            inputMode="numeric"
            autoComplete={i === 0 ? 'one-time-code' : 'off'}
            maxLength={1}
            aria-label={`Digit ${i + 1}`}
            className={`h-14 w-12 rounded-xl border text-center text-xl font-bold text-gray-900 transition-all focus:outline-none focus:ring-2 disabled:opacity-60 ${
              error
                ? 'border-[#fca5a5] focus:border-[#ef4444] focus:ring-[#ef4444]/40'
                : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500/40'
            }`}
          />
        ))}
      </div>

      {busy && (
        <div className="mt-4 flex items-center justify-center gap-2 text-sm text-gray-500">
          <Loader2 className="h-4 w-4 animate-spin" /> Checking…
        </div>
      )}

      {error && (
        <div className="mt-4 flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 p-3">
          <AlertTriangle className="mt-0.5 h-4 w-4 flex-shrink-0 text-red-600" />
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {notice && !error && (
        <p className="mt-4 text-center text-sm text-green-700">{notice}</p>
      )}

      <div className="mt-6 text-center">
        <button
          type="button"
          onClick={resend}
          disabled={busy || cooldown > 0}
          className="inline-flex items-center gap-2 text-sm font-semibold text-blue-600 hover:text-blue-700 disabled:cursor-not-allowed disabled:text-gray-400"
        >
          <RotateCw className="h-4 w-4" />
          {cooldown > 0 ? `Resend code in ${cooldown}s` : 'Resend code'}
        </button>
        <p className="mt-2 text-xs text-gray-400">The code expires in 10 minutes.</p>
      </div>

      {onSkip && (
        <div className="mt-6 border-t border-gray-100 pt-4 text-center">
          <button
            type="button"
            onClick={onSkip}
            className="text-sm text-gray-500 hover:text-gray-700 cursor-pointer"
          >
            Verify later
          </button>
        </div>
      )}
    </div>
  );
}
