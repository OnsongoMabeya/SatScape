import { create } from 'zustand';

const useStore = create((set) => ({
  // User location state
  userLocation: null,
  setUserLocation: (location) => set({ userLocation: location }),

  // Selected satellite state
  selectedSatellite: null,
  setSelectedSatellite: (satellite) => set({ selectedSatellite: satellite }),

  // Satellites above state
  satellitesAbove: [],
  setSatellitesAbove: (satellites) => set({ satellitesAbove: satellites }),

  // Search state
  searchQuery: '',
  setSearchQuery: (query) => set({ searchQuery: query }),

  // Loading states
  isLoading: false,
  setIsLoading: (loading) => set({ isLoading: loading }),

  // Error state
  error: null,
  setError: (error) => set({ error: error }),
}));

export default useStore;
