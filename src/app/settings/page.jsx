'use client';

import React, { useState, Suspense } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter, useSearchParams } from 'next/navigation';
import Sidebar from '@/components/Sidebar';
import TopNavbar from '@/components/TopNavbar';
import {
  ArrowLeft,
  User,
  Settings,
  CreditCard,
  Receipt,
  Mail,
  Phone,
  Building,
  MapPin,
  Save,
  Loader2,
  Check,
  AlertCircle,
  Crown,
  Zap,
  Shield,
  Bell,
  Globe,
  Users,
  FileText
} from 'lucide-react';

// Separate component for settings content that uses useSearchParams
function SettingsContent() {
  const { user, isAuthenticated, loading: authLoading, updateProfile } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  // Get section from URL or default to profile
  const sectionFromUrl = searchParams?.get('section') || 'profile';
  const [activeSection, setActiveSection] = useState(sectionFromUrl);

  // Sidebar state for main dashboard sidebar
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [activeSidebarItem, setActiveSidebarItem] = useState('settings');

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  // Form state matching actual database schema
  const [formData, setFormData] = useState({
    // User model fields
    fullName: user?.fullName || '',
    email: user?.email || '',
    phone: user?.phone || '',
    avatar: user?.avatar || '',
    // User preferences
    emailNotifications: user?.preferences?.emailNotifications ?? true,
    smsNotifications: user?.preferences?.smsNotifications ?? false,
    marketingEmails: user?.preferences?.marketingEmails ?? true,

    // BusinessProfile fields (if exists)
    companyName: user?.profiles?.owner?.company?.name || '',
    companyWebsite: user?.profiles?.owner?.company?.website || '',
    companyDescription: user?.profiles?.owner?.company?.description || '',
    industry: user?.profiles?.owner?.industry || '',
    companySize: user?.profiles?.owner?.companySize || '',
    businessType: user?.profiles?.owner?.businessType || '',

    // Location fields
    address: user?.profiles?.owner?.location?.address || '',
    city: user?.profiles?.owner?.location?.city || '',
    state: user?.profiles?.owner?.location?.state || '',
    country: user?.profiles?.owner?.location?.country || 'India',
    pincode: user?.profiles?.owner?.location?.pincode || ''
  });

  // Redirect if not authenticated
  React.useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login');
      return;
    }
  }, [authLoading, isAuthenticated, router]);

  // Update form data when user changes
  React.useEffect(() => {
    if (user) {
      setFormData({
        // User model fields
        fullName: user.fullName || '',
        email: user.email || '',
        phone: user.phone || '',
        avatar: user.avatar || '',
        // User preferences
        emailNotifications: user.preferences?.emailNotifications ?? true,
        smsNotifications: user.preferences?.smsNotifications ?? false,
        marketingEmails: user.preferences?.marketingEmails ?? true,

        // BusinessProfile fields (if exists)
        companyName: user.profiles?.owner?.company?.name || '',
        companyWebsite: user.profiles?.owner?.company?.website || '',
        companyDescription: user.profiles?.owner?.company?.description || '',
        industry: user.profiles?.owner?.industry || '',
        companySize: user.profiles?.owner?.companySize || '',
        businessType: user.profiles?.owner?.businessType || '',

        // Location fields
        address: user.profiles?.owner?.location?.address || '',
        city: user.profiles?.owner?.location?.city || '',
        state: user.profiles?.owner?.location?.state || '',
        country: user.profiles?.owner?.location?.country || 'India',
        pincode: user.profiles?.owner?.location?.pincode || ''
      });
    }
  }, [user]);

  // Update active section based on URL params
  React.useEffect(() => {
    const section = searchParams?.get('section');
    if (section && ['profile', 'account', 'upgrade', 'billing'].includes(section)) {
      setActiveSection(section);
    }
  }, [searchParams]);

  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  // Handle profile form submission
  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Prepare data for backend
      const updateData = {
        // User fields
        fullName: formData.fullName,
        phone: formData.phone,
        avatar: formData.avatar,
        preferences: {
          emailNotifications: formData.emailNotifications,
          smsNotifications: formData.smsNotifications,
          marketingEmails: formData.marketingEmails
        },
        // Business fields (will be handled by backend if user has business profile)
        companyName: formData.companyName,
        companyWebsite: formData.companyWebsite,
        companyDescription: formData.companyDescription,
        industry: formData.industry,
        companySize: formData.companySize,
        businessType: formData.businessType,
        'location.address': formData.address,
        'location.city': formData.city,
        'location.state': formData.state,
        'location.country': formData.country,
        'location.pincode': formData.pincode
      };

      const result = await updateProfile(updateData);

      if (result.success) {
        setSuccess(true);
        setTimeout(() => setSuccess(false), 3000);
      } else {
        setError(result.error || 'Failed to update profile');
      }
    } catch (err) {
      setError(err.message || 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  // Handle section change with URL update
  const handleSectionChange = (section) => {
    setActiveSection(section);
    const url = new URL(window.location);
    url.searchParams.set('section', section);
    window.history.pushState({}, '', url);
  };

  // Show loading while checking auth
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  // Sidebar navigation items
  const sidebarItems = [
    {
      id: 'profile',
      name: 'Edit Profile',
      icon: User,
      description: 'Personal & business information'
    },
    {
      id: 'account',
      name: 'Account Settings',
      icon: Settings,
      description: 'Security and preferences'
    },
    {
      id: 'upgrade',
      name: 'Upgrade Plan',
      icon: Crown,
      description: 'View and upgrade your plan'
    },
    {
      id: 'billing',
      name: 'Billing',
      icon: Receipt,
      description: 'Manage billing and invoices'
    }
  ];

  // Get user initials
  const getUserInitials = (name) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map(word => word.charAt(0).toUpperCase())
      .slice(0, 2)
      .join('');
  };

  // Render Edit Profile Section
  const renderEditProfile = () => (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-gray-900">Edit Profile</h2>
        <p className="text-gray-600 mt-1">Update your personal and business information.</p>
      </div>

      {/* Success Message */}
      {success && (
        <div className="p-4 bg-green-50 border border-green-200 rounded-lg flex items-center space-x-3">
          <Check className="h-5 w-5 text-green-600" />
          <p className="text-green-800 font-medium">Profile updated successfully!</p>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-center space-x-3">
          <AlertCircle className="h-5 w-5 text-red-600" />
          <p className="text-red-800">{error}</p>
        </div>
      )}

      <form onSubmit={handleProfileSubmit} className="space-y-8">
        {/* Profile Photo Section */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Profile Photo</h3>
          <div className="flex items-center space-x-6">
            <div className="w-20 h-20 bg-indigo-600 rounded-full flex items-center justify-center">
              <span className="text-2xl font-semibold text-white">
                {getUserInitials(formData.fullName)}
              </span>
            </div>
            <div>
              <button
                type="button"
                className="bg-white border border-gray-300 rounded-lg px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Change Photo
              </button>
              <p className="text-xs text-gray-500 mt-2">JPG, GIF or PNG. 2MB max.</p>
            </div>
          </div>
        </div>

        {/* Personal Information */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Personal Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Full Name <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleInputChange}
                  className="pl-10 w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="Enter your full name"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Address <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="pl-10 w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-gray-50"
                  placeholder="Enter your email"
                  disabled
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">Email cannot be changed for security reasons</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Phone Number
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className="pl-10 w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="Enter your phone number"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Company Information */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Company Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Company Name
              </label>
              <div className="relative">
                <Building className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  name="companyName"
                  value={formData.companyName}
                  onChange={handleInputChange}
                  className="pl-10 w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="Enter your company name"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Company Website
              </label>
              <div className="relative">
                <Globe className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <input
                  type="url"
                  name="companyWebsite"
                  value={formData.companyWebsite}
                  onChange={handleInputChange}
                  className="pl-10 w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="https://yourcompany.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Industry
              </label>
              <input
                type="text"
                name="industry"
                value={formData.industry}
                onChange={handleInputChange}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="e.g., Technology, Healthcare"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Company Size
              </label>
              <select
                name="companySize"
                value={formData.companySize}
                onChange={handleInputChange}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="">Select company size</option>
                <option value="1-10">1-10 employees</option>
                <option value="11-50">11-50 employees</option>
                <option value="51-200">51-200 employees</option>
                <option value="201-500">201-500 employees</option>
                <option value="501-1000">501-1000 employees</option>
                <option value="1000+">1000+ employees</option>
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Business Type
              </label>
              <select
                name="businessType"
                value={formData.businessType}
                onChange={handleInputChange}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="">Select business type</option>
                <option value="b2b">B2B (Business to Business)</option>
                <option value="b2c">B2C (Business to Consumer)</option>
                <option value="b2b2c">B2B2C (Business to Business to Consumer)</option>
                <option value="d2c">D2C (Direct to Consumer)</option>
                <option value="marketplace">Marketplace</option>
                <option value="saas">SaaS (Software as a Service)</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Company Description
              </label>
              <textarea
                name="companyDescription"
                value={formData.companyDescription}
                onChange={handleInputChange}
                rows={4}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Describe your company and what it does..."
              />
            </div>
          </div>
        </div>

        {/* Location Information */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Location</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Address
              </label>
              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleInputChange}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Street address"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                City
              </label>
              <input
                type="text"
                name="city"
                value={formData.city}
                onChange={handleInputChange}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="City"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                State
              </label>
              <input
                type="text"
                name="state"
                value={formData.state}
                onChange={handleInputChange}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="State"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Country
              </label>
              <input
                type="text"
                name="country"
                value={formData.country}
                onChange={handleInputChange}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Country"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                PIN Code
              </label>
              <input
                type="text"
                name="pincode"
                value={formData.pincode}
                onChange={handleInputChange}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="PIN code"
              />
            </div>
          </div>
        </div>

        {/* Notification Preferences */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Notification Preferences</h3>
          <div className="space-y-4">
            <div className="flex items-center">
              <input
                type="checkbox"
                name="emailNotifications"
                checked={formData.emailNotifications}
                onChange={handleInputChange}
                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
              />
              <label className="ml-3 text-sm text-gray-700">
                Email notifications about account activity
              </label>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                name="smsNotifications"
                checked={formData.smsNotifications}
                onChange={handleInputChange}
                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
              />
              <label className="ml-3 text-sm text-gray-700">
                SMS notifications for important updates
              </label>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                name="marketingEmails"
                checked={formData.marketingEmails}
                onChange={handleInputChange}
                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
              />
              <label className="ml-3 text-sm text-gray-700">
                Marketing emails about new features and tips
              </label>
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={loading}
            className="flex items-center space-x-2 px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            <span>{loading ? 'Saving...' : 'Save Changes'}</span>
          </button>
        </div>
      </form>
    </div>
  );

  // Render other sections (placeholder for now)
  const renderSection = () => {
    switch (activeSection) {
      case 'profile':
        return renderEditProfile();
      case 'account':
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-semibold text-gray-900">Account Settings</h2>
              <p className="text-gray-600 mt-1">Manage your account security and preferences.</p>
            </div>
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <p className="text-gray-500">Account settings coming soon...</p>
            </div>
          </div>
        );
      case 'upgrade':
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-semibold text-gray-900">Upgrade Plan</h2>
              <p className="text-gray-600 mt-1">Choose the plan that works best for you.</p>
            </div>
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <p className="text-gray-500">Plan upgrade options coming soon...</p>
            </div>
          </div>
        );
      case 'billing':
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-semibold text-gray-900">Billing</h2>
              <p className="text-gray-600 mt-1">Manage your billing information and invoices.</p>
            </div>
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <p className="text-gray-500">Billing management coming soon...</p>
            </div>
          </div>
        );
      default:
        return renderEditProfile();
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Main Dashboard Sidebar */}
      <Sidebar
        sidebarCollapsed={sidebarCollapsed}
        setSidebarCollapsed={setSidebarCollapsed}
        activeItem={activeSidebarItem}
        setActiveItem={setActiveSidebarItem}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col">
        {/* Top Navigation */}
        <TopNavbar />

        {/* Settings Content */}
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Header */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
            </div>

            <div className="flex gap-8">
              {/* Settings Sidebar */}
              <div className="w-64 flex-shrink-0">
                <nav className="bg-white rounded-lg border border-gray-200 p-4">
                  <ul className="space-y-2">
                    {sidebarItems.map((item) => {
                      const Icon = item.icon;
                      return (
                        <li key={item.id}>
                          <button
                            onClick={() => handleSectionChange(item.id)}
                            className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                              activeSection === item.id
                                ? 'bg-indigo-50 text-indigo-600 border border-indigo-200'
                                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                            }`}
                          >
                            <Icon className="h-4 w-4 mr-3" />
                            <div className="text-left">
                              <div>{item.name}</div>
                              <div className="text-xs opacity-75">{item.description}</div>
                            </div>
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                </nav>
              </div>

              {/* Main Content */}
              <div className="flex-1">
                {renderSection()}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Loading fallback component
function SettingsLoading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
    </div>
  );
}

// Main page component with Suspense boundary
export default function SettingsPage() {
  return (
    <Suspense fallback={<SettingsLoading />}>
      <SettingsContent />
    </Suspense>
  );
}
