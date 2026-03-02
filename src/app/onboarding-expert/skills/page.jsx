'use client';

// components/onboarding-expert/ExpertSkills.jsx
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowRight, ArrowLeft, Check, Plus, X, AlertCircle, Loader2 } from 'lucide-react';
import { updateSkills, getExpertOnboardingStatus, skipStep } from '@/services/expertonboardingApi';

function ExpertSkills() {
  const router = useRouter();
  const [selectedSkills, setSelectedSkills] = useState([]);
  const [customSkill, setCustomSkill] = useState('');
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [error, setError] = useState('');

  // Predefined skills based on the screenshot
  const skillCategories = {
    'CRM & Marketing': [
      'CRM Management',
      'CRM Setup',
      'Customer Segmentation',
      'Lead Scoring',
      'Marketing Automation',
      'A/B Testing',
      'Campaign Planning',
      'No-Code Tools'
    ],
    'Platforms & Tools': [
      'HubSpot',
      'Salesforce',
      'Marketo',
      'Zoho CRM',
      'Pardot',
      'ActiveCampaign',
      'Mailchimp',
      'Google Analytics'
    ],
    'Content & Strategy': [
      'Content Marketing',
      'SEO Strategy',
      'Copywriting',
      'Email Marketing',
      'Social Media Marketing',
      'Brand Strategy',
      'Go-to-Market Strategy',
      'Product Marketing'
    ],
    'Analytics & Reporting': [
      'Data Analysis',
      'Dashboard Creation',
      'KPI Tracking',
      'Reporting',
      'Google Data Studio',
      'Tableau',
      'Excel/Spreadsheets',
      'Marketing Analytics'
    ],
    'Design & Creative': [
      'Graphic Design',
      'UI/UX Design',
      'Video Production',
      'Landing Page Design',
      'Presentation Design',
      'Branding',
      'Adobe Creative Suite',
      'Figma'
    ],
    'Technical': [
      'HTML/CSS',
      'JavaScript',
      'API Integrations',
      'Workflow Automation',
      'Zapier',
      'WordPress',
      'SQL',
      'Tag Management'
    ]
  };

  // Fetch existing skills on load
  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const response = await getExpertOnboardingStatus();
        if (response.data?.skills && response.data.skills.length > 0) {
          // Extract skill names from the skills array
          const skillNames = response.data.skills.map(s => s.name || s);
          setSelectedSkills(skillNames);
        }
      } catch (err) {
        console.log('No existing skills data');
      } finally {
        setIsFetching(false);
      }
    };
    fetchStatus();
  }, []);

  const toggleSkill = (skill) => {
    setError('');
    if (selectedSkills.includes(skill)) {
      setSelectedSkills(selectedSkills.filter(s => s !== skill));
    } else {
      setSelectedSkills([...selectedSkills, skill]);
    }
  };

  const addCustomSkill = () => {
    if (customSkill.trim() && !selectedSkills.includes(customSkill.trim())) {
      setSelectedSkills([...selectedSkills, customSkill.trim()]);
      setCustomSkill('');
      setShowCustomInput(false);
      setError('');
    }
  };

  const removeSkill = (skill) => {
    setSelectedSkills(selectedSkills.filter(s => s !== skill));
  };

  const handleSkip = async () => {
    try {
      setIsLoading(true);
      await skipStep(2);
      router.push('/onboarding-expert/services');
    } catch (err) {
      router.push('/onboarding-expert/services');
    } finally {
      setIsLoading(false);
    }
  };

  const handleNext = async () => {
    if (selectedSkills.length === 0) {
      setError('Please select at least one skill');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      await updateSkills(selectedSkills);
      router.push('/onboarding-expert/services');
    } catch (err) {
      setError(err.message || 'Failed to save skills. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBack = () => {
    router.push('/onboarding-expert/profile-setup');
  };

  if (isFetching) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-blue-400 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <div className="w-full max-w-5xl">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-500">Step 2 of 4</span>
            <span className="text-sm text-gray-500">50% Complete</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div className="bg-indigo-500 h-2 rounded-full transition-all duration-300" style={{ width: '50%' }}></div>
          </div>
        </div>

        {/* Main Card */}
        <div className="bg-white border border-gray-200 shadow-sm rounded-2xl p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2 text-center">
            Certified Skills
          </h1>
          <p className="text-gray-500 mb-8 text-center">
            Select the skills you're proficient in to help businesses find you
          </p>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          {/* Selected Skills */}
          {selectedSkills.length > 0 && (
            <div className="mb-8 bg-blue-50 border border-blue-200 rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  Selected Skills ({selectedSkills.length})
                </h3>
              </div>
              <div className="flex flex-wrap gap-2">
                {selectedSkills.map((skill, index) => (
                  <div
                    key={index}
                    className="px-4 py-2 bg-blue-500 text-white rounded-lg flex items-center gap-2 font-medium"
                  >
                    <Check className="w-4 h-4" />
                    {skill}
                    <button
                      onClick={() => removeSkill(skill)}
                      disabled={isLoading}
                      className="ml-1 hover:bg-blue-600 rounded-full p-1 transition-colors disabled:opacity-50"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Skills Categories */}
          <div className="space-y-6 mb-8 max-h-[500px] overflow-y-auto pr-2">
            {Object.entries(skillCategories).map(([category, skills]) => (
              <div key={category}>
                <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <div className="w-1 h-6 bg-indigo-500 rounded-full"></div>
                  {category}
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                  {skills.map((skill) => (
                    <button
                      key={skill}
                      onClick={() => toggleSkill(skill)}
                      disabled={isLoading}
                      className={`p-3 rounded-lg border-2 transition-all text-sm font-medium text-left disabled:opacity-50 ${
                        selectedSkills.includes(skill)
                          ? 'bg-blue-50 border-blue-500 text-gray-900 shadow-lg'
                          : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span>{skill}</span>
                        {selectedSkills.includes(skill) && (
                          <Check className="w-4 h-4 text-blue-400 flex-shrink-0 ml-2" />
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Add Custom Skill */}
          <div className="mb-8">
            {showCustomInput ? (
              <div className="flex gap-2">
                <input
                  type="text"
                  value={customSkill}
                  onChange={(e) => setCustomSkill(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && addCustomSkill()}
                  placeholder="Enter custom skill..."
                  disabled={isLoading}
                  className="flex-1 px-4 py-3 bg-white border border-gray-300 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/50 transition-all disabled:opacity-50"
                  autoFocus
                />
                <button
                  onClick={addCustomSkill}
                  disabled={isLoading}
                  className="px-6 py-3 bg-blue-500 hover:bg-blue-600 rounded-xl text-white font-medium transition-all disabled:opacity-50"
                >
                  Add
                </button>
                <button
                  onClick={() => {
                    setShowCustomInput(false);
                    setCustomSkill('');
                  }}
                  disabled={isLoading}
                  className="px-6 py-3 bg-white border border-gray-300 hover:bg-gray-50 rounded-xl text-gray-700 font-medium transition-all disabled:opacity-50"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <button
                onClick={() => setShowCustomInput(true)}
                disabled={isLoading}
                className="w-full py-3 bg-white border border-gray-300 hover:bg-gray-50 rounded-xl text-gray-700 font-medium transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <Plus className="w-5 h-5" />
                Add Custom Skill
              </button>
            )}
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

          {/* Helper Text */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-8">
            <p className="text-blue-700 text-sm flex items-start gap-2">
              <span className="text-lg">💡</span>
              <span>
                Select skills that match your expertise. This helps businesses find the right expert for their needs. You can add custom skills if you don't see what you're looking for.
              </span>
            </p>
          </div>

          {/* Navigation Buttons */}
          <div className="flex gap-4">
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
              disabled={isLoading || selectedSkills.length === 0}
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

export default ExpertSkills;