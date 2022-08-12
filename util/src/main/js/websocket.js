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
/* globals WebSocket */
import { shortuid } from './util'
import { broadcast, getUrl, getNodeId } from './environment'
import EventStream from './EventStream'

const webSocketClients = {}
const stream = new EventStream()
let pingInterval = 300000

class WebSocketClient {
  #clientId = shortuid()
  #uri
  #socket
  #nonces = []
  #pingTimer
  #closeOfflineDialog
  #pendingMessages = []
  #online = false

  constructor (uri) {
    this.#uri = uri
    this.#connect()
  }

  #sendPendingMessages () {
    const socket = this.#socket
    if (!socket || socket.readyState > WebSocket.OPEN) {
      stream.next({
        error: {
          message: 'A internal error has occurred (invalid socket state).',
          nodeId: getNodeId(),
          severe: true,
          reload: true
        }
      })
    } else { this.#pendingMessages.splice(0).forEach(m => socket.send(JSON.stringify(m))) }
  }

  #ping () {
    const socket = this.#socket
    if (!socket || socket.readyState > WebSocket.OPEN) {
      stream.next({
        error: {
          message: 'A internal error has occurred (invalid socket state).',
          nodeId: getNodeId(),
          severe: true,
          reload: true
        }
      })
    } else {
      const nonce = shortuid()
      this.#nonces.push(nonce)
      socket.send(JSON.stringify({
        message: { clientId: this.#clientId, nodeId: getNodeId(), nonce },
        type: 'ClientPing'
      }))
    }
  }

  #handleServerPing (ping) {
    if (ping.nodeId !== getNodeId()) {
      stream.next({
        error: {
          message: 'A internal error has occurred (node mismatch).',
          nodeId: getNodeId(),
          severe: true,
          reload: true
        }
      })
    } else if (ping.clientId !== this.#clientId) {
      stream.next({
        error: {
          message: 'A internal error has occurred (client ID mismatch).',
          nodeId: getNodeId(),
          severe: true,
          reload: true
        }
      })
    } else {
      const ni = this.#nonces.indexOf(ping.nonce)
      if (ni === -1) {
        stream.next({
          error: {
            message: 'A internal error has occurred (nonce mismatch).',
            nodeId: getNodeId(),
            severe: true,
            reload: true
          }
        })
      } else {
        this.#nonces.splice(ni, 1)
        this.#handleStatus(ping)
        this.#pingTimer = setTimeout(() => this.#ping(), pingInterval)
      }
    }
  }

  #handleStatus (status) {
    this.#online = status.online
    if (!status.online) {
      this.#closeOfflineDialog = stream.next({
        error: {
          message: 'This service is temporarily down for maintenance. Please try again later.',
          nodeId: getNodeId(),
          status: 503
        }
      })
    } else {
      if (this.#closeOfflineDialog) {
        this.#closeOfflineDialog()
        this.#closeOfflineDialog = null
      }
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
        if (s.error) {
          stream.next({
            websocket: {
              uri: this.#uri,
              online: this.#online
            },
            error: s.error
          })
        } else if (s.type === 'ServerPing') {
          this.#handleServerPing(s.message)
          if (oldSocket) {
            if (closeOldSocket) clearTimeout(closeOldSocket)
            oldSocket.close()
          }
        } else if (s.type === 'ServerStatus') this.#handleStatus(s.message)
        else if (s.type === 'SocketReconnect') this.#connect()
        else {
          stream.next({
            websocket: {
              uri: this.#uri,
              online: this.#online
            },
            message: s
          })
          broadcast(s)
        }
      }
    })

    socket.addEventListener('close', e => {
      if (e.code === 1000) {
        console.log('Web Socket closed', e)
      } else {
        console.error('Web Socket closed abnormally', e)
      }

      if (socket !== this.#socket) return
      this.#socket = null
      this.#online = false

      if (this.#pingTimer) {
        clearTimeout(this.#pingTimer)
        this.#pingTimer = null
      }

      if (e.code !== 1000) {
        stream.next({
          error: {
            message: 'Connection closed unexpectedly. ' + e.reason,
            status: e.code,
            nodeId: getNodeId(),
            severe: true,
            reload: true
          },
          pendingMessages: this.#pendingMessages
        })
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

export function subscribe (s) {
  stream.subscribe(s)
}

export function setPingInterval (i) {
  if (i > 0) pingInterval = i
  else stream.error(new Error('Invalid ping interval'))
}

export function open (url, absolute) {
  const uri = getUrl(url, null, absolute).toString().replace(/^http/, 'ws')
  let socket = webSocketClients[uri]
  if (!socket) webSocketClients[uri] = socket = new WebSocketClient(uri)
  return socket
}

export function send (url, message, absolute) {
  open(url, absolute).send(message)
}
