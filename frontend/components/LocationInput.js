'use client';

import { useState } from 'react';
import { 
  Paper, 
  TextField, 
  Button, 
  Stack, 
  Typography,
  CircularProgress
} from '@mui/material';
import useStore from '../store/useStore';

export default function LocationInput() {
  const { setUserLocation } = useStore();
  const [loading, setLoading] = useState(false);
  const [manual, setManual] = useState(false);
  const [lat, setLat] = useState('');
  const [lng, setLng] = useState('');

  const handleGeolocation = () => {
    setLoading(true);
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
          setLoading(false);
        },
        (error) => {
          console.error('Geolocation error:', error);
          setManual(true);
          setLoading(false);
        }
      );
    } else {
      setManual(true);
      setLoading(false);
    }
  };

  const handleManualSubmit = (e) => {
    e.preventDefault();
    setUserLocation({
      lat: parseFloat(lat),
      lng: parseFloat(lng)
    });
  };

  return (
    <Paper sx={{ p: 2 }}>
      <Typography variant="h6" gutterBottom>
        Your Location
      </Typography>
      {!manual ? (
        <Button
          variant="contained"
          onClick={handleGeolocation}
          disabled={loading}
          fullWidth
        >
          {loading ? (
            <CircularProgress size={24} color="inherit" />
          ) : (
            'Detect Location'
          )}
        </Button>
      ) : (
        <form onSubmit={handleManualSubmit}>
          <Stack spacing={2}>
            <TextField
              label="Latitude"
              type="number"
              value={lat}
              onChange={(e) => setLat(e.target.value)}
              required
              fullWidth
            />
            <TextField
              label="Longitude"
              type="number"
              value={lng}
              onChange={(e) => setLng(e.target.value)}
              required
              fullWidth
            />
            <Button type="submit" variant="contained" fullWidth>
              Set Location
            </Button>
          </Stack>
        </form>
      )}
      {!manual && (
        <Button
          sx={{ mt: 1 }}
          onClick={() => setManual(true)}
          fullWidth
        >
          Enter Manually
        </Button>
      )}
    </Paper>
  );
}
