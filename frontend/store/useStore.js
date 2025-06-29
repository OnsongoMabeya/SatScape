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

      console.log('Making request to /satellites/above');
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/satellites/above?` +
        new URLSearchParams({
          lat: userLocation.lat,
          lng: userLocation.lng,
          alt: 0
        })
      );

      if (!response.ok) {
        throw new Error('Failed to fetch satellites');
      }

      const data = await response.json();
      console.log('Received satellites:', data.above);
      set({ satellites: data.above || [] });
      
      // Fetch initial positions for all satellites
      data.above?.forEach(sat => {
        console.log('Fetching position for satellite:', sat.satid);
        useStore.getState().fetchSatellitePositions(sat.satid);
      });
    } catch (error) {
      set({ error: error.message });
    }
  },

  fetchSatellitePositions: async (satId) => {
    try {
      const { userLocation } = useStore.getState();
      if (!userLocation) {
        console.warn('No user location available');
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
        throw new Error('Failed to fetch satellite positions');
      }

      const data = await response.json();
      if (data.positions && data.positions.length > 0) {
        const position = data.positions[0];
        useStore.getState().setSatellitePosition(satId, position);
      }
      return data.positions;
    } catch (error) {
      set({ error: error.message });
      return null;
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
      set({ error: error.message });
      return null;
    }
  }
}));

export default useStore;
