/**
 * @jest-environment jsdom
 */
import { beforeEach, afterEach, test, expect } from '@jest/globals'
import WS from 'jest-websocket-mock'
import * as environment from './environment'
import * as websocket from './websocket'
import { listen } from './message'
import { shortuid } from './util'

const remoteNodeId = shortuid()
let server
beforeEach(() => {
  server = new WS('ws://iu-js.server/test-sock')
  environment.init({ applicationUrl: 'http://iu-js.server/' })
})

afterEach(() => {
  server.close()
  WS.clean()
})

function handlePing (clientPing, online) {
  const serverPing = {
    type: 'ServerPing',
    message: {
      ...clientPing.message,
      online,
      remoteNodeId
    }
  }
  server.send(JSON.stringify(serverPing))
}

test('send foo receive bar', async () => {
  const messageToEcho = { type: 'test', message: 'foo' }
  websocket.send('test-sock', messageToEcho)

  await server.connected
  const clientPing = JSON.parse(await server.nextMessage)
  expect(clientPing.type).toBe('ClientPing')
  handlePing(clientPing, true)

  const received = JSON.parse(await server.nextMessage)
  expect(received).toStrictEqual(messageToEcho)

  await expect(new Promise((resolve, reject) => {
    listen('test', a => resolve(a))
    listen('error', e => reject(e))
    server.send(JSON.stringify(received))
  })).resolves.toBe('foo')
})
