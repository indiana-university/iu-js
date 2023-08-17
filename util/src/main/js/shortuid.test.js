import shortuid from './shortuid'
import { test, expect } from '@jest/globals'

test('shortuid generates 10000 unique ids', () => {
  console.log(shortuid())
  const ids = new Set()
  for (let i = 0; i < 10000; i++) {
    const id = shortuid()
    expect(ids.has(id)).toBe(false)
    expect(id.length).toBeGreaterThan(3)
    expect(id.length).toBeLessThan(8)
    ids.add(id)
  }
  expect(ids.size).toBe(10000)
})
