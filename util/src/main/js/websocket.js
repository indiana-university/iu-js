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
import { broadcast } from './environment'
import EventStream from './EventStream'

const stream = new EventStream()

class WebSocketClient {
    constructor(uri, pingInterval = 300000) {
        this.uri = uri
        this.pingInterval = pingInterval
        this.pendingMessages = []
        this.online = false
        this.connect()
    }

    sendPendingMessages() {
        const { socket, pendingMessages } = this
        if (!socket || socket.readyState > WebSocket.OPEN)
            errorDialog({
                message: "A internal error has occurred (invalid socket state).",
                nodeId: environment.nodeId, severe: true, reload: true
            })
        else
            pendingMessages.splice(0).forEach(m => socket.send(JSON.stringify(m)))
    }

    ping() {
        const { socket } = this
        if (!socket || socket.readyState > WebSocket.OPEN)
            errorDialog({
                message: "A internal error has occurred (invalid socket state).",
                nodeId: environment.nodeId, severe: true, reload: true
            })
        else {
            this.nonce = shortuid()
            socket.send(JSON.stringify({
                message: { nodeId: environment.nodeId, nonce: this.nonce },
                type: 'ClientPing'
            }))
        }
    }

    send(message) {
        const { online, pendingMessages, socket } = this
        if (!online) pendingMessages.push(message)
        else socket.send(JSON.stringify(message))
    }

    handleServerPing(ping) {
        if (ping.nodeId !== environment.nodeId) errorDialog({
            message: "A internal error has occurred (node mismatch).",
            nodeId: environment.nodeId, severe: true, reload: true
        })
        else if (ping.nonce !== environment.nonce) errorDialog({
            message: "A internal error has occurred (nonce mismatch).",
            nodeId: environment.nodeId, severe: true, reload: true
        })
        else {
            this.nonce = null
            this.handleStatus(ping)
        }
    }

    handleStatus(status) {
        this.online = status.online
        if (!status.online) this.closeOfflineDialog = errorDialog({
            message: "This service is temporarily down for maintenance. Please try again later.",
            nodeId: environment.nodeId, status: 503
        })
        else {
            if (this.closeOfflineDialog) {
                this.closeOfflineDialog()
                delete this.closeOfflineDialog
            }
            this.sendPendingMessages()
        }
    }

    connect() {
        let oldSocket = this.socket
        const closeOldSocket = oldSocket && setTimeout(() => {
            oldSocket.close()
            oldSocket = null
        }, 15000)

        const socket = new WebSocket(this.uri)

        socket.addEventListener('open', () => {
            this.ping()
            if (this.pingInterval > 0)
                this.pingTimer = setInterval(() => this.ping(), this.pingInterval)
        })

        socket.addEventListener('message', d => {
            const s = JSON.parse(d.data)
            if (s) {
                if (s.error) {
                    stream.next({
                        websocket: {
                            uri: this.uri,
                            online: this.online
                        },
                        error: s.error
                    })
                } else if (s.type === 'ServerPing') {
                    this.handleServerPing(s.message)
                    if (oldSocket) {
                        if (closeOldSocket) clearTimeout(closeOldSocket)
                        oldSocket.close()
                    }
                }
                else if (s.type === 'ServerStatus') this.handleStatus(s.message)
                else if (s.type === 'SocketReconnect') this.connect()
                else {
                    stream.next({
                        websocket: {
                            uri: this.uri,
                            online: this.online
                        },
                        message: s
                    })
                    broadcast.next(s)
                }
            }
        })

        socket.addEventListener('close', e => {
            if (this.pingTimer && socket === this.socket) {
                clearInterval(this.pingTimer)
                delete this.pingTimer
            }
            if (!e.wasClean) errorDialog({
                message: "Connection closed unexpectedly. " + e.reason,
                status: e.code, nodeId: environment.nodeId, severe: true, reload: true
            })
        })

        this.socket = socket
    }
}

const webSocketClients = {}

export function subscribe(s) {
	stream.subscribe(s)
}

export function send(url, message, pingInterval = 300000, absolute) {
    const uri = getUrl(url, null, absolute).replace(/^http/, 'ws')
    let socket = webSocketClients[uri]
    if (!socket) socket = new WebSocketClient(uri, pingInterval)
    socket.send(message)
}
