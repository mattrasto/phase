const path = require('path');

module.exports = {
  entry: './src/network.js',
  output: {
    filename: 'main.js',
    path: path.resolve(__dirname, 'dist')
  }
};
