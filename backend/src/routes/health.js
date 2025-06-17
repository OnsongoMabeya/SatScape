const express = require('express');
const router = express.Router();
const healthCheck = require('../utils/healthCheck');
const logger = require('../utils/logger');

// Health check endpoint
router.get('/', async (req, res) => {
    const status = healthCheck.getStatus();
    res.json(status);
});

// Detailed health check with N2YO API test
router.get('/check', async (req, res) => {
    try {
        const isHealthy = await healthCheck.checkN2YOApi();
        const status = healthCheck.getStatus();

        res.status(isHealthy ? 200 : 503).json(status);
    } catch (error) {
        logger.error('Health check failed', { error: error.message });
        res.status(500).json({
            healthy: false,
            error: 'Health check failed'
        });
    }
});

module.exports = router;
