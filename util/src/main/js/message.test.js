import { test, expect } from '@jest/globals'
import * as endpoint from './message'
import { broadcast } from './global'

test('receives a message', async () => {
  await expect(new Promise((resolve, reject) => {
    endpoint.listen('test', resolve)
    broadcast({ type: 'test', message: 'foo' })
  })).resolves.toBe('foo')
})
