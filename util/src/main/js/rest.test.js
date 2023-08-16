/**
 * @jest-environment jsdom
 * @jest-environment-options {"url" : "http://localhost:8707/"}
 */
import { beforeEach, afterEach, test, expect } from '@jest/globals'
import express from 'express'
import http from 'http'
import * as environment from './environment'
import * as rest from './rest'

let server
beforeEach(() => {
  const app = express()
  app.get('/echo', (req, res) => {
    res.type('text/plain')
    res.send(req.query.v)
  })
  server = http.createServer(app)
  server.listen(8707)

  environment.init({ applicationUrl: 'http://localhost:8707/' })
})

afterEach(() => {
  if (server) server.close()
})

test('get returns foobar', async () => {
  await expect(rest.ajaxGet('echo', { v: 'foobar' })).resolves.toBe('foobar')
})
