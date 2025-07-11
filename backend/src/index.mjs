import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';
import satelliteRoutes from './routes/satellites.mjs';
import healthRoutes from './routes/health.mjs';
import logger from './utils/logger.mjs';
import healthCheck from './utils/healthCheck.mjs';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware to log all requests
app.use((req, res, next) => {
    logger.info('Incoming request', {
        method: req.method,
        path: req.path,
        query: req.query,
        ip: req.ip
    });
    next();
});

app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000'
}));

app.use(express.json());

// Routes
app.use('/health', healthRoutes);
app.use('/satellites', satelliteRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
    logger.error('Server error', {
        error: err.message,
        stack: err.stack,
        path: req.path
    });
    res.status(500).json({ error: 'Something went wrong!' });
});

const server = app.listen(PORT, () => {
    logger.info(`Server started`, {
        port: PORT,
        env: process.env.NODE_ENV || 'development',
        time: new Date().toISOString()
    });

    // Initial health check
    healthCheck.checkN2YOApi()
        .then(isHealthy => {
            logger.info('Initial N2YO API health check', {
                healthy: isHealthy,
                time: new Date().toISOString()
            });
        })
        .catch(error => {
            logger.error('Initial health check failed', { error: error.message });
        });
});

// Periodic health checks every 5 minutes
setInterval(() => {
    healthCheck.checkN2YOApi()
        .then(isHealthy => {
            logger.info('Periodic N2YO API health check', {
                healthy: isHealthy,
                time: new Date().toISOString()
            });
        })
        .catch(error => {
            logger.error('Periodic health check failed', { error: error.message });
        });
}, 5 * 60 * 1000);

// Graceful shutdown
process.on('SIGTERM', () => {
    logger.info('SIGTERM received. Shutting down gracefully...');
    server.close(() => {
        logger.info('Server closed');
        process.exit(0);
    });
});

