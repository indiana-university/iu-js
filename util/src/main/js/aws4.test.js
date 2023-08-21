import { test, expect } from '@jest/globals'
import * as aws4 from './aws4'

test('date formats', () => {
  const date = new Date('2023-04-05T17:34:00Z')
  expect(date.getTime()).toBe(1680716040000)
  expect(date.toUTCString()).toBe('Wed, 05 Apr 2023 17:34:00 GMT')
  let datestamp = date.getUTCFullYear()
  const m = date.getUTCMonth() + 1
  if (m < 10) datestamp += '0'
  datestamp += m
  const d = date.getUTCDate()
  if (d < 10) datestamp += '0'
  datestamp += d
  expect(datestamp).toBe('20230405')
})

test('uri encode', () => {
  expect(aws4.uriEncode()).toBe('')
  expect(aws4.uriEncode('-.0123456789_ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefhijklmnopqrstuvwxyz~'))
    .toBe('-.0123456789_ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefhijklmnopqrstuvwxyz~')
  expect(aws4.uriEncode('foobar')).toBe('foobar')
  expect(aws4.uriEncode('foo bar')).toBe('foo%20bar')
  expect(aws4.uriEncode('foo+bar')).toBe('foo%2Bbar')
  expect(aws4.uriEncode('"foobar"')).toBe('%22foobar%22')
  expect(aws4.uriEncode('foobar\r\n')).toBe('foobar%0D%0A')
})
