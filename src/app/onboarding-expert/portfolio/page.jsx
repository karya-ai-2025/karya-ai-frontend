'use client';

// components/onboarding-expert/ExpertPortfolio.jsx
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowRight, ArrowLeft, Upload, Plus, Trash2, ExternalLink, Check, FileText, AlertCircle, Loader2 } from 'lucide-react';
import { updatePortfolio, getExpertOnboardingStatus, skipStep } from '@/services/expertonboardingApi';

function ExpertPortfolio() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [error, setError] = useState('');

  const [caseStudies, setCaseStudies] = useState([
    {
      id: 1,
      title: '',
      client: '',
      description: '',
      results: '',
      link: '',
      attachments: []
    }
  ]);

  const [portfolioLinks, setPortfolioLinks] = useState({
    website: '',
    linkedin: '',
    portfolio: '',
    other: ''
  });

  // Fetch existing portfolio data on load
  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const response = await getExpertOnboardingStatus();
        if (response.data) {
          // Load social links
          if (response.data.socialLinks) {
            setPortfolioLinks({
              website: response.data.socialLinks.website || '',
              linkedin: response.data.socialLinks.linkedin || '',
              portfolio: response.data.socialLinks.portfolio || '',
              other: response.data.socialLinks.other || ''
            });
          }

          // Load portfolio/case studies
          if (response.data.portfolio && response.data.portfolio.length > 0) {
            const existingCaseStudies = response.data.portfolio.map((p, index) => ({
              id: index + 1,
              title: p.title || '',
              client: p.client || '',
              description: p.description || '',
              results: p.results || '',
              link: p.link || '',
              attachments: p.attachments || []
            }));
            setCaseStudies(existingCaseStudies);
          }
        }
      } catch (err) {
        console.log('No existing portfolio data');
      } finally {
        setIsFetching(false);
      }
    };
    fetchStatus();
  }, []);

  const handleCaseStudyChange = (id, field, value) => {
    setCaseStudies(caseStudies.map(cs =>
      cs.id === id ? { ...cs, [field]: value } : cs
    ));
    setError('');
  };

  const handleFileUpload = (id, files) => {
    const fileArray = Array.from(files).map(file => ({
      name: file.name,
      size: file.size,
      type: file.type
    }));

    setCaseStudies(caseStudies.map(cs =>
      cs.id === id ? { ...cs, attachments: [...cs.attachments, ...fileArray] } : cs
    ));
  };

  const removeAttachment = (caseStudyId, attachmentIndex) => {
    setCaseStudies(caseStudies.map(cs =>
      cs.id === caseStudyId
        ? { ...cs, attachments: cs.attachments.filter((_, i) => i !== attachmentIndex) }
        : cs
    ));
  };

  const addCaseStudy = () => {
    const newId = Math.max(...caseStudies.map(cs => cs.id)) + 1;
    setCaseStudies([...caseStudies, {
      id: newId,
      title: '',
      client: '',
      description: '',
      results: '',
      link: '',
      attachments: []
    }]);
  };

  const removeCaseStudy = (id) => {
    if (caseStudies.length > 1) {
      setCaseStudies(caseStudies.filter(cs => cs.id !== id));
    }
  };

  const handleLinkChange = (platform, value) => {
    setPortfolioLinks({
      ...portfolioLinks,
      [platform]: value
    });
    setError('');
  };

  const handleSkip = async () => {
    try {
      setIsLoading(true);
      await skipStep(4);
      router.push('/expert-landing');
    } catch (err) {
      router.push('/expert-landing');
    } finally {
      setIsLoading(false);
    }
  };

  const handleComplete = async () => {
    setIsLoading(true);
    setError('');

    try {
      // Filter valid case studies
      const validCaseStudies = caseStudies.filter(cs => cs.title || cs.description);

      await updatePortfolio({
        caseStudies: validCaseStudies.map(cs => ({
          title: cs.title.trim(),
          client: cs.client.trim(),
          description: cs.description.trim(),
          results: cs.results.trim(),
          link: cs.link.trim(),
          attachments: cs.attachments
        })),
        links: {
          website: portfolioLinks.website.trim(),
          linkedin: portfolioLinks.linkedin.trim(),
          portfolio: portfolioLinks.portfolio.trim(),
          other: portfolioLinks.other.trim()
        }
      });

      // Navigate to dashboard
      router.push('/expert-landing');
    } catch (err) {
      setError(err.message || 'Failed to save portfolio. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBack = () => {
    router.push('/onboarding-expert/services');
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
            <span className="text-sm text-gray-500">Step 4 of 4</span>
            <span className="text-sm text-gray-500">100% Complete</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div className="bg-indigo-500 h-2 rounded-full transition-all duration-300" style={{ width: '100%' }}></div>
          </div>
        </div>

        {/* Main Card */}
        <div className="bg-white border border-gray-200 shadow-sm rounded-2xl p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2 text-center">
            Portfolio & Case Studies
          </h1>
          <p className="text-gray-500 mb-8 text-center">
            Showcase your work and prove your expertise
          </p>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          {/* Portfolio Links */}
          <div className="mb-8 bg-white border border-gray-200 shadow-sm rounded-xl p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Professional Links</h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-2">
                  Personal Website
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <ExternalLink className="w-5 h-5 text-gray-400" />
                  </div>
                  <input
                    type="url"
                    value={portfolioLinks.website}
                    onChange={(e) => handleLinkChange('website', e.target.value)}
                    placeholder="https://yourwebsite.com"
                    disabled={isLoading}
                    className="w-full pl-12 pr-4 py-3 bg-white border border-gray-300 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/50 transition-all disabled:opacity-50"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-600 mb-2">
                  LinkedIn Profile
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <ExternalLink className="w-5 h-5 text-gray-400" />
                  </div>
                  <input
                    type="url"
                    value={portfolioLinks.linkedin}
                    onChange={(e) => handleLinkChange('linkedin', e.target.value)}
                    placeholder="https://linkedin.com/in/yourname"
                    disabled={isLoading}
                    className="w-full pl-12 pr-4 py-3 bg-white border border-gray-300 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/50 transition-all disabled:opacity-50"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-600 mb-2">
                  Portfolio Link
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <ExternalLink className="w-5 h-5 text-gray-400" />
                  </div>
                  <input
                    type="url"
                    value={portfolioLinks.portfolio}
                    onChange={(e) => handleLinkChange('portfolio', e.target.value)}
                    placeholder="https://behance.net/yourname"
                    disabled={isLoading}
                    className="w-full pl-12 pr-4 py-3 bg-white border border-gray-300 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/50 transition-all disabled:opacity-50"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-600 mb-2">
                  Other Link
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <ExternalLink className="w-5 h-5 text-gray-400" />
                  </div>
                  <input
                    type="url"
                    value={portfolioLinks.other}
                    onChange={(e) => handleLinkChange('other', e.target.value)}
                    placeholder="https://..."
                    disabled={isLoading}
                    className="w-full pl-12 pr-4 py-3 bg-white border border-gray-300 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/50 transition-all disabled:opacity-50"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Case Studies */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Case Studies & Projects</h3>
            <div className="space-y-6 max-h-[500px] overflow-y-auto pr-2">
              {caseStudies.map((caseStudy, index) => (
                <div
                  key={caseStudy.id}
                  className="bg-white border border-gray-200 shadow-sm rounded-xl p-6 relative"
                >
                  {/* Remove Button */}
                  {caseStudies.length > 1 && (
                    <button
                      onClick={() => removeCaseStudy(caseStudy.id)}
                      disabled={isLoading}
                      className="absolute top-4 right-4 p-2 bg-red-50 hover:bg-red-100 border border-red-200 rounded-lg transition-all disabled:opacity-50"
                    >
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </button>
                  )}

                  <h4 className="text-md font-semibold text-gray-900 mb-4">
                    Case Study {index + 1}
                  </h4>

                  <div className="space-y-4">
                    {/* Project Title */}
                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-2">
                        Project Title
                      </label>
                      <input
                        type="text"
                        value={caseStudy.title}
                        onChange={(e) => handleCaseStudyChange(caseStudy.id, 'title', e.target.value)}
                        placeholder="e.g., E-commerce CRM Migration & Optimization"
                        disabled={isLoading}
                        className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/50 transition-all disabled:opacity-50"
                      />
                    </div>

                    {/* Client */}
                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-2">
                        Client <span className="text-xs text-gray-400">(Optional - can be anonymous)</span>
                      </label>
                      <input
                        type="text"
                        value={caseStudy.client}
                        onChange={(e) => handleCaseStudyChange(caseStudy.id, 'client', e.target.value)}
                        placeholder="e.g., Fortune 500 Retail Company or Confidential"
                        disabled={isLoading}
                        className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/50 transition-all disabled:opacity-50"
                      />
                    </div>

                    {/* Description */}
                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-2">
                        Project Description
                      </label>
                      <textarea
                        value={caseStudy.description}
                        onChange={(e) => handleCaseStudyChange(caseStudy.id, 'description', e.target.value)}
                        placeholder="Describe the challenge, your approach, and the solution..."
                        rows={3}
                        disabled={isLoading}
                        className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/50 transition-all resize-none disabled:opacity-50"
                      />
                    </div>

                    {/* Results */}
                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-2">
                        Results & Impact
                      </label>
                      <textarea
                        value={caseStudy.results}
                        onChange={(e) => handleCaseStudyChange(caseStudy.id, 'results', e.target.value)}
                        placeholder="Quantify your impact: metrics, improvements, ROI..."
                        rows={2}
                        disabled={isLoading}
                        className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/50 transition-all resize-none disabled:opacity-50"
                      />
                    </div>

                    {/* Project Link */}
                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-2">
                        Project Link <span className="text-xs text-gray-400">(Optional)</span>
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                          <ExternalLink className="w-5 h-5 text-gray-400" />
                        </div>
                        <input
                          type="url"
                          value={caseStudy.link}
                          onChange={(e) => handleCaseStudyChange(caseStudy.id, 'link', e.target.value)}
                          placeholder="https://..."
                          disabled={isLoading}
                          className="w-full pl-12 pr-4 py-3 bg-white border border-gray-300 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/50 transition-all disabled:opacity-50"
                        />
                      </div>
                    </div>

                    {/* File Attachments */}
                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-2">
                        Attachments <span className="text-xs text-gray-400">(PDFs, images, etc.)</span>
                      </label>
                      <label className={`block w-full py-3 bg-gray-50 border border-dashed border-gray-300 rounded-xl text-center text-gray-500 hover:bg-gray-100 hover:border-gray-400 transition-all ${isLoading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}>
                        <Upload className="w-5 h-5 mx-auto mb-1" />
                        <span className="text-sm">Click to upload files</span>
                        <input
                          type="file"
                          multiple
                          onChange={(e) => handleFileUpload(caseStudy.id, e.target.files)}
                          className="hidden"
                          accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                          disabled={isLoading}
                        />
                      </label>

                      {/* Attached Files */}
                      {caseStudy.attachments.length > 0 && (
                        <div className="mt-2 space-y-2">
                          {caseStudy.attachments.map((file, fileIndex) => (
                            <div
                              key={fileIndex}
                              className="flex items-center justify-between p-2 bg-gray-50 rounded-lg"
                            >
                              <div className="flex items-center gap-2">
                                <FileText className="w-4 h-4 text-blue-400" />
                                <span className="text-sm text-gray-600">{file.name}</span>
                              </div>
                              <button
                                onClick={() => removeAttachment(caseStudy.id, fileIndex)}
                                disabled={isLoading}
                                className="p-1 hover:bg-red-50 rounded transition-colors disabled:opacity-50"
                              >
                                <Trash2 className="w-4 h-4 text-red-500" />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Add Case Study Button */}
            <button
              onClick={addCaseStudy}
              disabled={isLoading}
              className="w-full mt-4 py-3 bg-blue-50 border border-blue-200 hover:bg-blue-100 rounded-xl text-blue-700 font-medium transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <Plus className="w-5 h-5" />
              Add Another Case Study
            </button>
          </div>

          {/* Skip Option */}
          <div className="text-center mb-6">
            <button
              onClick={handleSkip}
              disabled={isLoading}
              className="text-gray-500 hover:text-gray-900 text-sm transition-colors disabled:opacity-50"
            >
              Skip this step - I'll add portfolio items later
            </button>
          </div>

          {/* Helper Text */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-8">
            <p className="text-blue-700 text-sm flex items-start gap-2">
              <span className="text-lg">💡</span>
              <span>
                Case studies help businesses understand the value you bring. Include specific metrics and results when possible. Don't worry if you can't share everything - even anonymous case studies are valuable!
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
              onClick={handleComplete}
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
                  Complete Setup
                  <Check className="w-5 h-5" />
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ExpertPortfolio;