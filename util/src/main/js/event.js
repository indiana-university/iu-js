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
import environment from './environment'

let deferred

/**
 * Global event stream.
 *
 * Allows application modules to subscribe to global broadcast events prior to
 * page initialization time. Subscribers may also register shutdown hooks to
 * be called when the page is destroyed.
 */
class EventStream {
  #subscribers = []
  #initialized

  constructor () {
    if (deferred) {
      deferred.forEach(subscriber => {
        const { notify, destroy } = subscriber
        this.subscribe(notify, destroy)
      })
      deferred = undefined
    }
  }

  init (nodeId) {
    if (this.#initialized) {
      throw new Error('Already initialized')
    }

    let environmentNode
    try {
      environmentNode = environment.nodeId
    } catch (e) {
      console.error(e)
      environmentNode = null
    }

    if (nodeId !== environmentNode) {
      throw new Error('Must be called from environment.init()')
    }

    this.#initialized = true
    return this
  }

  destroy () {
    while (this.#subscribers.length > 0) {
      const subscriber = this.#subscribers.pop()
      try {
        subscriber.destroy()
      } catch (e) {
        console.log(e)
      }
    }

    this.#initialized = false
  }

  subscribe (notify, destroy) {
    if (this.#initialized) {
      throw new Error('Already initialized')
    }

    if (notify && typeof notify !== 'function') {
      throw new Error('Invalid subscriber, notify must be a function')
    }

    if (destroy && typeof destroy !== 'function') {
      throw new Error('Invalid subscriber, destroy must be a function')
    }

    if (notify || destroy) {
      this.#subscribers.push({ notify, destroy })
    } else {
      throw new Error('Invalid subscriber, expected notify and/or destroy function(s)')
    }
  }

  broadcast (type, message, remote) {
    for (const subscriber of this.#subscribers) {
      subscriber.notify({ type, message, remote })
    }
  }
}

const eventStream = new EventStream()

export function init (nodeId) {
  return eventStream.init(nodeId)
}

export function subscribe (notify, destroy) {
  if (!eventStream) {
    if (!deferred) deferred = []
    deferred.push({ notify, destroy })
  } else {
    eventStream.subscribe(notify, destroy)
  }
}
