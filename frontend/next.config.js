const CopyWebpackPlugin = require('copy-webpack-plugin');
const path = require('path');

/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config, { buildId, dev, isServer, defaultLoaders, webpack }) => {
    if (!isServer) {
      config.plugins.push(
        new CopyWebpackPlugin({
          patterns: [
            {
              from: path.join(
                path.dirname(require.resolve('cesium')),
                'Build/Cesium/Workers'
              ),
              to: 'public/cesium/Workers',
            },
            {
              from: path.join(
                path.dirname(require.resolve('cesium')),
                'Build/Cesium/ThirdParty'
              ),
              to: 'public/cesium/ThirdParty',
            },
            {
              from: path.join(
                path.dirname(require.resolve('cesium')),
                'Build/Cesium/Assets'
              ),
              to: 'public/cesium/Assets',
            },
            {
              from: path.join(
                path.dirname(require.resolve('cesium')),
                'Build/Cesium/Widgets'
              ),
              to: 'public/cesium/Widgets',
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
