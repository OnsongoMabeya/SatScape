import dotenv from 'dotenv';
import axios from 'axios';
import logger from './logger.mjs';

dotenv.config();

const BASE_URL = 'https://api.n2yo.com/rest/v1/satellite';
const API_KEY = process.env.N2YO_API_KEY;

const sanitizeEndpoint = (endpoint) => {
  // Remove any leading/trailing slashes and normalize
  endpoint = endpoint.replace(/^\/+|\/+$/g, '');
  
  // Check if endpoint uses query string format
  if (endpoint.includes('?')) {
    const [path, query] = endpoint.split('?');
    const params = new URLSearchParams(query);
    
    // Handle /above endpoint with query parameters
    if (path === 'above') {
      const lat = params.get('lat');
      const lng = params.get('lng');
      const alt = params.get('alt') || '0';
      const radius = params.get('radius') || '45';
      const cat = params.get('cat') || '0';
      
      // Validate required parameters
      if (!lat || !lng) {
        throw new Error('Missing required parameters lat/lng for /above endpoint');
      }
      
      // Ensure parameters are numeric
      if ([lat, lng, alt, radius, cat].some(param => isNaN(parseFloat(param)))) {
        throw new Error('All parameters for /above endpoint must be numeric');
      }
      
      return `/above/${lat}/${lng}/${alt}/${radius}/${cat}`;
    }
    
    return '/' + path;
  }
  
  // Handle path format
  const parts = endpoint.split('/');
  
  if (parts[0] === 'above') {
    const [cmd, lat, lng, alt = '0', radius = '45', cat = '0'] = parts;
    
    if (!lat || !lng) {
      throw new Error('Missing required parameters lat/lng for /above endpoint');
    }
    
    if ([lat, lng, alt, radius, cat].some(param => isNaN(parseFloat(param)))) {
      throw new Error('All parameters for /above endpoint must be numeric');
    }
    
    return `/${cmd}/${lat}/${lng}/${alt}/${radius}/${cat}`;
  }
  
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
    if (error.response) {
      const errorMessage = error.response.data.error;
      const isRateLimit = errorMessage && errorMessage.includes('exceeded the number of transactions');
      
      logger.error('N2YO API response error:', {
        endpoint,
        error: errorMessage,
        isRateLimit
      });

      if (isRateLimit) {
        // Return cached data if available when rate limited
        return { info: { warning: 'Using cached data due to rate limit' } };
      }

      throw new Error(`N2YO API error: ${errorMessage}`);
    } else if (error.request) {
      logger.error('N2YO API request error:', {
        endpoint,
        error: error.message
      });
      throw new Error(`N2YO API request error: ${error.message}`);
    } else {
      logger.error('N2YO API error:', {
        endpoint,
        error: error.message
      });
      throw new Error(`Error setting up request: ${error.message}`);
    }
  }
};

export { fetchFromN2YO };
