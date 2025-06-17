const CopyWebpackPlugin = require('copy-webpack-plugin');
const path = require('path');

/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config, { buildId, dev, isServer, defaultLoaders, webpack }) => {
    config.plugins.push(
      new CopyWebpackPlugin({
        patterns: [
          {
            from: path.join(
              path.dirname(require.resolve('@cesium/engine/package.json')),
              'Source',
              'Assets'
            ),
            to: 'static/cesium/Assets',
          },
          {
            from: path.join(
              path.dirname(require.resolve('@cesium/engine/package.json')),
              'Source',
              'Widgets'
            ),
            to: 'static/cesium/Widgets',
          },
        ],
      })
    );

    return config;
  },
};

module.exports = nextConfig;
