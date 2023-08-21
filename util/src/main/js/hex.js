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
function encode (byte) {
  if (byte < 0 || byte > 255) {
    throw new RangeError('Expected byte (0-255)')
  }

  if (byte < 16) {
    return '0' + byte.toString(16)
  } else {
    return byte.toString(16)
  }
}

function isHex (byte) {
  return (
    (byte >= 48 && byte <= 57) || // '0' through '9'
    (byte >= 65 && byte <= 70) || // 'A' through 'F'
    (byte >= 97 && byte <= 102) // 'a' through 'f'
  )
}

function decode (encodedByte) {
  if (!isHex(encodedByte.charCodeAt(0)) || !isHex(encodedByte.charCodeAt(1))) {
    throw new RangeError('Expected encoded byte (00-ff)')
  }
  return Number.parseInt(encodedByte, 16)
}

/**
 * Converts between binary and hex encoded data
 *
 * @param data String to decode or Uint8Array to encode
 * @returns Decoded Uint8Array or encoded String
 */
export default function (data) {
  if (typeof data === 'number') {
    return encode(data)
  }

  if (ArrayBuffer.isView(data)) {
    let encoded = ''
    for (const byte of data) {
      encoded += encode(byte)
    }
    return encoded
  }

  if (typeof data === 'string') {
    if (data.length % 2 === 1) {
      throw new TypeError('Length must be even')
    }

    const decoded = []
    for (let i = 0; i < data.length; i += 2) {
      decoded.push(decode(data.substring(i, i + 2)))
    }
    return new Uint8Array(decoded)
  }

  throw new TypeError('Expected String to decode or BufferSource to encode')
}
