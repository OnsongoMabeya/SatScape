const NodeCache = require('node-cache');
const { fetchFromN2YO } = require('../utils/api');

// Cache configuration
const cache = new NodeCache({
  stdTTL: 5, // 5 seconds for regular data
  checkperiod: 10
});

const TLE_CACHE_TTL = 300; // 5 minutes for TLE data

const getSatellitesAbove = async (lat, lng, alt = 0, cat = 0) => {
  const cacheKey = `above-${lat}-${lng}-${alt}-${cat}`;
  const cached = cache.get(cacheKey);
  
  if (cached) return cached;

  // N2YO API expects category to be 0 for all satellites
  const data = await fetchFromN2YO(`/above/${lat}/${lng}/${alt}/0/1`);
  if (!data || !data.above) {
    throw new Error('Failed to fetch satellite data');
  }
  cache.set(cacheKey, data);
  return data;
};

const getSatellitePositions = async (satId, lat = 0, lng = 0, alt = 0, seconds = 2) => {
  const cacheKey = `positions-${satId}-${lat}-${lng}-${alt}-${seconds}`;
  const cached = cache.get(cacheKey);
  
  if (cached) return cached;

  const data = await fetchFromN2YO(`/positions/${satId}/${lat}/${lng}/${alt}/${seconds}`);
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
