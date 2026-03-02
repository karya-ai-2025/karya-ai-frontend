'use client';
// components/onboarding/QuickWins.jsx
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowRight, ArrowLeft, Search, Check, AlertCircle, Loader2, Sparkles } from 'lucide-react';
import { updateQuickWins, skipStep } from '@/services/onboardingApi';

function QuickWins() {
  const router = useRouter();
  const [selectedWins, setSelectedWins] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const quickWinOptions = [
    'Launch Website with Key Information',
    'Create Social Media Presence',
    'Develop Brand Voice and Messaging',
    'Define Target Market Segments',
    'Implement SEO Strategy for Website',
    'Establish Partnerships with Industry Leaders',
    'Collect and Showcase Customer Testimonials',
    'Develop a Unique Value Proposition',
    'Initiate Email Marketing Campaigns',
    'Conduct Competitor Analysis for Positioning',
    'Set Up Analytics and Tracking',
    'Create Content Calendar',
    'Design Lead Magnets',
    'Optimize Landing Pages',
    'Build Email List'
  ];

  const filteredOptions = quickWinOptions.filter(option =>
    option.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const toggleWin = (win) => {
    if (selectedWins.includes(win)) {
      setSelectedWins(selectedWins.filter(w => w !== win));
    } else {
      setSelectedWins([...selectedWins, win]);
    }
    setError('');
  };

  const handleSkip = async () => {
    try {
      setIsLoading(true);
      await skipStep(7);
      // Navigate to dashboard
      router.push('/business-dashboard');
    } catch (err) {
      router.push('/business-dashboard');
    } finally {
      setIsLoading(false);
    }
  };

  const handleComplete = async () => {
    setIsLoading(true);
    setError('');

    try {
      await updateQuickWins(selectedWins);

      // Update user in localStorage to reflect completed onboarding
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        try {
          const user = JSON.parse(storedUser);
          user.onboarding = user.onboarding || { owner: {} };
          user.onboarding.owner = {
            completed: true,
            currentStep: 7
          };
          localStorage.setItem('user', JSON.stringify(user));
        } catch (e) {}
      }

      // Navigate to dashboard
      router.push('/business-dashboard');
    } catch (err) {
      setError(err.message || 'Failed to complete setup. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBack = () => {
    router.push('/onboarding-owner/marketing-activities');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <div className="w-full max-w-3xl">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-500">Step 7 of 7</span>
            <span className="text-sm text-gray-500">100% Complete</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div className="bg-indigo-500 h-2 rounded-full transition-all duration-300" style={{ width: '100%' }}></div>
          </div>
        </div>

        {/* Main Card */}
        <div className="bg-white border border-gray-200 shadow-lg rounded-2xl p-8">
          <div className="text-center mb-8">
            <p className="text-sm text-gray-500 mb-2">Quick Wins</p>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Do you have any quick wins that you'd like to get done?
            </h1>
            <p className="text-gray-500">
              Select the marketing tasks you want to prioritize
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          {/* Search Bar */}
          <div className="mb-6">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Search className="w-5 h-5 text-gray-500" />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search for quick wins..."
                disabled={isLoading}
                className="w-full pl-12 pr-4 py-3 bg-white border border-gray-300 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/50 transition-all disabled:opacity-50"
              />
            </div>
          </div>

          {/* Quick Win Options */}
          <div className="mb-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-80 overflow-y-auto pr-2">
              {filteredOptions.map((win, index) => (
                <button
                  key={index}
                  onClick={() => toggleWin(win)}
                  disabled={isLoading}
                  className={`p-4 rounded-lg border-2 transition-all text-left ${
                    selectedWins.includes(win)
                      ? 'bg-indigo-50 border-indigo-500 shadow-lg'
                      : 'bg-gray-50 border-gray-200 hover:bg-gray-100 hover:border-gray-300'
                  } disabled:opacity-50`}
                >
                  <div className="flex items-center justify-between">
                    <span className={`text-sm font-medium ${
                      selectedWins.includes(win) ? 'text-gray-900' : 'text-gray-600'
                    }`}>
                      {win}
                    </span>
                    {selectedWins.includes(win) && (
                      <Check className="w-5 h-5 text-indigo-500 flex-shrink-0 ml-2" />
                    )}
                  </div>
                </button>
              ))}
            </div>

            {filteredOptions.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                No quick wins match your search
              </div>
            )}
          </div>

          {/* Selected Count */}
          {selectedWins.length > 0 && (
            <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4 mb-6">
              <p className="text-indigo-700 text-sm text-center flex items-center justify-center gap-2">
                <Sparkles className="w-4 h-4" />
                {selectedWins.length} quick win{selectedWins.length !== 1 ? 's' : ''} selected
              </p>
            </div>
          )}

          {/* Skip Link */}
          <div className="text-center mb-6">
            <button
              onClick={handleSkip}
              disabled={isLoading}
              className="text-gray-500 hover:text-gray-900 text-sm transition-colors flex items-center gap-2 mx-auto disabled:opacity-50"
            >
              Skip this step
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* Navigation Buttons */}
          <div className="flex gap-4">
            <button
              onClick={handleBack}
              disabled={isLoading}
              className="flex-1 py-3 bg-white border border-gray-300 rounded-xl text-gray-900 font-semibold hover:bg-gray-50 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <ArrowLeft className="w-5 h-5" />
              Back
            </button>
            <button
              onClick={handleComplete}
              disabled={isLoading}
              className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-700 rounded-xl text-white font-semibold transition-all hover:scale-105 shadow-lg flex items-center justify-center gap-2 disabled:opacity-50 disabled:hover:scale-100"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Completing...
                </>
              ) : (
                <>
                  Complete Setup
                  <Check className="w-5 h-5" />
                </>
              )}
            </button>
          </div>
        </div>

        {/* Celebration Animation on completion would go here */}
      </div>
    </div>
  );
}

export default QuickWins;
