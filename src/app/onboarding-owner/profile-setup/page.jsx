'use client';
// components/onboarding/ProfileSetup.jsx
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { User, Upload, ArrowRight, ArrowLeft, AlertCircle, Loader2 } from 'lucide-react';
import { updateProfilePhoto, skipStep } from '@/services/onboardingApi';

function ProfileSetup() {
  const router = useRouter();
  const [profilePhoto, setProfilePhoto] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handlePhotoUpload = (e) => {
    const file = e.target.files[0];
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
      setProfilePhoto(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSkip = async () => {
    try {
      setIsLoading(true);
      await skipStep(1);
      router.push('/onboarding-owner/platform-usage');
    } catch (err) {
      // Even if skip fails, allow navigation
      router.push('/onboarding-owner/platform-usage');
    } finally {
      setIsLoading(false);
    }
  };

  const handleNext = async () => {
    if (!profilePhoto) {
      // If no photo, just skip to next
      handleSkip();
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      await updateProfilePhoto(photoPreview);
      router.push('/onboarding-owner/platform-usage');
    } catch (err) {
      setError(err.message || 'Failed to upload photo. Please try again.');
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
            <span className="text-sm text-gray-500">Step 1 of 7</span>
            <span className="text-sm text-gray-500">14% Complete</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div className="bg-indigo-500 h-2 rounded-full transition-all duration-300" style={{ width: '14%' }}></div>
          </div>
        </div>

        {/* Main Card */}
        <div className="bg-white border border-gray-200 shadow-lg rounded-2xl p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2 text-center">
            Alright, your account is ready. Let's get your profile set up.
          </h1>

          {/* Error Message */}
          {error && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          <div className="mt-12 mb-8 flex flex-col items-center">
            {/* Profile Photo Upload */}
            <div className="relative">
              <div className="w-32 h-32 rounded-full bg-gray-50 border-2 border-gray-200 flex items-center justify-center overflow-hidden">
                {photoPreview ? (
                  <img src={photoPreview} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <User className="w-16 h-16 text-gray-400" />
                )}
              </div>
              <label className="absolute bottom-0 right-0 w-10 h-10 bg-indigo-600 rounded-full flex items-center justify-center cursor-pointer hover:scale-110 transition-transform shadow-lg">
                <Upload className="w-5 h-5 text-white" />
                <input
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoUpload}
                  className="hidden"
                  disabled={isLoading}
                />
              </label>
            </div>

            <p className="text-gray-500 text-sm mt-4">Upload Your Profile Photo</p>
          </div>

          {/* Skip Link */}
          <div className="text-center mb-8">
            <button
              onClick={handleSkip}
              disabled={isLoading}
              className="text-gray-500 hover:text-gray-900 text-sm transition-colors flex items-center gap-2 mx-auto disabled:opacity-50"
            >
              I like this one, next I want to upload my profile photo.
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* Help Text */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-8">
            <p className="text-gray-600 text-sm text-center flex items-center justify-center gap-2">
              <span className="text-indigo-500">💡</span>
              Click above on the icon to the right to upload a Profile Photo
            </p>
          </div>

          {/* Navigation Buttons */}
          <div className="flex gap-4">
            <button
              onClick={() => router.push('/onboarding-owner/welcome')}
              disabled={isLoading}
              className="flex-1 py-3 bg-white border border-gray-300 rounded-xl text-gray-900 font-semibold hover:bg-gray-50 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <ArrowLeft className="w-5 h-5" />
              Back
            </button>
            <button
              onClick={handleNext}
              disabled={isLoading}
              className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-700 rounded-xl text-white font-semibold transition-all hover:scale-105 shadow-lg flex items-center justify-center gap-2 disabled:opacity-50 disabled:hover:scale-100"
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
      `}</style>
    </div>
  );
}

export default ProfileSetup;
