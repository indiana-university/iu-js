import utf8 from './utf8'
import hex from './hex'

export default async function (key, data) {
  if (typeof data !== 'string') {
    throw new TypeError('Invalid data, expected String')
  }

  const secretKey = await crypto.subtle
    .importKey('raw', utf8(key), {
      name: 'HMAC',
      hash: 'SHA-256'
    }, false, ['sign'])

  return hex(new Uint8Array(
    await crypto.subtle.sign('HMAC', secretKey, utf8(data))))
}
