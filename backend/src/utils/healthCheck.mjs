import { fetchFromN2YO } from './api.mjs';
import logger from './logger.mjs';

class HealthCheck {
    constructor() {
        this.status = {
            n2yo: false,
            lastCheck: null,
            errors: []
        };
    }

    async checkN2YOApi() {
        try {
            // Test N2YO API with a simple request to /above endpoint (less rate-limited)
            // Test with a basic /above request (using NYC coordinates)
            const data = await fetchFromN2YO('/above/40.7128/-74.0060/0/45/0');
            
            const isHealthy = !!data;
            this.status.n2yo = isHealthy;
            this.status.lastCheck = new Date();
            this.status.errors = [];

            logger.info('N2YO API Health Check', {
                healthy: isHealthy,
                timestamp: this.status.lastCheck
            });

            return isHealthy;
        } catch (error) {
            this.status.n2yo = false;
            this.status.lastCheck = new Date();
            this.status.errors.push({
                timestamp: new Date(),
                message: error.message,
                code: error.response?.status
            });

            logger.error('N2YO API Health Check Failed', {
                error: error.message,
                code: error.response?.status,
                timestamp: this.status.lastCheck
            });

            return false;
        }
    }

    getStatus() {
        return {
            ...this.status,
            uptime: process.uptime(),
            memory: process.memoryUsage()
        };
    }
}

export default new HealthCheck();
