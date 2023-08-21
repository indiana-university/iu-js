import environment from './environment'
import { jest, test, expect } from '@jest/globals'
import * as id from './id'
import { listen } from './message'

const url = 'http://iu-js.server/'
const username = 'iu-user'

test('url and username are required', () => {
  expect(() => environment.init()).toThrow()
  expect(() => environment.init({})).toThrow()
  expect(() => environment.init({ url })).toThrow()
  expect(() => environment.init({ username })).toThrow()
  expect(() => environment.url).toThrow()
  expect(() => environment.username).toThrow()

  const destroy = environment.init({ url, username })
  expect(environment.url.toString()).toBe(url)
  expect(environment.username).toBe(username)
  destroy()
})

test('can only init once', () => {
  const destroy = environment.init({ url, username })
  expect(() => environment.init({ url, username })).toThrow()
  destroy()
})

test('params', () => {
  expect(() => environment.init({ url, username, params: true })).toThrow()
  expect(() => environment.init({ url, username, params: { foo: null } })).toThrow()
  const destroy = environment.init({ url, username, params: { foo: 'bar' } })
  expect(environment.getUrl('').toString()).toEqual(url + '?foo=bar')
  destroy()
})

test('xsrfToken', () => {
  expect(() => environment.init({ url, username, xsrfToken: true })).toThrow()
  const xsrfToken = id.generate()
  const destroy = environment.init({ url, username, xsrfToken })
  expect(environment.getUrl('').toString()).toEqual(url)
  expect(environment.getUrl('', undefined, true).toString()).toEqual(url + '?xsrf_token=' + xsrfToken)
  destroy()
})

test('accessToken', () => {
  expect(() => environment.init({ url, username, accessToken: true })).toThrow()
  expect(() => environment.accessToken).toThrow()
  const accessToken = id.generate()
  const destroy = environment.init({ url, username, accessToken })
  expect(environment.accessToken).toEqual(accessToken)
  destroy()
})

test('init events', () => {
  expect(new Promise((resolve, reject) => {
    const ignore = listen('environment', resolve)
    environment.init({ url, username })
    ignore()
  })).resolves.toStrictEqual(environment)
})

// import shortuid from './shortuid'
// import { broadcast } from './global'
// import * as rivet from './rivet'

// const xsrfToken = shortuid()
// window.Rivet = true

// jest.mock('./rivet')

// test('init', () => {
//   expect(environment.init).toThrow()
//   expect(() => environment.init({})).toThrow()
//   expect(() => environment.init({ url })).toThrow()
//   expect(() => environment.init({ username })).toThrow()
//   expect(() => environment.init({ url, username, xsrfToken: {} })).toThrow()
//   const env = { url, username, xsrfToken }
//   environment.init(env)
//   expect(() => environment.init(env)).toThrow()
// })

// test('url', () => {
//   expect(environment.url).toEqual(new URL('http://iu-js.server/'))
// })

// test('username', () => {
//   expect(environment.username).toBe('iu-user')
// })

// test('nodeId', () => {
//   expect(environment.nodeId).toMatch(/\w{4,8}/)
// })

// test('rivets', () => {
//   broadcast({ type: 'loading', message: true })
//   expect(rivet.showLoadingIndicator).toHaveBeenCalled()
//   broadcast({ type: 'loading', message: false })
//   expect(rivet.hideLoadingIndicator).toHaveBeenCalled()

//   const error = {}
//   broadcast({ type: 'error', message: error })
//   expect(rivet.openErrorDialog).toHaveBeenCalledWith(error)
// })

// test('urls', () => {
//   expect(environment.getUrl('foo')).toEqual(new URL('https://iu-js.server/foo'))
//   expect(environment.getUrl('foo', null, true)).toEqual(new URL('https://iu-js.server/foo?xsrf_token=' + xsrfToken))
//   expect(environment.getUrl('foo?bar=baz')).toEqual(new URL('https://iu-js.server/foo?bar=baz'))
//   expect(environment.getUrl('foo', { bar: 'baz' })).toEqual(new URL('https://iu-js.server/foo?bar=baz'))
// })
