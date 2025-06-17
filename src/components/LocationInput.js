import { useState, useEffect } from 'react';
import { TextField, Button, Box, Alert } from '@mui/material';
import useStore from '@/store/useStore';

const LocationInput = () => {
  const { setUserLocation, setError } = useStore();
  const [manualInput, setManualInput] = useState(false);
  const [coords, setCoords] = useState({ lat: '', lng: '' });

  const handleGeolocation = () => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser');
      setManualInput(true);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setUserLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
      },
      (error) => {
        setError(`Failed to get location: ${error.message}`);
        setManualInput(true);
      }
    );
  };

  const handleManualSubmit = (e) => {
    e.preventDefault();
    const lat = parseFloat(coords.lat);
    const lng = parseFloat(coords.lng);

    if (isNaN(lat) || isNaN(lng) || lat < -90 || lat > 90 || lng < -180 || lng > 180) {
      setError('Invalid coordinates. Latitude must be between -90 and 90, longitude between -180 and 180');
      return;
    }

    setUserLocation({ latitude: lat, longitude: lng });
  };

  useEffect(() => {
    handleGeolocation();
  }, []);

  if (!manualInput) return null;

  return (
    <Box
      component="form"
      onSubmit={handleManualSubmit}
      sx={{
        position: 'absolute',
        left: 20,
        top: 20,
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        padding: 2,
        borderRadius: 1,
      }}
    >
      <TextField
        label="Latitude"
        type="number"
        value={coords.lat}
        onChange={(e) => setCoords(prev => ({ ...prev, lat: e.target.value }))}
        size="small"
        sx={{ mr: 1 }}
      />
      <TextField
        label="Longitude"
        type="number"
        value={coords.lng}
        onChange={(e) => setCoords(prev => ({ ...prev, lng: e.target.value }))}
        size="small"
        sx={{ mr: 1 }}
      />
      <Button type="submit" variant="contained" size="small">
        Set Location
      </Button>
    </Box>
  );
};

export default LocationInput;
