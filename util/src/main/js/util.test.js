/* globals test, expect */
import * as util from './util'

test('shortuid generates 1000 unique ids', () => {
  const ids = new Set()
  for (let i = 0; i < 1000; i++) {
    const id = util.shortuid()
    expect(ids.has(id)).toBe(false)
    ids.add(id)
  }
  expect(ids.size).toBe(1000)
})

test('object has not changed to same object', () => {
  const o = {}
  expect(util.hasChanged(o, o)).toBe(false)
})

test('object has not changed to undefined', () => {
  expect(util.hasChanged({})).toBe(false)
})

test('object has changed to null', () => {
  expect(util.hasChanged({}, null)).toBe(true)
})

test('null has changed to object', () => {
  expect(util.hasChanged(null, {})).toBe(true)
})
