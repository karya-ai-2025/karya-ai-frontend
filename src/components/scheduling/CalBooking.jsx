'use client';

// Onboarding call booking, on Cal.com.
//
// Cal.com owns the whole booking: it shows the free slots, creates the video
// link and emails both sides. This component only embeds the booking page and
// then waits for the result — Cal.com tells the backend about the booking
// through a webhook, and it shows up here via GET /api/scheduling/my.
//
// Set NEXT_PUBLIC_CALCOM_LINK to the event's link — either "team/event" or a
// full https://cal.com/… URL. Without it there is nothing to book against, and
// the component says so rather than showing a picker that cannot work.

import { useCallback, useEffect, useRef, useState } from 'react';
import { ArrowRight, Calendar, CheckCircle, Clock, ExternalLink, Loader2, Video } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { getMyCall } from '@/lib/schedulingApi';

const CALCOM_LINK = process.env.NEXT_PUBLIC_CALCOM_LINK || '';

// How often to ask the backend whether the booking has arrived.
const POLL_MS = 5000;

/**
 * The booking page URL for this member.
 *
 * metadata[userId] is what lets the backend's webhook attach the booking to
 * the right account even if they book with a different email address; name
 * and email just save them typing.
 */
function buildBookingUrl(user) {
  if (!CALCOM_LINK) return null;

  let url;
  try {
    url = new URL(/^https?:\/\//.test(CALCOM_LINK) ? CALCOM_LINK : `https://cal.com/${CALCOM_LINK.replace(/^\/+/, '')}`);
  } catch {
    return null;
  }

  const userId = user?._id || user?.id;
  if (userId) url.searchParams.set('metadata[userId]', String(userId));
  if (user?.fullName) url.searchParams.set('name', user.fullName);
  if (user?.email) url.searchParams.set('email', user.email);
  return url.toString();
}

const isUpcoming = (call) =>
  !!call && call.status === 'scheduled' && new Date(call.dateTime).getTime() > Date.now() - 60 * 60 * 1000;

const formatDate = (iso) =>
  new Date(iso).toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

const formatTime = (iso) =>
  new Date(iso).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });

/** The join button, which unlocks 5 minutes before the call. */
function JoinLink({ call }) {
  const [canJoin, setCanJoin] = useState(false);
  const [countdown, setCountdown] = useState('');

  useEffect(() => {
    const meetingTime = new Date(call.dateTime).getTime();
    const update = () => {
      const diff = meetingTime - Date.now() - 5 * 60 * 1000;
      if (diff <= 0) {
        setCanJoin(true);
        setCountdown('');
        return;
      }
      setCanJoin(false);
      const totalMins = Math.ceil(diff / 60000);
      const days = Math.floor(totalMins / 1440);
      const hrs = Math.floor((totalMins % 1440) / 60);
      const mins = totalMins % 60;
      setCountdown(days > 0 ? `${days}d ${hrs}h` : hrs > 0 ? `${hrs}h ${mins}m` : `${mins}m`);
    };
    update();
    const id = setInterval(update, 30000);
    return () => clearInterval(id);
  }, [call.dateTime]);

  if (!call.meetLink) {
    return (
      <div className="inline-flex items-center gap-2 px-5 py-3 bg-blue-50 border border-blue-200 text-blue-700 rounded-xl mb-6 text-sm font-medium">
        <Clock className="w-4 h-4" />
        The joining link is in your confirmation email
      </div>
    );
  }

  return canJoin ? (
    <a
      href={call.meetLink}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-orange-500 text-white font-semibold rounded-xl hover:opacity-90 transition mb-6"
    >
      <Video className="w-5 h-5" />
      Join the call
    </a>
  ) : (
    <div className="inline-flex items-center gap-2 px-5 py-3 bg-gray-100 border border-gray-200 text-gray-500 rounded-xl mb-6 text-sm font-medium cursor-not-allowed select-none">
      <Clock className="w-4 h-4" />
      Join link opens {countdown ? `in ${countdown}` : 'soon'} (5 min before the call)
    </div>
  );
}

/**
 * @param {() => void} onClose          back to the previous step
 * @param {() => void} onDone           leave onboarding (go to the dashboard)
 * @param {() => void} [onBooked]       fired once, when a new booking is confirmed
 */
