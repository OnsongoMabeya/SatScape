'use client';

import { Paper, Typography, Stack, Chip } from '@mui/material';
import useStore from '../store/useStore';

export default function SatelliteInfo() {
  const { selectedSatellite } = useStore();

  if (!selectedSatellite) return null;

  return (
    <Paper sx={{ p: 2 }}>
      <Stack spacing={2}>
        <Typography variant="h6">
          {selectedSatellite.satname}
        </Typography>
        <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
          <Chip 
            label={`NORAD ID: ${selectedSatellite.satid}`} 
            variant="outlined" 
          />
          <Chip 
            label={`Alt: ${Math.round(selectedSatellite.alt)} km`} 
            variant="outlined" 
          />
          <Chip 
            label={`Lat: ${selectedSatellite.lat.toFixed(2)}°`} 
            variant="outlined" 
          />
          <Chip 
            label={`Lng: ${selectedSatellite.lng.toFixed(2)}°`} 
            variant="outlined" 
          />
        </Stack>
        {selectedSatellite.tle && (
          <Stack spacing={1}>
            <Typography variant="subtitle2">TLE Data:</Typography>
            <Typography variant="body2" 
              component="pre" 
              sx={{ 
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-all',
                bgcolor: 'background.paper',
                p: 1,
                borderRadius: 1
              }}
            >
              {selectedSatellite.tle}
            </Typography>
          </Stack>
        )}
      </Stack>
    </Paper>
  );
}
