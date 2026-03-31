'use client';

import React, { useState, useEffect } from 'react';
import {
  Crown,
  Building,
  Users,
  Check,
  ArrowRight,
  Loader2,
  AlertCircle,
  Zap,
  CreditCard,
  Shield,
  Calendar,
  Target,
  Package
} from 'lucide-react';
import { getPlans, getPackagesByPlan, upgradePlan, simpleUpgrade } from '@/services/planService';
import { useAuth } from '@/contexts/AuthContext';

const PlanSelection = () => {
  const { user } = useAuth();
  const [plans, setPlans] = useState([]);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [packagesLoading, setPackagesLoading] = useState(false);
  const [error, setError] = useState('');

  // Upgrade flow states
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [isUpgrading, setIsUpgrading] = useState(false);
  const [upgradeSuccess, setUpgradeSuccess] = useState(false);

  console.log(packages)

  // Fetch plans on component mount
  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    try {
      setLoading(true);
      const response = await getPlans();
      if (response.success) {
        setPlans(response.data);
        // Auto-select first plan if available
        if (response.data.length > 0) {
          setSelectedPlan(response.data[0]);
          fetchPackages(response.data[0]._id);
        }
      }
    } catch (err) {
      setError('Failed to load plans. Please try again.');
      console.error('Error fetching plans:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchPackages = async (planId) => {
    try {
      setPackagesLoading(true);
      const response = await getPackagesByPlan(planId);
      if (response.success) {
        setPackages(response.data);
      }
    } catch (err) {
      setError('Failed to load packages. Please try again.');
      console.error('Error fetching packages:', err);
    } finally {
      setPackagesLoading(false);
    }
  };

  const handlePlanSelect = (plan) => {
    setSelectedPlan(plan);
    fetchPackages(plan._id);
  };

  const handlePackageSelect = async (pkg) => {
    // Get token from localStorage since AuthContext stores it separately
    const token = localStorage.getItem('token');

    if (!token || !user || !selectedPlan) {
      setError('Please login to upgrade your plan');
      return;
    }

    setSelectedPackage(pkg);
    setIsUpgrading(true);
    setError('');

    try {
      const response = await simpleUpgrade(
        selectedPlan._id,
        pkg._id,
        token
      );

      if (response.success) {
        setUpgradeSuccess(true);

        // Trigger plan update event for navbar to refresh
        window.dispatchEvent(new CustomEvent('planUpdated'));

        // Show success message with next billing date
        const nextBillingMessage = response.data.nextBillingDate
          ? `Next billing date: ${new Date(response.data.nextBillingDate).toLocaleDateString()}`
          : 'One-time purchase - no recurring billing';

        // Set success message
        setError(''); // Clear any previous errors

        setTimeout(() => {
          setUpgradeSuccess(false);
          setSelectedPackage(null);
          // Optionally refresh user data
          window.location.reload(); // Simple refresh to update user state
        }, 4000);

      } else {
        setError(response.message || 'Failed to upgrade plan');
      }
    } catch (err) {
      setError(err.message || 'Failed to upgrade plan. Please try again.');
      console.error('Upgrade error:', err);
    } finally {
      setIsUpgrading(false);
    }
  };


  const getPlanIcon = (planType) => {
    switch (planType) {
      case 'startups_solopreneurs':
        return <Users className="h-8 w-8" />;
      case 'enterprise':
        return <Building className="h-8 w-8" />;
      default:
        return <Crown className="h-8 w-8" />;
    }
  };

  const getPlanColor = (planType) => {
    switch (planType) {
      case 'startups_solopreneurs':
        return 'blue';
      case 'enterprise':
        return 'purple';
      default:
        return 'indigo';
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">Upgrade Plan</h2>
          <p className="text-gray-600 mt-1">Choose the plan that works best for you.</p>
        </div>
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">Upgrade Plan</h2>
          <p className="text-gray-600 mt-1">Choose the plan that works best for you.</p>
        </div>
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 flex items-center space-x-3">
          <AlertCircle className="h-5 w-5 text-red-600" />
          <p className="text-red-800">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Choose Your Plan</h2>
      </div>

      {/* Success Message */}
      {upgradeSuccess && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center space-x-3">
          <Check className="h-5 w-5 text-green-600" />
          <div>
            <p className="text-green-800 font-medium">Plan upgraded successfully!</p>
            <p className="text-green-700 text-sm">You now have access to all premium features.</p>
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center space-x-3">
          <AlertCircle className="h-5 w-5 text-red-600" />
          <p className="text-red-800">{error}</p>
        </div>
      )}

      {/* Plan Type Selection */}
      <div className="bg-white rounded-lg">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {plans.map((plan) => {
            const color = getPlanColor(plan.type);
            const isSelected = selectedPlan?._id === plan._id;

            return (
              <button
                key={plan._id}
                onClick={() => handlePlanSelect(plan)}
                className={`p-6 rounded-lg border-2 text-left transition-all hover:shadow-md ${
                  isSelected
                    ? (plan.type === 'startups_solopreneurs'
                        ? 'border-blue-500 bg-blue-50 shadow-md'
                        : 'border-purple-500 bg-purple-50 shadow-md')
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center space-x-4">
                  <div className={`p-3 rounded-lg ${
                    isSelected
                      ? (plan.type === 'startups_solopreneurs'
                          ? 'bg-blue-100 text-blue-600'
                          : 'bg-purple-100 text-purple-600')
                      : 'bg-gray-100 text-gray-600'
                  }`}>
                    {getPlanIcon(plan.type)}
                  </div>
                  <div>
                    <h4 className={`font-semibold ${
                      isSelected
                        ? (plan.type === 'startups_solopreneurs'
                            ? 'text-blue-900'
                            : 'text-purple-900')
                        : 'text-gray-900'
                    }`}>
                      {plan.displayName}
                    </h4>
                    <p className="text-sm text-gray-600 mt-1">
                      {plan.type === 'startups_solopreneurs'
                        ? 'Perfect for small teams and entrepreneurs'
                        : 'Designed for large organizations'
                      }
                    </p>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Package Selection */}
      {selectedPlan && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center space-x-3 mb-6">
            <h3 className="text-lg font-medium text-gray-900">
              {selectedPlan.displayName} Packages
            </h3>
            {packagesLoading && <Loader2 className="h-4 w-4 animate-spin text-gray-400" />}
          </div>

          {packagesLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-indigo-600" />
            </div>
          ) : packages.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">No packages available for this plan.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {packages.map((pkg, index) => {
                const isPopular = index === 1; // Make middle package popular

                return (
                  <div
                    key={pkg._id}
                    className={`relative rounded-lg border-2 p-6 ${
                      isPopular
                        ? 'border-indigo-500 bg-indigo-50'
                        : 'border-gray-200 bg-white'
                    }`}
                  >
                    {/* Popular Badge */}
                    {isPopular && (
                      <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                        <span className="bg-indigo-600 text-white px-3 py-1 rounded-full text-xs font-semibold">
                          Most Popular
                        </span>
                      </div>
                    )}

                    <div className="text-center">
                      {/* Package Name */}
                      <h4 className="text-xl font-semibold text-gray-900 mb-2">
                        {pkg.name}
                      </h4>

                      {/* Price */}
                      <div className="mb-4">
                        <span className="text-4xl font-bold text-gray-900">
                          ${pkg.price}
                        </span>
                        <span className="text-gray-600">/month</span>
                      </div>

                      {/* Features */}
                      <div className="space-y-3 mb-6 text-left">
                        <div className="flex items-center space-x-3">
                          <Zap className="h-4 w-4 text-indigo-600" />
                          <span className="text-sm text-gray-700">
                            {pkg.credits.toLocaleString()} Credits
                          </span>
                        </div>
                        <div className="flex items-center space-x-3">
                          <Check className="h-4 w-4 text-indigo-600" />
                          <span className="text-sm text-gray-700">
                            {pkg.projectsAvailable} Project{pkg.projectsAvailable > 1 ? 's' : ''}
                          </span>
                        </div>
                        {pkg.support && (
                          <div className="flex items-center space-x-3">
                            <Check className="h-4 w-4 text-indigo-600" />
                            <span className="text-sm text-gray-700">
                              {pkg.support}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Select Button */}
                      <button
                        onClick={() => handlePackageSelect(pkg)}
                        disabled={isUpgrading}
                        className={`w-full py-3 px-4 rounded-lg font-semibold transition-colors cursor-pointer flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed ${
                          upgradeSuccess && selectedPackage?._id === pkg._id
                            ? 'bg-green-600 text-white'
                            : isUpgrading && selectedPackage?._id === pkg._id
                            ? 'bg-gray-400 text-white'
                            : isPopular
                            ? 'bg-indigo-600 text-white hover:bg-indigo-700'
                            : 'bg-gray-900 text-white hover:bg-gray-800'
                        }`}
                      >
                        {isUpgrading && selectedPackage?._id === pkg._id ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin" />
                            <span>Upgrading...</span>
                          </>
                        ) : upgradeSuccess && selectedPackage?._id === pkg._id ? (
                          <>
                            <Check className="h-4 w-4" />
                            <span>Upgraded!</span>
                          </>
                        ) : (
                          <>
                            <CreditCard className="h-4 w-4" />
                            <span>Choose {pkg.name}</span>
                            <ArrowRight className="h-4 w-4" />
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Free Plan Info */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <div className="flex items-center justify-center space-x-2 text-gray-600">
          <Zap className="h-4 w-4" />
          <span className="text-sm font-medium">
            Currently on Free Plan • Upgrade to unlock advanced features and higher limits
          </span>
        </div>
      </div>
    </div>
  );
};

export default PlanSelection;