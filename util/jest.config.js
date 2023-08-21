module.exports = {
  injectGlobals: false,
  testEnvironment: './iu-jest-environment',
  transformIgnorePatterns: ['/node_modules/(?!(node-fetch|data-uri-to-buffer|fetch-blob|formdata-polyfill)/)']
}
