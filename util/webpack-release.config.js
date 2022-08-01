module.exports = require('./webpack.config')
module.exports.output.filename = '[name].js'
module.exports.mode = 'production'
module.exports.optimization = { minimize: true }
