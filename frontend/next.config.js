const CopyWebpackPlugin = require('copy-webpack-plugin');
const path = require('path');

/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['@cesium/engine', '@cesium/widgets'],
  webpack: (config, { buildId, dev, isServer, defaultLoaders, webpack }) => {
    config.plugins.push(
      new CopyWebpackPlugin({
        patterns: [
          {
            from: 'node_modules/@cesium/engine/Build/Workers',
            to: 'static/cesium/Workers',
          },
          {
            from: 'node_modules/@cesium/engine/Build/ThirdParty',
            to: 'static/cesium/ThirdParty',
          },
          {
            from: 'node_modules/@cesium/engine/Source/Assets',
            to: 'static/cesium/Assets',
          },
          {
            from: 'node_modules/@cesium/widgets/Source/widgets.css',
            to: 'static/cesium/Widgets/widgets.css',
          },
          {
            from: 'node_modules/@cesium/widgets/Source/Widgets',
            to: 'static/cesium/Widgets',
          },
        ],
      })
    );

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
