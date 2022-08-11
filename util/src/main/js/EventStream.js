/*
  Copyright (c), 2022 Indiana University
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
export default class EventStream {
  constructor () {
    this.listeners = []
  }

  next (o) {
    if (!this.listeners) { throw new Error('EventStream completed') }

    this.last = o
    delete this.lastError

    this.listeners.forEach(s => {
      if (s.next) {
        try {
          s.next(o)
        } catch (e) {
          if (s.error) { s.error(e) } else { console.error(e) }
        }
      }
    })
  }

  error (e) {
    if (!this.listeners) { throw new Error('EventStream completed') }

    delete this.last
    this.lastError = e

    let one = false
    this.listeners.forEach(s => {
      if (s.error) {
        try {
          s.error(e)
          one = true
        } catch (e2) {
          console.error(e2)
        }
      }
    })
    if (!one) console.error(e)
  }

  complete () {
    const { listeners } = this
    delete this.listeners
    if (listeners) {
      listeners.forEach(s => {
        if (s.complete) {
          try {
            s.complete()
          } catch (e) {
            if (s.error) { s.error(e) } else { console.error(e) }
          }
        }
      })
    }
  }

  subscribe (subscriber) {
    if (typeof subscriber === 'function') { subscriber = { next: subscriber } }

    if (this.last && subscriber.next) { subscriber.next(this.last) }
    if (this.lastError && subscriber.error) { subscriber.error(this.lastError) }
    if (!this.listeners) {
      if (subscriber.complete) { subscriber.complete() }
      return null
    }

    if (this.listeners) this.listeners.push(subscriber)

    const children = []
    return {
      add: c => children.push(c),
      remove: c => {
        const i = children.indexOf(c)
        if (i !== -1) children.splice(i, 1)
      },
      unsubscribe: () => {
        const { listeners } = this
        if (listeners) {
          const i = listeners.indexOf(subscriber)
          if (i !== -1) listeners.splice(i, 1)
        }
        children.forEach(c => c.unsubscribe())
      }
    }
  }
}
