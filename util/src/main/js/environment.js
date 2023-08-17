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
import shortuid from './shortuid'
import * as rivet from './rivet'
import { listen } from './message'

/**
 * Accepts attributes provided by the server at page initialization time, for
 * use with subsequent server interactions.
 */
class Environment {
  #initialized
  #nodeId = shortuid()
  #url
  #username
  #xsrfToken
  #params = {}

  // TODO: #accessToken, for inclusion in HTTP Authorization header

  static #append (params, toAppend) {
    if (!toAppend) return

    const setParam = (name, value) => {
      if (typeof name !== 'string') {
        throw new Error('Invalid param name, expected string')
      }

      if (value === null || typeof value === 'undefined') {
        delete params[name]
      } else if (typeof value === 'string') {
        params[name] = value
      } else {
        throw new Error('Invalid param value, expected string')
      }
    }

    if (toAppend instanceof URLSearchParams) {
      for (const [name, value] of toAppend) {
        setParam(name, value)
      }
    } else if (typeof toAppend === 'object') {
      for (const name in toAppend) {
        setParam(name, toAppend[name])
      }
    } else {
      throw new Error('Invalid search params, expected URLSearchParams or object')
    }
  }

  /**
   * Initializes a page-level environment with attributes from the server.
   *
   * This method may only be called once, at page initialization time, typically
   * prior to any application-level initialization scripts.
   *
   * - url: Base URL for pages and related service endpoints.
   *
   * - username: Principal name for the logged-in user.
   *
   * - xsrfToken: Token generated by the server. For appending to the query string
   *             on POST, PUT, and PATCH requests to protect against cross-site
   *             request forgery attacks.
   *
   * - params: Plain object containing query parameters to append to all URLs.
   *
   * - rivetErrorDialog: Flag indicating whether or not to enable a Rivet-based
   *             error dialog when error events are observed. No effect if Rivet
   *             is not loaded on the page. Default is true.
   *
   * - rivetLoadingIndicator: Flag indicating whether or not to enable a Rivet-
   *             based loading indicator while REST calls are active. No effect
   *             if Rivet is not loaded on the page. Default is true.
   *
   * @param environment Server attributes
   */
  init (environment) {
    if (this.#initialized) {
      throw new Error('Already initialized')
    }

    const { url, username, params, xsrfToken } = environment

    this.#url = new URL(url)

    if (typeof username !== 'string') {
      throw new Error('Missing or invalid username')
    }
    this.#username = username

    Environment.#append(this.#params, params)

    if (typeof xsrfToken === 'string') {
      this.#xsrfToken = xsrfToken
    } else if (xsrfToken) {
      throw new Error('Invalid xsrfToken')
    }

    if (window.Rivet) {
      const { rivetErrorDialog, rivetLoadingIndicator } = environment

      if (rivetErrorDialog !== false) {
        listen('error', e => rivet.openErrorDialog(e))
      }

      if (rivetLoadingIndicator !== false) {
        listen('loading', a => {
          if (a) rivet.showLoadingIndicator()
          else rivet.hideLoadingIndicator()
        })
      }
    }

    this.#initialized = true
  }

  /**
   * Page-level unique identifier, used to identify the browser session
   * on the server side.
   *
   * @returns string
   */
  get nodeId () {
    return this.#nodeId
  }

  /**
   * Base URL for connecting to REST and WebSocket endpoints, and page-
   * level navigation.
   *
   * @returns URL
   */
  get url () {
    return this.#url
  }

  /**
   * Principal name for the logged-in user.
   *
   * @returns string
   */
  get username () {
    return this.#username
  }

  /**
   * Appends query parameters from the environment to the those provided.
   * Parameters defined in the environment will replace any provided with the
   * same name.
   *
   * @param params Plain object with parameters to append, may be null or
   * undefined to return only values defined by the envieonment.
   *
   * @param includeXsrfToken True to append the 'xsrf_token' token value.
   *
   * @returns Combined query string, null if none are provided or defined by
   * the environment
   */
  createSearchParams (params, includeXsrfToken) {
    const query = {}
    Environment.#append(query, params)
    Environment.#append(query, this.#params)

    if (includeXsrfToken) {
      if (!this.#xsrfToken) {
        throw new Error('xsrfToken not initialized')
      } else {
        query.xsrf_token = this.#xsrfToken
      }
    }

    if (Object.keys(query).length === 0) {
      return null
    } else {
      return new URLSearchParams(query)
    }
  }

  /**
   * Gets an absolute URL relative to the application base URL defined by
   * the environment.
   *
   * @param url Relative URL
   *
   * @param params Plain object with parameters to append, may be null or
   * undefined to return only values defined by the envieonment.
   *
   * @param includeXsrfToken True to append the 'xsrf_token' token value to
   * the query string.
   *
   * @returns URL
   */
  getUrl (url, params, includeXsrfToken) {
    const query = {}

    const q = url.indexOf('?')
    if (q !== -1) {
      Environment.#append(query, new URLSearchParams(url.substring(q + 1)))
      url = url.substring(0, q)
    }

    Environment.#append(query, params)

    const searchParams = this.createSearchParams(params, includeXsrfToken)
    if (searchParams) url += '?' + searchParams

    return new URL(url, this.#url)
  }
}

export default new Environment()
