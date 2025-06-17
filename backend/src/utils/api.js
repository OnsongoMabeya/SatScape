const axios = require('axios');
const logger = require('./logger');

const BASE_URL = process.env.N2YO_BASE_URL || 'https://api.n2yo.com/rest/v1/satellite';
const API_KEY = process.env.N2YO_API_KEY;

const fetchFromN2YO = async (endpoint) => {
  try {
    const url = `${BASE_URL}${endpoint}?apiKey=${API_KEY}`;
    const response = await axios.get(url);
    
    if (response.status !== 200) {
      throw new Error(`N2YO API error: ${response.statusText}`);
    }

    return response.data;
  } catch (error) {
    logger.error('Error fetching from N2YO:', {
      error: error.message,
      endpoint,
      status: error.response?.status
    });
    throw error;
  }
};

module.exports = {
  fetchFromN2YO
};
