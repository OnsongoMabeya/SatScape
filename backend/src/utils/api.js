require('dotenv').config();
const axios = require('axios');
const logger = require('./logger');

const BASE_URL = 'https://api.n2yo.com/rest/v1/satellite';
const API_KEY = process.env.N2YO_API_KEY;

const sanitizeEndpoint = (endpoint) => {
  // Remove any leading/trailing slashes
  endpoint = endpoint.replace(/^\/+|\/+$/g, '');
  
  // Split the endpoint into parts
  const parts = endpoint.split('/');
  
  // For /above endpoint with category, ensure proper format
  if (parts[0] === 'above') {
    const [cmd, lat, lng, alt, cat, minCount] = parts;
    // If category is 0 or missing, use 0/minCount format
    if (!cat || cat === '0') {
      return `/${cmd}/${lat}/${lng}/${alt}/0/${minCount || 1}`;
    }
    // Otherwise use the category as provided
    return `/${cmd}/${lat}/${lng}/${alt}/${cat}/${minCount || 1}`;
  }
  
  // For other endpoints, just join with slashes
  return '/' + parts.join('/');
};

const fetchFromN2YO = async (endpoint) => {
  try {
    if (!API_KEY) {
      throw new Error('N2YO API key is not configured');
    }
    
    // Sanitize the endpoint before making the request
    const sanitizedEndpoint = sanitizeEndpoint(endpoint);
    const url = `${BASE_URL}${sanitizedEndpoint}?apiKey=${API_KEY}`;
    
    logger.info('Making N2YO API request:', { 
      timestamp: new Date().toISOString(),
      endpoint: sanitizedEndpoint
    });
    
    const response = await axios.get(url);
    
    if (response.status !== 200) {
      logger.error('N2YO API HTTP error:', {
        endpoint: sanitizedEndpoint,
        status: response.status,
        statusText: response.statusText,
        timestamp: new Date().toISOString()
      });
      throw new Error(`N2YO API HTTP error: ${response.statusText}`);
    }
    
    if (response.data.error) {
      logger.error('N2YO API response error:', {
        endpoint: sanitizedEndpoint,
        error: response.data.error,
        timestamp: new Date().toISOString()
      });
      throw new Error(`N2YO API error: ${response.data.error}`);
    }

    logger.info('N2YO API Response:', {
      endpoint: sanitizedEndpoint,
      status: response.status,
      timestamp: new Date().toISOString()
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
