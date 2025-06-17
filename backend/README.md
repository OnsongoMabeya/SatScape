# SatScape Backend

The backend server for SatScape, providing API endpoints and caching for satellite data.

## Directory Structure

```bash
backend/
├── src/
│   ├── routes/
│   │   └── satellites.js    # API route handlers
│   ├── services/
│   │   └── satelliteService.js  # Business logic
│   ├── utils/
│   │   └── api.js          # N2YO API client
│   └── index.js            # Server entry point
└── [config files]          # Configuration files
```

## API Endpoints

### GET /api/satellites/above

Get satellites above a location

- Query params:

  - `lat`: Latitude (required)
  - `lng`: Longitude (required)
  - `alt`: Altitude (optional, default: 0)
  - `cat`: Category (optional, default: 0)
- Cache duration: 5 seconds

### GET /api/satellites/positions

Get satellite positions

- Query params:
  - `satId`: NORAD ID (required)
  - `lat`: Observer latitude (required)
  - `lng`: Observer longitude (required)
  - `alt`: Observer altitude (optional, default: 0)
  - `seconds`: Prediction window (optional, default: 2)
- Cache duration: 5 seconds

### GET /api/satellites/tle

Get satellite TLE data

- Query params:
  - `satId`: NORAD ID (required)
- Cache duration: 5 minutes

## Caching Strategy

Uses Node-Cache for in-memory caching:

- Regular satellite data: 5 seconds TTL
- TLE data: 5 minutes TTL
- Automatic cache cleanup
- Cache invalidation on errors

## Rate Limiting

Implements caching to respect N2YO API rate limits:

- /above: 100 requests/hour
- /positions: 1000 requests/hour
- /tle: 1000 requests/hour

## Environment Variables

Create a `.env` file with:

```env
PORT=3001
FRONTEND_URL=http://localhost:3000
N2YO_API_KEY=your_api_key_here
N2YO_BASE_URL=https://api.n2yo.com/rest/v1/satellite
```

## Available Scripts

- `npm run dev` - Start development server with nodemon
- `npm start` - Start production server

## Development

1 Install dependencies:

```bash
npm install
```

2 Start development server:

```bash
npm run dev
```

3 Server will be available at `http://localhost:3001`

## Error Handling

- Input validation for all endpoints
- Proper error responses with status codes
- Error logging and monitoring
- Graceful error recovery

## Security

- CORS configuration for frontend
- Environment variable protection
- Input sanitization
- Error message sanitization

## Production Deployment

1. Install dependencies:

```bash
npm install --production
```

2 Set environment variables

3 Start the server:

```bash
npm start
```
