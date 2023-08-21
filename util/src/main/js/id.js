/*
  Copyright (c), 2023 Indiana University
  All rights reserved.

  Redistribution and use in source and binary forms, with or without
  modification, are permitted provided that the following conditions are met:

  * Redistributions of source code must retain the above copyright notice, this
    list of conditions and the following disclaimer.

  * Redistributions in binary form must reproduce the above copyright notice,
    this list of conditions and the following disclaimer in the documentation
    and/or other materials provided with the distribution.

  * Neither the name of the copyright holder nor the names of its
    contributors may be used to endorse or promote products derived from
    this software without specific prior written permission.

  THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
  AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
  IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
  DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE
  FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL
  DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR
  SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER
  CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY,
  OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
  OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
*/
function getEncodedChar (byte) {
  if (byte === 0) {
    return '_'
  } else if (byte === 1) {
    return '-'
  } else if (byte < 12) {
    // 0 to 9
    return String.fromCharCode(48 + (byte - 2))
  } else if (byte < 38) {
    // A to Z
    return String.fromCharCode(65 + (byte - 12))
  } else {
    return String.fromCharCode(97 + (byte - 38))
  }
}

function getDecodedValue (byte) {
  if (byte === 95) { // '_'
    return 0
  } else if (byte === 45) { // '-'
    return 1
  } else if (byte >= 48 && byte <= 57) {
    // 0 to 9
    return byte - 46
  } else if (byte >= 65 && byte <= 90) {
    return byte - 53
  } else if (byte >= 97 && byte <= 122) {
    return byte - 59
  } else {
    throw new RangeError('Illegal encoding char')
  }
}

function encodeId (raw) {
  let encoded = ''
  let p = 0
  for (let i = 0; i < raw.length; i++) {
    const b0 = raw[i]
    if (p <= 2) {
      encoded += getEncodedChar((b0 >> (2 - p)) & 0x3f)
    }

    const p1 = (p + 4) % 6
    if (p !== 2) {
      const b1 = raw[i + 1]
      encoded += getEncodedChar(((b0 << p1) & 0x3f) + ((b1 >> (8 - p1)) & (Math.pow(2, p1) - 1)))
    }
    p = p1
  }
  return encoded
}

function decodeId (id) {
  if (id.length % 4 !== 0) {
    throw new RangeError('encoded id length must be divisible by 4')
  }

  const raw = new Int8Array(id.length * 3 / 4)
  raw.fill(0)
  let p = 0
  let i = 0
  for (let j = 0; j < id.length; j++) {
    const v = getDecodedValue(id.charCodeAt(j))
    let d = v * Math.pow(2, 2 - p)
    if (d > 127) {
      d -= 256
    }
    raw[i] |= d & 0xff
    p += 6
    if (p >= 8) {
      p -= 8
      i++
      if (p > 0) {
        raw[i] |= (v * Math.pow(2, 8 - p)) & 0xff
      }
    }
  }
  return raw
}

/**
 * Generates a short unqiue identifer, similar to {@link generate},
 * but without embedded verification data. This method is suitable
 * for use with the HTML id attribute.
 */
export function short () {
  const rawId = new Int8Array(6)
  crypto.getRandomValues(rawId)

  const now = Date.now()
  rawId[1] = now & 0xff
  rawId[4] = (now >> 8) & 0xff
  return encodeId(rawId)
}

/**
 * Generates a globally unique identifier with embedded timestamp and
 * verification checksum. This implementation is a direct port of the
 * IU JEE class IdGenerator, and is intended to be interoperable with
 * ids generated on the server side.
 *
 * @returns String
 */
export function generate () {
  const rawId = new Int8Array(24)
  crypto.getRandomValues(rawId)

  const now = BigInt(Date.now())
  rawId[3] = Number(now & 0xffn)
  rawId[9] = Number((now >> 8n) & 0xffn)
  rawId[15] = Number((now >> 16n) & 0xffn)
  rawId[6] = Number((now >> 24n) & 0xffn)
  rawId[12] = Number((now >> 32n) & 0xffn)
  rawId[18] = Number((now >> 40n) & 0xffn)

  const hashView = new DataView(new ArrayBuffer(4))
  hashView.setInt32(0, Number(now))
  for (let i = 1; i < 24; i++) {
    if (i !== 11 && i !== 20) {
      hashView.setInt32(0, (47 * hashView.getInt32(0) + rawId[i]))
    }
  }

  const hash = hashView.getInt32(0)
  rawId[11] = hash & 0xff
  rawId[20] = (hash >> 8) & 0xff
  rawId[0] = (hash >> 16) & 0xff

  return encodeId(rawId)
}

/**
 * Verifies that an identifier was generated using the algorithm
 * implemented in {@link generate}.
 *
 * @param id String identifier
 * @param ttl Number, milliseconds since generation to consider
 *            the identifier valid. Pass 0 (default) to skip
 *            expiration checks.
 */
export function verify (id, ttl = 0) {
  const decoded = decodeId(id)
  if (decoded.length !== 24) {
    throw new Error('Invalid length')
  }

  const s6 = (BigInt(decoded[18]) << 40n) & 0xff0000000000n
  const s5 = (BigInt(decoded[12]) << 32n) & 0xff00000000n
  const s4 = (BigInt(decoded[6]) << 24n) & 0xff000000n
  const s3 = (BigInt(decoded[15]) << 16n) & 0xff0000n
  const s2 = (BigInt(decoded[9]) << 8n) & 0xff00n
  const s1 = BigInt(decoded[3]) & 0xffn
  const s = s6 | s5 | s4 | s3 | s2 | s1

  const now = BigInt(Date.now())
  if (s < 0n || now - s < -1000n) {
    throw new Error('Invalid time signature')
  }

  const ttln = BigInt(ttl)
  if (ttln > 0 && now - s > ttln) {
    throw new Error('Expired time signature')
  }

  const h1 = decoded[11]
  const h2 = decoded[20]
  const h3 = decoded[0]
  const h = (h3 << 16) & 0xff0000 |
    (h2 << 8) & 0xff00 |
    h1 & 0xff
  const hashView = new DataView(new ArrayBuffer(4))
  hashView.setInt32(0, Number(s))
  for (let i = 1; i < 24; i++) {
    if (i !== 11 && i !== 20) {
      const a = hashView.getInt32(0)
      const d = decoded[i]
      hashView.setInt32(0, (47 * a + d))
    }
  }

  const vhash = hashView.getInt32(0) & 0xffffff
  if (h !== vhash) {
    throw new Error('Checksum mismatch')
  }
}
