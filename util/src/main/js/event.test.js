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
import { test, expect } from '@jest/globals'
import { init, subscribe } from './event'
import environment from './environment'

test('subscribe must pass functions', () => {
  expect(() => subscribe()).toThrow()
  expect(() => subscribe('foo', () => 'bar')).toThrow()
  expect(() => subscribe(a => {}, 'bar')).toThrow()
})

test('init only works from environment', () => {
  expect(() => init()).toThrow()
  const destroy = environment.init({ url: 'http://iu-js.server/', username: 'iu-user' })
  try {
    expect(init).toThrow()
  } finally {
    destroy()
  }
  expect(() => init('foobar')).toThrow()
})

test('subscribe only works before init', () => {
  expect(() => subscribe()).toThrow()
  subscribe(() => {})
  const destroy = environment.init({ url: 'http://iu-js.server/', username: 'iu-user' })
  expect(() => subscribe(() => {})).toThrow()
  destroy()
})
