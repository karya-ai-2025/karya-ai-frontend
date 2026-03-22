const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

// Get all plans
export const getPlans = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/plans`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch plans');
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching plans:', error);
    throw error;
  }
};

// Get packages by plan ID
export const getPackagesByPlan = async (planId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/plans/${planId}/packages`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch plan packages');
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching plan packages:', error);
    throw error;
  }
};

// Get all plans with their packages
export const getPlansWithPackages = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/plans-with-packages`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch plans with packages');
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching plans with packages:', error);
    throw error;
  }
};

// Get current user's plan (requires authentication)
export const getCurrentUserPlan = async (token) => {
  try {
    const response = await fetch(`${API_BASE_URL}/user/current-plan`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch user plan');
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching user plan:', error);
    throw error;
  }
};

// Check if user has active plan access (requires authentication)
export const checkUserPlanAccess = async (token) => {
  try {
    const response = await fetch(`${API_BASE_URL}/user/check-plan-access`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to check plan access');
    }

    return await response.json();
  } catch (error) {
    console.error('Error checking plan access:', error);
    throw error;
  }
};

// Upgrade user plan (requires authentication)
export const upgradePlan = async (planId, planPackageId, token) => {
  try {
    const response = await fetch(`${API_BASE_URL}/user/upgrade-plan`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({
        planId,
        planPackageId
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to upgrade plan');
    }

    return await response.json();
  } catch (error) {
    console.error('Error upgrading plan:', error);
    throw error;
  }
};