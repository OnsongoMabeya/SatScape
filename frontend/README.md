# SatScape Frontend

The frontend application for SatScape, built with Next.js 13+ and CesiumJS/Resium.

## Tech Stack

- Next.js 13+ with App Router
- CesiumJS/Resium for 3D globe visualization
- Material-UI v5 for UI components
- Zustand for state management

## Directory Structure

```bash
frontend/
├── app/                     # Next.js 13+ app directory
│   ├── layout.js            # Root layout with providers
│   ├── page.js              # Main application page
│   └── HomeContent.js       # Main content component
├── components/              # React components
│   ├── Globe.js             # 3D globe visualization
│   ├── LocationInput.js     # User location handling
│   ├── SatelliteInfo.js     # Satellite details
│   ├── SatelliteSearch.js   # Search functionality
│   └── ErrorNotification.js # Error handling
├── store/
│   └── useStore.js          # Zustand state management
├── public/                  # Static assets
│   └── cesium/              # Cesium static files
└── next.config.js           # Next.js configuration
```

## Components

## Setup

1 Install dependencies:

```bash
npm install
```

2 Configure environment:

```bash
# Copy environment file
cp .env.example .env

# Set API URL
echo "NEXT_PUBLIC_API_URL=http://localhost:5000" >> .env
```

3 Start development server:

```bash
npm run dev
```

The app will be available at `http://localhost:3000`

## Key Components

### Globe (`components/Globe.js`)

- 3D globe visualization using CesiumJS/Resium
- Real-time satellite position tracking
- Orbit trail visualization
- Interactive camera controls

### Location Input (`components/LocationInput.js`)

- Automatic geolocation detection
- Manual location input
- Coordinate validation

### Satellite Info (`components/SatelliteInfo.js`)

- Real-time position updates
- TLE data display
- Orbital parameters

### Satellite Search (`components/SatelliteSearch.js`)

- Search by name or NORAD ID
- Results filtering
- Selection handling

## State Management

The application uses Zustand for state management (`store/useStore.js`):

- User location state
- Selected satellite data
- API integration
- Error handling

## Build

To build for production:

```bash
npm run build
```

This will:

1. Copy Cesium assets to public directory
2. Generate optimized production build
3. Output to `.next` directory

## Environment Variables

- `NEXT_PUBLIC_API_URL`: Backend API URL (required)

## Notes

- Cesium assets are automatically copied during build
- The app requires a running backend API
- Development server includes hot reloading
- Provides autocomplete suggestions

### ErrorNotification.js

- Handles error display and notifications
- Provides user feedback for various operations

## State Managementt

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

## Environment Variabless

Create a `.env.local` file with:

```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
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
