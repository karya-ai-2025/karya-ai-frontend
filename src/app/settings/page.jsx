'use client';

import React, { useState, Suspense } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter, useSearchParams } from 'next/navigation';
import Sidebar from '@/components/Sidebar';
import TopNavbar from '@/components/TopNavbar';
import PlanSelection from '@/components/PlanSelection';
import BillingDashboard from '@/components/BillingDashboard';
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
  FileText,
  Lock,
  Eye,
  EyeOff,
  Trash2,
  RefreshCw,
  Briefcase,
  DollarSign,
  Clock,
  Star,
  ToggleLeft,
  ToggleRight
} from 'lucide-react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

// Separate component for settings content that uses useSearchParams
function SettingsContent() {
  const { user, isAuthenticated, loading: authLoading, updateProfile, changePassword, deactivateAccount, resendVerification, activeRole } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  const sectionFromUrl = searchParams?.get('section') || 'profile';
  const [activeSection, setActiveSection] = useState(sectionFromUrl);

  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [activeSidebarItem, setActiveSidebarItem] = useState('settings');

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  // Form state — user fields
  const [formData, setFormData] = useState({
    fullName: user?.fullName || '',
    email: user?.email || '',
    phone: user?.phone || '',
    avatar: user?.avatar || '',
    emailNotifications: user?.preferences?.emailNotifications ?? true,
    smsNotifications: user?.preferences?.smsNotifications ?? false,
    marketingEmails: user?.preferences?.marketingEmails ?? true,
    // Business profile
    companyName: user?.profiles?.owner?.company?.name || '',
    companyWebsite: user?.profiles?.owner?.company?.website || '',
    companyDescription: user?.profiles?.owner?.company?.description || '',
    industry: user?.profiles?.owner?.industry || '',
    companySize: user?.profiles?.owner?.companySize || '',
    businessType: user?.profiles?.owner?.businessType || '',
    address: user?.profiles?.owner?.location?.address || '',
    city: user?.profiles?.owner?.location?.city || '',
    state: user?.profiles?.owner?.location?.state || '',
    country: user?.profiles?.owner?.location?.country || 'India',
    pincode: user?.profiles?.owner?.location?.pincode || '',
    // Expert profile
    headline: user?.profiles?.expert?.headline || '',
    bio: user?.profiles?.expert?.bio || '',
    yearsOfExperience: user?.profiles?.expert?.yearsOfExperience || '',
    primaryCategory: user?.profiles?.expert?.primaryCategory || '',
    hourlyRate: user?.profiles?.expert?.pricing?.hourlyRate || '',
    expertCity: user?.profiles?.expert?.location?.city || '',
    expertCountry: user?.profiles?.expert?.location?.country || 'India',
    availabilityStatus: user?.profiles?.expert?.availability?.status || 'available',
    hoursPerWeek: user?.profiles?.expert?.availability?.hoursPerWeek || '',
    isPublic: user?.profiles?.expert?.profileStatus?.isPublic ?? true,
    isSearchable: user?.profiles?.expert?.profileStatus?.isSearchable ?? true,
  });

  // Password change state
  const [pwData, setPwData] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [showPw, setShowPw] = useState({ current: false, new: false, confirm: false });

  // Deactivation state
  const [deactivatePassword, setDeactivatePassword] = useState('');
  const [showDeactivateConfirm, setShowDeactivateConfirm] = useState(false);

  // Redirect if not authenticated
  React.useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [authLoading, isAuthenticated, router]);

  // Sync form when user loads
  React.useEffect(() => {
    if (user) {
      setFormData({
        fullName: user.fullName || '',
        email: user.email || '',
        phone: user.phone || '',
        avatar: user.avatar || '',
        emailNotifications: user.preferences?.emailNotifications ?? true,
        smsNotifications: user.preferences?.smsNotifications ?? false,
        marketingEmails: user.preferences?.marketingEmails ?? true,
        companyName: user.profiles?.owner?.company?.name || '',
        companyWebsite: user.profiles?.owner?.company?.website || '',
        companyDescription: user.profiles?.owner?.company?.description || '',
        industry: user.profiles?.owner?.industry || '',
        companySize: user.profiles?.owner?.companySize || '',
        businessType: user.profiles?.owner?.businessType || '',
        address: user.profiles?.owner?.location?.address || '',
        city: user.profiles?.owner?.location?.city || '',
        state: user.profiles?.owner?.location?.state || '',
        country: user.profiles?.owner?.location?.country || 'India',
        pincode: user.profiles?.owner?.location?.pincode || '',
        headline: user.profiles?.expert?.headline || '',
        bio: user.profiles?.expert?.bio || '',
        yearsOfExperience: user.profiles?.expert?.yearsOfExperience || '',
        primaryCategory: user.profiles?.expert?.primaryCategory || '',
        hourlyRate: user.profiles?.expert?.pricing?.hourlyRate || '',
        expertCity: user.profiles?.expert?.location?.city || '',
        expertCountry: user.profiles?.expert?.location?.country || 'India',
        availabilityStatus: user.profiles?.expert?.availability?.status || 'available',
        hoursPerWeek: user.profiles?.expert?.availability?.hoursPerWeek || '',
        isPublic: user.profiles?.expert?.profileStatus?.isPublic ?? true,
        isSearchable: user.profiles?.expert?.profileStatus?.isSearchable ?? true,
      });
    }
  }, [user]);

  // Sync section from URL
  React.useEffect(() => {
    const section = searchParams?.get('section');
    if (section && ['profile', 'account', 'upgrade', 'billing'].includes(section)) {
      setActiveSection(section);
    }
  }, [searchParams]);

  const showSuccess = (msg) => {
    setSuccess(msg);
    setError('');
    setTimeout(() => setSuccess(''), 3500);
  };

  const showError = (msg) => {
    setError(msg);
    setSuccess('');
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  // Handle profile form submission
  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      let updateData;

      if (activeRole === 'expert') {
        updateData = {
          fullName: formData.fullName,
          phone: formData.phone,
          preferences: {
            emailNotifications: formData.emailNotifications,
            smsNotifications: formData.smsNotifications,
            marketingEmails: formData.marketingEmails
          },
          headline: formData.headline,
          bio: formData.bio,
          yearsOfExperience: formData.yearsOfExperience,
          primaryCategory: formData.primaryCategory,
          'pricing.hourlyRate': formData.hourlyRate,
          'location.city': formData.expertCity,
          'location.country': formData.expertCountry,
          'availability.status': formData.availabilityStatus,
          'availability.hoursPerWeek': formData.hoursPerWeek,
        };

        // Update expert profile via profiles API
        const token = localStorage.getItem('token');
        const res = await fetch(`${API_URL}/profiles/expert`, {
          method: 'PUT',
          headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify(updateData)
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || 'Failed to update profile');

        // Also update visibility if changed
        const visRes = await fetch(`${API_URL}/profiles/expert/visibility`, {
          method: 'PUT',
          headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ isPublic: formData.isPublic, isSearchable: formData.isSearchable })
        });
        if (!visRes.ok) {
          const visData = await visRes.json();
          throw new Error(visData.message || 'Failed to update visibility');
        }

        // Also update basic user info
        await updateProfile({ fullName: formData.fullName, phone: formData.phone });
      } else {
        updateData = {
          fullName: formData.fullName,
          phone: formData.phone,
          preferences: {
            emailNotifications: formData.emailNotifications,
            smsNotifications: formData.smsNotifications,
            marketingEmails: formData.marketingEmails
          },
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
        if (!result.success) throw new Error(result.error || 'Failed to update profile');
      }

      showSuccess('Profile updated successfully!');
    } catch (err) {
      showError(err.message || 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  // Handle password change
  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (pwData.newPassword !== pwData.confirmPassword) {
      showError('New passwords do not match');
      return;
    }
    if (pwData.newPassword.length < 8) {
      showError('New password must be at least 8 characters');
      return;
    }
    setLoading(true);
    try {
      const result = await changePassword(pwData.currentPassword, pwData.newPassword);
      if (result.success) {
        showSuccess('Password changed successfully!');
        setPwData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      } else {
        showError(result.error || 'Failed to change password');
      }
    } finally {
      setLoading(false);
    }
  };

  // Handle account deactivation
  const handleDeactivate = async () => {
    if (!deactivatePassword) {
      showError('Please enter your password to confirm deactivation');
      return;
    }
    setLoading(true);
    try {
      const result = await deactivateAccount(deactivatePassword);
      if (result.success) {
        router.push('/login?deactivated=1');
      } else {
        showError(result.error || 'Failed to deactivate account');
      }
    } finally {
      setLoading(false);
    }
  };

  // Handle resend verification
  const handleResendVerification = async () => {
    setLoading(true);
    try {
      const result = await resendVerification();
      if (result.success) {
        showSuccess('Verification email sent! Check your inbox.');
      } else {
        showError(result.error || 'Failed to send verification email');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSectionChange = (section) => {
    setActiveSection(section);
    setError('');
    setSuccess('');
    const url = new URL(window.location);
    url.searchParams.set('section', section);
    window.history.pushState({}, '', url);
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const sidebarItems = [
    { id: 'profile', name: 'Edit Profile', icon: User, description: 'Personal & business information' },
    { id: 'account', name: 'Account Settings', icon: Settings, description: 'Security and preferences' },
    { id: 'upgrade', name: 'Upgrade Plan', icon: Crown, description: 'View and upgrade your plan' },
    { id: 'billing', name: 'Billing', icon: Receipt, description: 'Manage billing and invoices' }
  ];

  const getUserInitials = (name) => {
    if (!name) return 'U';
    return name.split(' ').map(w => w.charAt(0).toUpperCase()).slice(0, 2).join('');
  };

  const AlertBanner = ({ type, message }) => (
    <div className={`p-4 rounded-lg flex items-center space-x-3 ${type === 'success' ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
      {type === 'success'
        ? <Check className="h-5 w-5 text-green-600 flex-shrink-0" />
        : <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0" />}
      <p className={type === 'success' ? 'text-green-800 font-medium' : 'text-red-800'}>{message}</p>
    </div>
  );

  // ─── EDIT PROFILE SECTION ────────────────────────────────────────────────────
  const renderEditProfile = () => (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-gray-900">Edit Profile</h2>
        <p className="text-gray-600 mt-1">
          {activeRole === 'expert' ? 'Update your expert profile and availability.' : 'Update your personal and business information.'}
        </p>
      </div>

      {success && <AlertBanner type="success" message={success} />}
      {error && <AlertBanner type="error" message={error} />}

      <form onSubmit={handleProfileSubmit} className="space-y-6">
        {/* Profile Photo */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Profile Photo</h3>
          <div className="flex items-center space-x-6">
            <div className="w-20 h-20 bg-gradient-to-br from-blue-600 to-orange-500 rounded-full flex items-center justify-center">
              <span className="text-2xl font-semibold text-white">{getUserInitials(formData.fullName)}</span>
            </div>
            <div>
              <button type="button" className="bg-white border border-gray-300 rounded-lg px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
                Change Photo
              </button>
              <p className="text-xs text-gray-500 mt-2">JPG, GIF or PNG. 2MB max.</p>
            </div>
          </div>
        </div>

        {/* Personal Information */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Personal Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Full Name <span className="text-red-500">*</span></label>
              <div className="relative">
                <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <input type="text" name="fullName" value={formData.fullName} onChange={handleInputChange}
                  className="pl-10 w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter your full name" required />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <input type="email" value={formData.email} disabled
                  className="pl-10 w-full border border-gray-300 rounded-lg px-3 py-2 bg-gray-50 text-gray-500 cursor-not-allowed" />
              </div>
              <p className="text-xs text-gray-500 mt-1">Email cannot be changed for security reasons</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
              <div className="relative">
                <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <input type="tel" name="phone" value={formData.phone} onChange={handleInputChange}
                  className="pl-10 w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter your phone number" />
              </div>
            </div>
          </div>
        </div>

        {/* Role-specific fields */}
        {activeRole === 'expert' ? (
          <>
            {/* Expert Profile Details */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Expert Profile</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Professional Headline</label>
                  <input type="text" name="headline" value={formData.headline} onChange={handleInputChange}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., B2B Growth Expert | Lead Generation Specialist" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Bio / About You</label>
                  <textarea name="bio" value={formData.bio} onChange={handleInputChange} rows={4}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Tell clients about your experience, skills, and expertise..." />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Years of Experience</label>
                    <input type="number" name="yearsOfExperience" value={formData.yearsOfExperience} onChange={handleInputChange}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="e.g., 5" min="0" max="50" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Primary Category</label>
                    <select name="primaryCategory" value={formData.primaryCategory} onChange={handleInputChange}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500">
                      <option value="">Select category</option>
                      <option value="lead-generation">Lead Generation</option>
                      <option value="content-marketing">Content Marketing</option>
                      <option value="seo">SEO</option>
                      <option value="paid-ads">Paid Ads</option>
                      <option value="social-media">Social Media</option>
                      <option value="email-marketing">Email Marketing</option>
                      <option value="sales">Sales</option>
                      <option value="strategy">Strategy</option>
                      <option value="analytics">Analytics</option>
                      <option value="branding">Branding</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* Pricing & Availability */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Pricing & Availability</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Hourly Rate (₹)</label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <input type="number" name="hourlyRate" value={formData.hourlyRate} onChange={handleInputChange}
                      className="pl-10 w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="e.g., 2000" min="0" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Hours per Week</label>
                  <div className="relative">
                    <Clock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <input type="number" name="hoursPerWeek" value={formData.hoursPerWeek} onChange={handleInputChange}
                      className="pl-10 w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="e.g., 20" min="0" max="168" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Availability Status</label>
                  <select name="availabilityStatus" value={formData.availabilityStatus} onChange={handleInputChange}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <option value="available">Available</option>
                    <option value="busy">Busy</option>
                    <option value="unavailable">Unavailable</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">City</label>
                  <input type="text" name="expertCity" value={formData.expertCity} onChange={handleInputChange}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Your city" />
                </div>
              </div>
            </div>

            {/* Profile Visibility */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Profile Visibility</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <p className="text-sm font-medium text-gray-900">Public Profile</p>
                    <p className="text-xs text-gray-500">Allow anyone to view your expert profile</p>
                  </div>
                  <button type="button" onClick={() => setFormData(p => ({ ...p, isPublic: !p.isPublic }))}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${formData.isPublic ? 'bg-blue-600' : 'bg-gray-300'}`}>
                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${formData.isPublic ? 'translate-x-6' : 'translate-x-1'}`} />
                  </button>
                </div>
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <p className="text-sm font-medium text-gray-900">Appear in Search</p>
                    <p className="text-xs text-gray-500">Let clients find you through marketplace search</p>
                  </div>
                  <button type="button" onClick={() => setFormData(p => ({ ...p, isSearchable: !p.isSearchable }))}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${formData.isSearchable ? 'bg-blue-600' : 'bg-gray-300'}`}>
                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${formData.isSearchable ? 'translate-x-6' : 'translate-x-1'}`} />
                  </button>
                </div>
              </div>
            </div>
          </>
        ) : (
          <>
            {/* Business Profile */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Company Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Company Name</label>
                  <div className="relative">
                    <Building className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <input type="text" name="companyName" value={formData.companyName} onChange={handleInputChange}
                      className="pl-10 w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter your company name" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Company Website</label>
                  <div className="relative">
                    <Globe className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <input type="url" name="companyWebsite" value={formData.companyWebsite} onChange={handleInputChange}
                      className="pl-10 w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="https://yourcompany.com" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Industry</label>
                  <input type="text" name="industry" value={formData.industry} onChange={handleInputChange}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., Technology, Healthcare" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Company Size</label>
                  <select name="companySize" value={formData.companySize} onChange={handleInputChange}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500">
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
                  <label className="block text-sm font-medium text-gray-700 mb-2">Business Type</label>
                  <select name="businessType" value={formData.businessType} onChange={handleInputChange}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <option value="">Select business type</option>
                    <option value="b2b">B2B (Business to Business)</option>
                    <option value="b2c">B2C (Business to Consumer)</option>
                    <option value="b2b2c">B2B2C</option>
                    <option value="d2c">D2C (Direct to Consumer)</option>
                    <option value="marketplace">Marketplace</option>
                    <option value="saas">SaaS</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Company Description</label>
                  <textarea name="companyDescription" value={formData.companyDescription} onChange={handleInputChange} rows={4}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Describe your company and what it does..." />
                </div>
              </div>
            </div>

            {/* Location */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Location</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
                  <input type="text" name="address" value={formData.address} onChange={handleInputChange}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Street address" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">City</label>
                  <input type="text" name="city" value={formData.city} onChange={handleInputChange}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="City" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">State</label>
                  <input type="text" name="state" value={formData.state} onChange={handleInputChange}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="State" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Country</label>
                  <input type="text" name="country" value={formData.country} onChange={handleInputChange}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Country" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">PIN Code</label>
                  <input type="text" name="pincode" value={formData.pincode} onChange={handleInputChange}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="PIN code" />
                </div>
              </div>
            </div>
          </>
        )}

        {/* Notification Preferences */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Notification Preferences</h3>
          <div className="space-y-4">
            {[
              { name: 'emailNotifications', label: 'Email notifications about account activity' },
              { name: 'smsNotifications', label: 'SMS notifications for important updates' },
              { name: 'marketingEmails', label: 'Marketing emails about new features and tips' },
            ].map(pref => (
              <div key={pref.name} className="flex items-center">
                <input type="checkbox" name={pref.name} checked={formData[pref.name]} onChange={handleInputChange}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded" />
                <label className="ml-3 text-sm text-gray-700">{pref.label}</label>
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-end">
          <button type="submit" disabled={loading}
            className="flex items-center space-x-2 px-6 py-2 bg-gradient-to-r from-blue-600 to-orange-500 text-white rounded-lg hover:from-blue-700 hover:to-orange-600 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all">
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            <span>{loading ? 'Saving...' : 'Save Changes'}</span>
          </button>
        </div>
      </form>
    </div>
  );

  // ─── ACCOUNT SETTINGS SECTION ─────────────────────────────────────────────────
  const renderAccountSettings = () => (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-gray-900">Account Settings</h2>
        <p className="text-gray-600 mt-1">Manage your account security and preferences.</p>
      </div>

      {success && <AlertBanner type="success" message={success} />}
      {error && <AlertBanner type="error" message={error} />}

      {/* Email Verification Status */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
          <Mail className="h-5 w-5 text-blue-600" />
          Email Verification
        </h3>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-700">{user?.email}</p>
            {user?.isEmailVerified ? (
              <span className="inline-flex items-center gap-1 text-xs text-green-700 bg-green-50 border border-green-200 px-2 py-1 rounded-full mt-2">
                <Check className="h-3 w-3" /> Verified
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-xs text-orange-700 bg-orange-50 border border-orange-200 px-2 py-1 rounded-full mt-2">
                <AlertCircle className="h-3 w-3" /> Not Verified
              </span>
            )}
          </div>
          {!user?.isEmailVerified && (
            <button onClick={handleResendVerification} disabled={loading}
              className="flex items-center gap-2 px-4 py-2 border border-blue-300 text-blue-600 rounded-lg text-sm font-medium hover:bg-blue-50 disabled:opacity-50">
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
              Resend Email
            </button>
          )}
        </div>
      </div>

      {/* Change Password */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
          <Lock className="h-5 w-5 text-blue-600" />
          Change Password
        </h3>
        <form onSubmit={handlePasswordChange} className="space-y-4">
          {[
            { key: 'currentPassword', label: 'Current Password', placeholder: 'Enter current password' },
            { key: 'newPassword', label: 'New Password', placeholder: 'Minimum 8 characters' },
            { key: 'confirmPassword', label: 'Confirm New Password', placeholder: 'Repeat new password' },
          ].map(field => (
            <div key={field.key}>
              <label className="block text-sm font-medium text-gray-700 mb-2">{field.label}</label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <input
                  type={showPw[field.key === 'currentPassword' ? 'current' : field.key === 'newPassword' ? 'new' : 'confirm'] ? 'text' : 'password'}
                  value={pwData[field.key]}
                  onChange={e => setPwData(p => ({ ...p, [field.key]: e.target.value }))}
                  className="pl-10 pr-10 w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder={field.placeholder}
                  required />
                <button type="button"
                  onClick={() => setShowPw(p => ({
                    ...p,
                    [field.key === 'currentPassword' ? 'current' : field.key === 'newPassword' ? 'new' : 'confirm']:
                      !p[field.key === 'currentPassword' ? 'current' : field.key === 'newPassword' ? 'new' : 'confirm']
                  }))}
                  className="absolute right-3 top-3 text-gray-400 hover:text-gray-600">
                  {showPw[field.key === 'currentPassword' ? 'current' : field.key === 'newPassword' ? 'new' : 'confirm']
                    ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
          ))}
          <div className="flex justify-end">
            <button type="submit" disabled={loading}
              className="flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-blue-600 to-orange-500 text-white rounded-lg hover:from-blue-700 hover:to-orange-600 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 transition-all">
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Shield className="h-4 w-4" />}
              <span>{loading ? 'Updating...' : 'Update Password'}</span>
            </button>
          </div>
        </form>
      </div>

      {/* Danger Zone */}
      <div className="bg-white rounded-xl border border-red-200 p-6">
        <h3 className="text-lg font-medium text-red-700 mb-2 flex items-center gap-2">
          <Trash2 className="h-5 w-5" />
          Danger Zone
        </h3>
        <p className="text-sm text-gray-600 mb-4">
          Deactivating your account will disable access to Karya-AI. Your data will be preserved and you can reactivate by contacting support.
        </p>

        {!showDeactivateConfirm ? (
          <button onClick={() => setShowDeactivateConfirm(true)}
            className="px-4 py-2 border border-red-300 text-red-600 rounded-lg text-sm font-medium hover:bg-red-50 transition-colors">
            Deactivate Account
          </button>
        ) : (
          <div className="space-y-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm font-medium text-red-800">Enter your password to confirm deactivation:</p>
            <div className="relative">
              <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <input type="password" value={deactivatePassword} onChange={e => setDeactivatePassword(e.target.value)}
                className="pl-10 w-full border border-red-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500"
                placeholder="Your current password" />
            </div>
            <div className="flex gap-3">
              <button onClick={handleDeactivate} disabled={loading}
                className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 disabled:opacity-50">
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                Confirm Deactivation
              </button>
              <button onClick={() => { setShowDeactivateConfirm(false); setDeactivatePassword(''); }}
                className="px-4 py-2 border border-gray-300 text-gray-600 rounded-lg text-sm font-medium hover:bg-gray-50">
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  const renderSection = () => {
    switch (activeSection) {
      case 'profile': return renderEditProfile();
      case 'account': return renderAccountSettings();
      case 'upgrade': return <PlanSelection />;
      case 'billing':
        return <BillingDashboard />;
      default:
        return renderEditProfile();
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar sidebarCollapsed={sidebarCollapsed} setSidebarCollapsed={setSidebarCollapsed}
        activeItem={activeSidebarItem} setActiveItem={setActiveSidebarItem} />

      <div className="flex-1 flex flex-col">
        <TopNavbar />
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex gap-8">
              {/* Settings sidebar nav */}
              <div className="w-64 shrink-0">
                <nav className="bg-white rounded-xl border border-gray-200 p-4">
                  <ul className="space-y-2">
                    {sidebarItems.map((item) => {
                      const Icon = item.icon;
                      return (
                        <li key={item.id}>
                          <button onClick={() => handleSectionChange(item.id)}
                            className={`w-full flex items-center px-3 py-3 text-sm font-medium rounded-lg transition-colors ${
                              activeSection === item.id
                                ? 'bg-blue-50 text-blue-600 border border-blue-200'
                                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                            }`}>
                            <Icon className="h-4 w-4 mr-3 flex-shrink-0" />
                            <div className="text-left">
                              <div>{item.name}</div>
                              <div className="text-xs opacity-70 mt-0.5">{item.description}</div>
                            </div>
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                </nav>
              </div>

              {/* Main Content */}
              <div className="flex-1 min-w-0">
                {renderSection()}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function SettingsLoading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
    </div>
  );
}

export default function SettingsPage() {
  return (
    <Suspense fallback={<SettingsLoading />}>
      <SettingsContent />
    </Suspense>
  );
}
