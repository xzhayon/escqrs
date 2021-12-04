const HtmlWebpackPlugin = require('html-webpack-plugin')
const DotEnv = require('dotenv-webpack')
const path = require('path')

module.exports = (env, argv) => ({
  entry: path.resolve(__dirname, 'assets', 'index.tsx'),
  output: {
    filename: '[name].[contenthash].js',
    path: path.resolve(__dirname, 'dist', 'assets'),
  },
  module: {
    rules: [
      { test: /\.css$/i, use: ['style-loader', 'css-loader'] },
      { test: /\.(woff|woff2|eot|ttf|otf)$/i, type: 'asset/resource' },
      {
        test: /\.tsx?$/,
        use: [
          {
            loader: 'ts-loader',
            options: {
              compilerOptions: { module: 'es6', moduleResolution: 'node' },
            },
          },
        ],
        exclude: /node_modules/,
      },
    ],
  },
  resolve: { extensions: ['.css', '.js', '.ts', '.tsx'] },
  optimization: {
    moduleIds: 'deterministic',
    runtimeChunk: 'single',
    splitChunks: {
      cacheGroups: {
        vendor: {
          test: /\/node_modules\//,
          name: 'vendor',
          chunks: 'all',
        },
      },
    },
  },
  plugins: [
    new DotEnv({ path: './.env.local' }),
    new HtmlWebpackPlugin({
      template: path.resolve(__dirname, 'public', 'index.html'),
      inject: 'body',
    }),
  ],
  devtool: 'development' === argv.mode ? 'inline-source-map' : 'source-map',
})
