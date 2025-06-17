# SatScape Frontend

The frontend application for SatScape, built with Next.js and CesiumJS.

## Directory Structure

```bash
frontend/
├── src/
│   ├── components/           # React components
│   │   ├── Globe.js         # 3D globe visualization
│   │   ├── LocationInput.js # User location handling
│   │   ├── SatelliteInfo.js # Satellite details display
│   │   ├── SatelliteSearch.js # Search functionality
│   │   └── ErrorNotification.js # Error handling
│   ├── store/
│   │   └── useStore.js      # Zustand state management
│   ├── utils/
│   │   └── api.js          # API client utilities
│   ├── layout.js           # Root layout component
│   └── page.js            # Main application page
├── public/                # Static assets
└── [config files]        # Various configuration files
```

## Components

### Globe.js

- Renders the 3D globe using CesiumJS/Resium
- Displays user location marker
- Shows satellite positions and orbit trails
- Handles camera movements and animations

### LocationInput.js

- Manages user location detection
- Provides manual location input form
- Handles geolocation errors and fallbacks

### SatelliteInfo.js

- Displays detailed satellite information
- Shows position, altitude, azimuth, etc.
- Updates in real-time

### SatelliteSearch.js

- Implements satellite search functionality
- Filters satellites by name or NORAD ID
- Provides autocomplete suggestions

### ErrorNotification.js

- Handles error display and notifications
- Provides user feedback for various operations

## State Management

Uses Zustand for state management with the following stores:

- User location
- Selected satellite
- Satellites above
- Search query
- Loading states
- Error states

## API Integration

The `api.js` utility provides methods for:

- Fetching satellites above location
- Getting satellite positions
- Retrieving TLE data
- Error handling and response processing

## Environment Variables

Create a `.env.local` file with:

```env
NEXT_PUBLIC_API_URL=http://localhost:3001/api
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## Development

1 Install dependencies:

```bash
npm install
```

2 Start development server:

```bash
npm run dev
```

3 Open <http://localhost:3000>

## Building for Production

```bash
npm run build
npm run start
```
