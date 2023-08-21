import { test, expect } from '@jest/globals'
import sha256 from './sha256'

test('sha-256', async () => {
  await expect(sha256('foobar'))
    .resolves.toBe('c3ab8ff13720e8ad9047dd39466b3c8974e592c2fa383d4a3960714caef0c4f2')
  await expect(sha256())
    .resolves.toBe('e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855')
})
