import { expect, test } from '@jest/globals'
import hmac from './hmac'

test('matches server-generated signature', async () => {
  await expect(hmac('foo', 'bar'))
    .resolves.toBe('f9320baf0249169e73850cd6156ded0106e2bb6ad8cab01b7bbbebe6d1065317')
})