export default function CalBooking({ onClose, onDone, onBooked }) {
  const { user } = useAuth();
  const [checking, setChecking] = useState(true);
  const [call, setCall] = useState(null);
  // True when the call was already there when this opened, false when it was
  // booked just now — only the wording differs.
  const [alreadyBooked, setAlreadyBooked] = useState(false);
  // Latest onBooked without restarting the polling interval when the parent re-renders.
  const onBookedRef = useRef(onBooked);
  useEffect(() => { onBookedRef.current = onBooked; }, [onBooked]);

  const bookingUrl = buildBookingUrl(user);

  const fetchCall = useCallback(async () => {
    try {
      const result = await getMyCall();
      return isUpcoming(result.data) ? result.data : null;
    } catch {
      return null; // not reachable right now — keep showing the booking page
    }
  }, []);

  // On open: do they already have a call?
  useEffect(() => {
    let cancelled = false;
    fetchCall().then((existing) => {
      if (cancelled) return;
      if (existing) {
        setCall(existing);
        setAlreadyBooked(true);
      }
      setChecking(false);
    });
    return () => { cancelled = true; };
  }, [fetchCall]);

  // While the booking page is showing, watch for the booking to arrive.
  useEffect(() => {
    if (checking || call || !bookingUrl) return undefined;
    const id = setInterval(async () => {
      const booked = await fetchCall();
      if (booked) {
        setCall(booked);
        if (onBookedRef.current) onBookedRef.current(booked);
      }
    }, POLL_MS);
    return () => clearInterval(id);
  }, [checking, call, bookingUrl, fetchCall]);

  let body;
  if (checking) {
    body = (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="w-7 h-7 text-blue-600 animate-spin" />
      </div>
    );
  } else if (call) {
    body = (
      <div className="text-center py-8">
        <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 ${alreadyBooked ? 'bg-blue-100' : 'bg-green-100'}`}>
          {alreadyBooked
            ? <Calendar className="w-10 h-10 text-blue-500" />
            : <CheckCircle className="w-10 h-10 text-green-500" />}
        </div>
        <h2 className="text-3xl font-bold text-gray-900 mb-2">
          {alreadyBooked ? 'Your call is scheduled' : 'Call Confirmed!'}
        </h2>
        <p className="text-gray-500 mb-6">
          {formatDate(call.dateTime)} at {formatTime(call.dateTime)}
        </p>

        <div><JoinLink call={call} /></div>

        <p className="text-sm text-gray-400 mb-8">
          A confirmation with the calendar invite has been emailed to you. Use the link in that email to reschedule or cancel.
        </p>
        <button
          onClick={onDone}
          className="px-8 py-3 bg-gradient-to-r from-blue-600 to-orange-500 hover:opacity-90 rounded-xl text-white font-semibold transition inline-flex items-center gap-2 cursor-pointer"
        >
          Go to Dashboard <ArrowRight className="w-5 h-5" />
        </button>
      </div>
    );
  } else if (!bookingUrl) {
    body = (
      <div className="text-center py-8">
        <div className="w-20 h-20 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <Calendar className="w-10 h-10 text-amber-500" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Call booking isn&apos;t available right now</h2>
        <p className="text-gray-500 mb-8">
          You can carry on setting up your workspace yourself, and we&apos;ll be in touch to arrange a call.
        </p>
        <button
          onClick={onClose}
          className="px-8 py-3 bg-white border border-gray-300 rounded-xl text-gray-900 font-semibold hover:bg-gray-50 transition cursor-pointer"
        >
          Back
        </button>
      </div>
    );
  } else {
    body = (
      <>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Schedule your onboarding call</h2>
            <p className="text-sm text-gray-500">Pick a time that suits you. You&apos;ll get a calendar invite with the joining link.</p>
          </div>
          <a
            href={bookingUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-blue-600 hover:text-blue-700 shrink-0"
          >
            Open in a new tab <ExternalLink className="w-4 h-4" />
          </a>
        </div>

        <iframe
          src={bookingUrl}
          title="Schedule your onboarding call"
          className="w-full h-[640px] rounded-xl border border-gray-200 bg-white"
          loading="lazy"
        />

        <div className="mt-4 flex items-center gap-2 text-sm text-gray-500">
          <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
          This page updates by itself once your booking is confirmed.
        </div>

        <div className="flex gap-4 mt-6">
          <button
            onClick={onClose}
            className="flex-1 py-3 bg-white border border-gray-300 rounded-lg text-gray-900 font-semibold hover:bg-gray-50 transition-all cursor-pointer"
          >
            Back
          </button>
          <button
            onClick={onDone}
            className="flex-1 py-3 bg-gradient-to-r from-blue-600 to-orange-500 hover:from-blue-700 hover:to-orange-600 rounded-lg text-white font-semibold transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            I&apos;ve booked — go to Dashboard <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </>
    );
  }

  return (
    <div className="bg-white border border-gray-200 shadow-lg rounded-2xl p-8 max-w-4xl mx-auto">
      {body}
    </div>
  );
}
