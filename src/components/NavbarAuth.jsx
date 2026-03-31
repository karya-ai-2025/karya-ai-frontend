'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronDown, LayoutDashboard, Settings, LogOut } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

/**
 * Shared auth section for all navbars.
 * Shows profile dropdown when logged in, Sign In + CTA when logged out.
 *
 * Props:
 *  theme      - 'light' (default) | 'dark'
 *  loginRole  - 'owner' (default) | 'expert'
 *  ctaText    - button label when logged out (default: 'Get Started')
 *  ctaPath    - route for CTA button (default: '/register')
 */
export default function NavbarAuth({
  theme = 'light',
  loginRole = 'owner',
  ctaText = 'Get Started',
  ctaPath = '/register',
}) {
  const router = useRouter();
  const { isAuthenticated, user, logout } = useAuth();
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const profileRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setShowProfileDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getInitials = (name) => {
    if (!name) return 'U';
    return name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const handleLogout = async () => {
    await logout();
    setShowProfileDropdown(false);
    router.push('/');
  };

  const getDashboardPath = () => {
    if (user?.activeRole === 'expert') return '/expert-dashboard';
    return '/business-dashboard';
  };

  const isLight = theme === 'light';

  if (isAuthenticated) {
    return (
      <div className="relative" ref={profileRef}>
        <button
          onClick={() => setShowProfileDropdown(!showProfileDropdown)}
          className={`flex items-center gap-2 px-3 py-2 rounded-xl transition-all ${isLight ? 'hover:bg-gray-100' : 'hover:bg-white/10'}`}
        >
          <div className="w-9 h-9 bg-blue-600 rounded-full flex items-center justify-center text-white font-semibold text-sm shadow-md">
            {getInitials(user?.name)}
          </div>
          <ChevronDown
            className={`w-4 h-4 transition-transform duration-300 ${isLight ? 'text-gray-500' : 'text-white/70'} ${showProfileDropdown ? 'rotate-180' : ''}`}
          />
        </button>

        {showProfileDropdown && (
          <div className="absolute right-0 mt-3 w-52 bg-white border border-gray-200 rounded-2xl shadow-2xl shadow-blue-500/10 overflow-hidden z-50">
            <div className="px-4 py-3 border-b border-gray-100">
              <p className="font-semibold text-gray-900 text-sm truncate">{user?.name || 'User'}</p>
              <p className="text-xs text-gray-500 truncate">{user?.email}</p>
            </div>
            <button
              onClick={() => { router.push(getDashboardPath()); setShowProfileDropdown(false); }}
              className="w-full px-4 py-3 text-left text-gray-700 hover:bg-blue-50 flex items-center gap-3 text-sm transition-all"
            >
              <LayoutDashboard className="w-4 h-4 text-blue-500" /> Dashboard
            </button>
            <button
              onClick={() => { router.push('/preferences'); setShowProfileDropdown(false); }}
              className="w-full px-4 py-3 text-left text-gray-700 hover:bg-blue-50 flex items-center gap-3 text-sm transition-all"
            >
              <Settings className="w-4 h-4 text-blue-500" /> Settings
            </button>
            <div className="border-t border-gray-100">
              <button
                onClick={handleLogout}
                className="w-full px-4 py-3 text-left text-red-600 hover:bg-red-50 flex items-center gap-3 text-sm transition-all"
              >
                <LogOut className="w-4 h-4" /> Logout
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <>
      <button
        onClick={() => router.push(`/login?role=${loginRole}`)}
        className={`px-5 py-2 font-medium transition-colors ${
          isLight
            ? 'text-gray-700 hover:text-blue-600 border border-gray-300 rounded-lg hover:border-blue-300'
            : 'text-white hover:text-blue-300'
        }`}
      >
        Sign In
      </button>
      <button
        onClick={() => router.push(ctaPath)}
        className={`px-6 py-2 rounded-lg text-white font-medium transition-all ${
          isLight
            ? 'bg-blue-600 hover:bg-blue-700 hover:scale-105'
            : 'bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600'
        }`}
      >
        {ctaText}
      </button>
    </>
  );
}
