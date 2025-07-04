import NodeCache from 'node-cache';
import { fetchFromN2YO } from '../utils/api.mjs';
import pLimit from 'p-limit';

// Cache with TTL of 2 minutes for positions and 5 minutes for other data
const positionsCache = new NodeCache({ stdTTL: 120 }); // Increased from 30s to 120s
const satelliteCache = new NodeCache({ stdTTL: 300 });

// Limit to 30 requests per minute (N2YO's limit)
const limit = pLimit(1); // Only 1 concurrent request
const requestQueue = [];
let lastRequestTime = 0;
const MIN_REQUEST_INTERVAL = 3000; // 3 seconds between requests to avoid rate limits

const TLE_CACHE_TTL = 300; // 5 minutes for TLE data

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
  const cached = satelliteCache.get(cacheKey);
  
  if (cached) return cached;

  // Add request to queue with throttling
  const makeRequest = async () => {
    const now = Date.now();
    const timeSinceLastRequest = now - lastRequestTime;
    
    if (timeSinceLastRequest < MIN_REQUEST_INTERVAL) {
      await new Promise(resolve => setTimeout(resolve, MIN_REQUEST_INTERVAL - timeSinceLastRequest));
    }

    // N2YO API format: /above/{observer_lat}/{observer_lng}/{observer_alt}/{search_radius}/{category_id}
    // Search radius of 45 degrees (90 degrees total view)
    const searchRadius = 45; // Fixed search radius for better coverage
    // Category 0 means all satellites
    const endpoint = `/above/${parsedLat}/${parsedLng}/${parsedAlt}/${searchRadius}/${parsedCat}`;
    lastRequestTime = Date.now();

    try {
      const response = await fetchFromN2YO(endpoint);
      
      // Ensure we have valid data
      if (!response) {
        throw new Error('Empty response from N2YO API');
      }
      
      // N2YO API returns info and above fields
      if (!response.info) {
        console.error('Missing info in response:', response);
        throw new Error('Missing info field in N2YO API response');
      }
      
      if (!response.above || !Array.isArray(response.above)) {
        console.error('Missing or invalid above field:', response);
        throw new Error('Missing or invalid above field in N2YO API response');
      }

      // If a specific category was requested, filter the results
      const data = {
        info: response.info,
        above: cat ? response.above.filter(sat => sat.satid) : response.above
      };
      
      satelliteCache.set(cacheKey, data);
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
  const cached = positionsCache.get(cacheKey);
  
  if (cached) return cached;

  // Add request to queue with throttling
  const makeRequest = async () => {
    const now = Date.now();
    const timeSinceLastRequest = now - lastRequestTime;
    
    if (timeSinceLastRequest < MIN_REQUEST_INTERVAL) {
      await new Promise(resolve => setTimeout(resolve, MIN_REQUEST_INTERVAL - timeSinceLastRequest));
    }

    const endpoint = `/positions/${satId}/${lat}/${lng}/${alt}/${seconds}`;
    lastRequestTime = Date.now();

    try {
      const response = await fetchFromN2YO(endpoint);
      
      // Ensure we have valid data
      if (!response) {
        throw new Error('Empty response from N2YO API');
      }
      
      // N2YO API returns info and positions fields
      if (!response.info) {
        console.error('Missing info in positions response:', response);
        throw new Error('Missing info field in N2YO API response');
      }
      
      if (!response.positions || !Array.isArray(response.positions)) {
        console.error('Missing or invalid positions field:', response);
        throw new Error('Missing or invalid positions field in N2YO API response');
      }
      
      const data = {
        info: response.info,
        positions: response.positions
      };
      
      positionsCache.set(cacheKey, data);
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

  // Add request to queue with throttling
  const makeRequest = async () => {
    const now = Date.now();
    const timeSinceLastRequest = now - lastRequestTime;
    
    if (timeSinceLastRequest < MIN_REQUEST_INTERVAL) {
      await new Promise(resolve => setTimeout(resolve, MIN_REQUEST_INTERVAL - timeSinceLastRequest));
    }

    const endpoint = `/tle/${satId}`;
    lastRequestTime = Date.now();

    try {
      const data = await fetchFromN2YO(endpoint);
      
      if (!data || !data.tle) {
        throw new Error('Failed to fetch satellite TLE');
      }
      
      satelliteCache.set(cacheKey, data, TLE_CACHE_TTL);
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
