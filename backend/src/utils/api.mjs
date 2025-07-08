import dotenv from 'dotenv';
import axios from 'axios';
import logger from './logger.mjs';

dotenv.config({ path: new URL('../../.env', import.meta.url).pathname });

// API configuration
const N2YO_API_CONFIG = {
  baseUrl: process.env.N2YO_API_BASE || 'https://api.n2yo.com/rest/v1/satellite',
  apiKey: process.env.N2YO_API_KEY,
  defaultHeaders: {
    'Accept': 'application/json'
  }
};

// Debug environment variables
logger.info('API Configuration:', {
  baseUrl: N2YO_API_CONFIG.baseUrl,
  hasApiKey: !!N2YO_API_CONFIG.apiKey,
  envVars: {
    N2YO_API_KEY: process.env.N2YO_API_KEY ? 'Set' : 'Not Set',
    N2YO_API_BASE: process.env.N2YO_API_BASE ? 'Set' : 'Not Set'
  }
});

if (!N2YO_API_CONFIG.apiKey) {
  logger.error('N2YO_API_KEY is not configured in environment');
  throw new Error('N2YO_API_KEY is required');
}

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
    if (!N2YO_API_CONFIG.apiKey) {
      throw new Error('N2YO API key is not configured');
    }
    
    // Sanitize the endpoint before making the request
    const sanitizedEndpoint = sanitizeEndpoint(endpoint);
    
    // Construct URL with API key
    const url = `${N2YO_API_CONFIG.baseUrl}${sanitizedEndpoint}?apiKey=${N2YO_API_CONFIG.apiKey}`;
    
    logger.info('Making N2YO API request:', {
      endpoint: sanitizedEndpoint
    });
    
    const response = await fetch(url, {
      headers: N2YO_API_CONFIG.defaultHeaders
    });

    // Handle rate limiting
    if (response.status === 429) {
      logger.warn('Rate limited by N2YO API', { endpoint: sanitizedEndpoint });
      throw new Error('N2YO API rate limit exceeded. Please try again in a few seconds.');
    }

    if (!response.ok) {
      logger.error('N2YO API HTTP error:', {
        endpoint: sanitizedEndpoint,
        status: response.status
      });
      throw new Error(`N2YO API HTTP error: ${response.status}`);
    }

    const text = await response.text();
    logger.debug('N2YO API raw response:', { text });

    let data;
    try {
      data = JSON.parse(text);
    } catch (e) {
      logger.error('Failed to parse N2YO API response:', { text, error: e.message });
      throw new Error('Invalid JSON response from N2YO API');
    }
    
    logger.info('N2YO API Response:', {
      endpoint: sanitizedEndpoint,
      status: response.status,
      data: data
    });

    return data;
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
