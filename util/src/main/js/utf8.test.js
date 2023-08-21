import { test, expect } from '@jest/globals'
import util from 'util'

Object.defineProperty(global.self, 'TextEncoder', { value: util.TextEncoder })
Object.defineProperty(global.self, 'TextDecoder', { value: util.TextDecoder })
const utf8 = require('./utf8').default

const foobar = [102, 111, 111, 98, 97, 114, 10]

test('needs data', () => {
  expect(utf8).toThrow()
})

test('encode', () => {
  expect(Array.from(utf8('foobar\n'))).toEqual(foobar)
})

test('decode', () => {
  expect(utf8(new Uint8Array(foobar))).toBe('foobar\n')
  const buffer = new ArrayBuffer(7)
  const view = new DataView(buffer)
  for (const i in foobar) view.setUint8(i, foobar[i])
  expect(utf8(buffer)).toBe('foobar\n')
})
