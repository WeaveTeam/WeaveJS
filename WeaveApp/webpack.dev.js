const path = require('path');
const merge = require('webpack-merge');
const common = require('./webpack.common.js');
const webpack = require('webpack');

const distFolder = 'dist';

module.exports = merge(common, {
    plugins: [
        new webpack.HotModuleReplacementPlugin(),
    ],
    devtool: 'cheap-module-eval-source-map',
    devServer: {
        contentBase: [
            path.join(__dirname, distFolder),
        ],
        compress: true,
        port: 8080,
        hot: true,
        https: true,
        watchContentBase: true,
        watchOptions: {
            aggregateTimeout: 200,
            ignored: /node_modules/,
        },
    },
});