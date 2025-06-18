'use client';

import { useEffect } from 'react';
import { Box, Container, Paper } from '@mui/material';
import Grid from '@mui/material/Grid';
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
      <Grid container spacing={2}>
        <Grid container xs={12} md={4}>
          <Paper
            elevation={3}
            sx={{
              p: 2,
              display: 'flex',
              flexDirection: 'column',
              height: 240,
              width: '100%'
            }}
          >
            <Typography variant="h6" gutterBottom>
              Satellite Controls
            </Typography>
            <LocationInput />
            <SatelliteSearch />
            {selectedSatellite && (
              <SatelliteInfo />
            )}
          </Paper>
        </Grid>
        <Grid container xs={12} md={8}>
          <Paper
            elevation={3}
            sx={{
              p: 2,
              display: 'flex',
              flexDirection: 'column',
              height: 'calc(100vh - 400px)',
              minHeight: '500px',
              width: '100%'
            }}
          >
            <Globe />
          </Paper>
        </Grid>
      </Grid>
      <ErrorNotification />
    </Container>
  );
}
