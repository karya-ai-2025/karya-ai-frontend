// services/marketplaceApi.js
// API service for expert marketplace (public routes)

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

// Generic API call function
const apiCall = async (endpoint, options = {}) => {
  const config = {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json'
    },
    ...options
  };

  console.log(`[Marketplace API] GET ${API_URL}${endpoint}`);

  try {
    const response = await fetch(`${API_URL}${endpoint}`, config);
    const data = await response.json();

    console.log(`[Marketplace API] Response:`, data);

    if (!response.ok) {
      throw new Error(data.message || `Request failed with status ${response.status}`);
    }

    return data;
  } catch (error) {
    console.error(`[Marketplace API] Error:`, error);
    if (error.message === 'Failed to fetch') {
      throw new Error('Unable to connect to server. Please check your connection.');
    }
    throw error;
  }
};

// Build query string from filters object
const buildQueryString = (params) => {
  const query = new URLSearchParams();
  
  Object.entries(params).forEach(([key, value]) => {
    if (value !== null && value !== undefined && value !== '') {
      if (Array.isArray(value)) {
        if (value.length > 0) {
          query.append(key, value.join(','));
        }
      } else {
        query.append(key, value);
      }
    }
  });
  
  const queryString = query.toString();
  return queryString ? `?${queryString}` : '';
};

// ============================================
// MARKETPLACE API FUNCTIONS
// ============================================

/**
 * Get all public experts with filters and pagination
 * @param {Object} options - Query options
 * @param {number} options.page - Page number (default: 1)
 * @param {number} options.limit - Items per page (default: 12)
 * @param {string} options.sortBy - Sort field (match, rating, projects, price-low, price-high, availability)
 * @param {string} options.search - Search query
 * @param {string[]} options.expertise - Expertise filter array
 * @param {string[]} options.industries - Industries filter array
 * @param {string[]} options.tools - Tools filter array
 * @param {string[]} options.availability - Availability filter array
 * @param {number} options.minPrice - Minimum hourly rate
 * @param {number} options.maxPrice - Maximum hourly rate
 * @param {number} options.minRating - Minimum rating
 * @param {string} options.projectRange - Project range (e.g., "1-5", "5-20", "20-50", "50+")
 * @param {string[]} options.timezones - Timezone filter array
 */
export const getExperts = async (options = {}) => {
  const queryString = buildQueryString(options);
  return apiCall(`/marketplace/experts${queryString}`);
};

/**
 * Get single expert profile by ID
 * @param {string} id - Expert profile ID
 */
export const getExpertById = async (id) => {
  return apiCall(`/marketplace/experts/${id}`);
};

/**
 * Get featured expert for sidebar
 */
export const getFeaturedExpert = async () => {
  return apiCall('/marketplace/experts/featured');
};

/**
 * Get available filter options
 */
export const getFilterOptions = async () => {
  return apiCall('/marketplace/filters');
};

/**
 * Search experts (autocomplete)
 * @param {string} query - Search query
 * @param {number} limit - Max results (default: 5)
 */
export const searchExperts = async (query, limit = 5) => {
  return apiCall(`/marketplace/search?q=${encodeURIComponent(query)}&limit=${limit}`);
};

// Default export
const marketplaceApi = {
  getExperts,
  getExpertById,
  getFeaturedExpert,
  getFilterOptions,
  searchExperts
};

export default marketplaceApi;