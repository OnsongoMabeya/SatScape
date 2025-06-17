const BASE_URL = process.env.N2YO_BASE_URL || 'https://api.n2yo.com/rest/v1/satellite';
const API_KEY = process.env.N2YO_API_KEY;

const fetchFromN2YO = async (endpoint) => {
  try {
    const response = await fetch(`${BASE_URL}${endpoint}/${API_KEY}`);
    
    if (!response.ok) {
      throw new Error(`N2YO API error: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching from N2YO:', error);
    throw error;
  }
};

module.exports = {
  fetchFromN2YO
};
