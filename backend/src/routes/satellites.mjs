import express from 'express';
import { getSatellitesAbove, getSatellitePositions, getSatelliteTLE } from '../services/satelliteService.mjs';

const router = express.Router();

router.get('/above', async (req, res, next) => {
  try {
    const { lat, lng, alt = 0, cat = 0 } = req.query;
    
    // Parse and validate numeric parameters
    const parsedLat = parseFloat(lat);
    const parsedLng = parseFloat(lng);
    const parsedAlt = parseFloat(alt);
    const parsedCat = parseInt(cat, 10) || 0;

    // Let the service handle validation and throw appropriate errors
    const data = await getSatellitesAbove(parsedLat, parsedLng, parsedAlt, parsedCat);
    res.json(data);
  } catch (error) {
    // Log the error for debugging
    console.error('Error in /above endpoint:', error);
    
    // Send appropriate error response
    if (error.message.includes('N2YO API')) {
      return res.status(502).json({ 
        error: 'Error fetching satellite data from upstream API',
        details: error.message
      });
    }
    
    if (error.message === 'Failed to fetch satellite data') {
      return res.status(404).json({ 
        error: 'No satellite data available for the given parameters'
      });
    }

    // Default error response
    res.status(500).json({ 
      error: 'Internal server error',
      message: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

router.get('/positions', async (req, res, next) => {
  try {
    const { satId, lat, lng, alt = 0, seconds = 2 } = req.query;
    if (!satId || !lat || !lng) {
      return res.status(400).json({ error: 'Missing required parameters: satId, lat, lng' });
    }
    const data = await getSatellitePositions(satId, lat, lng, alt, seconds);
    res.json(data);
  } catch (error) {
    next(error);
  }
});

router.get('/tle', async (req, res, next) => {
  try {
    const { satId } = req.query;
    if (!satId) {
      return res.status(400).json({ error: 'Missing required parameter: satId' });
    }
    const data = await getSatelliteTLE(satId);
    res.json(data);
  } catch (error) {
    next(error);
  }
});

// Error handling middleware
router.use((err, req, res, next) => {
  console.error('Error in satellites route:', err);
  res.status(400).json({ error: err.message });
});

export default router;
