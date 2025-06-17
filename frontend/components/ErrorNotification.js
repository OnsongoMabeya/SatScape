'use client';

import { Snackbar, Alert } from '@mui/material';
import useStore from '../store/useStore';

export default function ErrorNotification() {
  const { error, clearError } = useStore();

  return (
    <Snackbar
      open={!!error}
      autoHideDuration={6000}
      onClose={clearError}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
    >
      <Alert 
        onClose={clearError} 
        severity="error" 
        variant="filled"
        sx={{ width: '100%' }}
      >
        {error}
      </Alert>
    </Snackbar>
  );
}
