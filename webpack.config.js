const HtmlWebpackPlugin = require('html-webpack-plugin')
const path = require('path')

module.exports = (env, argv) => ({
  entry: './assets/index.tsx',
  output: { path: path.resolve(__dirname, 'dist', 'assets') },
  module: {
    rules: [
      { test: /\.css$/i, use: ['style-loader', 'css-loader'] },
      { test: /\.(woff|woff2|eot|ttf|otf)$/i, type: 'asset/resource' },
      { test: /\.tsx?$/, use: 'ts-loader', exclude: /node_modules/ },
    ],
  },
  resolve: { extensions: ['.css', '.js', '.ts', '.tsx'] },
  plugins: [
    new HtmlWebpackPlugin({
      template: path.resolve(__dirname, 'public', 'index.html'),
      hash: true,
      inject: 'body',
    }),
  ],
  devtool: 'development' === argv.mode ? 'eval-source-map' : false,
})
