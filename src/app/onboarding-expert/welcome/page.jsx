'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { bookCall, getMyCall } from '@/lib/schedulingApi';
import {
  Play, ArrowRight, CheckCircle, Calendar,
  FileEdit, Clock, Video, X, Loader2, Mail,
} from 'lucide-react';

function WelcomeExpert() {
  const router = useRouter();
  useAuth();
  const [showOptions, setShowOptions]     = useState(false);
  const [showScheduler, setShowScheduler] = useState(false);
  const [selectedDate, setSelectedDate]   = useState('');
  const [selectedTime, setSelectedTime]   = useState('');
  const [currentMonth, setCurrentMonth]   = useState(new Date());
  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookingError, setBookingError]   = useState('');
  const [bookedCall, setBookedCall]       = useState(null);
  const [canJoin, setCanJoin]             = useState(false);
  const [joinCountdown, setJoinCountdown] = useState('');
  const [checkingExisting, setCheckingExisting] = useState(false);
  const [existingCall, setExistingCall]   = useState(null);

  const handleSkip             = () => router.replace('/expert-dashboard');
  const handleStartOnboarding  = () => setShowOptions(true);
  const handleManualOnboarding = () => router.replace('/onboarding-expert/profile-setup');
  const handleScheduleCall = async () => {
    setCheckingExisting(true);
    setExistingCall(null);
    try {
      const result = await getMyCall();
      if (result.data && result.data.status === 'scheduled') {
        setExistingCall(result.data);
      }
    } catch (_) {
      // ignore — let user proceed to booking
    } finally {
      setCheckingExisting(false);
      setShowScheduler(true);
    }
  };

  const toISODateTime = (dateStr, timeStr) => {
    const [time, period] = timeStr.split(' ');
    let [hours, minutes] = time.split(':').map(Number);
    if (period === 'PM' && hours !== 12) hours += 12;
    if (period === 'AM' && hours === 12) hours = 0;
    return `${dateStr}T${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:00`;
  };

  const handleConfirmSchedule = async () => {
    if (!selectedDate || !selectedTime) return;
    setBookingError('');
    setBookingLoading(true);
    try {
      const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
      const dateTime = toISODateTime(selectedDate, selectedTime);
      const result   = await bookCall({ dateTime, timezone, source: 'onboarding-expert' });
      setBookedCall({ dateTime, meetLink: result.data.meetLink, isMock: result.data.isMock });
    } catch (err) {
      setBookingError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setBookingLoading(false);
    }
  };

  // ── Calendar helpers ──────────────────────────────────────────────────────
  const getDaysInMonth = (date) => {
    const firstDay     = new Date(date.getFullYear(), date.getMonth(), 1);
    const lastDay      = new Date(date.getFullYear(), date.getMonth() + 1, 0);
    return { daysInMonth: lastDay.getDate(), startingDayOfWeek: firstDay.getDay() };
  };

  const generateCalendarDays = () => {
    const { daysInMonth, startingDayOfWeek } = getDaysInMonth(currentMonth);
    const days = Array(startingDayOfWeek).fill(null);
    for (let d = 1; d <= daysInMonth; d++) days.push(d);
    return days;
  };

  const isDateDisabled = (day) => {
    if (!day) return true;
    const today = new Date(); today.setHours(0, 0, 0, 0);
    return new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day) < today;
  };

  const formatSelectedDate = (day) => {
    const y = currentMonth.getFullYear();
    const m = String(currentMonth.getMonth() + 1).padStart(2, '0');
    return `${y}-${m}-${String(day).padStart(2, '0')}`;
  };

  const changeMonth = (dir) => {
    const d = new Date(currentMonth);
    d.setMonth(currentMonth.getMonth() + dir);
    setCurrentMonth(d);
  };

  // Unlock join button 5 minutes before the meeting
  useEffect(() => {
    if (!bookedCall) return;
    const meetingTime = new Date(bookedCall.dateTime).getTime();
    const updateJoin = () => {
      const diff = meetingTime - Date.now() - 5 * 60 * 1000;
      if (diff <= 0) {
        setCanJoin(true);
        setJoinCountdown('');
      } else {
        setCanJoin(false);
        const totalMins = Math.ceil(diff / 60000);
        const hrs  = Math.floor(totalMins / 60);
        const mins = totalMins % 60;
        setJoinCountdown(hrs > 0 ? `${hrs}h ${mins}m` : `${mins}m`);
      }
    };
    updateJoin();
    const id = setInterval(updateJoin, 30000);
    return () => clearInterval(id);
  }, [bookedCall]);

  // Generate time slots 9:00 AM → 11:30 PM → 12:00 AM
  const timeSlots = (() => {
    const slots = [];
    for (let h = 9; h < 24; h++) {
      for (let m = 0; m < 60; m += 30) {
        const hour12 = h > 12 ? h - 12 : h;
        const period = h < 12 ? 'AM' : 'PM';
        slots.push(`${hour12}:${String(m).padStart(2, '0')} ${period}`);
      }
    }
    slots.push('12:00 AM');
    return slots;
  })();

  // Disable a time slot if it's in the past for the selected (or given) date
  const isTimeSlotDisabled = (timeStr, overrideDateStr) => {
    const dateStr = overrideDateStr !== undefined ? overrideDateStr : selectedDate;
    if (!dateStr) return false;
    const [time, period] = timeStr.split(' ');
    let [hours, minutes] = time.split(':').map(Number);
    if (period === 'PM' && hours !== 12) hours += 12;
    if (period === 'AM' && hours === 12) hours = 0;
    const [y, mo, d] = dateStr.split('-').map(Number);
    const slotDate = hours === 0 && minutes === 0
      ? new Date(y, mo - 1, d + 1, 0, 0, 0)
      : new Date(y, mo - 1, d, hours, minutes, 0);
    return slotDate <= new Date();
  };

  const priorityItems = [
    { icon: <CheckCircle className="w-5 h-5" />, text: 'Showcase your skills, experience & portfolio' },
    { icon: <CheckCircle className="w-5 h-5" />, text: 'Get matched with the right business clients' },
    { icon: <CheckCircle className="w-5 h-5" />, text: 'Set your availability, rates & service offerings' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      {/* Animated Background */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-20 left-20 w-72 h-72 bg-blue-300 rounded-full filter blur-xl animate-blob" />
        <div className="absolute top-40 right-20 w-72 h-72 bg-blue-300 rounded-full filter blur-xl animate-blob animation-delay-2000" />
        <div className="absolute bottom-20 left-40 w-72 h-72 bg-violet-300 rounded-full filter blur-xl animate-blob animation-delay-4000" />
      </div>

      <div className="relative w-full max-w-6xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-4">
            <Image src="/karya-ai-logo.png" alt="Karya AI" width={48} height={48} className="rounded-xl object-contain" />
            <span className="text-2xl font-bold text-gray-900">Karya-AI</span>
          </div>
          <h1 className="text-5xl font-bold text-gray-900 mb-3">Welcome, Expert!</h1>
          <p className="text-xl text-gray-600">Let's build your expert profile in minutes</p>
        </div>

        {/* ── Initial view ── */}
        {!showOptions && !showScheduler && (
          <div className="max-w-4xl mx-auto">
            <div className="bg-white border border-gray-200 shadow-lg rounded-2xl p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">This onboarding covers:</h2>
              <div className="space-y-4 mb-8">
                {priorityItems.map((item, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <div className="text-blue-500 mt-1">{item.icon}</div>
                    <p className="text-gray-600 text-lg">{item.text}</p>
                  </div>
                ))}
              </div>

              <div className="relative rounded-xl overflow-hidden group cursor-pointer mb-6">
                <img
                  src="https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=800&h=450&fit=crop"
                  alt="Onboarding Video"
                  className="w-full h-80 object-cover"
                />
                <div className="absolute inset-0 bg-black/40 group-hover:bg-black/50 transition-all flex items-center justify-center">
                  <div className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Play className="w-10 h-10 text-white ml-1" fill="white" />
                  </div>
                </div>
                <div className="absolute bottom-4 left-4 right-4">
                  <p className="text-white font-medium text-lg">
                    For You: A quick guide to getting the most out of Karya-AI as an expert
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── Choose path ── */}
        {showOptions && !showScheduler && (
          <div className="bg-white border border-gray-200 shadow-lg rounded-2xl p-8 max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
              How would you like to set up your profile?
            </h2>

            <div className="grid md:grid-cols-2 gap-6">
              {/* Manual */}
              <div
                onClick={handleManualOnboarding}
                className="group bg-gray-50 border border-gray-200 rounded-xl p-8 hover:bg-gray-100 transition-all cursor-pointer hover:scale-105"
              >
                <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-orange-500 rounded-xl flex items-center justify-center mb-6">
                  <FileEdit className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3">Fill Details Manually</h3>
                <p className="text-gray-600 mb-4">
                  Complete your expert profile step-by-step. Add your skills, portfolio, and services.
                </p>
                <ul className="space-y-2 mb-6">
                  {['Quick and easy', 'Immediate access', 'Full control over your profile'].map(t => (
                    <li key={t} className="flex items-center gap-2 text-gray-600">
                      <CheckCircle className="w-4 h-4 text-green-400" />
                      <span className="text-sm">{t}</span>
                    </li>
                  ))}
                </ul>
                <button className="w-full py-3 bg-gradient-to-r from-blue-600 to-orange-500 rounded-lg text-white font-semibold flex items-center justify-center gap-2 group-hover:from-blue-700 group-hover:to-orange-600 transition-all">
                  Start Now <ArrowRight className="w-5 h-5" />
                </button>
              </div>

              {/* Schedule */}
              <div
                onClick={handleScheduleCall}
                className="group bg-gray-50 border border-gray-200 rounded-xl p-8 hover:bg-gray-100 transition-all cursor-pointer hover:scale-105"
              >
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center mb-6">
                  <Video className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3">Schedule a Call</h3>
                <p className="text-gray-600 mb-4">
                  Talk to our team. We'll understand your expertise and set up your profile for you.
                </p>
                <ul className="space-y-2 mb-6">
                  {['30-minute session', 'We build your profile', 'Flexible timing'].map(t => (
                    <li key={t} className="flex items-center gap-2 text-gray-600">
                      <CheckCircle className="w-4 h-4 text-green-400" />
                      <span className="text-sm">{t}</span>
                    </li>
                  ))}
                </ul>
                <button className="w-full py-3 bg-gradient-to-r from-blue-600 to-orange-500 rounded-lg text-white font-semibold flex items-center justify-center gap-2 group-hover:from-blue-700 group-hover:to-orange-600 transition-all">
                  {checkingExisting
                    ? <><Loader2 className="w-5 h-5 animate-spin" /> Checking...</>
                    : <>Schedule Now <Calendar className="w-5 h-5" /></>}
                </button>
              </div>
            </div>

            <div className="text-center mt-8">
              <button onClick={() => setShowOptions(false)} className="text-gray-500 hover:text-gray-900 transition-colors">
                ← Go Back
              </button>
            </div>
          </div>
        )}

        {/* ── Scheduler ── */}
        {showScheduler && (
          <div className="bg-white border border-gray-200 shadow-lg rounded-2xl p-8 max-w-4xl mx-auto">

            {existingCall ? (
              <div className="text-center py-8">
                <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Calendar className="w-10 h-10 text-blue-500" />
                </div>
                <h2 className="text-3xl font-bold text-gray-900 mb-2">Meeting Already Scheduled</h2>
                <p className="text-gray-500 mb-2">
                  {new Date(existingCall.dateTime).toLocaleDateString('en-IN', {
                    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
                  })}
                </p>
                <p className="text-gray-500 mb-6">
                  at {new Date(existingCall.dateTime).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                </p>
                <p className="text-sm text-gray-400 mb-8">
                  You can only book one call at a time. Complete your current meeting first.
                </p>
                <button
                  onClick={() => router.replace('/expert-dashboard')}
                  className="px-8 py-3 bg-gradient-to-r from-blue-600 to-orange-500 hover:opacity-90 rounded-xl text-white font-semibold transition flex items-center gap-2 mx-auto"
                >
                  Go to Dashboard <ArrowRight className="w-5 h-5" />
                </button>
              </div>
            ) : bookedCall ? (
              <div className="text-center py-8">
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <CheckCircle className="w-10 h-10 text-green-500" />
                </div>
                <h2 className="text-3xl font-bold text-gray-900 mb-2">Call Confirmed!</h2>
                <p className="text-gray-500 mb-6">
                  {new Date(bookedCall.dateTime).toLocaleDateString('en-IN', {
                    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
                  })}{' '}at {selectedTime}
                </p>

                {bookedCall.meetLink ? (
                  canJoin ? (
                    <a
                      href={bookedCall.meetLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-orange-500 text-white font-semibold rounded-xl hover:opacity-90 transition mb-6"
                    >
                      <Video className="w-5 h-5" /> Join Google Meet
                    </a>
                  ) : (
                    <div className="inline-flex items-center gap-2 px-5 py-3 bg-gray-100 border border-gray-200 text-gray-500 rounded-xl mb-6 text-sm font-medium cursor-not-allowed select-none">
                      <Clock className="w-4 h-4" />
                      Join link opens {joinCountdown ? `in ${joinCountdown}` : 'soon'} (5 min before meeting)
                    </div>
                  )
                ) : (
                  <div className="inline-flex items-center gap-2 px-5 py-3 bg-blue-50 border border-blue-200 text-blue-700 rounded-xl mb-6 text-sm font-medium">
                    <Clock className="w-4 h-4" />
                    Meet link will be shared once our team confirms the slot
                  </div>
                )}

                <div className="flex items-center justify-center gap-2 text-sm text-gray-400 mb-8">
                  <Mail className="w-4 h-4" />
                  A confirmation email has been sent to your registered email address
                </div>

                <button
                  onClick={() => router.replace('/expert-dashboard')}
                  className="px-8 py-3 bg-gradient-to-r from-blue-600 to-orange-500 hover:opacity-90 rounded-xl text-white font-semibold transition flex items-center gap-2 mx-auto"
                >
                  Go to Dashboard <ArrowRight className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-3xl font-bold text-gray-900">Schedule Your Onboarding Call</h2>
                  <button onClick={() => setShowScheduler(false)} className="p-2 hover:bg-gray-100 rounded-lg transition-all">
                    <X className="w-6 h-6 text-gray-900" />
                  </button>
                </div>

                <div className="grid md:grid-cols-2 gap-8">
                  {/* Date Picker */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Select Date</h3>
                    <div className="bg-white rounded-xl p-6">
                      <div className="flex items-center justify-between mb-4">
                        <span className="font-semibold text-gray-800">
                          {currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                        </span>
                        <div className="flex gap-2">
                          <button onClick={() => changeMonth(-1)} className="p-2 hover:bg-gray-100 rounded-lg">‹</button>
                          <button onClick={() => changeMonth(1)}  className="p-2 hover:bg-gray-100 rounded-lg">›</button>
                        </div>
                      </div>
                      <div className="grid grid-cols-7 gap-2">
                        {['S','M','T','W','T','F','S'].map((d, i) => (
                          <div key={i} className="text-center text-xs font-medium text-gray-600 py-2">{d}</div>
                        ))}
                        {generateCalendarDays().map((day, idx) => {
                          const dateString = day ? formatSelectedDate(day) : null;
                          const disabled   = isDateDisabled(day);
                          const selected   = dateString === selectedDate;
                          return (
                            <button
                              key={idx}
                              onClick={() => {
                              if (!disabled && day) {
                                setSelectedDate(dateString);
                                if (selectedTime && isTimeSlotDisabled(selectedTime, dateString)) {
                                  setSelectedTime('');
                                }
                              }
                            }}
                              disabled={disabled}
                              className={`text-center py-2 text-sm rounded transition-all ${
                                !day      ? 'invisible'
                                : disabled ? 'text-gray-300 cursor-not-allowed'
                                : selected  ? 'bg-blue-500 text-white font-bold'
                                : 'text-gray-700 hover:bg-blue-100 cursor-pointer'
                              }`}
                            >
                              {day || ''}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  {/* Time Picker */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Select Time</h3>
                    <div className="bg-white rounded-xl p-6 max-h-96 overflow-y-auto">
                      <div className="grid grid-cols-2 gap-3">
                        {timeSlots.map(time => {
                          const disabled = isTimeSlotDisabled(time);
                          return (
                            <button
                              key={time}
                              onClick={() => !disabled && setSelectedTime(time)}
                              disabled={disabled}
                              className={`py-3 px-4 rounded-lg text-sm font-medium transition-all ${
                                disabled
                                  ? 'bg-gray-50 text-gray-300 cursor-not-allowed'
                                  : selectedTime === time
                                  ? 'bg-blue-500 text-white'
                                  : 'bg-gray-100 text-gray-700 hover:bg-blue-100'
                              }`}
                            >
                              {time}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>

                {selectedDate && selectedTime && (
                  <div className="mt-6 p-4 bg-blue-50 border border-blue-300 rounded-lg">
                    <div className="flex items-center gap-3 text-gray-900">
                      <Clock className="w-5 h-5" />
                      <span className="font-medium">
                        Scheduled for: {new Date(selectedDate).toLocaleDateString('en-US', {
                          weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
                        })} at {selectedTime}
                      </span>
                    </div>
                  </div>
                )}

                {bookingError && (
                  <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600">
                    {bookingError}
                  </div>
                )}

                <div className="flex gap-4 mt-8">
                  <button
                    onClick={() => setShowScheduler(false)}
                    disabled={bookingLoading}
                    className="flex-1 py-3 bg-white border border-gray-300 rounded-lg text-gray-900 font-semibold hover:bg-gray-50 transition-all disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleConfirmSchedule}
                    disabled={!selectedDate || !selectedTime || bookingLoading}
                    className="flex-1 py-3 bg-gradient-to-r from-blue-600 to-orange-500 hover:from-blue-700 hover:to-orange-600 rounded-lg text-white font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {bookingLoading
                      ? <><Loader2 className="w-5 h-5 animate-spin" /> Booking...</>
                      : <><CheckCircle className="w-5 h-5" /> Confirm Schedule</>
                    }
                  </button>
                </div>
              </>
            )}
          </div>
        )}

        {/* Bottom Actions */}
        {!showOptions && !showScheduler && (
          <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={handleSkip}
              className="px-8 py-4 bg-white border border-gray-300 hover:bg-gray-50 rounded-xl text-gray-900 font-semibold transition-all"
            >
              I'll Understand Later & Go
            </button>
            <button
              onClick={handleStartOnboarding}
              className="px-8 py-4 bg-gradient-to-r from-blue-600 to-orange-500 hover:from-blue-700 hover:to-orange-600 rounded-xl text-white font-semibold transition-all hover:scale-105 shadow-xl flex items-center justify-center gap-2"
            >
              Let's Go <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        )}
      </div>

      <style>{`
        @keyframes blob {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33%       { transform: translate(30px, -50px) scale(1.1); }
          66%       { transform: translate(-20px, 20px) scale(0.9); }
        }
        .animate-blob { animation: blob 7s infinite; }
        .animation-delay-2000 { animation-delay: 2s; }
        .animation-delay-4000 { animation-delay: 4s; }
      `}</style>
    </div>
  );
}

export default WelcomeExpert;
