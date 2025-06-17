'use client';

import { useEffect } from 'react';
import { Box, Container, Paper, Grid } from '@mui/material';
import Globe from '../components/Globe';
import LocationInput from '../components/LocationInput';
import SatelliteSearch from '../components/SatelliteSearch';
import SatelliteInfo from '../components/SatelliteInfo';
import ErrorNotification from '../components/ErrorNotification';
import useStore from '../store/useStore';

export default function HomeContent() {
  const { 
    userLocation,
    selectedSatellite,
    fetchSatellitesAbove,
    error
  } = useStore();

  useEffect(() => {
    if (userLocation) {
      fetchSatellitesAbove();
    }
  }, [userLocation, fetchSatellitesAbove]);

  return (
    <Container maxWidth="xl" sx={{ height: '100vh', py: 2 }}>
      <Grid container spacing={2} sx={{ height: '100%' }}>
        <Grid xs={12} md={8}>
          <Paper 
            elevation={3} 
            sx={{ 
              height: '100%', 
              position: 'relative',
              overflow: 'hidden'
            }}
          >
            <Globe />
          </Paper>
        </Grid>
        <Grid xs={12} md={4}>
          <Grid container spacing={2}>
            <Grid xs={12}>
              <LocationInput />
            </Grid>
            <Grid xs={12}>
              <SatelliteSearch />
            </Grid>
            {selectedSatellite && (
              <Grid xs={12}>
                <SatelliteInfo />
              </Grid>
            )}
          </Grid>
        </Grid>
      </Grid>
      <ErrorNotification />
    </Container>
  );
}
