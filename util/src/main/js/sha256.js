import hex from './hex'
import utf8 from './utf8'

/**
 * Calculates a SHA-256 digest.
 *
 * @param data String to be encoded as UTF-8 or BufferSource
 * @returns Promise<String>, resolves to hex-encoded digest
 */
export default async function (data) {
  if (data === null || data === undefined) {
    data = ''
  }

  if (typeof data === 'string') {
    data = utf8(data)
  }

  const digest = await crypto.subtle.digest('SHA-256', data)
  return hex(new Uint8Array(digest))
}
