'use client';
// pages/Login.jsx
import { useState, Suspense } from 'react';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Mail, Lock, Eye, EyeOff, ArrowRight, Briefcase, Users, AlertCircle, CheckCircle } from 'lucide-react';

// Constants
const ROLES = {
  OWNER: 'owner',
  EXPERT: 'expert'
};

const ROLE_CONFIG = {
  [ROLES.OWNER]: {
    title: 'Business Owner Login',
    subtitle: 'Sign in to manage your marketing workspace',
    icon: Briefcase,
    gradient: 'bg-gradient-to-r from-blue-600 to-orange-500',
    dashboardRoute: '/business-dashboard',
    onboardingRoute: '/onboarding-owner/welcome'
  },
  [ROLES.EXPERT]: {
    title: 'Expert Login',
    subtitle: 'Sign in to connect with businesses',
    icon: Users,
    gradient: 'bg-gradient-to-r from-blue-600 to-orange-500',
    dashboardRoute: '/expert-landing',
    onboardingRoute: '/onboarding-expert/profile-setup'
  }
};

// API Base URL
const API_URL = process.env.NEXT_PUBLIC_API_URL 


function Login() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const role = searchParams.get('role') || ROLES.OWNER;

  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [touched, setTouched] = useState({
    email: false,
    password: false
  });

  // Validation
  const validateEmail = (email) => {
    if (!email.trim()) return 'Email is required';
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) return 'Please enter a valid email';
    return '';
  };

  const validatePassword = (password) => {
    if (!password) return 'Password is required';
    if (password.length < 8) return 'Password must be at least 8 characters';
    return '';
  };

  const errors = {
    email: validateEmail(formData.email),
    password: validatePassword(formData.password)
  };

  const isFormValid = !errors.email && !errors.password;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setTouched({ email: true, password: true });

    if (!isFormValid) {
      setError('Please fix the errors above');
      return;
    }

    setError('');
    setSuccess('');
    setIsLoading(true);
    console.log(formData.email, formData.password)

    try {
      console.log("1")
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          email: formData.email.toLowerCase().trim(),
          password: formData.password,
          role // Send selected role to set activeRole
        })
      })
      console.log("2")
      const data = await response.json();
      console.log("data",data)

      if (!response.ok) {
        // Handle specific error cases
        if (data.message?.includes("don't have a")) {
          // User doesn't have this profile type
          setError(data.message);
          return;
        }
        throw new Error(data.message || 'Invalid credentials');
      }

      // Store token in localStorage
      if (data.token) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
      }

      setSuccess('Login successful! Redirecting...');

      // Determine redirect based on user's profile and onboarding status
      const user = data.user;
      const activeRole = user.activeRole;
      const roleConfig = ROLE_CONFIG[activeRole];

      // Check if onboarding is complete for this role
      const onboardingComplete = user.onboarding?.[activeRole]?.completed;

      setTimeout(() => {
        if (onboardingComplete) {
          router.push(roleConfig.dashboardRoute);
        } else {
          router.push(roleConfig.onboardingRoute);
        }
      }, 1000);

    } catch (err) {
      setError(err.message || 'Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e) => {
    setError('');
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleBlur = (field) => {
    setTouched(prev => ({ ...prev, [field]: true }));
  };

  const handleSocialLogin = (provider) => {
    // TODO: Implement OAuth flow
    setError(`${provider} login coming soon!`);
  };

  const currentRole = ROLE_CONFIG[role] || ROLE_CONFIG[ROLES.OWNER];
  const Icon = currentRole.icon;

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      {/* Animated Background */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-20 left-20 w-72 h-72 bg-blue-300 rounded-full filter blur-xl animate-blob"></div>
        <div className="absolute top-40 right-20 w-72 h-72 bg-blue-300 rounded-full filter blur-xl animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-20 left-40 w-72 h-72 bg-violet-300 rounded-full filter blur-xl animate-blob animation-delay-4000"></div>
      </div>

      <div className="relative max-w-md w-full animate-fade-in-up">
        {/* Logo/Brand */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-4 group">
            <Image src="/karya-ai-logo.png" alt="Karya AI" width={48} height={48} className="rounded-xl object-contain group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 shadow-lg shadow-blue-500/20" />
            <span className="text-2xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors">Karya-AI</span>
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{currentRole.title}</h1>
          <p className="text-gray-500">{currentRole.subtitle}</p>

          {/* Role Switcher */}
          <div className="mt-4 flex items-center justify-center gap-2">
            <button
              onClick={() => router.push(`/login?role=${ROLES.OWNER}`)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                role === ROLES.OWNER
                  ? 'bg-blue-50 text-blue-700 border border-blue-300'
                  : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              Business Owner
            </button>
            <button
              onClick={() => router.push(`/login?role=${ROLES.EXPERT}`)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                role === ROLES.EXPERT
                  ? 'bg-blue-50 text-blue-700 border border-blue-300'
                  : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              Expert
            </button>
          </div>
        </div>

        {/* Login Form */}
        <div className="bg-white border border-gray-200 rounded-2xl p-8 shadow-lg hover-lift">
          {/* Success Message */}
          {success && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
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

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email Input */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-600 mb-2">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Mail className={`w-5 h-5 ${touched.email && errors.email ? 'text-red-500' : 'text-gray-500'}`} />
                </div>
                <input
                  id="email"
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  onBlur={() => handleBlur('email')}
                  disabled={isLoading}
                  className={`w-full pl-12 pr-4 py-3 bg-white border rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
                    touched.email && errors.email
                      ? 'border-red-300 focus:border-red-500 focus:ring-red-500/50'
                      : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500/50'
                  }`}
                  placeholder="you@example.com"
                  autoComplete="email"
                />
              </div>
              {touched.email && errors.email && (
                <p className="mt-1 text-xs text-red-500">{errors.email}</p>
              )}
            </div>

            {/* Password Input */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-600 mb-2">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock className={`w-5 h-5 ${touched.password && errors.password ? 'text-red-500' : 'text-gray-500'}`} />
                </div>
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  onBlur={() => handleBlur('password')}
                  disabled={isLoading}
                  className={`w-full pl-12 pr-12 py-3 bg-white border rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
                    touched.password && errors.password
                      ? 'border-red-300 focus:border-red-500 focus:ring-red-500/50'
                      : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500/50'
                  }`}
                  placeholder="••••••••"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={isLoading}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-500 hover:text-gray-900 transition-colors disabled:opacity-50"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
              {touched.password && errors.password && (
                <p className="mt-1 text-xs text-red-500">{errors.password}</p>
              )}
            </div>

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between">
              <label htmlFor="remember" className="flex items-center cursor-pointer">
                <input
                  id="remember"
                  type="checkbox"
                  className="w-4 h-4 rounded border-gray-300 bg-white text-blue-600 focus:ring-2 focus:ring-blue-500/50"
                />
                <span className="ml-2 text-sm text-gray-600">Remember me</span>
              </label>
              <Link href="/forgot-password" className="text-sm text-blue-600 hover:text-blue-600 transition-colors">
                Forgot password?
              </Link>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className={`w-full py-3 ${currentRole.gradient} hover:opacity-90 rounded-xl text-white font-semibold transition-all hover:scale-105 shadow-lg flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100`}
            >
              {isLoading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Signing in...
                </>
              ) : (
                <>
                  Sign In as {role === ROLES.EXPERT ? 'Expert' : 'Owner'}
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
                <span className="px-4 bg-gray-50 text-gray-500">Or continue with</span>
              </div>
            </div>

            {/* Social Login Buttons */}
            <div className="grid grid-cols-2 gap-4">
              {/* Google Login */}
              <button
                type="button"
                onClick={() => handleSocialLogin('Google')}
                disabled={isLoading}
                className="py-3 px-4 bg-white border border-gray-200 rounded-xl text-gray-900 font-medium hover:bg-gray-50 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Google
              </button>

              {/* LinkedIn Login */}
              <button
                type="button"
                onClick={() => handleSocialLogin('LinkedIn')}
                disabled={isLoading}
                className="py-3 px-4 bg-white border border-gray-200 rounded-xl text-gray-900 font-medium hover:bg-gray-50 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                </svg>
                LinkedIn
              </button>
            </div>
          </form>

          {/* Sign Up Link */}
          <div className="mt-6 text-center">
            <p className="text-gray-500">
              Don't have an account?{' '}
              <Link href={`/register?role=${role}`} className="text-blue-600 hover:text-blue-600 font-medium transition-colors">
                Sign up for free
              </Link>
            </p>
          </div>
        </div>

        {/* Back to Home */}
        <div className="mt-6 text-center">
          <Link href="/" className="text-gray-500 hover:text-gray-900 transition-colors text-sm">
            ← Back to home
          </Link>
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
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </div>
  );
}

function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-50" />}>
      <Login />
    </Suspense>
  );
}

export default LoginPage;
