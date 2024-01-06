// webpack.config.js
const path = require('path');

module.exports = {
  entry: './main.mjs',
  mode: 'production', 
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, 'dist'),
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader', // Optional: Use Babel for transpilation
          options: {
            presets: ['@babel/preset-env'],
          },
        },
      },
    ],
  },
};
