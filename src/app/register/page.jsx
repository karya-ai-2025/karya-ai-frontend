'use client';
// pages/Register.jsx
import { useState, useEffect, Suspense } from 'react';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Mail, Lock, User, Eye, EyeOff, ArrowRight, Briefcase, Users, AlertTriangle, CheckCircle, Check, X } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { trackEvent } from '@/services/analyticsApi';

// Constants
const ROLES = {
  OWNER: 'owner',
  EXPERT: 'expert'
};

// Team-only unlock for the business/owner flow while it's "Coming soon" to the public.
// Team link:  /register?team=karya-team-2026
// Change this word to rotate access. Keep it IDENTICAL to the one in login/page.jsx.
const TEAM_ACCESS_CODE = 'karya-team-2026';

const ROLE_CONFIG = {
  [ROLES.OWNER]: {
    title: 'Create Business Account',
    subtitle: 'Start transforming your marketing today',
    icon: Briefcase,
    gradient: 'bg-gradient-to-r from-blue-600 to-orange-500',
    onboardingRoute: '/onboarding-owner/welcome',
    lhs: {
      badge: 'Join 743+ growing teams today',
      headingTop: 'Start growing',
      headingAccent: 'faster today.',
      sub: 'From your first prompt to your first 100 customers — AI handles the planning, experts handle execution.',
      steps: [
        { n: '1', t: 'Sign up free', d: 'No credit card required. Setup in 5 minutes.' },
        { n: '2', t: 'AI builds your roadmap', d: '90-day GTM plan generated instantly.' },
        { n: '3', t: 'Match with experts', d: 'Pre-vetted talent, ready to execute.' },
      ],
      testimonial: { quote: 'We scaled from ₹30L to ₹1.2Cr/month in under 3 months. Worth every rupee.', name: 'Amit Patel', role: 'Founder, E-Grow' },
    },
  },
  [ROLES.EXPERT]: {
    title: 'Join as Expert',
    subtitle: 'Connect with businesses and grow your career',
    icon: Users,
    gradient: 'bg-gradient-to-r from-blue-600 to-orange-500',
    onboardingRoute: '/onboarding-expert/welcome',
    lhs: {
      badge: 'Join 200+ vetted experts',
      headingTop: 'Grow your',
      headingAccent: 'expert practice.',
      sub: 'Get matched with businesses that need your skills — you focus on delivering, we bring the clients.',
      steps: [
        { n: '1', t: 'Create your profile', d: 'Showcase your skills, services, and portfolio.' },
        { n: '2', t: 'Get matched to projects', d: 'AI connects you with the right businesses.' },
        { n: '3', t: 'Execute & earn', d: 'Deliver great work and grow your practice.' },
      ],
      testimonial: { quote: 'I landed 5 retainer clients through Karya in my first 2 months.', name: 'Priya Sharma', role: 'Growth Consultant' },
    },
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
  // Business/owner is "Coming soon" for the public. Only the secret team link
  // (?team=<code>) unlocks it; otherwise any owner request falls back to Expert,
  // so the public can never register a business account.
  const businessUnlocked = searchParams.get('team') === TEAM_ACCESS_CODE;
  const requestedRole = searchParams.get('role') || (businessUnlocked ? ROLES.OWNER : ROLES.EXPERT);
  const role = requestedRole === ROLES.OWNER && !businessUnlocked ? ROLES.EXPERT : requestedRole;
  const { isAuthenticated, loading: authLoading, activeRole, register: authRegister } = useAuth();

  // Redirect users who land on /register while ALREADY logged in.
  // Depends on [authLoading] only, so it fires ONCE when the auth check settles —
  // NOT when isAuthenticated flips after a fresh registration. That flip used to
  // re-fire this effect and send new users to the dashboard, skipping onboarding.
  // A just-registered user is redirected to onboarding by handleSubmit instead.
  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      router.replace(activeRole === 'expert' ? '/expert-dashboard' : '/business-dashboard');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authLoading]);

  // Top of the onboarding funnel — "No. of sign ups". Reaching the signup form is
  // the sign-up intent, and the role is known here (expert default / owner via team
  // link) even pre-login, which the funnel needs to split Expert vs Business.
  // Fires once per session (the backend dedupes by session), only for guests.
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      trackEvent('SIGNUP_CLICKED', { role });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authLoading]);

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
    // Strict: valid local part + real domain labels + alphabetic TLD (e.g. gmail.com, outlook.com, karya-ai.com)
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9]([a-zA-Z0-9-]*[a-zA-Z0-9])?(\.[a-zA-Z0-9]([a-zA-Z0-9-]*[a-zA-Z0-9])?)*\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(email.trim())) return 'Enter a valid email like name@gmail.com';
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
      const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9]([a-zA-Z0-9-]*[a-zA-Z0-9])?(\.[a-zA-Z0-9]([a-zA-Z0-9-]*[a-zA-Z0-9])?)*\.[a-zA-Z]{2,}$/;
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
      const result = await authRegister({
        fullName: formData.fullName.trim(),
        email: formData.email.toLowerCase().trim(),
        password: formData.password,
        confirmPassword: formData.confirmPassword,
        role,
        company: formData.company.trim() || undefined
      });

      if (!result.success) {
        throw new Error(result.error || 'Registration failed');
      }

      router.replace(ROLE_CONFIG[role].onboardingRoute);

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

  if (authLoading || isAuthenticated) return null;

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
              <span className="text-blue-300 text-xs font-semibold">{currentRole.lhs.badge}</span>
            </div>
            <h2 className="text-4xl font-black text-white leading-[1.1] mb-4">
              {currentRole.lhs.headingTop}<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-orange-400">{currentRole.lhs.headingAccent}</span>
            </h2>
            <p className="text-gray-400 text-lg leading-relaxed mb-10">{currentRole.lhs.sub}</p>

            {/* Steps */}
            <div className="space-y-4 mb-10">
              {currentRole.lhs.steps.map(s=>(
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
              <p className="text-gray-300 text-sm leading-relaxed mb-4">{`"${currentRole.lhs.testimonial.quote}"`}</p>
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full" />
                <div>
                  <p className="text-white text-sm font-bold">{currentRole.lhs.testimonial.name}</p>
                  <p className="text-gray-500 text-xs">{currentRole.lhs.testimonial.role}</p>
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
              {businessUnlocked ? (
                <button
                  onClick={() => router.push(`/register?role=${ROLES.OWNER}&team=${TEAM_ACCESS_CODE}`)}
                  className={`px-5 py-2 rounded-lg text-sm font-bold transition-all ${
                    role === ROLES.OWNER ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  Business Owner
                </button>
              ) : (
                <button
                  type="button"
                  disabled
                  title="Business accounts are coming soon"
                  className="px-5 py-2 rounded-lg text-sm font-bold text-gray-400 cursor-not-allowed flex items-center gap-1.5"
                >
                  Business Owner
                  <span className="text-[10px] font-semibold uppercase bg-gray-200 text-gray-500 px-1.5 py-0.5 rounded">Soon</span>
                </button>
              )}
              <button
                onClick={() => router.push(businessUnlocked ? `/register?role=${ROLES.EXPERT}&team=${TEAM_ACCESS_CODE}` : `/register?role=${ROLES.EXPERT}`)}
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
            <div className="mb-6 p-4 bg-[#fef2f2] border border-[#fca5a5] rounded-lg flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-[#dc2626] shrink-0 mt-0.5" />
              <p className="text-sm font-medium text-[#b91c1c]">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Full Name Input */}
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-2">
                Full Name <span className="text-[#ef4444]">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <User className={`w-5 h-5 ${touched.fullName && errors.fullName ? 'text-[#ef4444]' : 'text-gray-500'}`} />
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
                      ? 'border-[#fca5a5] focus:border-[#ef4444] focus:ring-[#ef4444]/50'
                      : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500/50'
                  }`}
                  placeholder="John Doe"
                />
              </div>
              {touched.fullName && errors.fullName && (
                <p className="mt-1 text-xs text-[#ef4444]">{errors.fullName}</p>
              )}
            </div>

            {/* Email Input */}
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-2">
                Work Email <span className="text-[#ef4444]">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Mail className={`w-5 h-5 ${touched.email && errors.email ? 'text-[#ef4444]' : 'text-gray-500'}`} />
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
                      ? 'border-[#fca5a5] focus:border-[#ef4444] focus:ring-[#ef4444]/50'
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
                <p className="mt-1 text-xs text-[#ef4444]">{errors.email}</p>
              )}
            </div>

            {/* Company Input */}
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-2">
                Company Name {role === ROLES.OWNER && <span className="text-[#ef4444]">*</span>}
                {role === ROLES.EXPERT && <span className="text-gray-400 text-xs ml-1">(Optional)</span>}
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Briefcase className={`w-5 h-5 ${touched.company && errors.company ? 'text-[#ef4444]' : 'text-gray-500'}`} />
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
                      ? 'border-[#fca5a5] focus:border-[#ef4444] focus:ring-[#ef4444]/50'
                      : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500/50'
                  }`}
                  placeholder="Your Company"
                />
              </div>
              {touched.company && errors.company && (
                <p className="mt-1 text-xs text-[#ef4444]">{errors.company}</p>
              )}
            </div>

            {/* Password Input */}
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-2">
                Password <span className="text-[#ef4444]">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock className={`w-5 h-5 ${touched.password && errors.password ? 'text-[#ef4444]' : 'text-gray-500'}`} />
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
                      ? 'border-[#fca5a5] focus:border-[#ef4444] focus:ring-[#ef4444]/50'
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
                          passwordStrength.color === 'red' ? 'bg-[#ef4444] w-1/5' :
                          passwordStrength.color === 'yellow' ? 'bg-yellow-500 w-3/5' :
                          'bg-green-500 w-full'
                        }`}
                      />
                    </div>
                    <span className={`text-xs font-medium ${
                      passwordStrength.color === 'red' ? 'text-[#f87171]' :
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
                Confirm Password <span className="text-[#ef4444]">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock className={`w-5 h-5 ${touched.confirmPassword && errors.confirmPassword ? 'text-[#ef4444]' : 'text-gray-500'}`} />
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
                      ? 'border-[#fca5a5] focus:border-[#ef4444] focus:ring-[#ef4444]/50'
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
                <p className="mt-1 text-xs text-[#ef4444]">{errors.confirmPassword}</p>
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
                    touched.acceptTerms && errors.acceptTerms ? 'border-[#ef4444]' : ''
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
                <p className="mt-1 text-xs text-[#ef4444] ml-6">{errors.acceptTerms}</p>
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
