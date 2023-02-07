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
/* globals XMLHttpRequest */
import { getUrl, broadcast } from './environment'
import EventStream from './EventStream'

const stream = new EventStream()

export function subscribe (s) {
  stream.subscribe(s)
}

export class RestClient {
  #url
  #reload

  constructor (url, params, absolute, reload) {
    this.#url = getUrl(url, params, absolute)
    this.#reload = !!reload
  }

  #handleServerError (xhr, call, request) {
    let error
    try {
      if (xhr.responseText) {
        if (xhr.responseText.indexOf('<html') !== -1) {
          const responseElement = document.createElement('html')
          responseElement.innerHTML = xhr.responseText
          const responseScriptTags = responseElement.querySelectorAll('body>script')
          if (responseScriptTags) {
            for (let i = responseScriptTags.length - 1; i >= 0; i--) {
              const responseScriptTag = responseScriptTags.item(i)
              try {
                const scriptTagContent = responseScriptTag.textContent
                if (scriptTagContent &&
                      scriptTagContent.startsWith('renderError({') &&
                      scriptTagContent.endsWith('})')) {
                  error = JSON.parse(scriptTagContent.slice(12, scriptTagContent.length - 1))
                }
              } catch (e) {
                call.error(e)
              }
            }
          }
        } else error = JSON.parse(xhr.responseText)
      }
    } catch (e) {
      call.error(e)
    }

    if (!error) error = { status: xhr.status }

    error.reload = this.#reload
    stream.next({
      request,
      stop: true,
      error
    })
  }

  #handleServerResponse (xhr, call, request, responseContentType) {
    let response
    try {
      const { responseText } = xhr
      if (responseContentType === 'application/json') {
        response = JSON.parse(responseText)
      } else if (responseContentType === 'text/html') {
        const responseElement = document.createElement('html')
        responseElement.outerHTML = xhr.responseText
        response = responseElement
      } else response = responseText

      call.next(response)
      broadcast(response)

      stream.next({
        xhr,
        request,
        stop: true
      })
    } catch (e) {
      call.error(e)
      stream.next({
        xhr,
        request,
        error: {
          message: 'An internal error has occurred.',
          severe: true,
          reload: this.#reload
        },
        stop: true
      })
    }
  }

  send (method, data, contentType) {
    const xhr = new XMLHttpRequest()
    const call = new EventStream()
    const methodAcceptsContent = method === 'POST' || method === 'PUT' || method === 'PATCH'

    let url = this.#url
    if (data && !methodAcceptsContent) {
      const searchData = new URLSearchParams(data)
      if (url.search) url = new URL(url + '&' + searchData)
      else url = new URL(url + '?' + searchData)
      data = null
    }

    const request = { url, method, data, contentType }

    xhr.open(method, url)

    if (methodAcceptsContent && contentType) {
      xhr.setRequestHeader('Content-Type', contentType)
      if (typeof data === 'object') {
        if (contentType === 'application/json') {
          data = JSON.stringify(data)
        } else if (contentType === 'application/x-www-form-urlencoded') {
          data = new URLSearchParams(data).toString()
        }
      }
    }

    let responseContentType
    xhr.onreadystatechange = () => {
      switch (xhr.readyState) {
        case 2:
          xhr.getAllResponseHeaders().trim().split(/[\r\n]+/).forEach(h => {
            if (h.toLowerCase().indexOf('content-type: ') === 0) {
              let t = h.substring(14)
              const i = t.indexOf(';')
              if (i !== -1) t = t.substring(0, i)
              responseContentType = t
            }
          })
          break

        case 4:
          if (xhr.status >= 400) this.#handleServerError(xhr, call, request)
          else this.#handleServerResponse(xhr, call, request, responseContentType)

          call.complete()

          break
      }
    }

    stream.next({
      xhr,
      request,
      start: true
    })

    xhr.send(data)
    return call
  }

  get (data, contentType, reload = false) {
    return this.send('GET', data, contentType, reload)
  }

  post (data, contentType, reload = false) {
    return this.send('POST', data, contentType, reload)
  }

  put (data, contentType, reload = false) {
    return this.send('PUT', data, contentType, reload)
  }

  patch (data, contentType, reload = false) {
    return this.send('PATCH', data, contentType, reload)
  }

  delete (data, contentType, reload = false) {
    return this.send('DELETE', data, contentType, reload)
  }
}

export function ajaxGet (url, params, reload) {
  return new RestClient(url).get(params, null, reload)
}

export function ajaxPost (url, data, reload) {
  return new RestClient(url).post(JSON.stringify(data), 'application/json', reload)
}

export function ajaxFile (url, data, reload) {
  return new RestClient(url).post(data, null, reload)
}

export function ajaxPut (url, data, reload) {
  return new RestClient(url).put(JSON.stringify(data), 'application/json', reload)
}

export function ajaxDelete (url, params, reload) {
  return new RestClient(url).delete(params, null, reload)
}
