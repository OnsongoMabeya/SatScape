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
  setError: (error) => set({ error }),
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

      console.log('Making request to /api/satellites/above');
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/satellites/above?` +
        new URLSearchParams({
          lat: userLocation.lat,
          lng: userLocation.lng,
          alt: 0
        })
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
      console.error('Failed to fetch satellites:', error);
      set({ error: error.message });
    }
  },

  fetchSatellitePositions: async (satId) => {
    try {
      const { userLocation } = useStore.getState();
      
      if (!userLocation || !satId) {
        console.warn('Missing required data for position fetch:', { userLocation, satId });
        return;
      }

      console.log('Fetching position for satellite:', satId);
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/satellites/positions?` +
        new URLSearchParams({
          satId,
          lat: userLocation.lat,
          lng: userLocation.lng,
          alt: 0,
          seconds: 2
        })
      );

      if (!response.ok) {
        if (response.status === 429) { // Rate limit error
          console.log('Rate limited, retrying after delay...');
          await new Promise(resolve => setTimeout(resolve, 3000));
          return fetchSatellitePositions(satId);
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (!data || !data.info || !data.positions || !Array.isArray(data.positions)) {
        console.error('Invalid positions response format:', data);
        throw new Error('Invalid positions response format from backend');
      }

      if (data.positions.length > 0) {
        useStore.getState().setSatellitePosition(satId, data.positions[0]);
      } else {
        console.warn('No position data available for satellite:', satId);
      }
    } catch (error) {
      console.error('Failed to fetch satellite position:', error);
      useStore.getState().setError(error.message);
    }
  },

  fetchPositionsInBatches: async (satellites, batchSize = 5) => {
    const batches = [];
    for (let i = 0; i < satellites.length; i += batchSize) {
      batches.push(satellites.slice(i, i + batchSize));
    }

    for (const batch of batches) {
      await Promise.all(batch.map(sat => fetchSatellitePositions(sat.satid)));
      // Add delay between batches
      if (batches.indexOf(batch) < batches.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 3000));
      }
      set({ error: error.message });
      return null;
    }
  },

  fetchSatelliteTLE: async (satId) => {
    try {
      if (!satId) return;

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/satellites/tle?` +
        new URLSearchParams({ satId })
      );

      if (!response.ok) {
        throw new Error('Failed to fetch satellite TLE');
      }

      const data = await response.json();
      return data.tle;
    } catch (error) {
      console.error('Failed to fetch satellite TLE:', error);
      set({ error: error.message });
      return null;
    }
  }
}));

export default useStore;
