const { InjectManifest } = require('workbox-webpack-plugin');

module.exports = {
  // Other Webpack config...
  plugins: [
    new InjectManifest({
      swSrc: './src/custom-service-worker.js', // Custom service worker file
      swDest: 'service-worker.js',            // Output file
    }),
  ],
};
