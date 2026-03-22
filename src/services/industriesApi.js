// Industries API Service
// Fetches industry data from PostgreSQL via backend API

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

/**
 * Fetch all available industries
 */
export const getIndustries = async () => {
  try {
    const response = await fetch(`${API_URL}/industries`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to fetch industries');
    }

    return data;
  } catch (error) {
    console.error('Error fetching industries:', error);
    throw error;
  }
};

export default {
  getIndustries,
  
};