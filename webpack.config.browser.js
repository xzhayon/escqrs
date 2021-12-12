const HtmlWebpackPlugin = require('html-webpack-plugin')
const { resolve } = require('path')
const { merge } = require('webpack-merge')
const common = require('./webpack.config')

module.exports = (env, argv) =>
  merge(common(env, argv), {
    entry: resolve(
      __dirname,
      'app',
      'arcadia',
      'platform',
      'browser',
      'index.tsx',
    ),
    output: {
      filename: '[name].[contenthash].js',
      path: resolve(__dirname, 'dist', 'app', 'arcadia', 'platform', 'browser'),
    },
    plugins: [
      new HtmlWebpackPlugin({
        template: resolve(
          __dirname,
          'app',
          'arcadia',
          'platform',
          'browser',
          'index.html',
        ),
        inject: 'body',
      }),
    ],
  })
