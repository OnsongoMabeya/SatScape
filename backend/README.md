# SatScape Backend

Express.js backend server for SatScape, providing satellite tracking data through N2YO API integration.

## Tech Stack

- Express.js for API server
- Node-Cache for response caching
- Winston for structured logging
- N2YO API for satellite data

## Directory Structure

```bash
backend/
├── src/
│   ├── routes/
│   │   ├── satellites.js  # Satellite endpoints
│   │   └── health.js      # Health check endpoints
│   ├── services/
│   │   └── satelliteService.js  # Satellite data handling
│   ├── utils/
│   │   ├── api.js         # N2YO API client
│   │   ├── logger.js      # Winston logger setup
│   │   └── healthCheck.js # Health monitoring
│   └── index.js           # Server entry point
└── .env                   # Environment configuration
```

## Setup

1 Install dependencies:

```bash
npm install
```

2 Configure environment:

```bash
# Copy environment file
cp .env.example .env

# Add your N2YO API key
echo "N2YO_API_KEY=your-api-key" >> .env
```

3 Start development server:

```bash
npm run dev
```

The server will be available at `http://localhost:5000`

## API Endpoints

### Satellites

#### GET /satellites/above

Get satellites visible from a location.

```bash
GET /satellites/above?lat=<latitude>&lng=<longitude>&alt=<altitude>
```

#### GET /satellites/positions/:id

Get satellite positions over time.

```bash
GET /satellites/positions/:id?lat=<latitude>&lng=<longitude>&alt=<altitude>&seconds=<duration>
```

#### GET /satellites/tle/:id

Get satellite TLE data.

```bash
GET /satellites/tle/:id
```

### Health

#### GET /health

Check API health status.

```bash
GET /health
```

Response:

```json
{
  "status": "healthy",
  "n2yo": true,
  "uptime": 123456
}
```

## Caching

The server implements caching for:

- Satellite positions (5 seconds TTL)
- TLE data (5 minutes TTL)
- Health check results (10 seconds TTL)

## Logging

Structured logging using Winston:

- Log levels: error, warn, info, debug
- JSON format for machine parsing
- Console output in development
- File output in production

## Error Handling

- Standard error responses
- N2YO API error handling
- Rate limit monitoring
- Automatic retry for transient failures

## Environment Variables

- `PORT`: Server port (default: 5000)
- `NODE_ENV`: Environment (development/production)
- `N2YO_API_KEY`: N2YO API key (required)
- `N2YO_BASE_URL`: N2YO API base URL

## Development

- Nodemon for auto-restart
- ESLint for code quality
- Pretty error logging
- API response validation

## Production

To run in production:

```bash
npm run build
npm start
```

Consider using PM2 or similar for process management:

```bash
pm2 start npm -- start
```

- Request details (method, path, query)
- Error details when applicable
- Health check results

### Automatic Monitoring

- Initial health check on server start
- Periodic health checks every 5 minutes
- Graceful shutdown handling
- Request logging for all API endpoints
- Error tracking with stack traces

## API Endpointss

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

## Environment Variabless

Create a `.env` file with:

```env
PORT=5000
FRONTEND_URL=http://localhost:3000
N2YO_API_KEY=your_api_key_here
N2YO_BASE_URL=https://api.n2yo.com/rest/v1/satellite
```

## Available Scripts

- `npm run dev` - Start development server with nodemon
- `npm start` - Start production server

## Developmentt

1 Install dependencies:

```bash
npm install
```

2 Start development server:

```bash
npm run dev
```

3 Server will be available at `http://localhost:5000`

## Error Handlingg

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
