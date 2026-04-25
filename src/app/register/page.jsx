'use client';
// pages/Register.jsx
import { useState, useEffect, Suspense } from 'react';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Mail, Lock, User, Eye, EyeOff, ArrowRight, Briefcase, Users, AlertCircle, CheckCircle, Check, X } from 'lucide-react';

// Constants
const ROLES = {
  OWNER: 'owner',
  EXPERT: 'expert'
};

const ROLE_CONFIG = {
  [ROLES.OWNER]: {
    title: 'Create Business Account',
    subtitle: 'Start transforming your marketing today',
    icon: Briefcase,
    gradient: 'bg-gradient-to-r from-blue-600 to-orange-500',
    onboardingRoute: '/onboarding-owner/welcome'
  },
  [ROLES.EXPERT]: {
    title: 'Join as Expert',
    subtitle: 'Connect with businesses and grow your career',
    icon: Users,
    gradient: 'bg-gradient-to-r from-blue-600 to-orange-500',
    onboardingRoute: '/onboarding-expert/profile-setup'
  }
};

// API Base URL
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

// Password strength checker
const checkPasswordStrength = (password) => {
  const checks = {
    length: password.length >= 8,
    uppercase: /[A-Z]/.test(password),
    lowercase: /[a-z]/.test(password),
    number: /\d/.test(password),
    special: /[@$!%*?&]/.test(password)
  };

  const strength = Object.values(checks).filter(Boolean).length;

  return {
    checks,
    strength,
    label: strength <= 2 ? 'Weak' : strength <= 4 ? 'Medium' : 'Strong',
    color: strength <= 2 ? 'red' : strength <= 4 ? 'yellow' : 'green'
  };
};

function RegisterContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const role = searchParams.get('role') || ROLES.OWNER;

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [emailExists, setEmailExists] = useState(false);
  const [checkingEmail, setCheckingEmail] = useState(false);

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    company: '',
    password: '',
    confirmPassword: '',
    acceptTerms: false
  });

  const [touched, setTouched] = useState({
    fullName: false,
    email: false,
    company: false,
    password: false,
    confirmPassword: false,
    acceptTerms: false
  });

  // Validation rules
  const validateFullName = (name) => {
    if (!name.trim()) return 'Full name is required';
    if (name.trim().length < 2) return 'Name must be at least 2 characters';
    if (name.trim().length > 50) return 'Name cannot exceed 50 characters';
    if (!/^[a-zA-Z\s'-]+$/.test(name)) return 'Name can only contain letters, spaces, hyphens';
    return '';
  };

  const validateEmail = (email) => {
    if (!email.trim()) return 'Email is required';
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) return 'Please enter a valid email address';
    if (emailExists) return 'An account with this email already exists';
    return '';
  };

  const validateCompany = (company) => {
    if (role === ROLES.OWNER && !company.trim()) return 'Company name is required';
    if (company.length > 100) return 'Company name cannot exceed 100 characters';
    return '';
  };

  const validatePassword = (password) => {
    if (!password) return 'Password is required';
    if (password.length < 8) return 'Password must be at least 8 characters';
    if (!/[A-Z]/.test(password)) return 'Must contain uppercase letter';
    if (!/[a-z]/.test(password)) return 'Must contain lowercase letter';
    if (!/\d/.test(password)) return 'Must contain a number';
    if (!/[@$!%*?&]/.test(password)) return 'Must contain special character (@$!%*?&)';
    return '';
  };

  const validateConfirmPassword = (confirmPassword) => {
    if (!confirmPassword) return 'Please confirm your password';
    if (confirmPassword !== formData.password) return 'Passwords do not match';
    return '';
  };

  const validateTerms = (accepted) => {
    if (!accepted) return 'You must accept the terms';
    return '';
  };

  // Get all validation errors
  const errors = {
    fullName: validateFullName(formData.fullName),
    email: validateEmail(formData.email),
    company: validateCompany(formData.company),
    password: validatePassword(formData.password),
    confirmPassword: validateConfirmPassword(formData.confirmPassword),
    acceptTerms: validateTerms(formData.acceptTerms)
  };

  // Check if form is valid
  const isFormValid = Object.values(errors).every(error => !error);

  // Password strength
  const passwordStrength = checkPasswordStrength(formData.password);

  // Debounced email check
  useEffect(() => {
    const checkEmail = async () => {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!formData.email || !emailRegex.test(formData.email)) {
        setEmailExists(false);
        return;
      }

      setCheckingEmail(true);
      try {
        const response = await fetch(`${API_URL}/auth/check-email`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: formData.email.toLowerCase().trim() })
        });
        const data = await response.json();
        setEmailExists(data.exists);
      } catch (err) {
        console.error('Email check failed:', err);
      } finally {
        setCheckingEmail(false);
      }
    };

    const timeoutId = setTimeout(checkEmail, 500);
    return () => clearTimeout(timeoutId);
  }, [formData.email]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Mark all fields as touched
    setTouched({
      fullName: true,
      email: true,
      company: true,
      password: true,
      confirmPassword: true,
      acceptTerms: true
    });

    if (!isFormValid) {
      setError('Please fix the errors above');
      return;
    }

    setError('');
    setSuccess('');
    setIsLoading(true);

    try {
      const response = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          fullName: formData.fullName.trim(),
          email: formData.email.toLowerCase().trim(),
          password: formData.password,
          confirmPassword: formData.confirmPassword,
          role,
          company: formData.company.trim() || undefined
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Registration failed');
      }

      // Store token
      if (data.token) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
      }

      setSuccess('Account created! Redirecting to onboarding...');

      // Navigate to onboarding
      setTimeout(() => {
        router.push(ROLE_CONFIG[role].onboardingRoute);
      }, 1500);

    } catch (err) {
      setError(err.message || 'Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setError('');
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleBlur = (field) => {
    setTouched(prev => ({ ...prev, [field]: true }));
  };

  const handleSocialSignup = (provider) => {
    setError(`${provider} signup coming soon!`);
  };

  const currentRole = ROLE_CONFIG[role] || ROLE_CONFIG[ROLES.OWNER];
  const Icon = currentRole.icon;

  // Password requirement indicator component
  const PasswordCheck = ({ met, text }) => (
    <div className={`flex items-center gap-1.5 text-xs ${met ? 'text-green-500' : 'text-gray-400'}`}>
      {met ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
      {text}
    </div>
  );

  return (
    <div className="min-h-screen bg-white flex">
      {/* LEFT: Brand Panel */}
      <div className="hidden lg:flex w-[45%] bg-gray-950 relative overflow-hidden flex-col p-12">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#1d4ed815_1px,transparent_1px),linear-gradient(to_bottom,#1d4ed815_1px,transparent_1px)] bg-[size:3rem_3rem]" />
        <div className="absolute top-20 left-10 w-72 h-72 bg-blue-600/10 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-0 w-64 h-64 bg-orange-500/10 rounded-full blur-3xl" />

        <div className="relative flex flex-col h-full">
          <Link href="/" className="flex items-center gap-3 mb-auto">
            <Image src="/karya-ai-logo.png" alt="Karya AI" width={44} height={44} className="rounded-xl object-contain" />
            <span className="text-xl font-black text-white">Karya-AI</span>
          </Link>

          <div className="my-auto">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-500/20 border border-blue-500/30 rounded-full mb-6">
              <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
              <span className="text-blue-300 text-xs font-semibold">Join 743+ growing teams today</span>
            </div>
            <h2 className="text-4xl font-black text-white leading-[1.1] mb-4">
              Start growing<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-orange-400">faster today.</span>
            </h2>
            <p className="text-gray-400 text-lg leading-relaxed mb-10">From your first prompt to your first 100 customers — AI handles the planning, experts handle execution.</p>

            {/* Steps */}
            <div className="space-y-4 mb-10">
              {[
                { n:'1', t:'Sign up free', d:'No credit card required. Setup in 5 minutes.' },
                { n:'2', t:'AI builds your roadmap', d:'90-day GTM plan generated instantly.' },
                { n:'3', t:'Match with experts', d:'Pre-vetted talent, ready to execute.' },
              ].map(s=>(
                <div key={s.n} className="flex items-start gap-4">
                  <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm font-black flex-shrink-0 mt-0.5">{s.n}</div>
                  <div>
                    <p className="text-white font-bold text-sm">{s.t}</p>
                    <p className="text-gray-500 text-xs">{s.d}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
              <div className="flex gap-1 mb-3">{[1,2,3,4,5].map(i=><span key={i} className="text-yellow-400 text-sm">★</span>)}</div>
              <p className="text-gray-300 text-sm leading-relaxed mb-4">"We scaled from ₹30L to ₹1.2Cr/month in under 3 months. Worth every rupee."</p>
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full" />
                <div>
                  <p className="text-white text-sm font-bold">Amit Patel</p>
                  <p className="text-gray-500 text-xs">Founder, E-Grow</p>
                </div>
              </div>
            </div>
          </div>

          <p className="text-gray-700 text-xs mt-auto">&copy; 2026 Karya-AI. All rights reserved.</p>
        </div>
      </div>

      {/* RIGHT: Form Panel */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12 bg-white overflow-y-auto">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="lg:hidden text-center mb-8">
            <Link href="/" className="inline-flex items-center gap-2">
              <Image src="/karya-ai-logo.png" alt="Karya AI" width={44} height={44} className="rounded-xl object-contain" />
              <span className="text-xl font-black text-gray-900">Karya-AI</span>
            </Link>
          </div>

          {/* Heading */}
          <div className="mb-8">
            <h1 className="text-3xl font-black text-gray-900 mb-2">{currentRole.title}</h1>
            <p className="text-gray-500">{currentRole.subtitle}</p>

            {/* Role Switcher */}
            <div className="mt-5 flex items-center gap-2 p-1 bg-gray-100 rounded-xl w-fit">
              <button
                onClick={() => router.push(`/register?role=${ROLES.OWNER}`)}
                className={`px-5 py-2 rounded-lg text-sm font-bold transition-all ${
                  role === ROLES.OWNER ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Business Owner
              </button>
              <button
                onClick={() => router.push(`/register?role=${ROLES.EXPERT}`)}
                className={`px-5 py-2 rounded-lg text-sm font-bold transition-all ${
                  role === ROLES.EXPERT ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Expert
              </button>
            </div>
          </div>

        {/* Register Form */}
        <div className="bg-white border border-gray-200 rounded-3xl p-8 shadow-sm">
          {/* Success Message */}
          {success && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-green-500 shrink-0 mt-0.5" />
              <p className="text-sm text-green-600">{success}</p>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Full Name Input */}
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-2">
                Full Name <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <User className={`w-5 h-5 ${touched.fullName && errors.fullName ? 'text-red-500' : 'text-gray-500'}`} />
                </div>
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  onBlur={() => handleBlur('fullName')}
                  disabled={isLoading}
                  className={`w-full pl-12 pr-4 py-3 bg-white border rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 transition-all disabled:opacity-50 ${
                    touched.fullName && errors.fullName
                      ? 'border-red-300 focus:border-red-500 focus:ring-red-500/50'
                      : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500/50'
                  }`}
                  placeholder="John Doe"
                />
              </div>
              {touched.fullName && errors.fullName && (
                <p className="mt-1 text-xs text-red-500">{errors.fullName}</p>
              )}
            </div>

            {/* Email Input */}
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-2">
                Work Email <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Mail className={`w-5 h-5 ${touched.email && errors.email ? 'text-red-500' : 'text-gray-500'}`} />
                </div>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  onBlur={() => handleBlur('email')}
                  disabled={isLoading}
                  className={`w-full pl-12 pr-10 py-3 bg-white border rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 transition-all disabled:opacity-50 ${
                    touched.email && errors.email
                      ? 'border-red-300 focus:border-red-500 focus:ring-red-500/50'
                      : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500/50'
                  }`}
                  placeholder="you@company.com"
                />
                {checkingEmail && (
                  <div className="absolute inset-y-0 right-0 pr-4 flex items-center">
                    <div className="w-4 h-4 border-2 border-gray-400 border-t-gray-900 rounded-full animate-spin" />
                  </div>
                )}
              </div>
              {touched.email && errors.email && (
                <p className="mt-1 text-xs text-red-500">{errors.email}</p>
              )}
            </div>

            {/* Company Input */}
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-2">
                Company Name {role === ROLES.OWNER && <span className="text-red-500">*</span>}
                {role === ROLES.EXPERT && <span className="text-gray-400 text-xs ml-1">(Optional)</span>}
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Briefcase className={`w-5 h-5 ${touched.company && errors.company ? 'text-red-500' : 'text-gray-500'}`} />
                </div>
                <input
                  type="text"
                  name="company"
                  value={formData.company}
                  onChange={handleChange}
                  onBlur={() => handleBlur('company')}
                  disabled={isLoading}
                  className={`w-full pl-12 pr-4 py-3 bg-white border rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 transition-all disabled:opacity-50 ${
                    touched.company && errors.company
                      ? 'border-red-300 focus:border-red-500 focus:ring-red-500/50'
                      : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500/50'
                  }`}
                  placeholder="Your Company"
                />
              </div>
              {touched.company && errors.company && (
                <p className="mt-1 text-xs text-red-500">{errors.company}</p>
              )}
            </div>

            {/* Password Input */}
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-2">
                Password <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock className={`w-5 h-5 ${touched.password && errors.password ? 'text-red-500' : 'text-gray-500'}`} />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  onBlur={() => handleBlur('password')}
                  disabled={isLoading}
                  className={`w-full pl-12 pr-12 py-3 bg-white border rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 transition-all disabled:opacity-50 ${
                    touched.password && errors.password
                      ? 'border-red-300 focus:border-red-500 focus:ring-red-500/50'
                      : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500/50'
                  }`}
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={isLoading}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-500 hover:text-gray-900 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>

              {/* Password Strength */}
              {formData.password && (
                <div className="mt-2 space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className={`h-full transition-all duration-300 ${
                          passwordStrength.color === 'red' ? 'bg-red-500 w-1/5' :
                          passwordStrength.color === 'yellow' ? 'bg-yellow-500 w-3/5' :
                          'bg-green-500 w-full'
                        }`}
                      />
                    </div>
                    <span className={`text-xs font-medium ${
                      passwordStrength.color === 'red' ? 'text-red-400' :
                      passwordStrength.color === 'yellow' ? 'text-yellow-400' :
                      'text-green-400'
                    }`}>
                      {passwordStrength.label}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-1">
                    <PasswordCheck met={passwordStrength.checks.length} text="8+ characters" />
                    <PasswordCheck met={passwordStrength.checks.uppercase} text="Uppercase" />
                    <PasswordCheck met={passwordStrength.checks.lowercase} text="Lowercase" />
                    <PasswordCheck met={passwordStrength.checks.number} text="Number" />
                    <PasswordCheck met={passwordStrength.checks.special} text="Special char" />
                  </div>
                </div>
              )}
            </div>

            {/* Confirm Password Input */}
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-2">
                Confirm Password <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock className={`w-5 h-5 ${touched.confirmPassword && errors.confirmPassword ? 'text-red-500' : 'text-gray-500'}`} />
                </div>
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  onBlur={() => handleBlur('confirmPassword')}
                  disabled={isLoading}
                  className={`w-full pl-12 pr-12 py-3 bg-white border rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 transition-all disabled:opacity-50 ${
                    touched.confirmPassword && errors.confirmPassword
                      ? 'border-red-300 focus:border-red-500 focus:ring-red-500/50'
                      : formData.confirmPassword && formData.confirmPassword === formData.password
                      ? 'border-green-300 focus:border-green-500 focus:ring-green-500/50'
                      : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500/50'
                  }`}
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  disabled={isLoading}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-500 hover:text-gray-900 transition-colors"
                >
                  {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {touched.confirmPassword && errors.confirmPassword && (
                <p className="mt-1 text-xs text-red-500">{errors.confirmPassword}</p>
              )}
              {formData.confirmPassword && formData.confirmPassword === formData.password && !errors.password && (
                <p className="mt-1 text-xs text-green-500 flex items-center gap-1">
                  <Check className="w-3 h-3" /> Passwords match
                </p>
              )}
            </div>

            {/* Terms & Conditions */}
            <div>
              <div className="flex items-start">
                <input
                  type="checkbox"
                  id="acceptTerms"
                  name="acceptTerms"
                  checked={formData.acceptTerms}
                  onChange={handleChange}
                  onBlur={() => handleBlur('acceptTerms')}
                  disabled={isLoading}
                  className={`w-4 h-4 mt-0.5 rounded border-gray-300 bg-white text-blue-600 focus:ring-2 focus:ring-blue-500/50 ${
                    touched.acceptTerms && errors.acceptTerms ? 'border-red-500' : ''
                  }`}
                />
                <label htmlFor="acceptTerms" className="ml-2 text-sm text-gray-600">
                  I agree to the{' '}
                  <Link href="/terms" className="text-blue-600 hover:text-blue-600 transition-colors">
                    Terms of Service
                  </Link>
                  {' '}and{' '}
                  <Link href="/privacy" className="text-blue-600 hover:text-blue-600 transition-colors">
                    Privacy Policy
                  </Link>
                </label>
              </div>
              {touched.acceptTerms && errors.acceptTerms && (
                <p className="mt-1 text-xs text-red-500 ml-6">{errors.acceptTerms}</p>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className={`w-full py-3.5 ${currentRole.gradient} hover:opacity-90 rounded-2xl text-white font-black transition-all hover:scale-105 hover:shadow-xl hover:shadow-blue-500/20 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100`}
            >
              {isLoading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Creating account...
                </>
              ) : (
                <>
                  Create Account
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>

            {/* Divider */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white text-gray-500">Or sign up with</span>
              </div>
            </div>

            {/* Social Sign Up Buttons */}
            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => handleSocialSignup('Google')}
                disabled={isLoading}
                className="py-3 px-4 bg-white border border-gray-200 rounded-xl text-gray-900 font-medium hover:bg-gray-50 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Google
              </button>
              <button
                type="button"
                onClick={() => handleSocialSignup('LinkedIn')}
                disabled={isLoading}
                className="py-3 px-4 bg-white border border-gray-200 rounded-xl text-gray-900 font-medium hover:bg-gray-50 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                </svg>
                LinkedIn
              </button>
            </div>
          </form>

          {/* Sign In Link */}
          <div className="mt-6 text-center">
            <p className="text-gray-500 text-sm">
              Already have an account?{' '}
              <Link href={`/login?role=${role}`} className="text-blue-600 font-bold transition-colors hover:text-blue-700">
                Sign in
              </Link>
            </p>
          </div>
        </div>

        {/* Back to Home */}
        <div className="mt-5 text-center">
          <Link href="/" className="text-gray-400 hover:text-gray-600 transition-colors text-sm">
            ← Back to home
          </Link>
        </div>
        </div>{/* end max-w-md */}
      </div>{/* end right panel */}
    </div>
  );
}

export default function Register() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-50" />}>
      <RegisterContent />
    </Suspense>
  );
}
