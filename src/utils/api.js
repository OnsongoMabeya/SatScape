const BASE_URL = process.env.N2YO_BASE_URL;
const API_KEY = process.env.N2YO_API_KEY;

export const getSatellitesAbove = async (lat, lng, alt = 0, cat = 0) => {
  try {
    const response = await fetch(
      `${BASE_URL}/above/${lat}/${lng}/${alt}/${cat}/${API_KEY}`
    );
    if (!response.ok) throw new Error('Failed to fetch satellites');
    return await response.json();
  } catch (error) {
    throw error;
  }
};

export const getSatellitePositions = async (satId, lat, lng, alt = 0, seconds = 2) => {
  try {
    const response = await fetch(
      `${BASE_URL}/positions/${satId}/${lat}/${lng}/${alt}/${seconds}/${API_KEY}`
    );
    if (!response.ok) throw new Error('Failed to fetch satellite positions');
    return await response.json();
  } catch (error) {
    throw error;
  }
};

export const getSatelliteTLE = async (satId) => {
  try {
    const response = await fetch(
      `${BASE_URL}/tle/${satId}/${API_KEY}`
    );
    if (!response.ok) throw new Error('Failed to fetch TLE data');
    return await response.json();
  } catch (error) {
    throw error;
  }
};
