'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowRight, ArrowLeft, Building2, Briefcase, Users2, Rocket, AlertCircle, Loader2 } from 'lucide-react';
import { updatePlatformUsage } from '@/services/onboardingApi';

function PlatformUsage() {
  const router = useRouter();
  const [selectedUsage, setSelectedUsage] = useState('');
  const [isLoading, setIsLoading]         = useState(false);
  const [error, setError]                 = useState('');

  const usageOptions = [
    {
      id:          'business-owner',
      icon:        <Building2 className="w-6 h-6" />,
      title:       "I own or run a business",
      description: "I'm a founder, CEO or entrepreneur and want AI-powered marketing for my own company",
    },
    {
      id:          'inhouse-marketer',
      icon:        <Briefcase className="w-6 h-6" />,
      title:       "I work in-house at a company",
      description: "I'm a marketing manager, CMO or in-house marketer managing marketing for an employer",
    },
    {
      id:          'agency',
      icon:        <Users2 className="w-6 h-6" />,
      title:       "I run a marketing agency or consultancy",
      description: "I manage campaigns and strategies for multiple client businesses",
    },
    {
      id:          'freelancer',
      icon:        <Rocket className="w-6 h-6" />,
      title:       "I'm a freelancer or building a personal brand",
      description: "Solopreneur, consultant or creator working on personal projects",
    },
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

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <div className="w-full max-w-3xl">

        {/* Progress */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-500">Step 1 of 5</span>
            <span className="text-sm text-gray-500">20% Complete</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div className="bg-blue-500 h-2 rounded-full transition-all duration-300" style={{ width: '20%' }} />
          </div>
        </div>

        {/* Card */}
        <div className="bg-white border border-gray-200 shadow-lg rounded-2xl p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            What are you looking to use the platform for?
          </h1>
          <p className="text-gray-500 mb-8">
            This helps us tailor your experience from day one.
          </p>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          <div className="space-y-4 mb-8">
            {usageOptions.map((option) => (
              <button
                key={option.id}
                onClick={() => { setSelectedUsage(option.id); setError(''); }}
                disabled={isLoading}
                className={`w-full p-4 rounded-xl border-2 transition-all text-left flex items-center gap-4 disabled:opacity-50 ${
                  selectedUsage === option.id
                    ? 'bg-blue-50 border-blue-500 shadow-lg'
                    : 'bg-gray-50 border-gray-200 hover:bg-gray-100 hover:border-gray-300'
                }`}
              >
                <div className={`w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0 ${
                  selectedUsage === option.id ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-500'
                }`}>
                  {option.icon}
                </div>
                <div className="flex-1">
                  <p className={`font-semibold ${selectedUsage === option.id ? 'text-gray-900' : 'text-gray-700'}`}>
                    {option.title}
                  </p>
                  <p className="text-sm text-gray-400 mt-0.5">{option.description}</p>
                </div>
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                  selectedUsage === option.id ? 'border-blue-500 bg-blue-500' : 'border-gray-300'
                }`}>
                  {selectedUsage === option.id && <div className="w-2.5 h-2.5 bg-white rounded-full" />}
                </div>
              </button>
            ))}
          </div>

          <div className="flex gap-4">
            <button
              onClick={() => router.back()}
              disabled={isLoading}
              className="flex-1 py-3 bg-white border border-gray-300 rounded-xl text-gray-900 font-semibold hover:bg-gray-50 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <ArrowLeft className="w-5 h-5" /> Back
            </button>
            <button
              onClick={handleNext}
              disabled={!selectedUsage || isLoading}
              className="flex-1 py-3 bg-gradient-to-r from-blue-600 to-orange-500 hover:from-blue-700 hover:to-orange-600 rounded-xl text-white font-semibold transition-all hover:scale-105 shadow-lg flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
            >
              {isLoading ? <><Loader2 className="w-5 h-5 animate-spin" /> Saving...</> : <>Next <ArrowRight className="w-5 h-5" /></>}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PlatformUsage;
