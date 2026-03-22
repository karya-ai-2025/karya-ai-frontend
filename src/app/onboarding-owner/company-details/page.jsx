'use client';
// components/onboarding/CompanyDetails.jsx
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowRight, ArrowLeft, Building2, Users, Globe, Briefcase, AlertCircle, Loader2 } from 'lucide-react';
import { updateCompanyDetails } from '@/services/onboardingApi';

export default function CompanyDetails() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    companyName: '',
    companySize: '',
    industry: '',
    website: ''
  });
  const [touched, setTouched] = useState({});

  const companySizes = [
    { value: '1-10', label: '1-10 employees' },
    { value: '11-50', label: '11-50 employees' },
    { value: '51-200', label: '51-200 employees' },
    { value: '201-500', label: '201-500 employees' },
    { value: '501-1000', label: '501-1000 employees' },
    { value: '1000+', label: '1000+ employees' }
  ];

  const industries = [
    { value: 'technology', label: 'Technology & Software' },
    { value: 'ecommerce', label: 'E-commerce & Retail' },
    { value: 'healthcare', label: 'Healthcare & Wellness' },
    { value: 'finance', label: 'Finance & Banking' },
    { value: 'education', label: 'Education & Training' },
    { value: 'marketing', label: 'Marketing & Advertising' },
    { value: 'consulting', label: 'Consulting & Professional Services' },
    { value: 'manufacturing', label: 'Manufacturing & Industrial' },
    { value: 'hospitality', label: 'Hospitality & Tourism' },
    { value: 'real_estate', label: 'Real Estate' },
    { value: 'media', label: 'Media & Entertainment' },
    { value: 'nonprofit', label: 'Non-Profit & Social Impact' },
    { value: 'other', label: 'Other' }
  ];

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError('');
  };

  const handleBlur = (field) => {
    setTouched({ ...touched, [field]: true });
  };

  // Validation
  const errors = {
    companyName: !formData.companyName.trim() ? 'Company name is required' : '',
    companySize: !formData.companySize ? 'Company size is required' : '',
    industry: !formData.industry ? 'Industry is required' : ''
  };

  const isFormValid = !errors.companyName && !errors.companySize && !errors.industry;

  const handleNext = async () => {
    setTouched({ companyName: true, companySize: true, industry: true });

    if (!isFormValid) {
      setError('Please fill in all required fields');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      await updateCompanyDetails({
        companyName: formData.companyName.trim(),
        companySize: formData.companySize,
        industry: formData.industry,
        website: formData.website.trim() || undefined
      });
      router.push('/onboarding-owner/brand-setup');
    } catch (err) {
      setError(err.message || 'Failed to save. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBack = () => {
    router.push('/onboarding-owner/platform-usage');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <div className="w-full max-w-3xl">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-500">Step 3 of 7</span>
            <span className="text-sm text-gray-500">43% Complete</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div className="bg-blue-500 h-2 rounded-full transition-all duration-300" style={{ width: '43%' }}></div>
          </div>
        </div>

        {/* Main Card */}
        <div className="bg-white border border-gray-200 shadow-lg rounded-2xl p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Tell us about your company
          </h1>
          <p className="text-gray-500 mb-8">
            Help us understand your business better
          </p>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          {/* Form */}
          <div className="space-y-6 mb-8">
            {/* Company Name */}
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-2">
                Company Name <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Building2 className={`w-5 h-5 ${touched.companyName && errors.companyName ? 'text-red-500' : 'text-gray-500'}`} />
                </div>
                <input
                  type="text"
                  name="companyName"
                  value={formData.companyName}
                  onChange={handleChange}
                  onBlur={() => handleBlur('companyName')}
                  disabled={isLoading}
                  className={`w-full pl-12 pr-4 py-3 bg-white border rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 transition-all disabled:opacity-50 ${
                    touched.companyName && errors.companyName
                      ? 'border-red-300 focus:border-red-500 focus:ring-red-500/50'
                      : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500/50'
                  }`}
                  placeholder="Enter your company name"
                />
              </div>
              {touched.companyName && errors.companyName && (
                <p className="mt-1 text-xs text-red-500">{errors.companyName}</p>
              )}
            </div>

            {/* Company Size */}
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-2">
                Company Size <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none z-10">
                  <Users className={`w-5 h-5 ${touched.companySize && errors.companySize ? 'text-red-500' : 'text-gray-500'}`} />
                </div>
                <select
                  name="companySize"
                  value={formData.companySize}
                  onChange={handleChange}
                  onBlur={() => handleBlur('companySize')}
                  disabled={isLoading}
                  className={`w-full pl-12 pr-4 py-3 bg-white border rounded-xl text-gray-900 focus:outline-none focus:ring-2 transition-all appearance-none cursor-pointer disabled:opacity-50 ${
                    touched.companySize && errors.companySize
                      ? 'border-red-300 focus:border-red-500 focus:ring-red-500/50'
                      : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500/50'
                  }`}
                >
                  <option value="" className="bg-white">Select company size</option>
                  {companySizes.map((size) => (
                    <option key={size.value} value={size.value} className="bg-white">
                      {size.label}
                    </option>
                  ))}
                </select>
                <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
                  <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
              {touched.companySize && errors.companySize && (
                <p className="mt-1 text-xs text-red-500">{errors.companySize}</p>
              )}
            </div>

            {/* Industry */}
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-2">
                Industry <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none z-10">
                  <Briefcase className={`w-5 h-5 ${touched.industry && errors.industry ? 'text-red-500' : 'text-gray-500'}`} />
                </div>
                <select
                  name="industry"
                  value={formData.industry}
                  onChange={handleChange}
                  onBlur={() => handleBlur('industry')}
                  disabled={isLoading}
                  className={`w-full pl-12 pr-4 py-3 bg-white border rounded-xl text-gray-900 focus:outline-none focus:ring-2 transition-all appearance-none cursor-pointer disabled:opacity-50 ${
                    touched.industry && errors.industry
                      ? 'border-red-300 focus:border-red-500 focus:ring-red-500/50'
                      : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500/50'
                  }`}
                >
                  <option value="" className="bg-white">Select your industry</option>
                  {industries.map((industry) => (
                    <option key={industry.value} value={industry.label} className="bg-white">
                      {industry.label}
                    </option>
                  ))}
                </select>
                <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
                  <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
              {touched.industry && errors.industry && (
                <p className="mt-1 text-xs text-red-500">{errors.industry}</p>
              )}
            </div>

            {/* Website (Optional) */}
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-2">
                Company Website <span className="text-gray-400 text-xs">(Optional)</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Globe className="w-5 h-5 text-gray-500" />
                </div>
                <input
                  type="url"
                  name="website"
                  value={formData.website}
                  onChange={handleChange}
                  disabled={isLoading}
                  className="w-full pl-12 pr-4 py-3 bg-white border border-gray-300 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/50 transition-all disabled:opacity-50"
                  placeholder="https://www.example.com"
                />
              </div>
            </div>
          </div>

          {/* Helper Text */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-8">
            <p className="text-blue-700 text-sm flex items-start gap-2">
              <span className="text-lg">💡</span>
              <span>
                This information helps us personalize your experience and provide relevant insights for your industry.
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
