'use client';

import { Autocomplete, TextField, Paper } from '@mui/material';
import useStore from '../store/useStore';

export default function SatelliteSearch() {
  const { satellites, selectedSatellite, setSelectedSatellite } = useStore();

  return (
    <Paper sx={{ p: 2 }}>
      <Autocomplete
        value={selectedSatellite}
        onChange={(_, newValue) => setSelectedSatellite(newValue)}
        options={satellites || []}
        getOptionLabel={(option) => `${option.satname} (${option.satid})`}
        isOptionEqualToValue={(option, value) => option.satid === value.satid}
        renderInput={(params) => (
          <TextField
            {...params}
            label="Search Satellites"
            variant="outlined"
          />
        )}
      />
    </Paper>
  );
}
