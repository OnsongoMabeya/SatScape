const axios = require('axios');
const logger = require('./logger');

const BASE_URL = 'https://api.n2yo.com/rest/v1/satellite';
const API_KEY = process.env.N2YO_API_KEY;

const fetchFromN2YO = async (endpoint) => {
  try {
    if (!API_KEY) {
      throw new Error('N2YO API key is not configured');
    }
    
    const url = `${BASE_URL}${endpoint}?apiKey=${API_KEY}`;
    logger.info('Making N2YO API request:', { url });
    
    const response = await axios.get(url);
    
    if (response.status !== 200) {
      logger.error('N2YO API HTTP error:', {
        endpoint,
        status: response.status,
        statusText: response.statusText,
        url: response.config?.url
      });
      throw new Error(`N2YO API HTTP error: ${response.statusText}`);
    }
    
    if (response.data.error) {
      logger.error('N2YO API response error:', {
        endpoint,
        error: response.data.error,
        url: response.config?.url,
        data: response.data
      });
      throw new Error(`N2YO API error: ${response.data.error}`);
    }

    logger.info('N2YO API Response:', {
      endpoint,
      status: response.status,
      data: response.data
    });
    return response.data;
  } catch (error) {
    logger.error('Error fetching from N2YO:', {
      error: error.message,
      endpoint,
      status: error.response?.status,
      data: error.response?.data,
      url: error.config?.url
    });
    throw error;
  }
};

module.exports = {
  fetchFromN2YO
};
