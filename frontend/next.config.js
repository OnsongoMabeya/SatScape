const CopyWebpackPlugin = require('copy-webpack-plugin');
const path = require('path');

// Load environment variables from .env file if it exists
try {
  require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
} catch (error) {
  console.warn('No .env file found, using default environment variables');
}

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Transpile Cesium and Resium
  transpilePackages: ['cesium', 'resium'],
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
    NEXT_PUBLIC_CESIUM_ION_TOKEN: process.env.NEXT_PUBLIC_CESIUM_ION_TOKEN,
  },
  webpack: (config, { buildId, dev, isServer, defaultLoaders, webpack }) => {
    // Don't attempt to minify worker files
    config.optimization = {
      ...config.optimization,
      minimize: false
    };
    
    if (!isServer) {
      config.plugins.push(
        new CopyWebpackPlugin({
          patterns: [
            {
              from: path.join(
                path.dirname(require.resolve('cesium')),
                'Build/Cesium/Workers'
              ),
              to: path.join(__dirname, 'public', 'cesium', 'Workers'),
            },
            {
              from: path.join(
                path.dirname(require.resolve('cesium')),
                'Build/Cesium/ThirdParty'
              ),
              to: path.join(__dirname, 'public', 'cesium', 'ThirdParty'),
            },
            {
              from: path.join(
                path.dirname(require.resolve('cesium')),
                'Build/Cesium/Assets'
              ),
              to: path.join(__dirname, 'public', 'cesium', 'Assets'),
            },
            {
              from: path.join(
                path.dirname(require.resolve('cesium')),
                'Build/Cesium/Widgets'
              ),
              to: path.join(__dirname, 'public', 'cesium', 'Widgets'),
            },
          ],
        })
      );

      config.resolve.alias = {
        ...config.resolve.alias,
        cesium: path.resolve(__dirname, 'node_modules/cesium'),
      };
    }

    config.resolve = config.resolve || {};
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      http: false,
      https: false,
      zlib: false,
      url: false,
    };

    return config;
  },
};

module.exports = nextConfig;
