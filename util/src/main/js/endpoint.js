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
import { subscribe } from './global'

class MessageEndpoint {
  #last
  #listeners = new Set()

  listen (listener) {
    if (typeof listener !== 'function') {
      throw new Error('Missing or invalid listener, expected Function')
    }

    if (this.#last) {
      const { message, remote } = this.#last
      listener(message, remote)
    }

    this.#listeners.add(listener)
    return () => this.#listeners.delete(listener) && this.#listeners.size === 0
  }

  receive (message, remote) {
    if (remote && typeof remote !== 'function') {
      throw new Error('Invalid remote, expected Function')
    }

    this.#listeners.forEach(listener => listener(message, remote))
    this.#last = { message, remote }
  }
}

class Index {
  #active = new Map()

  prune (type) {
    this.#active.delete(type)
  }

  get (type, create) {
    if (!type || typeof type !== 'string') {
      throw new Error('Missing or invalid type')
    }

    let messageEndpoint = this.#active.get(type)
    if (!messageEndpoint && create) {
      messageEndpoint = new MessageEndpoint(type)
      this.#active.put(type, messageEndpoint)
    }
    return messageEndpoint
  }
}

const index = new Index()

subscribe(data => {
  const { type, message, remote } = data
  if (!type) return

  const messageEndpoint = index.get(type)
  if (!messageEndpoint) return

  messageEndpoint.receive(message, remote)
})

export function listen (type, listener) {
  const messageEndpoint = index.get(type, true)
  const stop = messageEndpoint.listen(listener)
  return () => {
    if (stop()) index.prune(type)
  }
}
