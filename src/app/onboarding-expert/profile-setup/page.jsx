'use client';

// components/onboarding-expert/ExpertProfileSetup.jsx
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { User, Upload, ArrowRight, ArrowLeft, Briefcase, MapPin, MessageSquare, AlertCircle, Loader2 } from 'lucide-react';
import { updateProfileSetup, getExpertOnboardingStatus } from '@/services/expertonboardingApi';

function ExpertProfileSetup() {
  const router = useRouter();
  const [profilePhoto, setProfilePhoto] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    fullName: '',
    title: '',
    bio: '',
    communicationStyle: '',
    workExperience: '',
    location: ''
  });
  const [touched, setTouched] = useState({});

  // Fetch existing data on load
  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const response = await getExpertOnboardingStatus();
        if (response.data) {
          setFormData({
            fullName: response.data.fullName || '',
            title: response.data.headline || '',
            bio: response.data.bio || '',
            communicationStyle: response.data.communicationStyle || '',
            workExperience: getExperienceLabel(response.data.yearsOfExperience),
            location: formatLocation(response.data.location)
          });
          if (response.data.avatar) {
            setPhotoPreview(response.data.avatar);
          }
        }
      } catch (err) {
        // If no existing data, that's fine
        console.log('No existing expert data');
      } finally {
        setIsFetching(false);
      }
    };
    fetchStatus();
  }, []);

  const getExperienceLabel = (years) => {
    if (!years) return '';
    if (years <= 3) return '1-3 years';
    if (years <= 5) return '3-5 years';
    if (years <= 10) return '5-10 years';
    return '10+ years';
  };

  const formatLocation = (location) => {
    if (!location) return '';
    const parts = [location.city, location.state].filter(Boolean);
    return parts.join(', ');
  };

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
    fullName: !formData.fullName.trim() ? 'Full name is required' : '',
    title: !formData.title.trim() ? 'Professional title is required' : '',
    bio: !formData.bio.trim() ? 'Bio is required' : ''
  };

  const isFormValid = !errors.fullName && !errors.title && !errors.bio;

  const handleNext = async () => {
    setTouched({ fullName: true, title: true, bio: true });

    if (!isFormValid) {
      setError('Please fill in all required fields');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      await updateProfileSetup({
        avatar: photoPreview || undefined,
        fullName: formData.fullName.trim(),
        title: formData.title.trim(),
        bio: formData.bio.trim(),
        communicationStyle: formData.communicationStyle || undefined,
        workExperience: formData.workExperience || undefined,
        location: formData.location.trim() || undefined
      });
      router.push('/onboarding-expert/skills');
    } catch (err) {
      setError(err.message || 'Failed to save profile. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBack = () => {
    router.push('/');
  };

  const communicationStyles = ['Warm', 'Professional', 'Friendly', 'Direct'];
  const experienceLevels = ['1-3 years', '3-5 years', '5-10 years', '10+ years'];

  if (isFetching) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-blue-400 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <div className="w-full max-w-4xl">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-500">Step 1 of 4</span>
            <span className="text-sm text-gray-500">25% Complete</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div className="bg-indigo-500 h-2 rounded-full transition-all duration-300" style={{ width: '25%' }}></div>
          </div>
        </div>

        {/* Main Card */}
        <div className="bg-white border border-gray-200 shadow-sm rounded-2xl p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2 text-center">
            All About You
          </h1>
          <p className="text-gray-500 mb-8 text-center">
            Let's set up your expert profile
          </p>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          <div className="grid md:grid-cols-2 gap-8">
            {/* Left Column - Photo & Basic Info */}
            <div className="space-y-6">
              {/* Profile Photo */}
              <div className="flex flex-col items-center">
                <div className="relative">
                  <div className="w-32 h-32 rounded-full bg-gray-100 border-2 border-gray-300 flex items-center justify-center overflow-hidden">
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
                <p className="text-gray-500 text-sm mt-4">Upload Profile Photo</p>
              </div>

              {/* Full Name */}
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-2">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  onBlur={() => handleBlur('fullName')}
                  disabled={isLoading}
                  className={`w-full px-4 py-3 bg-white border rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 transition-all disabled:opacity-50 ${
                    touched.fullName && errors.fullName
                      ? 'border-red-300 focus:border-red-500 focus:ring-red-500/50'
                      : 'border-gray-300 focus:border-indigo-500 focus:ring-indigo-500/50'
                  }`}
                  placeholder="e.g., Anthony Bourdain"
                />
                {touched.fullName && errors.fullName && (
                  <p className="mt-1 text-xs text-red-500">{errors.fullName}</p>
                )}
              </div>

              {/* Professional Title */}
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-2">
                  Professional Title <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Briefcase className={`w-5 h-5 ${touched.title && errors.title ? 'text-red-500' : 'text-gray-400'}`} />
                  </div>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    onBlur={() => handleBlur('title')}
                    disabled={isLoading}
                    className={`w-full pl-12 pr-4 py-3 bg-white border rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 transition-all disabled:opacity-50 ${
                      touched.title && errors.title
                        ? 'border-red-300 focus:border-red-500 focus:ring-red-500/50'
                        : 'border-gray-300 focus:border-indigo-500 focus:ring-indigo-500/50'
                    }`}
                    placeholder="e.g., CRM Consultant"
                  />
                </div>
                {touched.title && errors.title && (
                  <p className="mt-1 text-xs text-red-500">{errors.title}</p>
                )}
              </div>

              {/* Location */}
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-2">
                  Location
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <MapPin className="w-5 h-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleChange}
                    disabled={isLoading}
                    className="w-full pl-12 pr-4 py-3 bg-white border border-gray-300 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/50 transition-all disabled:opacity-50"
                    placeholder="e.g., Beaverton, OR"
                  />
                </div>
              </div>
            </div>

            {/* Right Column - Additional Info */}
            <div className="space-y-6">
              {/* Bio */}
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-2">
                  About You <span className="text-red-500">*</span>
                </label>
                <textarea
                  name="bio"
                  value={formData.bio}
                  onChange={handleChange}
                  onBlur={() => handleBlur('bio')}
                  rows={5}
                  disabled={isLoading}
                  className={`w-full px-4 py-3 bg-white border rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 transition-all resize-none disabled:opacity-50 ${
                    touched.bio && errors.bio
                      ? 'border-red-300 focus:border-red-500 focus:ring-red-500/50'
                      : 'border-gray-300 focus:border-indigo-500 focus:ring-indigo-500/50'
                  }`}
                  placeholder="Tell businesses about your expertise, experience, and what makes you unique..."
                />
                {touched.bio && errors.bio && (
                  <p className="mt-1 text-xs text-red-500">{errors.bio}</p>
                )}
              </div>

              {/* Communication Style */}
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-2">
                  Communication Style
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none z-10">
                    <MessageSquare className="w-5 h-5 text-gray-400" />
                  </div>
                  <select
                    name="communicationStyle"
                    value={formData.communicationStyle}
                    onChange={handleChange}
                    disabled={isLoading}
                    className="w-full pl-12 pr-4 py-3 bg-white border border-gray-300 rounded-xl text-gray-900 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/50 transition-all appearance-none cursor-pointer disabled:opacity-50"
                  >
                    <option value="" className="bg-white">Select style</option>
                    {communicationStyles.map((style) => (
                      <option key={style} value={style} className="bg-white">
                        {style}
                      </option>
                    ))}
                  </select>
                  <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Work Experience */}
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-2">
                  Work Experience
                </label>
                <select
                  name="workExperience"
                  value={formData.workExperience}
                  onChange={handleChange}
                  disabled={isLoading}
                  className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl text-gray-900 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/50 transition-all appearance-none cursor-pointer disabled:opacity-50"
                >
                  <option value="" className="bg-white">Select experience</option>
                  {experienceLevels.map((level) => (
                    <option key={level} value={level} className="bg-white">
                      {level}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Helper Text */}
          <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-blue-700 text-sm flex items-start gap-2">
              <span className="text-lg">💡</span>
              <span>
                Your profile helps businesses understand who you are and what you bring to the table. Be authentic and showcase your unique strengths!
              </span>
            </p>
          </div>

          {/* Navigation Buttons */}
          <div className="flex gap-4 mt-8">
            <button
              onClick={handleBack}
              disabled={isLoading}
              className="flex-1 py-3 bg-white border border-gray-300 rounded-xl text-gray-700 font-semibold hover:bg-gray-50 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
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
    </div>
  );
}

export default ExpertProfileSetup;