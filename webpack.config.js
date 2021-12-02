const HtmlWebpackPlugin = require('html-webpack-plugin')
const path = require('path')

module.exports = (env, argv) => ({
  entry: './assets/js/index.tsx',
  output: { path: path.resolve(__dirname, 'dist', 'assets') },
  devtool: 'development' === argv.mode ? 'eval-source-map' : false,
  module: {
    rules: [
      { test: /\.css$/i, use: ['style-loader', 'css-loader'] },
      { test: /\.(woff|woff2|eot|ttf|otf)$/i, type: 'asset/resource' },
      { test: /\.tsx?$/, use: 'ts-loader', exclude: /node_modules/ },
    ],
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: path.resolve(__dirname, 'assets', 'index.html'),
      hash: true,
      inject: 'body',
      showErrors: false,
    }),
  ],
  resolve: { extensions: ['.css', '.js', '.ts', '.tsx'] },
})
