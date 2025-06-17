import { Inter } from 'next/font/google';
import ThemeRegistry from '../components/ThemeRegistry';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'SatScape - Satellite Tracking',
  description: 'Real-time satellite tracking and visualization',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ThemeRegistry>
          {children}
        </ThemeRegistry>
      </body>
    </html>
  );
}
