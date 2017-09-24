const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const ProgressBarPlugin = require('progress-bar-webpack-plugin');
const webpack = require('webpack');

const distFolder = 'dist';

module.exports = {
    entry: {
        "weave-app": './src/index.tsx',
    },
    plugins: [
        new CleanWebpackPlugin([distFolder]),
        new HtmlWebpackPlugin({
            template: './resources/index.ejs',
        }),
        new HtmlWebpackPlugin({
            filename: 'weave.html',
            template: './resources/weave.ejs',
        }),
        new webpack.optimize.CommonsChunkPlugin({
            children: true,
            async: true,
            minChunks: 3,
        }),
        new CopyWebpackPlugin([
                {flatten: false, context: 'resources/', from: 'css/', to: path.resolve(__dirname, distFolder, 'css')},
                {flatten: true, context: '../WeaveTSJS/css/', from: 'weave-ui.css', to: path.resolve(__dirname, distFolder, 'css/weave-ui.css')},
                {flatten: true, context: 'resources/', from: 'img/*.*', to: path.resolve(__dirname, distFolder, 'img')},
                {flatten: true, context: 'resources/', from: 'css/fonts/*.ttf', to: path.resolve(__dirname, distFolder, 'fonts')},
                {flatten: true, context: 'node_modules/openlayers/css/', from: 'ol.css', to: path.resolve(__dirname, distFolder, 'css')},
                {flatten: true, context: 'node_modules/font-awesome/css/', from: 'font-awesome.css', to: path.resolve(__dirname, distFolder, 'css')},
                {flatten: true, context: 'node_modules/font-awesome/fonts/', from: '*', to: path.resolve(__dirname, distFolder, 'fonts')},
                {context: 'resources/semantic/', from: 'semantic.min.js', to: path.resolve(__dirname, distFolder)},
                {context: 'resources/semantic/', from: 'semantic.min.css', to: path.resolve(__dirname, distFolder, 'css')},
                {context: 'resources/semantic/themes/', from: '*', to: path.resolve(__dirname, distFolder, 'css/themes')},
                {flatten: true, context: '../weave_sessions/', from: "*.weave", to: path.resolve(__dirname, distFolder)},
                {flatten: true, context: 'resources/', from: 'ProjDatabase.zip', to: path.resolve(__dirname, distFolder, 'ProjDatabase.zip')}
        ]),
        new ProgressBarPlugin({ clear: false }),
        new webpack.ProvidePlugin({
            $: "jquery",
            jQuery: "jquery",
            "window.jQuery": "jquery"
        }),
        new webpack.ProvidePlugin({
            React: "React", react: "React", "window.react": "React", "window.React": "React"
        }),
    ],
    output: {
        filename: '[name].bundle.js',
        path: path.resolve(__dirname, distFolder),
    },
    module: {
        rules: [{
            test: /\.tsx?$/,
            use: [
                'babel-loader',
                'ts-loader',
            ],
            exclude: /node_modules/
        },
        {
            test: /\.css$/,
            use: [
                'style-loader',
                'css-loader',
            ],
        },
        {
            test: /\.(png|svg|jpg|gif)$/,
            use: [
                'file-loader',
            ],
        },
        {
            test: /\.(woff|woff2|eot|ttf|otf)$/,
            use: [
                'file-loader',
            ],
        },
        {
            test: /\.(csv|tsv)$/,
            use: [
                'csv-loader',
            ],
        },
        {
            test: /\.xml$/,
            use: [
                'xml-loader',
            ]
        },
        {
            test: /\.json$/,
            use: [
                'json-loader',
            ],
        },
    ]},
    resolve: {
        extensions: [ ".tsx", ".ts", ".js" ],
        alias: {
            weaveapp: path.resolve(__dirname, 'src/weaveapp/'),
        }
    },
    node: {
        fs: 'empty',
    },
};