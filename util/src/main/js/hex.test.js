import { test, expect } from '@jest/globals'
import hex from './hex'

const foobar = [102, 111, 111, 98, 97, 114, 10]

test('needs data', () => {
  expect(hex).toThrow()
})

test('bytes', () => {
  expect(hex(0)).toBe('00')
  expect(hex(15)).toBe('0f')
  expect(hex(255)).toBe('ff')
  expect(() => hex(-1)).toThrow()
  expect(() => hex(256)).toThrow()
})

test('encode', () => {
  expect(hex(new Uint8Array(foobar))).toBe('666f6f6261720a')
})

test('decode', () => {
  expect(() => hex('0')).toThrow()
  expect(() => hex('foobar')).toThrow()
  expect(Array.from(hex('666f6f6261720a'))).toEqual(foobar)
})
