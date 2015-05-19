/*global require: false, module: false, __dirname: false */
'use strict';
var HtmlWebpackPlugin = require('html-webpack-plugin');
var webpack = require('webpack');

module.exports = {
	historyApiFallback: true,
	entry: "./js/bogorouter",
	output: {
		path: "build",
		publicPath: "/",
		filename: "[name].js"
	},
	module: {
		loaders: [
			{ test: /\.js$/, exclude: /node_modules/, loader: 'babel-loader?optional=runtime,cacheDirectory=cache'},
		]
	},
	plugins: [
		new HtmlWebpackPlugin({
			title: "Template Project",
			filename: "index.html",
			template: "page.template"
		}),
		new webpack.OldWatchingPlugin()
	],
	resolve: {
		extensions: ['', '.js', '.json', '.coffee'],
		root: __dirname + "/js"
	}
};
