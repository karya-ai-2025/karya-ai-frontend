'use client';
// pages/WelcomeOnboard.jsx
import { useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import {
  Play,
  ArrowRight,
  CheckCircle,
  Calendar,
  FileEdit,
  Clock,
  Video,
  X
} from 'lucide-react';

function WelcomeOnboard() {
  const router = useRouter();
  const [showOptions, setShowOptions] = useState(false);
  const [showScheduler, setShowScheduler] = useState(false);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [currentMonth, setCurrentMonth] = useState(new Date());

  // Get user role from localStorage
  const userRole = typeof window !== 'undefined' ? (localStorage.getItem('userRole') || 'owner') : 'owner';

  const handleSkip = () => {
    // Skip directly to dashboard
    router.push('/business-dashboard');
  };

  const handleStartOnboarding = () => {
    setShowOptions(true);
  };

  const handleManualOnboarding = () => {
    // Navigate to first step of manual onboarding
    router.push('/onboarding-owner/profile-setup');
  };

  const handleScheduleCall = () => {
    setShowScheduler(true);
  };

  const handleConfirmSchedule = () => {
    if (selectedDate && selectedTime) {
      // TODO: Save scheduled call to backend
      alert(`Call scheduled for ${selectedDate} at ${selectedTime}`);
      router.push('/business-dashboard');
    } else {
      alert('Please select both date and time');
    }
  };

  // Calendar functions
  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    return { daysInMonth, startingDayOfWeek };
  };

  const generateCalendarDays = () => {
    const { daysInMonth, startingDayOfWeek } = getDaysInMonth(currentMonth);
    const days = [];

    // Add empty cells for days before month starts
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }

    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(day);
    }

    return days;
  };

  const isDateDisabled = (day) => {
    if (!day) return true;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const selectedDateObj = new Date(
      currentMonth.getFullYear(),
      currentMonth.getMonth(),
      day
    );

    // Disable past dates
    return selectedDateObj < today;
  };

  const formatSelectedDate = (day) => {
    const year = currentMonth.getFullYear();
    const month = String(currentMonth.getMonth() + 1).padStart(2, '0');
    const dayStr = String(day).padStart(2, '0');
    return `${year}-${month}-${dayStr}`;
  };

  const changeMonth = (direction) => {
    const newMonth = new Date(currentMonth);
    newMonth.setMonth(currentMonth.getMonth() + direction);
    setCurrentMonth(newMonth);
  };

  const getMonthYearString = () => {
    return currentMonth.toLocaleDateString('en-US', {
      month: 'long',
      year: 'numeric'
    });
  };

  // Generate available time slots
  const timeSlots = [
    '9:00 AM', '9:30 AM', '10:00 AM', '10:30 AM', '11:00 AM', '11:30 AM',
    '12:00 PM', '12:30 PM', '1:00 PM', '1:30 PM', '2:00 PM', '2:30 PM',
    '3:00 PM', '3:30 PM', '4:00 PM', '4:30 PM', '5:00 PM'
  ];

  const priorityItems = [
    {
      icon: <CheckCircle className="w-5 h-5" />,
      text: "Users ready to activate and use their Workspace"
    },
    {
      icon: <CheckCircle className="w-5 h-5" />,
      text: "Company employee growth, policy, etc"
    },
    {
      icon: <CheckCircle className="w-5 h-5" />,
      text: "The protection and security of your data"
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      {/* Animated Background */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-20 left-20 w-72 h-72 bg-blue-300 rounded-full filter blur-xl animate-blob"></div>
        <div className="absolute top-40 right-20 w-72 h-72 bg-blue-300 rounded-full filter blur-xl animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-20 left-40 w-72 h-72 bg-violet-300 rounded-full filter blur-xl animate-blob animation-delay-4000"></div>
      </div>

      <div className="relative w-full max-w-6xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-4">
            <Image src="/karya-ai-logo.png" alt="Karya AI" width={48} height={48} className="rounded-xl object-contain" />
            <span className="text-2xl font-bold text-gray-900">Karya-AI</span>
          </div>
          <h1 className="text-5xl font-bold text-gray-900 mb-3">
            Getting Started
          </h1>
          <p className="text-xl text-gray-600">
            Welcome! Let's set up your workspace in minutes
          </p>
        </div>

        {/* Main Content */}
        {!showOptions && !showScheduler && (
          <div className="max-w-4xl mx-auto">
            {/* Single Card - Priorities and Video */}
            <div className="bg-white border border-gray-200 shadow-lg rounded-2xl p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                This onboarding prioritizes:
              </h2>

              <div className="space-y-4 mb-8">
                {priorityItems.map((item, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <div className="text-blue-500 mt-1">
                      {item.icon}
                    </div>
                    <p className="text-gray-600 text-lg">{item.text}</p>
                  </div>
                ))}
              </div>

              {/* Video Thumbnail */}
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
                    For You: Navigate onboarding using arrow keys and tab to select
                  </p>
                </div>
              </div>

              <div className="flex gap-3 justify-center flex-wrap">
                <button className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-blue-600 hover:text-gray-900 hover:bg-gray-50 transition-all flex items-center gap-2">
                  <ArrowRight className="w-4 h-4 rotate-180" />
                  Move Up
                </button>
                <button className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-blue-600 hover:text-gray-900 hover:bg-gray-50 transition-all flex items-center gap-2">
                  Move down
                  <ArrowRight className="w-4 h-4" />
                </button>
                <button className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-blue-600 hover:text-gray-900 hover:bg-gray-50 transition-all">
                  Enter
                </button>
                <button className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-blue-600 hover:text-gray-900 hover:bg-gray-50 transition-all">
                  Confirm
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Onboarding Options */}
        {showOptions && !showScheduler && (
          <div className="bg-white border border-gray-200 shadow-lg rounded-2xl p-8 max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
              Choose your onboarding path
            </h2>

            <div className="grid md:grid-cols-2 gap-6">
              {/* Manual Onboarding */}
              <div
                onClick={handleManualOnboarding}
                className="group bg-gray-50 border border-gray-200 rounded-xl p-8 hover:bg-gray-100 transition-all cursor-pointer hover:scale-105"
              >
                <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-orange-500 rounded-xl flex items-center justify-center mb-6">
                  <FileEdit className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3">
                  Fill Details Manually
                </h3>
                <p className="text-gray-600 mb-4">
                  Complete the onboarding form step-by-step at your own pace. Takes about 5-10 minutes.
                </p>
                <ul className="space-y-2 mb-6">
                  <li className="flex items-center gap-2 text-gray-600">
                    <CheckCircle className="w-4 h-4 text-green-400" />
                    <span className="text-sm">Quick and easy</span>
                  </li>
                  <li className="flex items-center gap-2 text-gray-600">
                    <CheckCircle className="w-4 h-4 text-green-400" />
                    <span className="text-sm">Immediate access</span>
                  </li>
                  <li className="flex items-center gap-2 text-gray-600">
                    <CheckCircle className="w-4 h-4 text-green-400" />
                    <span className="text-sm">7 simple steps</span>
                  </li>
                </ul>
                <button className="w-full py-3 bg-gradient-to-r from-blue-600 to-orange-500 rounded-lg text-white font-semibold flex items-center justify-center gap-2 group-hover:from-blue-700 group-hover:to-orange-600 transition-all">
                  Start Now
                  <ArrowRight className="w-5 h-5" />
                </button>
              </div>

              {/* Schedule a Call */}
              <div
                onClick={handleScheduleCall}
                className="group bg-gray-50 border border-gray-200 rounded-xl p-8 hover:bg-gray-100 transition-all cursor-pointer hover:scale-105"
              >
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center mb-6">
                  <Video className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3">
                  Schedule a Call
                </h3>
                <p className="text-gray-600 mb-4">
                  Get personalized help from our team. We'll guide you through setup and answer your questions.
                </p>
                <ul className="space-y-2 mb-6">
                  <li className="flex items-center gap-2 text-gray-600">
                    <CheckCircle className="w-4 h-4 text-green-400" />
                    <span className="text-sm">30-minute session</span>
                  </li>
                  <li className="flex items-center gap-2 text-gray-600">
                    <CheckCircle className="w-4 h-4 text-green-400" />
                    <span className="text-sm">Expert guidance</span>
                  </li>
                  <li className="flex items-center gap-2 text-gray-600">
                    <CheckCircle className="w-4 h-4 text-green-400" />
                    <span className="text-sm">Flexible timing</span>
                  </li>
                </ul>
                <button className="w-full py-3 bg-gradient-to-r from-blue-600 to-orange-500 rounded-lg text-white font-semibold flex items-center justify-center gap-2 group-hover:from-blue-700 group-hover:to-orange-600 transition-all">
                  Schedule Now
                  <Calendar className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="text-center mt-8">
              <button
                onClick={() => setShowOptions(false)}
                className="text-gray-500 hover:text-gray-900 transition-colors"
              >
                ← Go Back
              </button>
            </div>
          </div>
        )}

        {/* Scheduler Modal */}
        {showScheduler && (
          <div className="bg-white border border-gray-200 shadow-lg rounded-2xl p-8 max-w-4xl mx-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-3xl font-bold text-gray-900">Schedule Your Onboarding Call</h2>
              <button
                onClick={() => setShowScheduler(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-all"
              >
                <X className="w-6 h-6 text-gray-900" />
              </button>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              {/* Date Picker */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Select Date</h3>
                <div className="bg-white rounded-xl p-6">
                  <div className="flex items-center justify-between mb-4">
                    <span className="font-semibold text-gray-800">{getMonthYearString()}</span>
                    <div className="flex gap-2">
                      <button
                        onClick={() => changeMonth(-1)}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-all"
                      >
                        ‹
                      </button>
                      <button
                        onClick={() => changeMonth(1)}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-all"
                      >
                        ›
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-7 gap-2">
                    {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day) => (
                      <div key={day} className="text-center text-xs font-medium text-gray-600 py-2">
                        {day}
                      </div>
                    ))}
                    {generateCalendarDays().map((day, index) => {
                      const dateString = day ? formatSelectedDate(day) : null;
                      const isDisabled = isDateDisabled(day);
                      const isSelected = dateString === selectedDate;

                      return (
                        <button
                          key={index}
                          onClick={() => !isDisabled && day && setSelectedDate(dateString)}
                          disabled={isDisabled}
                          className={`text-center py-2 text-sm rounded transition-all ${
                            !day
                              ? 'invisible'
                              : isDisabled
                              ? 'text-gray-300 cursor-not-allowed'
                              : isSelected
                              ? 'bg-blue-500 text-white font-bold'
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
                    {timeSlots.map((time) => (
                      <button
                        key={time}
                        onClick={() => setSelectedTime(time)}
                        className={`py-3 px-4 rounded-lg text-sm font-medium transition-all ${
                          selectedTime === time
                            ? 'bg-blue-500 text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-blue-100'
                        }`}
                      >
                        {time}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Selected DateTime Display */}
            {selectedDate && selectedTime && (
              <div className="mt-6 p-4 bg-blue-50 border border-blue-300 rounded-lg">
                <div className="flex items-center gap-3 text-gray-900">
                  <Clock className="w-5 h-5" />
                  <span className="font-medium">
                    Scheduled for: {new Date(selectedDate).toLocaleDateString('en-US', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })} at {selectedTime}
                  </span>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-4 mt-8">
              <button
                onClick={() => setShowScheduler(false)}
                className="flex-1 py-3 bg-white border border-gray-300 rounded-lg text-gray-900 font-semibold hover:bg-gray-50 transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmSchedule}
                disabled={!selectedDate || !selectedTime}
                className="flex-1 py-3 bg-gradient-to-r from-blue-600 to-orange-500 hover:from-blue-700 hover:to-orange-600 rounded-lg text-white font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                Confirm Schedule
                <CheckCircle className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}

        {/* Bottom Actions - Only show on initial view */}
        {!showOptions && !showScheduler && (
          <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={handleSkip}
              className="px-8 py-4 bg-white backdrop-blur-sm border border-gray-300 hover:bg-gray-50 rounded-xl text-gray-900 font-semibold transition-all"
            >
              I'll Understand Later & Go
            </button>
            <button
              onClick={handleStartOnboarding}
              className="px-8 py-4 bg-gradient-to-r from-blue-600 to-orange-500 hover:from-blue-700 hover:to-orange-600 rounded-xl text-white font-semibold transition-all hover:scale-105 shadow-xl flex items-center justify-center gap-2"
            >
              Let's Go
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        )}
      </div>

      {/* CSS for animations */}
      <style>{`
        @keyframes blob {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </div>
  );
}

export default WelcomeOnboard;
