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
import { shortuid } from './util'
import * as rivet from './rivet'
import { listen } from './message'

const environment = {
  applicationUrl: null,
  nodeId: shortuid(),
  authParams: {},
  rivetErrorDialog: true,
  rivetLoadingIndicator: true
}

export function init (env) {
  const a = {}
  for (const n in env) {
    if (n === 'authParams') {
      const { authParams } = env
      for (const o in authParams) {
        environment.authParams[o] = authParams[o]
      }
    } else if (Object.prototype.hasOwnProperty.call(environment, n)) {
      environment[n] = env[n]
    } else {
      a[n] = env[n]
    }
  }

  if (window.Rivet) {
    if (environment.rivetErrorDialog) {
      listen('error', rivet.openErrorDialog)
    }
    if (environment.rivetLoadingIndicator) {
      listen('loading', a => {
        if (a) rivet.showLoadingIndicator()
        else rivet.hideLoadingIndicator()
      })
    }
  }
}

export function getNodeId () {
  return environment.nodeId
}

export function getApplicaitonUrl () {
  return environment.applicationUrl
}

export function getParam (name) {
  return environment.authParams[name]
}

export function setParam (name, value) {
  if (value == null) { delete environment.authParams[name] } else { environment.authParams[name] = value }
}

export function createSearchParams (params) {
  const query = { ...params }
  for (const n in environment.authParams) {
    query[n] = environment.authParams[n]
  }
  if (Object.keys(query).length === 0) return null
  else return new URLSearchParams(query)
}

export function getUrl (url, params, absolute) {
  let base
  if (!absolute) {
    base = environment.applicationUrl
    if (base.lastIndexOf('/') !== base.length - 1) base += '/'
  }

  const query = createSearchParams(params)
  const externalForm = query ? url + '?' + query : url
  return new URL(externalForm, base)
}

export function updateLocation (url, params, absolute) {
  window.history.pushState({}, '', getUrl(url, params, absolute))
}

export function popup (url, params, absolute) {
  window.open(getUrl(url, params, absolute))
}

export function navigateTo (url, params, absolute) {
  window.location = getUrl(url, params, absolute)
}
