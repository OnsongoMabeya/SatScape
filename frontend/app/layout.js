import { Inter } from 'next/font/google';
import { CssBaseline, ThemeProvider } from '@mui/material';
import theme from '../theme';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'SatScape - Satellite Tracking',
  description: 'Real-time satellite tracking and visualization',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
