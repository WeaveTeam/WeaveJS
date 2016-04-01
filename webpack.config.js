var webpack = require("webpack");
var path = require("path");

module.exports = {
    entry: {
    	index: "./src/index.js", 
    	index2: "./src/index2.js",
    	libs: ["react", "react-datagrid", "lodash", "jquery", "d3", "c3", "openlayers", 
				"copy!./src/index2.html", "copy!./src/index.html", "copy!./src/app.css"]
    },
	output: {
		path: __dirname + "/dist",
		filename: "[name].js"
	},
	resolveLoader: {
		alias: {
			'copy': 'file?name=[path][name].[ext]&context=./src'
		}
	},
	module: {
		noParse: [ /ol.js$/ ],
		loaders: [
		{
			test: /\.jsx?$/,
			exclude: /(node_modules|bower_components)/,
			loader: "babel-loader",
			query:
			{
				plugins: ["transform-decorators"],
				presets: ["es2015", "react"]
			}
		}
		]
	},
	plugins: [
		new webpack.optimize.CommonsChunkPlugin({name: "weave", chunks: ["index", "index2"]}),
		new webpack.optimize.CommonsChunkPlugin({name: "libs", minChunks: 3}),
	]
};
