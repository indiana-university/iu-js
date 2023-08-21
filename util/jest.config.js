module.exports = {
  injectGlobals: false,
  testMatch: ['**/src/test/js/**/*.test.js'],
  modulePaths: ['<rootDir>/src/main/js'],
  testEnvironment: './iu-jest-environment',
  transformIgnorePatterns: ['/node_modules/(?!(node-fetch|data-uri-to-buffer|fetch-blob|formdata-polyfill)/)']
}
