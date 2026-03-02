const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

// Get auth header
const getAuthHeader = () => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  return token ? { 'Authorization': `Bearer ${token}` } : {};
};

// Generic API call function
const apiCall = async (endpoint, method = 'GET', body = null) => {
  const config = {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeader()
    },
    credentials: 'include'
  };

  if (body) {
    config.body = JSON.stringify(body);
  }

  const response = await fetch(`${API_URL}${endpoint}`, config);
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'API call failed');
  }

  return data;
};

// ============================================
// ONBOARDING API FUNCTIONS
// ============================================

export const getOnboardingStatus = async () => {
  return apiCall('/onboarding/business/status');
};

export const updateProfilePhoto = async (avatar) => {
  return apiCall('/onboarding/business/profile-setup', 'PUT', { avatar });
};

export const updatePlatformUsage = async (platformUsageType) => {
  return apiCall('/onboarding/business/platform-usage', 'PUT', { platformUsageType });
};

export const updateCompanyDetails = async (data) => {
  return apiCall('/onboarding/business/company-details', 'PUT', data);
};

export const updateBrandLogo = async (logo) => {
  return apiCall('/onboarding/business/brand-setup', 'PUT', { logo });
};

export const updateICPs = async (icps) => {
  return apiCall('/onboarding/business/icp-definition', 'PUT', { icps });
};

export const addICP = async (icp) => {
  return apiCall('/onboarding/business/icp', 'POST', icp);
};

export const updateMarketingActivities = async (data) => {
  return apiCall('/onboarding/business/marketing-activities', 'PUT', data);
};

export const updateQuickWins = async (quickWins) => {
  return apiCall('/onboarding/business/quick-wins', 'PUT', { quickWins });
};

export const skipStep = async (step) => {
  return apiCall(`/onboarding/business/skip/${step}`, 'POST');
};

export const saveAllOnboardingData = async (data) => {
  return apiCall('/onboarding/business/save-all', 'PUT', data);
};

export default {
  getOnboardingStatus,
  updateProfilePhoto,
  updatePlatformUsage,
  updateCompanyDetails,
  updateBrandLogo,
  updateICPs,
  addICP,
  updateMarketingActivities,
  updateQuickWins,
  skipStep,
  saveAllOnboardingData
};
