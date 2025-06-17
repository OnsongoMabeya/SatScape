import { Alert, Snackbar } from '@mui/material';
import useStore from '@/store/useStore';

const ErrorNotification = () => {
  const { error, setError } = useStore();

  return (
    <Snackbar
      open={!!error}
      autoHideDuration={6000}
      onClose={() => setError(null)}
      anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
    >
      <Alert severity="error" onClose={() => setError(null)}>
        {error}
      </Alert>
    </Snackbar>
  );
};

export default ErrorNotification;
