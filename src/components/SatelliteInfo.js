import { Card, CardContent, Typography, Box } from '@mui/material';
import useStore from '@/store/useStore';

const SatelliteInfo = () => {
  const { selectedSatellite } = useStore();

  if (!selectedSatellite) return null;

  return (
    <Card sx={{ 
      position: 'absolute', 
      right: 20, 
      top: 20, 
      width: 300,
      backgroundColor: 'rgba(255, 255, 255, 0.9)'
    }}>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          {selectedSatellite.satname}
        </Typography>
        <Box sx={{ mt: 2 }}>
          <Typography variant="body2">
            NORAD ID: {selectedSatellite.satid}
          </Typography>
          <Typography variant="body2">
            Latitude: {selectedSatellite.satlatitude.toFixed(2)}°
          </Typography>
          <Typography variant="body2">
            Longitude: {selectedSatellite.satlongitude.toFixed(2)}°
          </Typography>
          <Typography variant="body2">
            Altitude: {selectedSatellite.sataltitude.toFixed(2)} km
          </Typography>
          <Typography variant="body2">
            Azimuth: {selectedSatellite.azimuth.toFixed(2)}°
          </Typography>
          <Typography variant="body2">
            Elevation: {selectedSatellite.elevation.toFixed(2)}°
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
};

export default SatelliteInfo;
