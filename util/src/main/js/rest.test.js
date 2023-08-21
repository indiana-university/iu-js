/**
 * @jest-environment jsdom
 * @jest-environment-options { "url" : "http://localhost:8707/" }
 */
import { beforeAll, afterAll, test, expect } from '@jest/globals'
import fetch, { Request, Response } from 'node-fetch'
import express from 'express'
import http from 'http'
import environment from './environment'
import * as rest from './rest'

if (!globalThis.fetch) {
  globalThis.fetch = fetch
  globalThis.Request = Request
  globalThis.Response = Response
}

let server
beforeAll(() => {
  const app = express()
  app.get('/echo', (req, res) => {
    res.type('text/plain')
    res.send(req.query.v)
  })

  app.get('/missing', (req, res) => {
    res.type('text/html')
    res.status(404)
    res.send(` 
<html>

<head>
    <title>404 NOT FOUND</title>
    <link media="all" rel="stylesheet" href="https://sisjee.iu.edu/essweb-prd/iu-js/6.4/iu.css" />
</head>

<body>
    <header class="rvt-header" role="banner">
        <a class="rvt-skip-link" href="#main-content">Skip to content</a>
        <div class="rvt-header__trident">
            <svg role="img" class="rvt-header__trident-logo" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 41 48" aria-describedby="iu-logo">
                <title id="iu-logo">Indiana University Logo</title>
                <rect width="41" height="48" fill="#900" />
                <polygon points="24.59 12.64 24.59 14.98 26.34 14.98 26.34 27.78 22.84 27.78 22.84 10.9 24.59 10.9 24.59 8.57 16.41 8.57 16.41 10.9 18.16 10.9 18.16 27.78 14.66 27.78 14.66 14.98 16.41 14.98 16.41 12.64 8.22 12.64 8.22 14.98 9.97 14.98 9.97 30.03 12.77 33.02 18.16 33.02 18.16 36.52 16.41 36.52 16.41 39.43 24.59 39.43 24.59 36.52 22.84 36.52 22.84 33.02 28 33.02 31.01 30.03 31.01 14.98 32.78 14.98 32.78 12.64 24.59 12.64"
                    fill="#fff" />
            </svg>
        </div>
        <span class="rvt-header__title">404 NOT FOUND</span>
        <div class="rvt-header__controls">
            <div class="rvt-header-id">
                <div class="rvt-header-id__profile">
                    <span class="rvt-header-id__user"></span>
                </div>
            </div>
        </div>
    </header>

    <div id="wrapper"></div>

    <script type="text/javascript" src="https://sisjee.iu.edu/essweb-prd/iu-js/6.4/iu.js"></script>
    <script type="text/javascript">
        function renderError(s) {
            document.getElementById("wrapper").appendChild(iu.Error(s))
        }
    </script>
    <script>renderError({"nodeId":"adrx/web/header@esjava158.uits.indiana.edu:dgdjp5","requestNumber":"3539832","status":404,"supportPreText":"","supportUrl":"","supportLabel":"","severe":false,"message":"/essweb-prd/web/adrx/header/missing"})</script>
    <script type="text/javascript" src="https://sisjee.iu.edu/essweb-prd/rivet/1.3/rivet.min.js"></script>
</body>

</html>
    `)
  })
  server = http.createServer(app)
  server.listen(8707)

  environment.init({ url: 'http://localhost:8707/', username: 'iu-user' })
})

afterAll(() => {
  if (server) server.close()
})

test('get returns foobar', async () => {
  await expect(rest.ajaxGet('echo', { v: 'foobar' })).resolves.toBe('foobar')
})

test('sisjee 404 error', async () => {
  await rest.ajaxGet('missing').catch(e => {
    expect(e).toStrictEqual({
      message: '/essweb-prd/web/adrx/header/missing',
      nodeId: 'adrx/web/header@esjava158.uits.indiana.edu:dgdjp5',
      reload: false,
      requestNumber: '3539832',
      severe: false,
      status: 404,
      supportLabel: '',
      supportPreText: '',
      supportUrl: ''
    })
  })
})
