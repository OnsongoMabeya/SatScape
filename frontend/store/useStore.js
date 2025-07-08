'use client';

import { create } from 'zustand';

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
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/satellites/above?${params}`.replace('/api/', '/')
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

    const fetchWithRetry = async () => {
      try {
        const { userLocation } = useStore.getState();
        
        if (!userLocation || !satId) {
          console.warn('Missing required data for position fetch:', { userLocation, satId });
          return;
        }

        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/satellites/positions?` +
          new URLSearchParams({
            satId,
            lat: userLocation.lat,
            lng: userLocation.lng,
            alt: 0,
            seconds: 2
          })
        );

        if (!response.ok) {
          if (response.status === 429 && retryCount < maxRetries) { // Rate limit error
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
          useStore.getState().setSatellitePosition(satId, data.positions[0]);
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

    try {
      await fetchWithRetry();
    } catch (error) {
      console.error(`Failed to fetch satellite ${satId} position after ${maxRetries} retries:`, error);
      // Don't set global error for individual satellite failures
      // useStore.getState().setError(error.message);
    }
  },

  fetchPositionsInBatches: async (satellites, batchSize = 3) => {
    try {
      const batches = [];
      // Process only visible satellites first
      const visibleSats = satellites.slice(0, 50); // Limit to 50 satellites for performance
      
      for (let i = 0; i < visibleSats.length; i += batchSize) {
        batches.push(visibleSats.slice(i, i + batchSize));
      }

      console.log(`Processing ${visibleSats.length} satellites in ${batches.length} batches`);

      for (let i = 0; i < batches.length; i++) {
        const batch = batches[i];
        try {
          // Process each satellite in the batch sequentially to avoid overwhelming the server
          for (const sat of batch) {
            await useStore.getState().fetchSatellitePositions(sat.satid);
            // Small delay between individual requests
            await new Promise(resolve => setTimeout(resolve, 500));
          }
          
          // Larger delay between batches
          if (i < batches.length - 1) {
            console.log(`Completed batch ${i + 1}/${batches.length}, waiting before next batch...`);
            await new Promise(resolve => setTimeout(resolve, 2000));
          }
        } catch (batchError) {
          console.error(`Error processing batch ${i + 1}:`, batchError);
          // Continue with next batch even if current one fails
          continue;
        }
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
