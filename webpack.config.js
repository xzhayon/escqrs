const DotEnv = require('dotenv-webpack')

module.exports = (env, argv) => ({
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
  plugins: [new DotEnv()],
  devtool: 'development' === argv.mode ? 'inline-source-map' : 'source-map',
})
