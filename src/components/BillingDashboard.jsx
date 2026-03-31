'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import {
  Crown,
  Calendar,
  Zap,
  Package,
  CreditCard,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  ArrowRight,
  Receipt,
  Download,
  ExternalLink
} from 'lucide-react';
import { checkUserPlanAccess, getCurrentUserPlan, getUserBillingHistory } from '@/services/planService';

export default function BillingDashboard() {
  const { user, getAuthHeader } = useAuth();
  const router = useRouter();
  const [planData, setPlanData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [billingHistory, setBillingHistory] = useState([]);
  const [billingLoading, setBillingLoading] = useState(false);
  const [billingError, setBillingError] = useState(null);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalCount: 0,
    hasNextPage: false,
    hasPrevPage: false
  });

  // Fetch plan data
  const fetchPlanData = async () => {
    try {
      setLoading(true);
      setError(null);
      const authHeader = getAuthHeader();
      const token = authHeader?.Authorization?.split(' ')[1];

      if (token) {
        const [planAccess, currentPlan] = await Promise.all([
          checkUserPlanAccess(token),
          getCurrentUserPlan(token)
        ]);

        // Debug: Log the API responses
        console.log('BillingDashboard - Plan Access Response:', planAccess);
        console.log('BillingDashboard - Current Plan Response:', currentPlan);

        // Debug: Log plan end date specifically
        if (planAccess?.data?.userPlan?.endDate) {
          console.log('Plan End Date:', planAccess.data.userPlan.endDate);
          console.log('Days Until Expiry:', getDaysUntilExpiry(planAccess.data.userPlan.endDate));
        }

        // Debug: Log usage data to verify carry-over
        if (planAccess?.data?.userPlan) {
          const userPlan = planAccess.data.userPlan;
          console.log('Usage Data:', {
            projectsCreated: userPlan.projectsCreated,
            creditsUsed: userPlan.creditsUsed,
            planPackageCredits: userPlan.planPackageId?.credits,
            planPackageProjects: userPlan.planPackageId?.projectsAvailable
          });

          if (planAccess?.data?.limits) {
            console.log('Calculated Limits:', {
              remainingCredits: planAccess.data.limits.remainingCredits,
              remainingProjects: planAccess.data.limits.remainingProjects
            });
          }
        }

        // Validate response structure
        if (planAccess && planAccess.success !== undefined) {
          const combinedData = {
            access: planAccess,
            current: currentPlan
          };
          setPlanData(combinedData);
          console.log('BillingDashboard - Combined Plan Data:', combinedData);
        } else {
          throw new Error('Invalid response structure from plan API');
        }
      } else {
        setPlanData({
          access: { hasActivePlan: false, success: true },
          current: { success: true }
        });
      }
    } catch (err) {
      console.error('Error fetching plan status:', err);
      setError(err.message || 'Failed to load plan data');
      // Don't set planData on error - let error state handle display
      setPlanData(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlanData();
    fetchBillingHistory(1);
  }, [getAuthHeader]);

  // Listen for plan updates and project creation events
  useEffect(() => {
    const handlePlanUpdate = () => {
      fetchPlanData();
      fetchBillingHistory(1);
    };

    const handleProjectCreated = () => {
      fetchPlanData();
      fetchBillingHistory(pagination.currentPage);
    };

    window.addEventListener('planUpdated', handlePlanUpdate);
    window.addEventListener('projectCreated', handleProjectCreated);

    return () => {
      window.removeEventListener('planUpdated', handlePlanUpdate);
      window.removeEventListener('projectCreated', handleProjectCreated);
    };
  }, [pagination.currentPage]);

  // Fetch billing history
  const fetchBillingHistory = async (page = 1) => {
    try {
      setBillingLoading(true);
      setBillingError(null);
      const authHeader = getAuthHeader();
      const token = authHeader?.Authorization?.split(' ')[1];

      if (token) {
        const response = await getUserBillingHistory(token, page, 5);
        console.log('Billing History Response:', response);

        if (response.success) {
          setBillingHistory(response.data.billingHistory);
          setPagination(response.data.pagination);
        } else {
          throw new Error(response.message || 'Failed to fetch billing history');
        }
      } else {
        setBillingHistory([]);
        setPagination({
          currentPage: 1,
          totalPages: 1,
          totalCount: 0,
          hasNextPage: false,
          hasPrevPage: false
        });
      }
    } catch (err) {
      console.error('Error fetching billing history:', err);
      setBillingError(err.message || 'Failed to load billing history');
      setBillingHistory([]);
    } finally {
      setBillingLoading(false);
    }
  };

  // Handle manual refresh
  const handleRefresh = async () => {
    setRefreshing(true);
    await Promise.all([
      fetchPlanData(),
      fetchBillingHistory(pagination.currentPage)
    ]);
    setTimeout(() => setRefreshing(false), 500);
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Get days until expiry
  const getDaysUntilExpiry = (endDate) => {
    if (!endDate) return null;

    const now = new Date();
    const expiry = new Date(endDate);

    // Reset time to start of day for accurate day calculation
    now.setHours(0, 0, 0, 0);
    expiry.setHours(0, 0, 0, 0);

    const diffTime = expiry - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    // Debug logging
    console.log('Days calculation:', {
      endDate,
      now: now.toISOString(),
      expiry: expiry.toISOString(),
      diffTime,
      diffDays
    });

    return diffDays;
  };

  // Get status color and icon
  const getStatusDisplay = () => {
    // Handle error state
    if (error || !planData) {
      return {
        icon: XCircle,
        color: 'text-red-500',
        bgColor: 'bg-red-100',
        status: 'Error Loading',
        description: 'Unable to load plan information'
      };
    }

    // Check if user has no active plan (legitimate free plan user)
    if (!planData?.access?.hasActivePlan) {
      // Only show "Free Plan" if we successfully checked and found no active plan
      if (planData?.access?.success === false) {
        return {
          icon: XCircle,
          color: 'text-red-500',
          bgColor: 'bg-red-100',
          status: 'Error Loading',
          description: 'Unable to verify plan status'
        };
      }

      return {
        icon: XCircle,
        color: 'text-gray-500',
        bgColor: 'bg-gray-100',
        status: 'Free Plan',
        description: 'Upgrade to unlock advanced features'
      };
    }

    const userPlan = planData.access.data?.userPlan;
    const endDate = userPlan?.endDate;
    const daysLeft = getDaysUntilExpiry(endDate);

    if (daysLeft === null) {
      return {
        icon: Crown,
        color: 'text-indigo-600',
        bgColor: 'bg-indigo-100',
        status: 'Active',
        description: 'Lifetime plan'
      };
    }

    if (daysLeft <= 0) {
      return {
        icon: XCircle,
        color: 'text-red-600',
        bgColor: 'bg-red-100',
        status: 'Expired',
        description: 'Plan has expired'
      };
    }

    if (daysLeft <= 7) {
      return {
        icon: AlertTriangle,
        color: 'text-orange-600',
        bgColor: 'bg-orange-100',
        status: 'Expiring Soon',
        description: `${daysLeft} days remaining`
      };
    }

    return {
      icon: CheckCircle,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
      status: 'Active',
      description: `${daysLeft} days remaining`
    };
  };

  // Get usage percentage
  const getUsagePercentage = (used, total) => {
    if (!total || total === 0) return 0;
    return Math.min((used / total) * 100, 100);
  };

  // Get usage color
  const getUsageColor = (percentage) => {
    if (percentage >= 90) return 'bg-red-500';
    if (percentage >= 75) return 'bg-orange-500';
    if (percentage >= 50) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  // Format currency amount
  const formatAmount = (amount, currency = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency
    }).format(amount);
  };

  // Get status badge color and text
  const getStatusBadge = (status) => {
    switch (status) {
      case 'active':
        return { color: 'bg-green-100 text-green-800', text: 'Active' };
      case 'expired':
        return { color: 'bg-red-100 text-red-800', text: 'Expired' };
      case 'cancelled':
        return { color: 'bg-gray-100 text-gray-800', text: 'Cancelled' };
      case 'suspended':
        return { color: 'bg-orange-100 text-orange-800', text: 'Suspended' };
      case 'pending':
        return { color: 'bg-yellow-100 text-yellow-800', text: 'Pending' };
      default:
        return { color: 'bg-gray-100 text-gray-800', text: 'Unknown' };
    }
  };

  // Handle pagination
  const handlePageChange = (newPage) => {
    fetchBillingHistory(newPage);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-semibold text-gray-900">Billing</h2>
            <p className="text-gray-600 mt-1">Manage your subscription and billing information.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white rounded-lg border border-gray-200 p-6 animate-pulse">
              <div className="h-4 bg-gray-200 rounded mb-4"></div>
              <div className="h-8 bg-gray-200 rounded mb-2"></div>
              <div className="h-4 bg-gray-200 rounded"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">Billing</h2>
          <p className="text-gray-600 mt-1">Manage your subscription and billing information.</p>
        </div>

        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <div className="flex items-center space-x-3">
            <AlertTriangle className="h-5 w-5 text-red-600" />
            <div>
              <h3 className="text-red-800 font-medium">Error Loading Billing Data</h3>
              <p className="text-red-600 text-sm mt-1">{error}</p>
              <button
                onClick={handleRefresh}
                className="mt-3 text-red-600 hover:text-red-500 text-sm font-medium flex items-center space-x-1"
              >
                <RefreshCw className="h-4 w-4" />
                <span>Try Again</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const statusDisplay = getStatusDisplay();
  const StatusIcon = statusDisplay.icon;
  const userPlan = planData?.access?.data?.userPlan;
  const limits = planData?.access?.data?.limits;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">Billing</h2>
          <p className="text-gray-600 mt-1">Manage your subscription and billing information.</p>
        </div>

        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className="flex items-center space-x-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Current Plan Overview */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-indigo-50 to-purple-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className={`p-3 rounded-full ${statusDisplay.bgColor}`}>
                <StatusIcon className={`h-6 w-6 ${statusDisplay.color}`} />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-900">
                  {error
                    ? 'Error Loading Plan'
                    : planData?.access?.hasActivePlan
                      ? `${userPlan?.planId?.displayName || 'Unknown Plan'} ${userPlan?.planPackageId?.name || ''}`
                      : 'Free Plan'
                  }
                </h3>
                <p className={`text-sm ${statusDisplay.color} font-medium`}>
                  {statusDisplay.status} • {statusDisplay.description}
                </p>
              </div>
            </div>

            {!error && planData?.access?.hasActivePlan && (
              <div className="text-right">
                <div className="text-2xl font-bold text-gray-900">
                  ${userPlan?.planPackageId?.price}
                </div>
                <div className="text-sm text-gray-500">
                  per {userPlan?.planPackageId?.billingCycle}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Plan Details */}
        {planData?.access?.hasActivePlan && (
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Next Billing Date */}
              <div className="flex items-center space-x-3">
                <Calendar className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-sm font-medium text-gray-900">Next Billing</p>
                  <p className="text-sm text-gray-600">
                    {formatDate(userPlan?.nextBillingDate)}
                  </p>
                </div>
              </div>

              {/* Plan Status */}
              <div className="flex items-center space-x-3">
                <Crown className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-sm font-medium text-gray-900">Status</p>
                  <p className="text-sm text-gray-600 capitalize">
                    {userPlan?.status || 'Unknown'}
                  </p>
                </div>
              </div>

              {/* Payment Method */}
              <div className="flex items-center space-x-3">
                <CreditCard className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-sm font-medium text-gray-900">Payment Method</p>
                  <p className="text-sm text-gray-600 capitalize">
                    {userPlan?.paymentDetails?.paymentMethod || 'Not set'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Usage Statistics */}
      {!error && planData?.access?.hasActivePlan && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Credits Usage */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <Zap className="h-5 w-5 text-indigo-600" />
                <h3 className="font-semibold text-gray-900">Credits</h3>
              </div>
              <span className="text-sm font-medium text-gray-600">
                {(userPlan?.planPackageId?.credits - userPlan?.creditsUsed || 0).toLocaleString()} remaining
              </span>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Used</span>
                <span className="font-medium">
                  {(userPlan?.creditsUsed || 0).toLocaleString()} / {(userPlan?.planPackageId?.credits || 0).toLocaleString()}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className={`h-2 rounded-full transition-all duration-300 ${getUsageColor(
                    getUsagePercentage(userPlan?.creditsUsed || 0, userPlan?.planPackageId?.credits || 0)
                  )}`}
                  style={{
                    width: `${getUsagePercentage(userPlan?.creditsUsed || 0, userPlan?.planPackageId?.credits || 0)}%`
                  }}
                ></div>
              </div>
            </div>
          </div>

          {/* Projects Usage */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <Package className="h-5 w-5 text-blue-600" />
                <h3 className="font-semibold text-gray-900">Projects</h3>
              </div>
              <span className="text-sm font-medium text-gray-600">
                {limits?.remainingProjects || 0} remaining
              </span>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Created</span>
                <span className="font-medium">
                  {userPlan?.projectsCreated || 0} / {userPlan?.planPackageId?.projectsAvailable || 0}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className={`h-2 rounded-full transition-all duration-300 ${getUsageColor(
                    getUsagePercentage(userPlan?.projectsCreated || 0, userPlan?.planPackageId?.projectsAvailable || 0)
                  )}`}
                  style={{
                    width: `${getUsagePercentage(userPlan?.projectsCreated || 0, userPlan?.planPackageId?.projectsAvailable || 0)}%`
                  }}
                ></div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <button
          onClick={() => router.push('/settings?section=upgrade')}
          className="flex items-center justify-center space-x-2 px-4 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
        >
          <Crown className="h-4 w-4" />
          <span>Upgrade Plan</span>
          <ArrowRight className="h-4 w-4" />
        </button>

        <button
          onClick={() => {
            // Placeholder for future invoice functionality
            // TODO: Implement invoice viewing functionality
          }}
          className="flex items-center justify-center space-x-2 px-4 py-3 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
        >
          <Receipt className="h-4 w-4" />
          <span>View Invoices</span>
        </button>

        <button
          onClick={() => {
            // Placeholder for future download functionality
            // TODO: Implement receipt download functionality
          }}
          className="flex items-center justify-center space-x-2 px-4 py-3 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
        >
          <Download className="h-4 w-4" />
          <span>Download Receipt</span>
        </button>
      </div>

      {/* Billing History */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Billing History</h3>
          <p className="text-gray-600 text-sm mt-1">Your recent billing transactions and invoices.</p>
        </div>

        {billingLoading ? (
          <div className="p-6">
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg animate-pulse">
                  <div className="space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-48"></div>
                    <div className="h-3 bg-gray-200 rounded w-32"></div>
                  </div>
                  <div className="space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-20"></div>
                    <div className="h-3 bg-gray-200 rounded w-16"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : billingError ? (
          <div className="p-6">
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center space-x-3">
                <AlertTriangle className="h-5 w-5 text-red-600" />
                <div>
                  <h4 className="text-red-800 font-medium">Error Loading Billing History</h4>
                  <p className="text-red-600 text-sm mt-1">{billingError}</p>
                  <button
                    onClick={() => fetchBillingHistory(pagination.currentPage)}
                    className="mt-2 text-red-600 hover:text-red-500 text-sm font-medium flex items-center space-x-1"
                  >
                    <RefreshCw className="h-4 w-4" />
                    <span>Retry</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : billingHistory.length === 0 ? (
          <div className="p-6">
            <div className="text-center py-8">
              <Receipt className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No billing history available</p>
              <p className="text-gray-400 text-sm mt-1">Your billing transactions will appear here</p>
            </div>
          </div>
        ) : (
          <div className="p-6">
            <div className="space-y-4">
              {billingHistory.map((transaction) => {
                const statusBadge = getStatusBadge(transaction.status);
                return (
                  <div key={transaction.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-indigo-100 rounded-full">
                          <Receipt className="h-4 w-4 text-indigo-600" />
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-900">{transaction.planName}</h4>
                          <div className="flex items-center space-x-2 text-sm text-gray-600 mt-1">
                            <span>{formatDate(transaction.purchaseDate)}</span>
                            <span>•</span>
                            <span className="capitalize">{transaction.paymentMethod}</span>
                            {transaction.transactionId && (
                              <>
                                <span>•</span>
                                <span className="font-mono text-xs">ID: {transaction.transactionId}</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-4">
                      <div className="text-right">
                        <div className="font-semibold text-gray-900">
                          {formatAmount(transaction.amount, transaction.currency)}
                        </div>
                        <div className="text-sm text-gray-600 capitalize">
                          {transaction.billingCycle}
                        </div>
                      </div>

                      <div className="flex flex-col items-end space-y-2">
                        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${statusBadge.color}`}>
                          {statusBadge.text}
                        </span>
                        {transaction.status === 'active' && (
                          <span className="text-xs text-gray-500">
                            Until {formatDate(transaction.endDate)}
                          </span>
                        )}
                        {transaction.status === 'cancelled' && transaction.cancellationDate && (
                          <span className="text-xs text-gray-500">
                            Cancelled {formatDate(transaction.cancellationDate)}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div className="flex items-center justify-between mt-6 pt-6 border-t border-gray-200">
                <div className="text-sm text-gray-600">
                  Showing {billingHistory.length} of {pagination.totalCount} transactions
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handlePageChange(pagination.currentPage - 1)}
                    disabled={!pagination.hasPrevPage}
                    className="flex items-center px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>

                  <div className="flex items-center space-x-1">
                    {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                      const page = i + 1;
                      return (
                        <button
                          key={page}
                          onClick={() => handlePageChange(page)}
                          className={`px-3 py-1 text-sm rounded-md ${
                            page === pagination.currentPage
                              ? 'bg-indigo-600 text-white'
                              : 'border border-gray-300 hover:bg-gray-50'
                          }`}
                        >
                          {page}
                        </button>
                      );
                    })}
                    {pagination.totalPages > 5 && (
                      <>
                        <span className="px-2 text-gray-400">...</span>
                        <button
                          onClick={() => handlePageChange(pagination.totalPages)}
                          className={`px-3 py-1 text-sm rounded-md ${
                            pagination.totalPages === pagination.currentPage
                              ? 'bg-indigo-600 text-white'
                              : 'border border-gray-300 hover:bg-gray-50'
                          }`}
                        >
                          {pagination.totalPages}
                        </button>
                      </>
                    )}
                  </div>

                  <button
                    onClick={() => handlePageChange(pagination.currentPage + 1)}
                    disabled={!pagination.hasNextPage}
                    className="flex items-center px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Plan Expiry Warning */}
      {!error && planData?.access?.hasActivePlan && getDaysUntilExpiry(userPlan?.endDate) <= 7 && getDaysUntilExpiry(userPlan?.endDate) > 0 && (
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-6">
          <div className="flex items-start space-x-3">
            <AlertTriangle className="h-6 w-6 text-orange-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h3 className="text-orange-800 font-medium">Plan Expiring Soon</h3>
              <p className="text-orange-700 text-sm mt-1">
                Your {userPlan?.planId?.displayName} plan will expire on {formatDate(userPlan?.endDate)}.
                Renew now to avoid service interruption.
              </p>
              <button
                onClick={() => router.push('/settings?section=upgrade')}
                className="mt-3 bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 transition-colors text-sm font-medium"
              >
                Renew Plan
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}