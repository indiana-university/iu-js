/**
 * @jest-environment jsdom
 */
import environment from './environment'
import { jest, test, expect } from '@jest/globals'
import shortuid from './shortuid'
import { broadcast } from './global'
import * as rivet from './rivet'

const url = 'http://iu-js.server/'
const username = 'iu-user'
const xsrfToken = shortuid()
window.Rivet = true

jest.mock('./rivet')

test('init', () => {
  expect(environment.init).toThrow()
  expect(() => environment.init({})).toThrow()
  expect(() => environment.init({ url })).toThrow()
  expect(() => environment.init({ username })).toThrow()
  expect(() => environment.init({ url, username, xsrfToken: {} })).toThrow()
  const env = { url, username, xsrfToken }
  environment.init(env)
  expect(() => environment.init(env)).toThrow()
})

test('url', () => {
  expect(environment.url).toEqual(new URL('http://iu-js.server/'))
})

test('username', () => {
  expect(environment.username).toBe('iu-user')
})

test('nodeId', () => {
  expect(environment.nodeId).toMatch(/\w{4,8}/)
})

test('rivets', () => {
  broadcast({ type: 'loading', message: true })
  expect(rivet.showLoadingIndicator).toHaveBeenCalled()
  broadcast({ type: 'loading', message: false })
  expect(rivet.hideLoadingIndicator).toHaveBeenCalled()

  const error = {}
  broadcast({ type: 'error', message: error })
  expect(rivet.openErrorDialog).toHaveBeenCalledWith(error)
})

test('urls', () => {
  expect(environment.getUrl('foo')).toEqual(new URL('https://iu-js.server/foo'))
  expect(environment.getUrl('foo', null, true)).toEqual(new URL('https://iu-js.server/foo?xsrf_token=' + xsrfToken))
  expect(environment.getUrl('foo?bar=baz')).toEqual(new URL('https://iu-js.server/foo?bar=baz'))
  expect(environment.getUrl('foo', { bar: 'baz' })).toEqual(new URL('https://iu-js.server/foo?bar=baz'))
})
