/* global __dirname */

const path = require('path')
const paths = {
	node: path.join(__dirname, 'node_modules'),
	source: path.join(__dirname, 'src/main/js'),
	dest: path.join(__dirname, 'src/main/webapp/iu-js/7.0')
}

module.exports = {
	context: paths.source,
	entry: {
		iu: './index'
	},
	output: {
		filename: '[name]-dev.js',
		path: paths.dest
	},
	resolve: {
		extensions: ['.js'],
		modules: [paths.source, paths.node]
	},
	resolveLoader: {
		modules: [paths.node]
	},
	devtool: 'source-map',
	mode: 'development',
	module: {
		rules: [
			{
				test: /\.js$/,
				include: [
					paths.source
				],
				use: {
					loader: 'babel-loader',
					options: {
						presets: ['@babel/env'],
						plugins: ['@babel/plugin-transform-runtime']
					}
				}
			}
		]
	}
}
