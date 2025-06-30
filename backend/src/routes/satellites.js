const express = require('express');
const { getSatellitesAbove, getSatellitePositions, getSatelliteTLE } = require('../services/satelliteService');

const router = express.Router();

router.get('/above', async (req, res, next) => {
  try {
    const { lat, lng, alt = 0, cat = 0 } = req.query;
    
    // Validate required parameters
    if (!lat || !lng) {
      return res.status(400).json({ error: 'Missing required parameters: lat, lng' });
    }

    // Parse and validate numeric parameters
    const parsedLat = parseFloat(lat);
    const parsedLng = parseFloat(lng);
    const parsedAlt = parseFloat(alt);
    const parsedCat = parseInt(cat, 10);

    if (isNaN(parsedLat) || isNaN(parsedLng)) {
      return res.status(400).json({ error: 'Invalid lat/lng values. Must be valid numbers.' });
    }

    if (isNaN(parsedAlt)) {
      return res.status(400).json({ error: 'Invalid altitude value. Must be a valid number.' });
    }

    if (isNaN(parsedCat)) {
      return res.status(400).json({ error: 'Invalid category value. Must be a valid integer.' });
    }

    // Validate value ranges
    if (parsedLat < -90 || parsedLat > 90) {
      return res.status(400).json({ error: 'Latitude must be between -90 and 90 degrees' });
    }

    if (parsedLng < -180 || parsedLng > 180) {
      return res.status(400).json({ error: 'Longitude must be between -180 and 180 degrees' });
    }

    if (parsedAlt < 0) {
      return res.status(400).json({ error: 'Altitude must be non-negative' });
    }

    if (parsedCat < 0) {
      return res.status(400).json({ error: 'Category must be non-negative' });
    }

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

module.exports = router;
