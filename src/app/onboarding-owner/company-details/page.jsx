'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  ArrowRight, ArrowLeft,
  Building2, Users, Globe, Briefcase,
  Upload, Check, Image as ImageIcon,
  AlertCircle, Loader2,
} from 'lucide-react';
import { updateCompanyDetails, updateBrandLogo } from '@/services/onboardingApi';

export default function CompanyDetails() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError]         = useState('');
  const [formData, setFormData]   = useState({
    companyName: '',
    companySize: '',
    industry:    '',
    website:     '',
  });
  const [touched, setTouched]     = useState({});
  const [logoFile, setLogoFile]   = useState(null);
  const [logoPreview, setLogoPreview] = useState(null);
  const [dragActive, setDragActive]   = useState(false);

  const companySizes = [
    { value: '1-10',      label: '1–10 employees' },
    { value: '11-50',     label: '11–50 employees' },
    { value: '51-200',    label: '51–200 employees' },
    { value: '201-500',   label: '201–500 employees' },
    { value: '501-1000',  label: '501–1000 employees' },
    { value: '1000+',     label: '1000+ employees' },
  ];

  const industries = [
    { value: 'technology',   label: 'Technology & Software' },
    { value: 'ecommerce',    label: 'E-commerce & Retail' },
    { value: 'healthcare',   label: 'Healthcare & Wellness' },
    { value: 'finance',      label: 'Finance & Banking' },
    { value: 'education',    label: 'Education & Training' },
    { value: 'marketing',    label: 'Marketing & Advertising' },
    { value: 'consulting',   label: 'Consulting & Professional Services' },
    { value: 'manufacturing',label: 'Manufacturing & Industrial' },
    { value: 'hospitality',  label: 'Hospitality & Tourism' },
    { value: 'real_estate',  label: 'Real Estate' },
    { value: 'media',        label: 'Media & Entertainment' },
    { value: 'nonprofit',    label: 'Non-Profit & Social Impact' },
    { value: 'other',        label: 'Other' },
  ];

  // ── form helpers ──────────────────────────────────────────────────────────────
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };
  const handleBlur = (field) => setTouched({ ...touched, [field]: true });

  const errors = {
    companyName: !formData.companyName.trim() ? 'Company name is required' : '',
    companySize: !formData.companySize        ? 'Company size is required' : '',
    industry:    !formData.industry           ? 'Industry is required'     : '',
  };
  const isFormValid = !errors.companyName && !errors.companySize && !errors.industry;

  // ── logo helpers ─────────────────────────────────────────────────────────────
  const handleLogoFile = (file) => {
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { setError('Logo must be less than 5 MB'); return; }
    if (!file.type.startsWith('image/')) { setError('Please upload an image file'); return; }
    setError('');
    setLogoFile(file);
    const reader = new FileReader();
    reader.onloadend = () => setLogoPreview(reader.result);
    reader.readAsDataURL(file);
  };
  const handleDrag  = (e) => { e.preventDefault(); e.stopPropagation(); setDragActive(e.type !== 'dragleave'); };
  const handleDrop  = (e) => { e.preventDefault(); e.stopPropagation(); setDragActive(false); handleLogoFile(e.dataTransfer.files[0]); };

  // ── submit ────────────────────────────────────────────────────────────────────
  const handleNext = async () => {
    setTouched({ companyName: true, companySize: true, industry: true });
    if (!isFormValid) { setError('Please fill in all required fields'); return; }

    setIsLoading(true);
    setError('');
    try {
      await updateCompanyDetails({
        companyName: formData.companyName.trim(),
        companySize: formData.companySize,
        industry:    formData.industry,
        website:     formData.website.trim() || undefined,
      });
      // Logo is optional — save if provided
      if (logoPreview) {
        await updateBrandLogo(logoPreview);
      }
      router.push('/onboarding-owner/icp-definition');
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
            <span className="text-sm text-gray-500">Step 2 of 5</span>
            <span className="text-sm text-gray-500">40% Complete</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div className="bg-blue-500 h-2 rounded-full transition-all duration-300" style={{ width: '40%' }} />
          </div>
        </div>

        {/* Card */}
        <div className="bg-white border border-gray-200 shadow-lg rounded-2xl p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Tell us about your company</h1>
          <p className="text-gray-500 mb-8">We'll use this to personalise your experience.</p>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          <div className="space-y-5 mb-8">

            {/* Company Name */}
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1.5">
                Company Name <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Building2 className={`absolute left-4 top-3.5 w-5 h-5 ${touched.companyName && errors.companyName ? 'text-red-400' : 'text-gray-400'}`} />
                <input
                  type="text" name="companyName" value={formData.companyName}
                  onChange={handleChange} onBlur={() => handleBlur('companyName')}
                  disabled={isLoading} placeholder="Enter your company name"
                  className={`w-full pl-12 pr-4 py-3 bg-white border rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 transition-all disabled:opacity-50 ${
                    touched.companyName && errors.companyName
                      ? 'border-red-300 focus:border-red-500 focus:ring-red-200'
                      : 'border-gray-300 focus:border-blue-500 focus:ring-blue-200'
                  }`}
                />
              </div>
              {touched.companyName && errors.companyName && <p className="mt-1 text-xs text-red-500">{errors.companyName}</p>}
            </div>

            {/* Company Size */}
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1.5">
                Company Size <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Users className={`absolute left-4 top-3.5 w-5 h-5 z-10 ${touched.companySize && errors.companySize ? 'text-red-400' : 'text-gray-400'}`} />
                <select
                  name="companySize" value={formData.companySize}
                  onChange={handleChange} onBlur={() => handleBlur('companySize')}
                  disabled={isLoading}
                  className={`w-full pl-12 pr-4 py-3 bg-white border rounded-xl text-gray-900 focus:outline-none focus:ring-2 appearance-none cursor-pointer disabled:opacity-50 ${
                    touched.companySize && errors.companySize
                      ? 'border-red-300 focus:border-red-500 focus:ring-red-200'
                      : 'border-gray-300 focus:border-blue-500 focus:ring-blue-200'
                  }`}
                >
                  <option value="">Select company size</option>
                  {companySizes.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                </select>
                <svg className="absolute right-4 top-4 w-4 h-4 text-gray-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7"/></svg>
              </div>
              {touched.companySize && errors.companySize && <p className="mt-1 text-xs text-red-500">{errors.companySize}</p>}
            </div>

            {/* Industry */}
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1.5">
                Industry <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Briefcase className={`absolute left-4 top-3.5 w-5 h-5 z-10 ${touched.industry && errors.industry ? 'text-red-400' : 'text-gray-400'}`} />
                <select
                  name="industry" value={formData.industry}
                  onChange={handleChange} onBlur={() => handleBlur('industry')}
                  disabled={isLoading}
                  className={`w-full pl-12 pr-4 py-3 bg-white border rounded-xl text-gray-900 focus:outline-none focus:ring-2 appearance-none cursor-pointer disabled:opacity-50 ${
                    touched.industry && errors.industry
                      ? 'border-red-300 focus:border-red-500 focus:ring-red-200'
                      : 'border-gray-300 focus:border-blue-500 focus:ring-blue-200'
                  }`}
                >
                  <option value="">Select your industry</option>
                  {industries.map(i => <option key={i.value} value={i.label}>{i.label}</option>)}
                </select>
                <svg className="absolute right-4 top-4 w-4 h-4 text-gray-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7"/></svg>
              </div>
              {touched.industry && errors.industry && <p className="mt-1 text-xs text-red-500">{errors.industry}</p>}
            </div>

            {/* Website */}
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1.5">
                Company Website <span className="text-gray-400 text-xs">(Optional)</span>
              </label>
              <div className="relative">
                <Globe className="absolute left-4 top-3.5 w-5 h-5 text-gray-400" />
                <input
                  type="url" name="website" value={formData.website}
                  onChange={handleChange} disabled={isLoading}
                  placeholder="https://www.example.com"
                  className="w-full pl-12 pr-4 py-3 bg-white border border-gray-300 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 disabled:opacity-50"
                />
              </div>
            </div>

            {/* ── Company Logo (optional) ── */}
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1.5">
                Company Logo <span className="text-gray-400 text-xs">(Optional — brand mark, favicon or LinkedIn photo)</span>
              </label>

              {logoPreview ? (
                /* Preview */
                <div className="flex items-center gap-4 p-4 bg-green-50 border border-green-200 rounded-xl">
                  <img src={logoPreview} alt="Logo preview" className="h-16 w-16 object-contain rounded-lg bg-white border border-gray-200" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-green-700 flex items-center gap-1.5">
                      <Check className="w-4 h-4" /> Logo uploaded
                    </p>
                    <p className="text-xs text-gray-500 mt-0.5">{logoFile?.name}</p>
                  </div>
                  <label className="text-xs text-blue-600 hover:underline cursor-pointer">
                    Change
                    <input type="file" accept="image/*" className="hidden" onChange={(e) => handleLogoFile(e.target.files[0])} />
                  </label>
                </div>
              ) : (
                /* Drop zone */
                <div
                  onDragEnter={handleDrag} onDragLeave={handleDrag} onDragOver={handleDrag} onDrop={handleDrop}
                  className={`border-2 border-dashed rounded-xl p-8 flex flex-col items-center gap-3 transition-colors ${
                    dragActive ? 'border-blue-400 bg-blue-50' : 'border-gray-200 bg-gray-50 hover:border-gray-300'
                  }`}
                >
                  <div className="w-12 h-12 bg-white border border-gray-200 rounded-xl flex items-center justify-center">
                    <ImageIcon className="w-6 h-6 text-gray-400" />
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-gray-600">Drag & drop your logo here, or</p>
                    <label className="mt-1 inline-flex items-center gap-1.5 text-sm text-blue-600 font-medium cursor-pointer hover:underline">
                      <Upload className="w-4 h-4" /> Browse file
                      <input type="file" accept="image/*" className="hidden" onChange={(e) => handleLogoFile(e.target.files[0])} />
                    </label>
                  </div>
                  <p className="text-xs text-gray-400">PNG, JPG, SVG — max 5 MB</p>
                </div>
              )}
            </div>
          </div>

          {/* Navigation */}
          <div className="flex gap-4">
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
              {isLoading ? <><Loader2 className="w-5 h-5 animate-spin" /> Saving...</> : <>Next <ArrowRight className="w-5 h-5" /></>}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
