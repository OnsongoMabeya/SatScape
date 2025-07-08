# SatScape 🛰️

A real-time satellite tracking application that visualizes satellites currently overhead using a 3D globe interface. Built with Next.js 13+, Express.js, and CesiumJS.

## Features

- 🌍 Real-time 3D globe visualization using CesiumJS/Resium with OpenStreetMap
- 📍 Automatic user location detection
- 🛰️ Live satellite position tracking with TLE data
- 🔍 Satellite search functionality
- 📊 Detailed satellite information display
- 🌠 Orbit trail visualization
- ⚡ Server-side caching for improved performance
- 🎨 Modern UI with Material-UI v5
- 🔄 Real-time state management with Zustand
- 🎮 Simplified globe controls for better UX

## Tech Stack

### Frontend

- Next.js 13+ (App Router)
- CesiumJS/Resium for 3D globe
- Material-UI v5 for UI components
- Zustand for state management

### Backend

- Express.js
- Node-Cache for API response caching
- Winston for logging
- N2YO API integration

## Project Structure

```bash
/
├── frontend/           # Next.js frontend application
│   ├── app/            # Next.js 13+ app directory
│   ├── components/     # React components
│   ├── store/          # Zustand state management
│   └── public/         # Static assets including Cesium
├── backend/            # Express.js backend server
│   ├── src/
│   │   ├── routes/     # API routes
│   │   ├── services/   # Business logic
│   │   └── utils/      # Shared utilities
└── package.json        # Root level dependencies and scripts
```

## Prerequisites

- Node.js (v18 or higher)
- npm (v9 or higher)
- N2YO API key (get it from [N2YO website](https://www.n2yo.com/api/))

## Setup

1 Clone the repository:

```bash
git clone git@github.com:OnsongoMabeya/SatScape.git
cd SatScape
```

2 Install dependencies:

```bash
npm run install:all
```

3 Configure environment:

```bash
# Copy environment files
cp frontend/.env.example frontend/.env
cp backend/.env.example backend/.env

# Add your N2YO API key to backend/.env
# Set frontend API URL
echo "NEXT_PUBLIC_API_URL=http://localhost:5000" >> frontend/.env
```

4 Start development servers:

```bash
npm run dev
```

## Usage

Once running, access:

- Frontend: `http://localhost:3000`
- Backend API: `http://localhost:5000`

## API Reference

- `GET /satellites/above` - Get satellites above current location
- `GET /satellites/positions/:id` - Get satellite positions
- `GET /satellites/tle/:id` - Get satellite TLE data
- `GET /health` - API health check

## Development

- Frontend hot reloading is enabled
- Backend uses nodemon for auto-restart
- Cesium assets are automatically copied during build

## Deployment

### Vercel Deployment

1. Fork or clone this repository
2. Import your repository to Vercel
3. Set the following environment variables in your Vercel project settings:
   - `NEXT_PUBLIC_API_URL`: Your Vercel deployment URL (e.g., `https://your-app.vercel.app`)
   - `NEXT_PUBLIC_CESIUM_ION_TOKEN`: Your Cesium Ion access token
   - `N2YO_API_KEY`: Your N2YO API key
4. Deploy! Vercel will automatically build and deploy both frontend and backend

### Manual Deployment

Build for production:

```bash
# Build frontend
cd frontend && npm run build

# Build backend
cd backend && npm run build
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Available Scripts

- `npm run install:all` - Install dependencies for root, frontend, and backend
- `npm run dev` - Start both frontend and backend in development mode
- `npm run dev:frontend` - Start only the frontend
- `npm run dev:backend` - Start only the backend
- `npm run build` - Build the frontend for production
- `npm run start` - Start both frontend and backend in production mode
- `npm run clean` - Clean all node_modules and build directories

## API Rate Limits

The N2YO API has the following rate limits:

- `/above` endpoint: 100 requests/hour
- `/positions` endpoint: 1000 requests/hour
- `/tle` endpoint: 1000 requests/hour
