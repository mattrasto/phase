const path = require('path');

module.exports = {
  entry: './src/network.js',
  mode: 'development',
  devtool: 'inline-source-map',
  output: {
    filename: 'phase.min.js',
    path: path.resolve(__dirname, 'dist'),
  },
};
