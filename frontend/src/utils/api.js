const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

export const getSatellitesAbove = async (lat, lng, alt = 0, cat = 0) => {
  try {
    const params = new URLSearchParams({ lat, lng, alt, cat });
    const response = await fetch(`${API_BASE_URL}/satellites/above?${params}`);
    if (!response.ok) throw new Error('Failed to fetch satellites');
    return await response.json();
  } catch (error) {
    throw error;
  }
};

export const getSatellitePositions = async (satId, lat, lng, alt = 0, seconds = 2) => {
  try {
    const params = new URLSearchParams({ satId, lat, lng, alt, seconds });
    const response = await fetch(`${API_BASE_URL}/satellites/positions?${params}`);
    if (!response.ok) throw new Error('Failed to fetch satellite positions');
    return await response.json();
  } catch (error) {
    throw error;
  }
};

export const getSatelliteTLE = async (satId) => {
  try {
    const params = new URLSearchParams({ satId });
    const response = await fetch(`${API_BASE_URL}/satellites/tle?${params}`);
    if (!response.ok) throw new Error('Failed to fetch TLE data');
    return await response.json();
  } catch (error) {
    throw error;
  }
};
