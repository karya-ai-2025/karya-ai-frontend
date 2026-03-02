'use client';
// components/onboarding/PlatformUsage.jsx
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowRight, ArrowLeft, Briefcase, Users, ShoppingBag, Sparkles, AlertCircle, Loader2 } from 'lucide-react';
import { updatePlatformUsage } from '@/services/onboardingApi';

function PlatformUsage() {
  const router = useRouter();
  const [selectedUsage, setSelectedUsage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const usageOptions = [
    {
      id: 'single-team',
      icon: <Briefcase className="w-6 h-6" />,
      title: 'Managing for a single team or brand',
      description: 'I have one company and want to manage all marketing in one place'
    },
    {
      id: 'agency',
      icon: <Users className="w-6 h-6" />,
      title: 'Managing as an agency for multiple clients',
      description: 'I manage marketing for multiple businesses'
    },
    {
      id: 'portfolio',
      icon: <ShoppingBag className="w-6 h-6" />,
      title: 'Managing a portfolio of brands or companies',
      description: 'I own or operate multiple brands/businesses'
    },
    {
      id: 'personal',
      icon: <Sparkles className="w-6 h-6" />,
      title: 'Personal/Freelance marketing work',
      description: 'I want to explore marketing tools for personal projects'
    }
  ];

  const handleNext = async () => {
    if (!selectedUsage) {
      setError('Please select an option to continue');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      await updatePlatformUsage(selectedUsage);
      router.push('/onboarding-owner/company-details');
    } catch (err) {
      setError(err.message || 'Failed to save. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBack = () => {
    router.push('/onboarding-owner/profile-setup');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <div className="w-full max-w-3xl">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-500">Step 2 of 7</span>
            <span className="text-sm text-gray-500">28% Complete</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div className="bg-indigo-500 h-2 rounded-full transition-all duration-300" style={{ width: '28%' }}></div>
          </div>
        </div>

        {/* Main Card */}
        <div className="bg-white border border-gray-200 shadow-lg rounded-2xl p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            What are you looking to use the platform for?
          </h1>
          <p className="text-gray-500 mb-8">
            Let me know how we should engage.
          </p>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          {/* Options */}
          <div className="space-y-4 mb-8">
            {usageOptions.map((option) => (
              <button
                key={option.id}
                onClick={() => {
                  setSelectedUsage(option.id);
                  setError('');
                }}
                disabled={isLoading}
                className={`w-full p-4 rounded-xl border-2 transition-all text-left flex items-center gap-4 disabled:opacity-50 ${
                  selectedUsage === option.id
                    ? 'bg-indigo-50 border-indigo-500 shadow-lg'
                    : 'bg-gray-50 border-gray-200 hover:bg-gray-100 hover:border-gray-300'
                }`}
              >
                <div className={`w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0 ${
                  selectedUsage === option.id
                    ? 'bg-indigo-500 text-white'
                    : 'bg-gray-50 text-gray-500'
                }`}>
                  {option.icon}
                </div>
                <div className="flex-1">
                  <p className={`font-medium ${
                    selectedUsage === option.id ? 'text-gray-900' : 'text-gray-600'
                  }`}>
                    {option.title}
                  </p>
                  {option.description && (
                    <p className="text-sm text-gray-400 mt-1">{option.description}</p>
                  )}
                </div>
                <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                  selectedUsage === option.id
                    ? 'border-indigo-500 bg-indigo-500'
                    : 'border-gray-300'
                }`}>
                  {selectedUsage === option.id && (
                    <div className="w-3 h-3 bg-white rounded-full"></div>
                  )}
                </div>
              </button>
            ))}
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
              onClick={handleNext}
              disabled={!selectedUsage || isLoading}
              className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-700 rounded-xl text-white font-semibold transition-all hover:scale-105 shadow-lg flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  Next
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PlatformUsage;
