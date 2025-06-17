const express = require('express');
const { getSatellitesAbove, getSatellitePositions, getSatelliteTLE } = require('../services/satelliteService');

const router = express.Router();

router.get('/above', async (req, res, next) => {
  try {
    const { lat, lng, alt = 0, cat = 0 } = req.query;
    if (!lat || !lng) {
      return res.status(400).json({ error: 'Missing required parameters: lat, lng' });
    }
    const data = await getSatellitesAbove(lat, lng, alt, cat);
    res.json(data);
  } catch (error) {
    next(error);
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
