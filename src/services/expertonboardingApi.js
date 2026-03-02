// services/expertOnboardingApi.js
// API service for expert onboarding

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

// Get auth token from localStorage
const getToken = () => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('token');
  }
  return null;
};

// Get auth header
const getAuthHeader = () => {
  const token = getToken();
  return token ? { 'Authorization': `Bearer ${token}` } : {};
};

// Generic API call function with better error handling
const apiCall = async (endpoint, method = 'GET', body = null) => {
  const config = {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeader()
    }
  };
  
  if (body) {
    config.body = JSON.stringify(body);
  }
  
  try {
    const response = await fetch(`${API_URL}${endpoint}`, config);
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || `Request failed with status ${response.status}`);
    }
    
    return data;
  } catch (error) {
    if (error.message === 'Failed to fetch') {
      throw new Error('Unable to connect to server. Please check your connection.');
    }
    throw error;
  }
};

// ============================================
// EXPERT ONBOARDING API FUNCTIONS
// ============================================

/**
 * Get current expert onboarding status and data
 */
export const getExpertOnboardingStatus = async () => {
  return apiCall('/expert-onboarding/expert/status');
};

/**
 * Step 1: Update profile setup
 * @param {Object} data - Profile data
 * @param {string} [data.avatar] - Base64 encoded image
 * @param {string} data.fullName - Full name
 * @param {string} data.headline - Professional title/headline
 * @param {string} data.bio - About/bio text
 * @param {string} [data.communicationStyle] - Communication style
 * @param {string} [data.yearsOfExperience] - Work experience
 * @param {string} [data.location] - Location string
 */
export const updateProfileSetup = async (data) => {
  return apiCall('/expert-onboarding/expert/profile-setup', 'PUT', data);
};

/**
 * Step 2: Update skills
 * @param {Array<string>} skills - Array of skill names
 */
export const updateSkills = async (skills) => {
  return apiCall('/expert-onboarding/expert/skills', 'PUT', { skills });
};

/**
 * Step 3: Update services and pricing
 * @param {Array<Object>} services - Array of service objects
 * @param {string} services[].name - Service name
 * @param {string} [services[].description] - Service description
 * @param {string} [services[].pricingType] - 'hourly', 'project', 'monthly', 'custom'
 * @param {string} [services[].pricing] - Price string
 * @param {string} [services[].duration] - Duration for project-based services
 */
export const updateServices = async (services) => {
  return apiCall('/expert-onboarding/expert/services', 'PUT', { services });
};

/**
 * Step 4: Update portfolio and case studies
 * @param {Object} data - Portfolio data
 * @param {Array<Object>} [data.caseStudies] - Array of case study objects
 * @param {Object} [data.links] - Social/portfolio links
 */
export const updatePortfolio = async (data) => {
  return apiCall('/expert-onboarding/expert/portfolio', 'PUT', data);
};

/**
 * Skip a specific onboarding step
 * @param {number} step - Step number (1-4)
 */
export const skipStep = async (step) => {
  return apiCall(`/expert-onboarding/expert/skip/${step}`, 'POST');
};

/**
 * Save all expert onboarding data at once (batch save)
 * @param {Object} data - All onboarding data
 */
export const saveAllExpertOnboardingData = async (data) => {
  return apiCall('/expert-onboarding/expert/save-all', 'PUT', data);
};

// Default export with all functions
const expertOnboardingApi = {
  getExpertOnboardingStatus,
  updateProfileSetup,
  updateSkills,
  updateServices,
  updatePortfolio,
  skipStep,
  saveAllExpertOnboardingData
};

export default expertOnboardingApi;