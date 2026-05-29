'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  ArrowRight, ArrowLeft, Sparkles, Check,
  AlertCircle, Loader2, RefreshCw,
} from 'lucide-react';
import { updateMarketingActivities, generateMarketingGoals } from '@/services/onboardingApi';

export default function MarketingActivities() {
  const router = useRouter();
  const [isLoading, setIsLoading]       = useState(false);
  const [error, setError]               = useState('');
  const [formData, setFormData]         = useState({
    currentActivities: '',
    desiredPlan:       '',
    monthlyBudget:     '',
  });
  // AI-generated goals state
  const [generatingGoals, setGeneratingGoals] = useState(false);
  const [aiGoals, setAiGoals]                 = useState('');     // text shown to user
  const [goalsConfirmed, setGoalsConfirmed]   = useState(false);

  const budgetOptions = [
    { value: 'under_10k',    label: 'Under ₹10,000' },
    { value: '10k_25k',      label: '₹10,000 – ₹25,000' },
    { value: '25k_50k',      label: '₹25,000 – ₹50,000' },
    { value: '50k_1lakh',    label: '₹50,000 – ₹1 Lakh' },
    { value: '1lakh_5lakh',  label: '₹1 Lakh – ₹5 Lakhs' },
    { value: '5lakh_plus',   label: '₹5 Lakhs+' },
  ];

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
    // Reset goals if inputs change
    setAiGoals('');
    setGoalsConfirmed(false);
  };

  const canGenerateGoals = formData.currentActivities.trim() || formData.desiredPlan.trim();

  const handleGenerateGoals = async (regenerate = false) => {
    if (!canGenerateGoals) return;
    if (regenerate) setAiGoals('');
    setGoalsConfirmed(false);
    setGeneratingGoals(true);
    setError('');
    try {
      const res = await generateMarketingGoals(formData.currentActivities, formData.desiredPlan);
      setAiGoals(res.data.goalsObjectives);
    } catch (err) {
      setError(err.message || 'AI generation failed. Please try again.');
    } finally {
      setGeneratingGoals(false);
    }
  };

  const handleNext = async () => {
    if (!formData.currentActivities.trim() && !formData.desiredPlan.trim()) {
      setError('Please describe your current marketing or your desired plan to continue.');
      return;
    }

    setIsLoading(true);
    setError('');
    try {
      await updateMarketingActivities({
        currentActivities: formData.currentActivities.trim(),
        desiredPlan:        formData.desiredPlan.trim(),
        goalsObjectives:    goalsConfirmed ? aiGoals : '',
        monthlyBudget:      formData.monthlyBudget,
      });
      router.push('/onboarding-owner/quick-wins');
    } catch (err) {
      setError(err.message || 'Failed to save. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <div className="w-full max-w-3xl">

        {/* Progress */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-500">Step 4 of 5</span>
            <span className="text-sm text-gray-500">80% Complete</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div className="bg-blue-500 h-2 rounded-full transition-all duration-300" style={{ width: '80%' }} />
          </div>
        </div>

        {/* Card */}
        <div className="bg-white border border-gray-200 shadow-lg rounded-2xl p-8">
          <div className="mb-6">
            <p className="text-sm text-gray-400 font-medium mb-1">Marketing Strategy</p>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Tell us about your marketing
            </h1>
            <p className="text-gray-500 text-sm leading-relaxed">
              Describe what you're doing now and where you want to be — our AI will turn that into clear goals and objectives for you.
            </p>
          </div>

          {error && (
            <div className="mb-5 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          <div className="space-y-5">

            {/* Current activities */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                What marketing are you currently doing?
              </label>
              <textarea
                name="currentActivities"
                value={formData.currentActivities}
                onChange={handleChange}
                placeholder="Tell us in your own words… e.g. 'We post on Instagram twice a week, send a monthly newsletter to about 800 subscribers, and run occasional Google Ads. Our website gets decent traffic but conversions are low.'"
                rows={4}
                disabled={isLoading}
                className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl text-gray-900 placeholder-gray-400 text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 resize-none disabled:opacity-50"
              />
            </div>

            {/* Desired plan */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                What would you like your marketing to look like?
              </label>
              <textarea
                name="desiredPlan"
                value={formData.desiredPlan}
                onChange={handleChange}
                placeholder="Describe your dream marketing setup… e.g. 'Ideally we'd be consistently generating 30–40 quality leads per month, have a strong LinkedIn presence, and an automated email nurture flow so we're top-of-mind with prospects.'"
                rows={4}
                disabled={isLoading}
                className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl text-gray-900 placeholder-gray-400 text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 resize-none disabled:opacity-50"
              />
            </div>

            {/* ── AI Goals Generation ── */}
            {!aiGoals && (
              <button
                onClick={() => handleGenerateGoals()}
                disabled={!canGenerateGoals || generatingGoals || isLoading}
                className="w-full py-3.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 rounded-xl text-white font-semibold flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {generatingGoals ? (
                  <><Loader2 className="w-5 h-5 animate-spin" /> Generating your goals…</>
                ) : (
                  <><Sparkles className="w-5 h-5" /> Generate Goals &amp; Objectives with AI</>
                )}
              </button>
            )}

            {!canGenerateGoals && !aiGoals && (
              <p className="text-xs text-gray-400 text-center -mt-2">
                Fill in at least one field above to unlock AI generation
              </p>
            )}

            {/* AI-generated goals card */}
            {aiGoals && (
              <div className={`rounded-xl border p-5 transition-colors ${
                goalsConfirmed ? 'border-green-300 bg-green-50' : 'border-blue-200 bg-blue-50/40'
              }`}>
                <div className="flex items-center gap-2 mb-3">
                  <Sparkles className="w-4 h-4 text-blue-500" />
                  <p className="text-sm font-semibold text-gray-700">AI-generated Goals &amp; Objectives</p>
                  {goalsConfirmed && (
                    <span className="ml-auto inline-flex items-center gap-1 text-xs font-semibold text-green-700 bg-green-100 border border-green-200 px-2 py-0.5 rounded-full">
                      <Check className="w-3 h-3" /> Confirmed
                    </span>
                  )}
                </div>

                <div className="bg-white border border-gray-200 rounded-lg p-4 mb-4">
                  <pre className="text-sm text-gray-700 whitespace-pre-wrap font-sans leading-relaxed">
                    {aiGoals}
                  </pre>
                </div>

                {goalsConfirmed ? (
                  <button
                    onClick={() => setGoalsConfirmed(false)}
                    disabled={isLoading}
                    className="text-xs text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    Edit / regenerate
                  </button>
                ) : (
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleGenerateGoals(true)}
                      disabled={generatingGoals || isLoading}
                      className="flex-1 py-2.5 border border-gray-300 bg-white hover:bg-gray-50 rounded-lg text-sm font-medium text-gray-700 flex items-center justify-center gap-1.5 transition-colors disabled:opacity-50"
                    >
                      {generatingGoals ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
                      Try again
                    </button>
                    <button
                      onClick={() => setGoalsConfirmed(true)}
                      disabled={isLoading}
                      className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 rounded-lg text-sm font-semibold text-white flex items-center justify-center gap-1.5 transition-colors disabled:opacity-50"
                    >
                      <Check className="w-4 h-4" /> Looks good!
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Monthly Budget */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                Monthly Marketing Budget <span className="text-gray-400 font-normal text-xs">(Optional)</span>
              </label>
              <div className="relative">
                <select
                  name="monthlyBudget" value={formData.monthlyBudget}
                  onChange={handleChange} disabled={isLoading}
                  className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl text-gray-900 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 appearance-none cursor-pointer disabled:opacity-50"
                >
                  <option value="">Select your budget range</option>
                  {budgetOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
                <svg className="absolute right-4 top-4 w-4 h-4 text-gray-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7"/>
                </svg>
              </div>
            </div>
          </div>

          {/* Nav */}
          <div className="flex gap-4 mt-8">
            <button
              onClick={() => router.back()} disabled={isLoading}
              className="flex-1 py-3 bg-white border border-gray-300 rounded-xl text-gray-900 font-semibold hover:bg-gray-50 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <ArrowLeft className="w-5 h-5" /> Back
            </button>
            <button
              onClick={handleNext} disabled={isLoading}
              className="flex-1 py-3 bg-gradient-to-r from-blue-600 to-orange-500 hover:from-blue-700 hover:to-orange-600 rounded-xl text-white font-semibold transition-all hover:scale-105 shadow-lg flex items-center justify-center gap-2 disabled:opacity-50 disabled:hover:scale-100"
            >
              {isLoading ? <><Loader2 className="w-5 h-5 animate-spin" /> Saving…</> : <>Next <ArrowRight className="w-5 h-5" /></>}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
