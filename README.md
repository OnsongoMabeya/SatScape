# SatScape 🛰️

A real-time satellite tracking application that visualizes satellites currently overhead using a 3D globe interface.

## Features

- 🌍 Real-time 3D globe visualization using CesiumJS
- 📍 Automatic user location detection
- 🛰️ Live satellite position tracking
- 🔍 Satellite search functionality
- 📊 Detailed satellite information display
- 🌠 Orbit trail visualization

## Project Structure

```bash
/
├── frontend/          # Next.js frontend application
├── backend/          # Express.js backend server
└── package.json      # Root level dependencies and scripts
```

## Prerequisites

- Node.js (v14 or higher)
- npm (v6 or higher)
- N2YO API key (get it from [N2YO website](https://www.n2yo.com/api/))

## Quick Start

1 Clone the repository:

```bash
git clone git@github.com:OnsongoMabeya/SatScape.git
cd SatScape
```

2 Install dependencies for both frontend and backend:

```bash
npm run install:all
```

3 Set up environment variables:

- Copy `.env.example` to `.env` in both frontend and backend directories
- Add your N2YO API key to `backend/.env`

4 Start both frontend and backend:

```bash
npm run dev
```

The application will be available at:

- Frontend: `http://localhost:3000`
- Backend API: `http://localhost:3001`

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

## Tech Stack

- Frontend:
  - Next.js
  - CesiumJS/Resium
  - Material UI
  - Zustand (State Management)

- Backend:
  - Express.js
  - Node-Cache (Caching)
  - CORS

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request
