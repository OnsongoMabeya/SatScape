import NodeCache from 'node-cache';
import { fetchFromN2YO } from '../utils/api.mjs';
import pLimit from 'p-limit';

// Cache configuration
const CACHE_CONFIG = {
  positions: { ttl: 120 }, // 2 minutes for positions
  satellites: { ttl: 300 }, // 5 minutes for satellite data
  tle: { ttl: 300 } // 5 minutes for TLE data
};

// Initialize caches
const caches = {
  positions: new NodeCache({ stdTTL: CACHE_CONFIG.positions.ttl }),
  satellites: new NodeCache({ stdTTL: CACHE_CONFIG.satellites.ttl }),
  tle: new NodeCache({ stdTTL: CACHE_CONFIG.tle.ttl })
};

// Rate limiting configuration
const RATE_LIMIT_CONFIG = {
  minInterval: 3000, // 3 seconds between requests
  maxConcurrent: 1 // Only 1 concurrent request
};

// Initialize rate limiter
const limit = pLimit(RATE_LIMIT_CONFIG.maxConcurrent);
let lastRequestTime = 0;

// Validate N2YO API response
const validateN2YOResponse = (response, requiredFields = []) => {
  if (!response) {
    throw new Error('Empty response from N2YO API');
  }

  for (const field of requiredFields) {
    if (!response[field]) {
      throw new Error(`Missing ${field} field in N2YO API response`);
    }

    // Check if field should be an array
    if (['above', 'positions'].includes(field) && !Array.isArray(response[field])) {
      throw new Error(`Invalid ${field} field in N2YO API response: expected array`);
    }
  }
};

const getSatellitesAbove = async (lat, lng, alt = 0, cat = 0) => {
  // Parse and validate numeric parameters
  const parsedLat = parseFloat(lat);
  const parsedLng = parseFloat(lng);
  const parsedAlt = parseFloat(alt);
  const parsedCat = parseInt(cat, 10) || 0;

  // Validate coordinates
  if (isNaN(parsedLat) || parsedLat < -90 || parsedLat > 90) {
    throw new Error('Invalid latitude value');
  }
  if (isNaN(parsedLng) || parsedLng < -180 || parsedLng > 180) {
    throw new Error('Invalid longitude value');
  }
  if (isNaN(parsedAlt) || parsedAlt < 0) {
    throw new Error('Invalid altitude value');
  }

  const cacheKey = `above-${parsedLat}-${parsedLng}-${parsedAlt}-${parsedCat}`;
  const cached = caches.satellites.get(cacheKey);
  
  if (cached) return cached;

  const throttleRequest = async () => {
    const now = Date.now();
    const timeSinceLastRequest = now - lastRequestTime;
    
    if (timeSinceLastRequest < RATE_LIMIT_CONFIG.minInterval) {
      await new Promise(resolve => 
        setTimeout(resolve, RATE_LIMIT_CONFIG.minInterval - timeSinceLastRequest)
      );
    }
    lastRequestTime = now;
  };

  // Add request to queue with throttling
  const makeRequest = async () => {
    await throttleRequest();

    // N2YO API format: /above/{observer_lat}/{observer_lng}/{observer_alt}/{search_radius}/{category_id}
    // Search radius of 45 degrees (90 degrees total view)
    const searchRadius = 45; // Fixed search radius for better coverage
    // Category 0 means all satellites
    const endpoint = `/above/${parsedLat}/${parsedLng}/${parsedAlt}/${searchRadius}/${parsedCat}`;
    lastRequestTime = Date.now();

    try {
      const response = await fetchFromN2YO(endpoint);
      
      validateN2YOResponse(response, ['info', 'above']);

      // If a specific category was requested, filter the results
      const data = {
        info: response.info,
        above: cat ? response.above.filter(sat => sat.satid) : response.above
      };
      
      caches.satellites.set(cacheKey, data);
      return data;
    } catch (error) {
      if (error.message.includes('exceeded the number of transactions')) {
        // Wait and retry once if rate limited
        await new Promise(resolve => setTimeout(resolve, 2000));
        return makeRequest();
      }
      throw new Error(`Failed to fetch satellites above: ${error.message}`);
    }
  };

  return limit(makeRequest);
};

const getSatellitePositions = async (satId, lat, lng, alt = 0, seconds = 2) => {
  const cacheKey = `positions-${satId}-${lat}-${lng}-${alt}-${seconds}`;
  const cached = caches.positions.get(cacheKey);
  if (cached) return cached;

  const throttleRequest = async () => {
    const now = Date.now();
    const timeSinceLastRequest = now - lastRequestTime;
    
    if (timeSinceLastRequest < RATE_LIMIT_CONFIG.minInterval) {
      await new Promise(resolve => 
        setTimeout(resolve, RATE_LIMIT_CONFIG.minInterval - timeSinceLastRequest)
      );
    }
    lastRequestTime = now;
  };

  // Add request to queue with throttling
  const makeRequest = async () => {
    await throttleRequest();

    const endpoint = `/positions/${satId}/${lat}/${lng}/${alt}/${seconds}`;
    lastRequestTime = Date.now();

    try {
      const response = await fetchFromN2YO(endpoint);
      
      validateN2YOResponse(response, ['info', 'positions']);
      
      const data = {
        info: response.info,
        positions: response.positions
      };
      
      caches.positions.set(cacheKey, data);
      return data;
    } catch (error) {
      if (error.message.includes('exceeded the number of transactions')) {
        // Wait and retry once if rate limited
        await new Promise(resolve => setTimeout(resolve, 2000));
        return makeRequest();
      }
      throw new Error(`Failed to fetch satellite positions: ${error.message}`);
    }
  };

  return limit(makeRequest);
};

const getSatelliteTLE = async (satId) => {
  const cacheKey = `tle-${satId}`;
  const cached = satelliteCache.get(cacheKey);
  
  if (cached) return cached;

  const throttleRequest = async () => {
    const now = Date.now();
    const timeSinceLastRequest = now - lastRequestTime;
    
    if (timeSinceLastRequest < RATE_LIMIT_CONFIG.minInterval) {
      await new Promise(resolve => 
        setTimeout(resolve, RATE_LIMIT_CONFIG.minInterval - timeSinceLastRequest)
      );
    }
    lastRequestTime = now;
  };

  // Add request to queue with throttling
  const makeRequest = async () => {
    await throttleRequest();

    const endpoint = `/tle/${satId}`;
    lastRequestTime = Date.now();

    try {
      const response = await fetchFromN2YO(endpoint);
      
      validateN2YOResponse(response, ['info', 'tle']);

      const data = response;
      
      caches.tle.set(cacheKey, data);
      return data;
    } catch (error) {
      if (error.message.includes('exceeded the number of transactions')) {
        // Wait and retry once if rate limited
        await new Promise(resolve => setTimeout(resolve, 2000));
        return makeRequest();
      }
      throw new Error(`Failed to fetch satellite TLE: ${error.message}`);
    }
  };

  return limit(makeRequest);
};

export {
  getSatellitesAbove,
  getSatellitePositions,
  getSatelliteTLE
};
