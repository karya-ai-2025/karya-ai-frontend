'use client';
// components/onboarding/BrandSetup.jsx
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowRight, ArrowLeft, Upload, Check, AlertCircle, Loader2 } from 'lucide-react';
import { updateBrandLogo, skipStep, getOnboardingStatus } from '@/services/onboardingApi';

function BrandSetup() {
  const router = useRouter();
  const [brandLogo, setBrandLogo] = useState(null);
  const [logoPreview, setLogoPreview] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [companyName, setCompanyName] = useState('your company');

  // Fetch company name from onboarding status
  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const response = await getOnboardingStatus();
        if (response.data?.company?.name) {
          setCompanyName(response.data.company.name);
        }
      } catch (err) {
        // Fallback to localStorage if API fails
        const stored = localStorage.getItem('user');
        if (stored) {
          try {
            const user = JSON.parse(stored);
            // Try to get company name from user data if available
          } catch (e) {}
        }
      }
    };
    fetchStatus();
  }, []);

  const handleLogoUpload = (file) => {
    if (file) {
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError('Image size must be less than 5MB');
        return;
      }

      // Validate file type
      if (!file.type.startsWith('image/')) {
        setError('Please upload an image file');
        return;
      }

      setError('');
      setBrandLogo(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleFileInput = (e) => {
    const file = e.target.files[0];
    handleLogoUpload(file);
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleLogoUpload(e.dataTransfer.files[0]);
    }
  };

  const handleSkip = async () => {
    try {
      setIsLoading(true);
      await skipStep(4);
      router.push('/onboarding-owner/icp-definition');
    } catch (err) {
      router.push('/onboarding-owner/icp-definition');
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirm = async () => {
    if (!brandLogo) {
      handleSkip();
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      await updateBrandLogo(logoPreview);
      router.push('/onboarding-owner/icp-definition');
    } catch (err) {
      setError(err.message || 'Failed to upload logo. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <div className="w-full max-w-2xl">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-500">Step 4 of 7</span>
            <span className="text-sm text-gray-500">57% Complete</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div className="bg-blue-500 h-2 rounded-full transition-all duration-300" style={{ width: '57%' }}></div>
          </div>
        </div>

        {/* Main Card */}
        <div className="bg-white border border-gray-200 shadow-lg rounded-2xl p-8">
          <div className="text-center mb-6">
            <p className="text-sm text-gray-500 mb-2">Brand Setup</p>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Let's set up {companyName}'s brand core.
            </h1>
            <p className="text-gray-500">
              Upload your company's logo (brand mark, favicon or LinkedIn company photo)
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          {/* Upload Area */}
          <div className="mb-6">
            <div className="bg-gray-50 border border-gray-200 rounded-xl p-6">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm text-gray-500">Upload Logo</span>
              </div>

              {/* Drag & Drop Area */}
              <div
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                className={`relative border-2 border-dashed rounded-xl p-12 transition-all ${
                  dragActive
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 bg-gray-50'
                }`}
              >
                {logoPreview ? (
                  <div className="flex flex-col items-center">
                    <img
                      src={logoPreview}
                      alt="Brand Logo Preview"
                      className="max-h-32 max-w-full object-contain mb-4"
                    />
                    <p className="text-green-600 text-sm flex items-center gap-2">
                      <Check className="w-4 h-4" />
                      Logo uploaded successfully
                    </p>
                  </div>
                ) : (
                  <div className="flex flex-col items-center">
                    <Upload className="w-12 h-12 text-gray-500 mb-4" />
                    <p className="text-gray-600 text-sm mb-2">
                      Drag or drop a logo to upload it
                    </p>
                  </div>
                )}
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileInput}
                  className="hidden"
                  id="logo-upload"
                  disabled={isLoading}
                />
              </div>

              {/* Upload Button */}
              <label
                htmlFor="logo-upload"
                className={`mt-4 w-full py-3 bg-gradient-to-r from-yellow-400 to-orange-400 hover:from-yellow-500 hover:to-orange-500 rounded-lg text-gray-900 font-semibold transition-all cursor-pointer flex items-center justify-center gap-2 ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <Upload className="w-5 h-5" />
                Upload Logo
              </label>

              {/* Confirm Button */}
              <button
                onClick={handleConfirm}
                disabled={!brandLogo || isLoading}
                className="mt-3 w-full py-3 bg-gray-50 border border-gray-200 hover:bg-gray-100 rounded-lg text-gray-900 font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Saving...
                  </>
                ) : (
                  'Confirm'
                )}
              </button>
            </div>
          </div>

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
              Your logo helps personalize your workspace and client communications
            </p>
          </div>

          {/* Navigation Buttons */}
          <div className="flex gap-4">
            <button
              onClick={() => router.push('/onboarding-owner/company-details')}
              disabled={isLoading}
              className="flex-1 py-3 bg-white border border-gray-300 rounded-xl text-gray-900 font-semibold hover:bg-gray-50 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <ArrowLeft className="w-5 h-5" />
              Back
            </button>
            <button
              onClick={handleConfirm}
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

export default BrandSetup;
