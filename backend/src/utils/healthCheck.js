const { fetchFromN2YO } = require('./api');
const logger = require('./logger');

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
            // Test N2YO API with a simple request using ISS (NORAD ID: 25544)
            const data = await fetchFromN2YO('/positions/25544/41.702/-76.014/0/1');
            
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

module.exports = new HealthCheck();
