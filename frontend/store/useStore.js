'use client';

import { create } from 'zustand';

const useStore = create((set) => ({
  // User location state
  userLocation: null,
  setUserLocation: (location) => set({ userLocation: location }),

  // Satellites state
  satellites: [],
  selectedSatellite: null,
  setSelectedSatellite: (satellite) => set({ selectedSatellite: satellite }),

  // Error handling
  error: null,
  setError: (error) => set({ error }),
  clearError: () => set({ error: null }),

  // API calls
  fetchSatellitesAbove: async () => {
    try {
      const { userLocation } = useStore.getState();
      if (!userLocation) return;

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
      set({ satellites: data.above });
    } catch (error) {
      set({ error: error.message });
    }
  },

  fetchSatellitePositions: async (satId) => {
    try {
      const { userLocation } = useStore.getState();
      if (!userLocation || !satId) return;

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
