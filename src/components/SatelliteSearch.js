import { TextField, Autocomplete, Box } from '@mui/material';
import useStore from '@/store/useStore';

const SatelliteSearch = () => {
  const { satellitesAbove, setSelectedSatellite } = useStore();

  return (
    <Box sx={{ 
      position: 'absolute', 
      left: 20, 
      bottom: 20, 
      width: 300,
      backgroundColor: 'rgba(255, 255, 255, 0.9)',
      borderRadius: 1,
      padding: 1
    }}>
      <Autocomplete
        options={satellitesAbove}
        getOptionLabel={(option) => `${option.satname} (NORAD: ${option.satid})`}
        onChange={(_, newValue) => setSelectedSatellite(newValue)}
        renderInput={(params) => (
          <TextField
            {...params}
            label="Search Satellites"
            variant="outlined"
            size="small"
          />
        )}
      />
    </Box>
  );
};

export default SatelliteSearch;
