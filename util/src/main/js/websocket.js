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
/* globals WebSocket */
import shortuid from './shortuid'
import environment from './environment'
import { broadcast } from './event'

const webSocketClients = {}
let pingInterval = 300000

function handleError (message, status, severe = true, reload = severe) {
  broadcast({
    type: 'error',
    message: { message, nodeId: environment.nodeId, status, severe, reload }
  })
}

class WebSocketClient {
  #clientId = shortuid()
  #uri
  #socket
  #nonces = []
  #pingTimer
  #reconnectNonces = []
  #pendingMessages = []
  #online = false

  constructor (uri) {
    this.#uri = uri
    this.#connect()
  }

  #sendPendingMessages () {
    const socket = this.#socket
    if (!socket || socket.readyState > WebSocket.OPEN) {
      handleError('An internal error has occurred (invalid socket state).')
    } else {
      this.#pendingMessages.splice(0).forEach(m => socket.send(JSON.stringify(m)))
    }
  }

  #ping () {
    const socket = this.#socket
    if (!socket || socket.readyState > WebSocket.OPEN) {
      handleError('An internal error has occurred (invalid socket state).')
    } else {
      const nonce = shortuid()
      this.#nonces.push(nonce)
      socket.send(JSON.stringify({
        message: { clientId: this.#clientId, nodeId: environment.nodeId, nonce },
        type: 'ClientPing'
      }))
    }
  }

  #handleServerPing (ping) {
    if (ping.nodeId !== environment.nodeId) {
      handleError('An internal error has occurred (node mismatch).')
    } else if (ping.clientId !== this.#clientId) {
      handleError('An internal error has occurred (client ID mismatch).')
    } else {
      const ni = this.#nonces.indexOf(ping.nonce)
      if (ni === -1) {
        handleError('An internal error has occurred (nonce mismatch).')
      } else {
        this.#nonces.splice(ni, 1)
        this.#handleStatus(ping)
        this.#pingTimer = setTimeout(() => {
          const socket = this.#socket
          if (socket && socket.readyState === WebSocket.OPEN) this.#ping()
        }, pingInterval)
      }
    }
  }

  #handleStatus (status) {
    this.#online = status.online
    if (!status.online) {
      handleError(
        'This service is temporarily down for maintenance. Please try again later.',
        503, false)
    } else {
      this.#sendPendingMessages()
    }
  }

  #connect () {
    let oldSocket = this.#socket
    const closeOldSocket = oldSocket && setTimeout(() => {
      oldSocket.close()
      oldSocket = null
    }, 15000)

    const socket = new WebSocket(this.#uri)

    socket.addEventListener('open', () => {
      this.#ping()
    })

    socket.addEventListener('message', d => {
      const s = JSON.parse(d.data)
      if (s) {
        broadcast({
          type: 'websocket',
          message: {
            uri: this.#uri,
            online: this.#online,
            payload: s
          },
          remote: a => this.send(a)
        })

        if (s.error) {
          broadcast({ type: 'error', message: s.error })
        } else if (s.type === 'ServerPing') {
          this.#handleServerPing(s.message)
          if (oldSocket) {
            if (closeOldSocket) clearTimeout(closeOldSocket)
            oldSocket.close()
          }
        } else if (s.type === 'ServerStatus') {
          this.#handleStatus(s.message)
        } else if (s.type === 'SocketReconnect') {
          const { nonce } = s.message
          // TODO is this verified??
          if (this.#reconnectNonces.indexOf(nonce) === -1) {
            this.#reconnectNonces.push(nonce)
            this.#connect()
            this.#reconnectNonces.splice(this.#reconnectNonces.indexOf(nonce), 1)
          }
        } else if (s.type && s.message) {
          broadcast({
            type: s.type,
            message: s.message,
            remote: a => this.send(a)
          })
        }
      }
    })

    socket.addEventListener('close', e => {
      if (socket !== this.#socket) return
      this.#socket = null
      this.#online = false

      if (this.#pingTimer) {
        clearTimeout(this.#pingTimer)
        this.#pingTimer = null
      }

      if (e.code !== 1000) {
        handleError('Connection closed unexpectedly. ' + e.reason, e.code)
      }
    })

    this.#socket = socket
  }

  send (message) {
    if (!this.#online) {
      this.#pendingMessages.push(message)
      if (!this.#socket) this.#connect()
    } else {
      this.#socket.send(JSON.stringify(message))
    }
  }
}

export function setPingInterval (i) {
  if (i > 0) pingInterval = i
  else throw new Error('Invalid ping interval')
}

export function open (url) {
  const uri = environment.getUrl(url).toString().replace(/^http/, 'ws')
  let socket = webSocketClients[uri]
  if (!socket) webSocketClients[uri] = socket = new WebSocketClient(uri)
  return socket
}

export function send (url, message) {
  open(url).send(message)
}
