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
    // Category 0 means all satellites
    const searchRadius = 45;
    const endpoint = `/above/${parsedLat}/${parsedLng}/${parsedAlt}/${searchRadius}/${parsedCat}`;
    lastRequestTime = Date.now();

    try {
      const data = await fetchFromN2YO(endpoint);
      
      if (!data || !data.above) {
        throw new Error('Failed to fetch satellite data');
      }

      // If a specific category was requested, filter the results
      if (cat) {
        data = {
          ...data,
          above: data.above.filter(sat => {
            // Here you would implement category filtering based on your needs
            // For now, we'll return all satellites since the API doesn't support filtering
            return true;
          })
        };
      }
      
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
      const data = await fetchFromN2YO(endpoint);
      
      if (!data || !data.positions) {
        throw new Error('Failed to fetch satellite positions');
      }
      
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
