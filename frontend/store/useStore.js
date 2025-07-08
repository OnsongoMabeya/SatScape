'use client';

import { create } from 'zustand';

// Cache for satellite positions with timestamps
const positionCache = new Map();
const CACHE_DURATION = 2000; // 2 seconds cache duration
const DEBOUNCE_DELAY = 500; // 500ms debounce delay

// Debounce function
const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

const useStore = create((set) => ({
  // User location state
  userLocation: null,
  setUserLocation: (location) => {
    console.log('Setting user location:', location);
    set({ userLocation: location });
    // Fetch satellites when location is set
    useStore.getState().fetchSatellitesAbove();
  },

  // Satellites state
  satellites: [],
  satellitePositions: {},
  selectedSatellite: null,
  setSelectedSatellite: (satellite) => set({ selectedSatellite: satellite }),
  setSatellitePosition: (satId, position) => set(state => ({
    satellitePositions: {
      ...state.satellitePositions,
      [satId]: position
    }
  })),
  setSatellites: (satellites) => set({ satellites }),

  // Error handling
  error: null,
  setError: (error) => {
    // Handle different error types
    let errorMessage;
    if (error instanceof Error) {
      console.error('Application error:', {
        name: error.name,
        message: error.message,
        stack: error.stack
      });
      errorMessage = error.message;
    } else if (typeof error === 'object') {
      console.error('Application error:', JSON.stringify(error, null, 2));
      errorMessage = error.message || 'An unknown error occurred';
    } else {
      console.error('Application error:', error);
      errorMessage = String(error);
    }
    set({ error: errorMessage });
  },
  clearError: () => set({ error: null }),

  // API calls
  fetchSatellitesAbove: async () => {
    try {
      const { userLocation } = useStore.getState();
      console.log('Fetching satellites with user location:', userLocation);
      
      if (!userLocation) {
        console.warn('No user location available, cannot fetch satellites');
        return;
      }

      if (!process.env.NEXT_PUBLIC_API_URL) {
        console.error('API URL not found in environment variables');
        return;
      }

      console.log('Making request to /satellites/above');
      const params = new URLSearchParams({
        lat: userLocation.lat,
        lng: userLocation.lng,
        alt: 0
      });
      
      // Construct the API URL
      const baseUrl = process.env.NEXT_PUBLIC_API_URL.endsWith('/api')
        ? process.env.NEXT_PUBLIC_API_URL.slice(0, -4) // Remove trailing '/api'
        : process.env.NEXT_PUBLIC_API_URL;
      
      const response = await fetch(
        `${baseUrl}/satellites/above?${params}`
      );

      if (!response.ok) {
        const error = await response.json();
        console.error('Error fetching satellites:', error);
        return;
      }

      const data = await response.json();
      if (!data || !data.info || !data.above || !Array.isArray(data.above)) {
        console.error('Invalid response format:', data);
        throw new Error('Invalid response format from backend');
      }

      console.log('Received satellites:', data);
      useStore.getState().setSatellites(data.above);
      
      // Fetch positions in batches
      useStore.getState().fetchPositionsInBatches(data.above);
    } catch (error) {
      useStore.getState().setError(error);
    }
  },

  fetchSatellitePositions: async (satId) => {
    const maxRetries = 2;
    let retryCount = 0;

    // Check cache first
    const cached = positionCache.get(satId);
    const now = Date.now();
    if (cached && (now - cached.timestamp) < CACHE_DURATION) {
      useStore.getState().setSatellitePosition(satId, cached.position);
      return;
    }

    const fetchWithRetry = async () => {
      try {
        const { userLocation } = useStore.getState();
        
        if (!userLocation || !satId) {
          console.warn('Missing required data for position fetch:', { userLocation, satId });
          return;
        }

        // Construct API URL
        const baseUrl = process.env.NEXT_PUBLIC_API_URL.endsWith('/api')
          ? process.env.NEXT_PUBLIC_API_URL.slice(0, -4)
          : process.env.NEXT_PUBLIC_API_URL;

        const response = await fetch(
          `${baseUrl}/satellites/positions?` +
          new URLSearchParams({
            satId,
            lat: userLocation.lat,
            lng: userLocation.lng,
            alt: 0,
            seconds: 2
          })
        );

        if (!response.ok) {
          if (response.status === 429 && retryCount < maxRetries) {
            retryCount++;
            const delay = 3000 * retryCount; // Exponential backoff
            console.log(`Rate limited, retry ${retryCount} after ${delay}ms delay...`);
            await new Promise(resolve => setTimeout(resolve, delay));
            return fetchWithRetry();
          }
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        
        if (!data || !data.info || !data.positions || !Array.isArray(data.positions)) {
          throw new Error('Invalid positions response format from backend');
        }

        if (data.positions.length > 0) {
          const position = data.positions[0];
          // Update cache
          positionCache.set(satId, {
            position,
            timestamp: Date.now()
          });
          useStore.getState().setSatellitePosition(satId, position);
        } else {
          console.warn('No position data available for satellite:', satId);
        }
      } catch (error) {
        if (retryCount < maxRetries && 
            (error.message.includes('rate') || error.message.includes('429'))) {
          retryCount++;
          const delay = 3000 * retryCount;
          console.log(`Error fetching position, retry ${retryCount} after ${delay}ms delay...`);
          await new Promise(resolve => setTimeout(resolve, delay));
          return fetchWithRetry();
        }
        throw error;
      }
    };

    // Debounce the fetch call
    const debouncedFetch = debounce(async () => {
      try {
        await fetchWithRetry();
      } catch (error) {
        useStore.getState().setError(error);
      }
    }, DEBOUNCE_DELAY);

    debouncedFetch();
  },

  fetchPositionsInBatches: async (satellites, batchSize = 3) => {
    try {
      const batches = [];
      // Process only visible satellites first
      const visibleSats = satellites.slice(0, 50); // Limit to 50 satellites for performance
      
      for (let i = 0; i < visibleSats.length; i += batchSize) {
        batches.push(visibleSats.slice(i, i + batchSize));
      }

      // Process batches with delay between them
      for (const batch of batches) {
        await Promise.all(
          batch.map(satellite =>
            useStore.getState().fetchSatellitePositions(satellite.satid)
          )
        );
        // Increased delay between batches to reduce server load
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    } catch (error) {
      console.error('Error in batch processing:', error);
      useStore.getState().setError('Failed to fetch satellite positions: ' + error.message);
    }
  },

  fetchSatelliteTLE: async (satId) => {
    try {
      if (!satId) return;

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/satellites/tle?` +
        new URLSearchParams({ satId })
      );

      if (!response.ok) {
        throw new Error('Failed to fetch satellite TLE');
      }

      const data = await response.json();
      return data.tle;
    } catch (error) {
      useStore.getState().setError(error);
      return null;
    }
  }
}));

export default useStore;
