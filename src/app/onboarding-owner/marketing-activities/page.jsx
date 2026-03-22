'use client';
// components/onboarding/MarketingActivities.jsx
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowRight, ArrowLeft, AlertCircle, Loader2 } from 'lucide-react';
import { updateMarketingActivities } from '@/services/onboardingApi';

function MarketingActivities() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    currentActivities: '',
    desiredPlan: '',
    goalsObjectives: '',
    monthlyBudget: ''
  });

  const budgetOptions = [
    { value: 'under_10k', label: 'Under ₹10,000' },
    { value: '10k_25k', label: '₹10,000 - ₹25,000' },
    { value: '25k_50k', label: '₹25,000 - ₹50,000' },
    { value: '50k_1lakh', label: '₹50,000 - ₹1 Lakh' },
    { value: '1lakh_5lakh', label: '₹1 Lakh - ₹5 Lakhs' },
    { value: '5lakh_plus', label: '₹5 Lakhs+' }
  ];

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError('');
  };

  const handleNext = async () => {
    // Validate at least one field is filled
    const hasContent = Object.values(formData).some(value => value.trim() !== '');

    if (!hasContent) {
      setError('Please fill in at least one field to continue');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      await updateMarketingActivities({
        currentActivities: formData.currentActivities.trim(),
        desiredPlan: formData.desiredPlan.trim(),
        goalsObjectives: formData.goalsObjectives.trim(),
        monthlyBudget: formData.monthlyBudget
      });
      router.push('/onboarding-owner/quick-wins');
    } catch (err) {
      setError(err.message || 'Failed to save. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBack = () => {
    router.push('/onboarding-owner/icp-definition');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <div className="w-full max-w-3xl">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-500">Step 6 of 7</span>
            <span className="text-sm text-gray-500">86% Complete</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div className="bg-blue-500 h-2 rounded-full transition-all duration-300" style={{ width: '86%' }}></div>
          </div>
        </div>

        {/* Main Card */}
        <div className="bg-white border border-gray-200 shadow-lg rounded-2xl p-8">
          <div className="mb-8">
            <p className="text-sm text-gray-500 mb-2">Training</p>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Let's train Karya-AI on your marketing activities.
            </h1>
            <p className="text-gray-500">
              What marketing programs or activities are you currently doing?
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          {/* Form Fields */}
          <div className="space-y-4 mb-8">
            {/* Current Marketing Activities */}
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-2">
                Current Marketing Activities
              </label>
              <textarea
                name="currentActivities"
                value={formData.currentActivities}
                onChange={handleChange}
                placeholder="Describe what you're currently doing on the marketing front... (e.g., social media posts, email newsletters, paid ads)"
                rows={4}
                disabled={isLoading}
                className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/50 transition-all resize-none disabled:opacity-50"
              />
            </div>

            {/* Desired Marketing Plan */}
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-2">
                What is your desired marketing plan?
              </label>
              <textarea
                name="desiredPlan"
                value={formData.desiredPlan}
                onChange={handleChange}
                placeholder="Describe your ideal marketing strategy... (e.g., expand to new channels, increase content production)"
                rows={3}
                disabled={isLoading}
                className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/50 transition-all resize-none disabled:opacity-50"
              />
            </div>

            {/* Goals & Objectives */}
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-2">
                Goals & Objectives
              </label>
              <textarea
                name="goalsObjectives"
                value={formData.goalsObjectives}
                onChange={handleChange}
                placeholder="What are your main marketing goals and objectives? (e.g., increase leads by 50%, grow social following)"
                rows={3}
                disabled={isLoading}
                className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/50 transition-all resize-none disabled:opacity-50"
              />
            </div>

            {/* Monthly Budget */}
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-2">
                Monthly Marketing Budget
              </label>
              <div className="relative">
                <select
                  name="monthlyBudget"
                  value={formData.monthlyBudget}
                  onChange={handleChange}
                  disabled={isLoading}
                  className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl text-gray-900 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/50 transition-all appearance-none cursor-pointer disabled:opacity-50"
                >
                  <option value="" className="bg-white">Select your budget range</option>
                  {budgetOptions.map((option) => (
                    <option key={option.value} value={option.value} className="bg-white">
                      {option.label}
                    </option>
                  ))}
                </select>
                <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
                  <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          {/* Helper Text */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-8">
            <p className="text-blue-700 text-sm flex items-start gap-2">
              <span className="text-lg">💡</span>
              <span>
                The more details you provide, the better Karya-AI can assist you with personalized marketing strategies and recommendations.
              </span>
            </p>
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
              disabled={isLoading}
              className="flex-1 py-3 bg-gradient-to-r from-blue-600 to-orange-500 hover:from-blue-700 hover:to-orange-600 rounded-xl text-white font-semibold transition-all hover:scale-105 shadow-lg flex items-center justify-center gap-2 disabled:opacity-50 disabled:hover:scale-100"
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

export default MarketingActivities;
