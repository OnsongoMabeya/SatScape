'use client';

import { useEffect } from 'react';
import dynamic from 'next/dynamic';
import { Box, CircularProgress } from '@mui/material';
import useStore from '@/store/useStore';
import { getSatellitesAbove } from '@/utils/api';
import LocationInput from '@/components/LocationInput';
import SatelliteSearch from '@/components/SatelliteSearch';
import SatelliteInfo from '@/components/SatelliteInfo';
import ErrorNotification from '@/components/ErrorNotification';

// Dynamically import Globe component to avoid SSR issues with Cesium
const Globe = dynamic(() => import('@/components/Globe'), {
  ssr: false,
  loading: () => (
    <Box sx={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      height: '100vh' 
    }}>
      <CircularProgress />
    </Box>
  ),
});

const UPDATE_INTERVAL = 10000; // Update every 10 seconds

export default function Home() {
  const { 
    userLocation, 
    setSatellitesAbove, 
    setError,
    setIsLoading,
  } = useStore();

  useEffect(() => {
    let intervalId;

    const fetchSatellites = async () => {
      if (!userLocation) return;

      try {
        setIsLoading(true);
        const data = await getSatellitesAbove(
          userLocation.latitude,
          userLocation.longitude
        );
        setSatellitesAbove(data.above || []);
      } catch (error) {
        setError(error.message);
      } finally {
        setIsLoading(false);
      }
    };

    if (userLocation) {
      fetchSatellites();
      intervalId = setInterval(fetchSatellites, UPDATE_INTERVAL);
    }

    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [userLocation]);

  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <main className="flex flex-col gap-[32px] row-start-2 items-center sm:items-start" style={{ height: '100vh', width: '100vw', position: 'relative' }}>
        <Globe />
        <LocationInput />
        <SatelliteSearch />
        <SatelliteInfo />
        <ErrorNotification />
      </main>
      <footer className="row-start-3 flex gap-[24px] flex-wrap items-center justify-center">
        <a
          className="flex items-center gap-2 hover:underline hover:underline-offset-4"
          href="https://nextjs.org/learn?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Image
            aria-hidden
            src="/file.svg"
            alt="File icon"
            width={16}
            height={16}
          />
          Learn
        </a>
        <a
          className="flex items-center gap-2 hover:underline hover:underline-offset-4"
          href="https://vercel.com/templates?framework=next.js&utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Image
            aria-hidden
            src="/window.svg"
            alt="Window icon"
            width={16}
            height={16}
          />
          Examples
        </a>
        <a
          className="flex items-center gap-2 hover:underline hover:underline-offset-4"
          href="https://nextjs.org?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Image
            aria-hidden
            src="/globe.svg"
            alt="Globe icon"
            width={16}
            height={16}
          />
          Go to nextjs.org →
        </a>
      </footer>
    </div>
  );
}
