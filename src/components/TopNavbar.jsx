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
  const { user, logout, getAuthHeader } = useAuth();
  const router = useRouter();
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const [planData, setPlanData] = useState(null);
  const [planLoading, setPlanLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const dropdownRef = useRef(null);

  // Fetch user plan data
  const fetchPlanData = async () => {
    try {
      setPlanLoading(true);
      const authHeader = getAuthHeader();
      const token = authHeader?.Authorization?.split(' ')[1];

      if (token) {
        console.log('TopNavbar - Current User:', {
          id: user?.id,
          email: user?.email,
          fullName: user?.fullName,
          token: token ? token.substring(0, 20) + '...' : 'NO TOKEN'
        });

        const response = await checkUserPlanAccess(token);

        // Debug: Log the actual response
        console.log('TopNavbar - Full API Response:', response);

        // Ensure we have a valid response structure
        if (response && response.success !== undefined) {
          setPlanData(response);
          console.log('TopNavbar - Plan Data Set:', response);
        } else {
          setPlanData({
            hasActivePlan: false,
            error: 'Invalid response from server',
            success: false
          });
        }
      } else {
        setPlanData({ hasActivePlan: false, error: null });
      }
    } catch (error) {
      console.error('Error fetching plan status:', error);
      // Don't assume no plan on error - maintain error state
      setPlanData({
        hasActivePlan: false,
        error: error.message || 'Failed to load plan data',
        success: false
      });
    } finally {
      setPlanLoading(false);
    }
  };

  useEffect(() => {
    fetchPlanData();
  }, [getAuthHeader]);

  // Listen for plan updates (e.g., after successful upgrade or project creation)
  useEffect(() => {
    const handlePlanUpdate = () => {
      fetchPlanData();
    };

    const handleProjectCreated = () => {
      fetchPlanData();
    };

    window.addEventListener('planUpdated', handlePlanUpdate);
    window.addEventListener('projectCreated', handleProjectCreated);

    return () => {
      window.removeEventListener('planUpdated', handlePlanUpdate);
      window.removeEventListener('projectCreated', handleProjectCreated);
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
      // Handle logout error silently or show user-friendly message
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

  // Get remaining credits (calculated as totalCredits - creditsUsed by backend API)
  const getRemainingCredits = () => {
    if (planLoading) return '...';

    // Handle error state
    if (planData?.error) return 'Error';

    // No active plan
    if (!planData?.hasActivePlan) {
      return planData?.success === false ? 'Error' : '0';
    }

    // Backend calculates: remainingCredits = userPlan.totalCredits - userPlan.creditsUsed
    const remainingCredits = planData.data?.limits?.remainingCredits || 0;
    return remainingCredits.toLocaleString();
  };

  // Get remaining projects
  const getRemainingProjects = () => {
    if (planLoading) return '...';

    // Handle error state
    if (planData?.error) return 'Error';

    // No active plan
    if (!planData?.hasActivePlan) {
      return planData?.success === false ? 'Error' : '0';
    }

    const remainingProjects = planData.data?.limits?.remainingProjects || 0;
    return remainingProjects.toString();
  };

  // Get plan display name
  const getPlanDisplayName = () => {
    if (planLoading) return 'Loading...';

    // Debug: Log plan data when getting display name
    console.log('TopNavbar - getPlanDisplayName - planData:', planData);

    // Handle error state
    if (planData?.error) return 'Error Loading';

    // Check if user has no active plan (legitimate free plan user)
    if (!planData?.hasActivePlan) {
      // Only show "Free Plan" if we successfully checked and found no active plan
      return planData?.success === false ? 'Error Loading' : 'Free Plan';
    }

    // User has active plan - show plan details
    const planName = planData.data?.userPlan?.planId?.displayName || 'Unknown Plan';
    const packageName = planData.data?.userPlan?.planPackageId?.name || '';

    // Format plan display name nicely
    if (planName && packageName) {
      return `${planName} ${packageName}`;
    }
    return planName || 'Unknown Plan';
  };

  // Format end date
  const formatEndDate = () => {
    if (planLoading || !planData?.hasActivePlan) return null;

    const endDate = planData.data?.userPlan?.endDate;
    if (!endDate) return null;

    return new Date(endDate).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  // Get credits color based on remaining amount
  const getCreditsColor = () => {
    if (planLoading || !planData?.hasActivePlan) return 'text-gray-600';

    const remaining = planData.data?.limits?.remainingCredits || 0;
    const total = planData.data?.userPlan?.totalCredits || 1;
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
          {/* Credits & Projects with Refresh Button */}
          <div className="flex items-center space-x-1">
            <button
              onClick={() => router.push('/settings?section=upgrade')}
              className={`flex items-center space-x-2 px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors ${getCreditsColor()}`}
            >
              <Zap className="h-4 w-4" />
              <span className="text-sm font-medium">
                {getRemainingCredits()} Credits
              </span>
            </button>

            {/* <button
              onClick={() => router.push('/settings?section=upgrade')}
              className="flex items-center space-x-2 px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors text-blue-600"
            >
              <span className="text-sm font-medium">
                {getRemainingProjects()} Projects Left
              </span>
            </button> */}

            <button
              onClick={handleRefreshPlanData}
              disabled={refreshing}
              className="p-2 text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 rounded-lg transition-colors disabled:opacity-50"
              title="Refresh plan data"
            >
              <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
            </button>
          </div>

          {/* Plan Details */}
          {/* <button
            onClick={() => router.push('/settings?section=upgrade')}
            className={`flex items-center space-x-2 px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors ${
              planData?.hasActivePlan ? 'text-indigo-600 hover:text-indigo-700' : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Crown className="h-4 w-4" />
            <span className="text-sm font-medium">
              {getPlanDisplayName()}
            </span>
          </button> */}

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
                <div className="w-8 h-8 bg-linear-to-br from-blue-600 to-orange-500 rounded-lg flex items-center justify-center">
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
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-orange-500 rounded-lg flex items-center justify-center">
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
                      <p className="text-xs text-blue-600 capitalize font-medium">
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
