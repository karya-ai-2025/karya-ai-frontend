'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import {
  Bell,
  Settings,
  User,
  LogOut,
  UserCog,
  ChevronDown,
  Edit3,
  Crown,
  Zap,
  RefreshCw
} from 'lucide-react';
import { checkUserPlanAccess } from '@/services/planService';

export default function TopNavbar() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const [planData, setPlanData] = useState(null);
  const [planLoading, setPlanLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const dropdownRef = useRef(null);

  // Fetch user plan data
  const fetchPlanData = async () => {
    if (!user?.token) {
      setPlanLoading(false);
      return;
    }

    try {
      setPlanLoading(true);
      const response = await checkUserPlanAccess(user.token);
      setPlanData(response);
    } catch (error) {
      console.error('Error fetching plan data:', error);
      setPlanData({ hasActivePlan: false });
    } finally {
      setPlanLoading(false);
    }
  };

  useEffect(() => {
    fetchPlanData();
  }, [user?.token]);

  // Listen for plan updates (e.g., after successful upgrade)
  useEffect(() => {
    const handlePlanUpdate = () => {
      fetchPlanData();
    };

    window.addEventListener('planUpdated', handlePlanUpdate);
    return () => {
      window.removeEventListener('planUpdated', handlePlanUpdate);
    };
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsProfileDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Handle logout
  const handleLogout = async () => {
    try {
      await logout();
      router.push('/login');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  // Handle edit profile - navigate to settings page
  const handleEditProfile = () => {
    setIsProfileDropdownOpen(false);
    router.push('/settings');
  };

  // Handle settings - navigate to settings page
  const handleSettings = () => {
    router.push('/settings');
  };

  // Handle account settings - navigate to settings page
  const handleAccountSettings = () => {
    setIsProfileDropdownOpen(false);
    router.push('/settings?section=account');
  };

  // Handle manual refresh of plan data
  const handleRefreshPlanData = async () => {
    setRefreshing(true);
    await fetchPlanData();
    setTimeout(() => setRefreshing(false), 500); // Show refresh animation for at least 500ms
  };

  // Get user initials for avatar
  const getUserInitials = (name) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map(word => word.charAt(0).toUpperCase())
      .slice(0, 2)
      .join('');
  };

  // Get remaining credits
  const getRemainingCredits = () => {
    if (planLoading) return '...';
    if (!planData?.hasActivePlan) return '0';

    const remainingCredits = planData.data?.limits?.remainingCredits || 0;
    return remainingCredits.toLocaleString();
  };

  // Get plan display name
  const getPlanDisplayName = () => {
    if (planLoading) return 'Loading...';
    if (!planData?.hasActivePlan) return 'Free Plan';

    const planName = planData.data?.userPlan?.planId?.displayName || 'Unknown Plan';
    const packageName = planData.data?.userPlan?.planPackageId?.name || '';
    return packageName ? `${planName} - ${packageName}` : planName;
  };

  // Get credits color based on remaining amount
  const getCreditsColor = () => {
    if (planLoading || !planData?.hasActivePlan) return 'text-gray-600';

    const remaining = planData.data?.limits?.remainingCredits || 0;
    const total = planData.data?.userPlan?.planPackageId?.credits || 1;
    const percentage = (remaining / total) * 100;

    if (percentage > 50) return 'text-green-600';
    if (percentage > 25) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <header className="bg-white border-b border-gray-200 px-5 py-1.5">
      <div className="flex items-center justify-end mt-1">
        {/* Right side - Actions */}
        <div className="flex items-center space-x-4">
          {/* Credits Left with Refresh Button */}
          <div className="flex items-center space-x-1">
            <button
              onClick={() => router.push('/settings?section=upgrade')}
              className={`flex items-center space-x-2 px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors ${getCreditsColor()}`}
            >
              <Zap className="h-4 w-4" />
              <span className="text-sm font-medium">
                Credits: {getRemainingCredits()}
              </span>
            </button>

            <button
              onClick={handleRefreshPlanData}
              disabled={refreshing}
              className="p-2 text-purple-700 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
              title="Refresh credits"
            >
              <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
            </button>
          </div>

          {/* Plan Details */}
          <button
            onClick={() => router.push('/settings?section=upgrade')}
            className={`flex items-center space-x-2 px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors ${
              planData?.hasActivePlan ? 'text-indigo-600 hover:text-indigo-700' : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Crown className="h-4 w-4" />
            <span className="text-sm font-medium">
              {getPlanDisplayName()}
            </span>
          </button>

          {/* Notifications */}
          <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors relative cursor-pointer">
            <Bell className="h-5 w-5" />
          </button>

          {/* Settings */}
          <button
            onClick={handleSettings}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
          >
            <Settings className="h-5 w-5" />
          </button>

          {/* User Profile Dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
              className="flex items-center space-x-3 p-1 rounded-lg hover:bg-gray-50 transition-colors border border-transparent hover:border-gray-200"
            >
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">{user?.fullName}</p>
                <p className="text-xs text-gray-500 capitalize">{user?.activeRole}</p>
              </div>
              <div className="flex items-center space-x-1">
                <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
                  <span className="text-xs font-semibold text-white">
                    {getUserInitials(user?.fullName)}
                  </span>
                </div>
                <ChevronDown
                  className={`h-4 w-4 text-gray-400 transition-transform ${
                    isProfileDropdownOpen ? 'rotate-180' : ''
                  }`}
                />
              </div>
            </button>

            {/* Dropdown Menu */}
            {isProfileDropdownOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-white border border-gray-200 rounded-lg shadow-lg z-50 py-1">
                {/* User Info Header */}
                <div className="px-4 py-3 border-b border-gray-100">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-indigo-600 rounded-lg flex items-center justify-center">
                      <span className="text-sm font-semibold text-white">
                        {getUserInitials(user?.fullName)}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {user?.fullName}
                      </p>
                      <p className="text-xs text-gray-500 truncate">
                        {user?.email}
                      </p>
                      <p className="text-xs text-indigo-600 capitalize font-medium">
                        {user?.activeRole} Account
                      </p>
                    </div>
                  </div>
                </div>

                {/* Menu Items */}
                <div className="py-1">
                  {/* Edit Profile */}
                  <button
                    onClick={handleEditProfile}
                    className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-gray-900 transition-colors"
                  >
                    <Edit3 className="h-4 w-4 mr-3 text-gray-400" />
                    Edit Profile
                  </button>

                  {/* Account Settings */}
                  <button
                    onClick={handleAccountSettings}
                    className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-gray-900 transition-colors"
                  >
                    <UserCog className="h-4 w-4 mr-3 text-gray-400" />
                    Account Settings
                  </button>

                  {/* Divider */}
                  <div className="border-t border-gray-100 my-1"></div>

                  {/* Logout */}
                  <button
                    onClick={handleLogout}
                    className="flex items-center w-full px-4 py-2 text-sm text-red-700 hover:bg-red-50 hover:text-red-900 transition-colors"
                  >
                    <LogOut className="h-4 w-4 mr-3 text-red-500" />
                    Sign Out
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
