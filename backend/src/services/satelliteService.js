const NodeCache = require('node-cache');
const { fetchFromN2YO } = require('../utils/api');

// Cache configuration
const cache = new NodeCache({
  stdTTL: 5, // 5 seconds for regular data
  checkperiod: 10
});

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
  const cached = cache.get(cacheKey);
  
  if (cached) return cached;

  // N2YO API format: /above/{observer_lat}/{observer_lng}/{observer_alt}/{search_radius}/{category_id}
  // Search radius of 45 degrees (90 degrees total view)
  // Category 0 means all satellites
  const searchRadius = 45;
  const endpoint = `/above/${parsedLat}/${parsedLng}/${parsedAlt}/${searchRadius}/${parsedCat}`;
  
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
    
    cache.set(cacheKey, data);
    return data;
  } catch (error) {
    // Add more context to the error
    throw new Error(`Failed to fetch satellites above: ${error.message}`);
  }
};

const getSatellitePositions = async (satId, lat = 0, lng = 0, alt = 0, seconds = 2) => {
  const cacheKey = `positions-${satId}-${lat}-${lng}-${alt}-${seconds}`;
  const cached = cache.get(cacheKey);
  
  if (cached) return cached;

  // Construct endpoint based on whether category is specified
  const endpoint = `/positions/${satId}/${lat}/${lng}/${alt}/${seconds}`;
  const data = await fetchFromN2YO(endpoint);
  cache.set(cacheKey, data);
  return data;
};

const getSatelliteTLE = async (satId) => {
  const cacheKey = `tle-${satId}`;
  const cached = cache.get(cacheKey);
  
  if (cached) return cached;

  const data = await fetchFromN2YO(`/tle/${satId}`);
  cache.set(cacheKey, data, TLE_CACHE_TTL);
  return data;
};

module.exports = {
  getSatellitesAbove,
  getSatellitePositions,
  getSatelliteTLE
};
