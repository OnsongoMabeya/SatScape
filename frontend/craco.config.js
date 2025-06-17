const path = require('path');
const CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports = {
  webpack: {
    alias: {
      // CesiumJS module name
      cesium: path.resolve(__dirname, 'node_modules/cesium/Source'),
    },
    plugins: {
      add: [
        new CopyWebpackPlugin({
          patterns: [
            {
              from: 'node_modules/cesium/Build/Cesium/Workers',
              to: 'static/cesium/Workers',
            },
            {
              from: 'node_modules/cesium/Build/Cesium/ThirdParty',
              to: 'static/cesium/ThirdParty',
            },
            {
              from: 'node_modules/cesium/Build/Cesium/Assets',
              to: 'static/cesium/Assets',
            },
            {
              from: 'node_modules/cesium/Build/Cesium/Widgets',
              to: 'static/cesium/Widgets',
            },
          ],
        }),
      ],
    },
    configure: (webpackConfig) => {
      webpackConfig.module.rules.push({
        test: /\.css$/,
        use: ['style-loader', 'css-loader'],
      });
      return webpackConfig;
    },
  },
};
