'use client';
// components/onboarding/ICPDefinition.jsx
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowRight, ArrowLeft, Sparkles, Plus, X, AlertCircle, Loader2, Check } from 'lucide-react';
import { updateICPs, skipStep } from '@/services/onboardingApi';

function ICPDefinition() {
  const router = useRouter();
  const [icps, setIcps] = useState([
    { id: 1, name: '', description: '', confirmed: false }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [generatingId, setGeneratingId] = useState(null);
  const [error, setError] = useState('');

  const handleICPChange = (id, field, value) => {
    setIcps(icps.map(icp =>
      icp.id === id ? { ...icp, [field]: value, confirmed: false } : icp
    ));
    setError('');
  };

  const handleGenerateDescription = async (id) => {
    const icp = icps.find(i => i.id === id);
    if (!icp.name.trim()) {
      setError('Please enter an ICP name first');
      return;
    }

    setGeneratingId(id);

    // Simulate AI generation (replace with actual API call when available)
    await new Promise(resolve => setTimeout(resolve, 1500));

    const sampleDescriptions = {
      'founder': `A startup founder typically in their late 20s to early 40s, focused on building and scaling their business. They value data-driven decisions, innovative solutions, and efficient marketing strategies. They're time-poor but eager to see measurable results from their marketing investments.`,
      'cmo': `A Chief Marketing Officer at a mid-to-large company, responsible for overall marketing strategy and brand positioning. They need comprehensive analytics, team collaboration tools, and enterprise-level solutions to manage complex marketing operations.`,
      'marketing manager': `A marketing manager overseeing day-to-day marketing activities. They need practical tools for campaign management, content scheduling, and performance tracking. They value ease of use and clear ROI reporting.`,
      'small business': `A small business owner wearing multiple hats, including marketing. They need simple, effective marketing solutions that don't require extensive training. Budget-conscious and results-focused.`,
      'ecommerce': `An e-commerce entrepreneur focused on driving online sales and customer acquisition. They need tools for social media marketing, email campaigns, and conversion optimization.`
    };

    // Generate description based on keywords in name
    let description = `A ${icp.name} is typically a professional who focuses on achieving their business goals through effective marketing. They value data-driven decisions, innovative solutions, and strategic partnerships to achieve their objectives. They're looking for tools that can help them save time while maximizing their marketing ROI.`;

    const nameLower = icp.name.toLowerCase();
    for (const [key, value] of Object.entries(sampleDescriptions)) {
      if (nameLower.includes(key)) {
        description = value;
        break;
      }
    }

    handleICPChange(id, 'description', description);
    setGeneratingId(null);
  };

  const handleAddICP = () => {
    const newId = Math.max(...icps.map(i => i.id)) + 1;
    setIcps([...icps, { id: newId, name: '', description: '', confirmed: false }]);
  };

  const handleRemoveICP = (id) => {
    if (icps.length <= 1) {
      setError('You need at least one ICP');
      return;
    }
    setIcps(icps.filter(icp => icp.id !== id));
  };

  const handleConfirmICP = (id) => {
    const icp = icps.find(i => i.id === id);
    if (!icp.name.trim() || !icp.description.trim()) {
      setError('Please fill in both name and description');
      return;
    }
    setIcps(icps.map(i =>
      i.id === id ? { ...i, confirmed: true } : i
    ));
    setError('');
  };

  const handleSkip = async () => {
    try {
      setIsLoading(true);
      await skipStep(5);
      router.push('/onboarding-owner/marketing-activities');
    } catch (err) {
      router.push('/onboarding-owner/marketing-activities');
    } finally {
      setIsLoading(false);
    }
  };

  const handleNext = async () => {
    // Check if at least one ICP is defined
    const validICPs = icps.filter(icp => icp.name.trim() && icp.description.trim());

    if (validICPs.length === 0) {
      setError('Please define at least one Ideal Customer Profile');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      await updateICPs(validICPs.map(icp => ({
        name: icp.name.trim(),
        description: icp.description.trim(),
        confirmed: icp.confirmed
      })));
      router.push('/onboarding-owner/marketing-activities');
    } catch (err) {
      setError(err.message || 'Failed to save ICPs. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBack = () => {
    router.push('/onboarding-owner/brand-setup');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <div className="w-full max-w-3xl">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-500">Step 5 of 7</span>
            <span className="text-sm text-gray-500">71% Complete</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div className="bg-blue-500 h-2 rounded-full transition-all duration-300" style={{ width: '71%' }}></div>
          </div>
        </div>

        {/* Main Card */}
        <div className="bg-white border border-gray-200 shadow-lg rounded-2xl p-8">
          <div className="text-center mb-8">
            <p className="text-sm text-gray-500 mb-2">Brand Core</p>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Let's work together to define your ICPs.
            </h1>
            <p className="text-gray-500">
              Enter an ideal customer name and I'll generate the description.
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          {/* ICP Forms */}
          <div className="space-y-6 mb-6">
            {icps.map((icp, index) => (
              <div key={icp.id} className={`bg-gray-50 border rounded-xl p-6 ${icp.confirmed ? 'border-green-500/50' : 'border-gray-200'}`}>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-500">Ideal Customer {index + 1}</span>
                    {icp.confirmed && (
                      <span className="text-xs bg-green-500/20 text-green-600 px-2 py-0.5 rounded-full flex items-center gap-1">
                        <Check className="w-3 h-3" /> Confirmed
                      </span>
                    )}
                  </div>
                  {icps.length > 1 && (
                    <button
                      onClick={() => handleRemoveICP(icp.id)}
                      disabled={isLoading}
                      className="text-gray-500 hover:text-red-500 transition-colors disabled:opacity-50"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  )}
                </div>

                {/* ICP Name */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-600 mb-2">
                    ICP Name
                  </label>
                  <input
                    type="text"
                    value={icp.name}
                    onChange={(e) => handleICPChange(icp.id, 'name', e.target.value)}
                    placeholder="Example: Sally the Series A Founder"
                    disabled={isLoading}
                    className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/50 transition-all disabled:opacity-50"
                  />
                </div>

                {/* Description */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-600 mb-2">
                    Description
                  </label>
                  <textarea
                    value={icp.description}
                    onChange={(e) => handleICPChange(icp.id, 'description', e.target.value)}
                    placeholder="Description will be generated..."
                    rows={4}
                    disabled={isLoading}
                    className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/50 transition-all resize-none disabled:opacity-50"
                  />
                </div>

                {/* Generate Description Button */}
                <button
                  onClick={() => handleGenerateDescription(icp.id)}
                  disabled={isLoading || generatingId === icp.id || !icp.name.trim()}
                  className="w-full mb-3 py-3 bg-gray-50 border border-gray-200 hover:bg-gray-100 rounded-lg text-gray-900 font-medium transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {generatingId === icp.id ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-5 h-5" />
                      Generate description
                    </>
                  )}
                </button>

                {/* Confirm Button */}
                <button
                  onClick={() => handleConfirmICP(icp.id)}
                  disabled={isLoading || !icp.name.trim() || !icp.description.trim() || icp.confirmed}
                  className={`w-full py-3 rounded-lg font-semibold transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed ${
                    icp.confirmed
                      ? 'bg-green-500/20 border border-green-500/50 text-green-600'
                      : 'bg-gray-50 border border-gray-200 hover:bg-gray-100 text-gray-900'
                  }`}
                >
                  {icp.confirmed ? (
                    <>
                      <Check className="w-5 h-5" />
                      ICP Confirmed
                    </>
                  ) : (
                    'Confirm This ICP'
                  )}
                </button>
              </div>
            ))}
          </div>

          {/* Add Another ICP Button */}
          <button
            onClick={handleAddICP}
            disabled={isLoading}
            className="w-full mb-6 py-3 bg-blue-50 border border-blue-300 hover:bg-blue-100 rounded-lg text-blue-600 font-medium transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <Plus className="w-5 h-5" />
            Add Another ICP
          </button>

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

          {/* Help Text */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-6">
            <p className="text-gray-600 text-sm text-center">
              ICPs help us tailor marketing strategies specifically for your target customers
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

export default ICPDefinition;
