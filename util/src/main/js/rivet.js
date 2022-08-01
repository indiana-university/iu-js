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

const statusCodes = {
  100: 'Continue',
  101: 'Switching Protocols',
  200: 'OK',
  201: 'Created',
  202: 'Accepted',
  203: 'Non-Authoritative Information',
  204: 'No Content',
  205: 'Reset Content',
  206: 'Partial Content',
  300: 'Multiple Choices',
  301: 'Moved Permantently',
  302: 'Found',
  303: 'See Other',
  304: 'Not Modified',
  305: 'Use Proxy',
  307: 'Temporary Redirect',
  400: 'Bad Request',
  401: 'Unauthorized',
  402: 'Payment Required',
  403: 'Forbidden',
  404: 'Not Found',
  405: 'Method Not Allowed',
  406: 'Not Acceptable',
  407: 'Proxy Authentication Required',
  408: 'Request Timeout',
  409: 'Conflict',
  410: 'Gone',
  411: 'Length Required',
  412: 'Precondition Failed',
  413: 'Request Entity Too Large',
  414: 'Request URI Too Long',
  415: 'Unsupported Media Type',
  416: 'Requested Range Not Satisfiable',
  417: 'Expectation Failed',
  500: 'Internal Server Error',
  501: 'Not Implemented',
  502: 'Bad Gateway',
  503: 'Service Unavailable',
  504: 'Gateway Timeout',
  505: 'HTTP Version Not Supported'
}

const webSocketCloseResons = {
  1000: 'Normal Closure',
  1001: 'Going Away',
  1002: 'Protocol Error',
  1003: 'Cannot Accept',
  1004: 'Reserved',
  1005: 'No Status Code',
  1006: 'Closed Abnormally',
  1007: 'Not Consistent',
  1008: 'Violated Policy',
  1009: 'Too Big',
  1010: 'No Extension',
  1011: 'Unexpected Condition',
  1012: 'Service Restart',
  1013: 'Try Again Later',
  1014: 'TLS Handshake Failure'
}

const focusableElementList = 'button, a[href], input[type="radio"]:checked, input:not([type="radio"]), select, textarea, [tabindex]:not([tabindex="-1"])'

function svgPath (d, fill) {
  const p = document.createElementNS('http://www.w3.org/2000/svg', 'path')
  p.setAttribute('d', d)
  p.setAttribute('fill', fill)
  return p
}

function getIcon (statusCode, size) {
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
  if (!size) svg.setAttribute('width', '100%')
  else {
    svg.setAttribute('height', size)
    svg.setAttribute('widght', size)
  }
  svg.setAttribute('viewBox', '0 0 48 48')
  svg.setAttribute('fill', 'none')

  if (statusCode === 404 || statusCode === 410 || (statusCode >= 300 && statusCode < 400)) {
    svg.appendChild(svgPath('M24 48C37.2548 48 48 37.2548 48 24C48 10.7452 37.2548 0 24 0C10.7452 0 0 10.7452 0 24C0 37.2548 10.7452 48 24 48Z', '#C9D2D6'))
    svg.appendChild(svgPath('M21.1201 16.3101C21.1201 16.8401 20.6901 17.2701 20.1601 17.2701H13.4301V38.4201H34.5801V9.58008H21.1201V16.3101ZM24.1701 26.3201L28.9201 21.5701C29.0101 21.4801 29.1701 21.4801 29.2601 21.5701L30.2801 22.5901C30.3701 22.6801 30.3701 22.8401 30.2801 22.9301L25.5301 27.6801C25.4401 27.7701 25.4401 27.9301 25.5301 28.0201L30.2801 32.7701C30.3701 32.8601 30.3701 33.0201 30.2801 33.1101L29.2601 34.1301C29.1701 34.2201 29.0101 34.2201 28.9201 34.1301L24.1701 29.3801C24.0801 29.2901 23.9201 29.2901 23.8301 29.3801L19.0801 34.1301C18.9901 34.2201 18.8301 34.2201 18.7401 34.1301L17.7201 33.1101C17.6301 33.0201 17.6301 32.8601 17.7201 32.7701L22.4701 28.0201C22.5601 27.9301 22.5601 27.7701 22.4701 27.6801L17.7201 22.9301C17.6301 22.8401 17.6301 22.6801 17.7201 22.5901L18.7401 21.5701C18.8301 21.4801 18.9901 21.4801 19.0801 21.5701L23.8301 26.3201C23.9201 26.4101 24.0801 26.4101 24.1701 26.3201Z', 'white'))
    svg.appendChild(svgPath('M19.1899 9.98047L13.8199 15.3505H19.1899V9.98047Z', 'white'))
    svg.appendChild(svgPath('M35.54 7.65039H20.15H19.19C19.06 7.65039 18.94 7.68039 18.82 7.72039C18.7 7.77039 18.6 7.84039 18.51 7.93039L11.78 14.6604C11.69 14.7504 11.62 14.8504 11.57 14.9704C11.52 15.0904 11.5 15.2104 11.5 15.3404V16.3004V39.3804C11.5 39.9104 11.93 40.3404 12.46 40.3404H35.54C36.07 40.3404 36.5 39.9104 36.5 39.3804V8.62039C36.5 8.08039 36.07 7.65039 35.54 7.65039ZM19.19 9.98039V15.3504H13.82L19.19 9.98039ZM34.58 38.4204H13.42V17.2704H20.15C20.68 17.2704 21.11 16.8404 21.11 16.3104V9.58039H34.57V38.4204H34.58Z', '#243142'))
    svg.appendChild(svgPath('M18.74 21.5701L17.72 22.5901C17.63 22.6801 17.63 22.8401 17.72 22.9301L22.47 27.6801C22.56 27.7701 22.56 27.9301 22.47 28.0201L17.72 32.7701C17.63 32.8601 17.63 33.0201 17.72 33.1101L18.74 34.1301C18.83 34.2201 18.99 34.2201 19.08 34.1301L23.83 29.3801C23.92 29.2901 24.08 29.2901 24.17 29.3801L28.92 34.1301C29.01 34.2201 29.17 34.2201 29.26 34.1301L30.28 33.1101C30.37 33.0201 30.37 32.8601 30.28 32.7701L25.53 28.0201C25.44 27.9301 25.44 27.7701 25.53 27.6801L30.28 22.9301C30.37 22.8401 30.37 22.6801 30.28 22.5901L29.26 21.5701C29.17 21.4801 29.01 21.4801 28.92 21.5701L24.17 26.3201C24.08 26.4101 23.92 26.4101 23.83 26.3201L19.08 21.5701C18.99 21.4701 18.83 21.4701 18.74 21.5701Z', '#243142'))
  } else if (statusCode === 401 || statusCode === 403) {
    svg.appendChild(svgPath('M24 48C37.2548 48 48 37.2548 48 24C48 10.7452 37.2548 0 24 0C10.7452 0 0 10.7452 0 24C0 37.2548 10.7452 48 24 48Z', '#C9D2D6'))
    svg.appendChild(svgPath('M24 22C22.35 22 21 23.35 21 25C21 26.07 21.56 27.03 22.5 27.58C22.88 27.8 23.07 28.23 22.97 28.66L22.24 32H25.75L25.02 28.66C24.93 28.24 25.12 27.8 25.49 27.58C26.44 27.03 27 26.07 27 25C27 23.35 25.65 22 24 22Z', 'white'))
    svg.appendChild(svgPath('M16 17H13V28.57C13 34.12 16.6 37.53 24 38.98C31.4 37.52 35 34.12 35 28.57V17H32H16ZM27.98 32.79C28.05 33.09 27.97 33.4 27.78 33.63C27.59 33.86 27.3 34 27 34H21C20.7 34 20.41 33.86 20.22 33.63C20.03 33.39 19.96 33.08 20.02 32.79L20.88 28.89C19.71 27.94 19 26.51 19 25C19 22.24 21.24 20 24 20C26.76 20 29 22.24 29 25C29 26.51 28.29 27.94 27.12 28.89L27.98 32.79Z', 'white'))
    svg.appendChild(svgPath('M36 15H32.94C32.44 10.51 28.62 7 24 7C19.38 7 15.56 10.51 15.06 15H12C11.45 15 11 15.45 11 16V28.57C11 33.12 13.22 38.96 23.81 40.98C23.88 40.99 23.94 41 24 41C24.06 41 24.12 40.99 24.19 40.98C34.78 38.96 37 33.12 37 28.57V16C37 15.45 36.55 15 36 15ZM24 9C27.52 9 30.44 11.61 30.93 15H17.07C17.56 11.61 20.48 9 24 9ZM35 28.57C35 34.12 31.4 37.53 24 38.98C16.6 37.52 13 34.12 13 28.57V17H16H32H35V28.57Z', '#243142'))
    svg.appendChild(svgPath('M29 25C29 22.24 26.76 20 24 20C21.24 20 19 22.24 19 25C19 26.51 19.71 27.94 20.88 28.89L20.02 32.79C19.95 33.09 20.03 33.4 20.22 33.63C20.41 33.86 20.7 34 21 34H27C27.3 34 27.59 33.86 27.78 33.63C27.97 33.39 28.04 33.08 27.98 32.79L27.12 28.89C28.29 27.94 29 26.51 29 25ZM25.5 27.58C25.12 27.8 24.93 28.23 25.03 28.66L25.76 32H22.25L22.98 28.66C23.07 28.24 22.88 27.8 22.51 27.58C21.56 27.03 21 26.07 21 25C21 23.35 22.35 22 24 22C25.65 22 27 23.35 27 25C27 26.07 26.44 27.03 25.5 27.58Z', '#243142'))
  } else {
    svg.appendChild(svgPath('M24 48C37.2548 48 48 37.2548 48 24C48 10.7452 37.2548 0 24 0C10.7452 0 0 10.7452 0 24C0 37.2548 10.7452 48 24 48Z', '#C9D2D6'))
    svg.appendChild(svgPath('M10.4102 36.69H37.6002V16.75H10.4102V36.69ZM22.5602 26.56L18.0802 22.08C17.9902 21.99 17.9902 21.85 18.0802 21.76L19.0402 20.8C19.1302 20.71 19.2702 20.71 19.3602 20.8L23.8402 25.28C23.9302 25.37 24.0702 25.37 24.1602 25.28L28.6402 20.8C28.7302 20.71 28.8702 20.71 28.9602 20.8L29.9202 21.76C30.0102 21.85 30.0102 21.99 29.9202 22.08L25.4402 26.56C25.3502 26.65 25.3502 26.79 25.4402 26.88L29.9202 31.36C30.0102 31.45 30.0102 31.59 29.9202 31.68L28.9602 32.64C28.8702 32.73 28.7302 32.73 28.6402 32.64L24.1602 28.16C24.0702 28.07 23.9302 28.07 23.8402 28.16L19.3602 32.64C19.2702 32.73 19.1302 32.73 19.0402 32.64L18.0802 31.68C17.9902 31.59 17.9902 31.45 18.0802 31.36L22.5602 26.88C22.6502 26.79 22.6502 26.65 22.5602 26.56Z', 'white'))
    svg.appendChild(svgPath('M10.4102 14.9403H37.6002V11.3203H10.4102V14.9403ZM18.5602 12.2203C19.0602 12.2203 19.4702 12.6303 19.4702 13.1303C19.4702 13.6303 19.0602 14.0403 18.5602 14.0403C18.0602 14.0403 17.6502 13.6303 17.6502 13.1303C17.6602 12.6203 18.0602 12.2203 18.5602 12.2203ZM15.8402 12.2203C16.3402 12.2203 16.7502 12.6303 16.7502 13.1303C16.7502 13.6303 16.3402 14.0403 15.8402 14.0403C15.3402 14.0403 14.9302 13.6303 14.9302 13.1303C14.9402 12.6203 15.3402 12.2203 15.8402 12.2203ZM13.1202 12.2203C13.6202 12.2203 14.0302 12.6303 14.0302 13.1303C14.0302 13.6303 13.6202 14.0403 13.1202 14.0403C12.6202 14.0403 12.2102 13.6303 12.2102 13.1303C12.2202 12.6203 12.6202 12.2203 13.1202 12.2203Z', 'white'))
    svg.appendChild(svgPath('M18.0802 31.3599C17.9902 31.4499 17.9902 31.5899 18.0802 31.6799L19.0402 32.6399C19.1302 32.7299 19.2702 32.7299 19.3602 32.6399L23.8402 28.1599C23.9302 28.0699 24.0702 28.0699 24.1602 28.1599L28.6402 32.6399C28.7302 32.7299 28.8702 32.7299 28.9602 32.6399L29.9202 31.6799C30.0102 31.5899 30.0102 31.4499 29.9202 31.3599L25.4402 26.8799C25.3502 26.7899 25.3502 26.6499 25.4402 26.5599L29.9202 22.0799C30.0102 21.9899 30.0102 21.8499 29.9202 21.7599L28.9602 20.7999C28.8702 20.7099 28.7302 20.7099 28.6402 20.7999L24.1602 25.2799C24.0702 25.3699 23.9302 25.3699 23.8402 25.2799L19.3602 20.7999C19.2702 20.7099 19.1302 20.7099 19.0402 20.7999L18.0802 21.7599C17.9902 21.8499 17.9902 21.9899 18.0802 22.0799L22.5602 26.5599C22.6502 26.6499 22.6502 26.7899 22.5602 26.8799L18.0802 31.3599Z', '#243142'))
    svg.appendChild(svgPath('M38.5001 9.5H9.50009C9.00009 9.5 8.59009 9.91 8.59009 10.41V15.85V37.6C8.59009 38.1 9.00009 38.51 9.50009 38.51H38.5001C39.0001 38.51 39.4101 38.1 39.4101 37.6V15.84V10.4C39.4101 9.91 39.0001 9.5 38.5001 9.5ZM37.5901 36.69H10.4101V16.75H37.6001V36.69H37.5901ZM37.5901 14.94H10.4101V11.32H37.6001V14.94H37.5901Z', '#243142'))
    svg.appendChild(svgPath('M13.1202 14.03C13.6228 14.03 14.0302 13.6225 14.0302 13.12C14.0302 12.6174 13.6228 12.21 13.1202 12.21C12.6176 12.21 12.2102 12.6174 12.2102 13.12C12.2102 13.6225 12.6176 14.03 13.1202 14.03Z', '#243142'))
    svg.appendChild(svgPath('M15.8402 14.03C16.3428 14.03 16.7502 13.6225 16.7502 13.12C16.7502 12.6174 16.3428 12.21 15.8402 12.21C15.3376 12.21 14.9302 12.6174 14.9302 13.12C14.9302 13.6225 15.3376 14.03 15.8402 14.03Z', '#243142'))
    svg.appendChild(svgPath('M18.5601 14.03C19.0627 14.03 19.4701 13.6225 19.4701 13.12C19.4701 12.6174 19.0627 12.21 18.5601 12.21C18.0576 12.21 17.6501 12.6174 17.6501 13.12C17.6501 13.6225 18.0576 14.03 18.5601 14.03Z', '#243142'))
  }

  return svg
}

function labelValue (label, value) {
  const id = shortuid()
  const e = document.createElement('div')
  e.setAttribute('class', 'rvt-row rvt-m-lr-xxs')

  const lc = document.createElement('div')
  lc.setAttribute('class', 'rvt-cols-5')
  const l = document.createElement('label')
  l.setAttribute('class', 'rvt-ts-18 rvt-text-bold')
  l.setAttribute('for', id)
  l.textContent = label
  lc.appendChild(l)

  const s = document.createElement('div')
  s.setAttribute('class', 'rvt-cols-7')
  s.setAttribute('id', id)
  s.textContent = value
  e.appendChild(lc)
  e.appendChild(s)
  return e
}

function handleModalCloseReload(e) {
  e.stopPropagation()
  e.preventDefault()
  window.location.reload()
}

function handleModalClose(activeElement, dialog, body) {
  body.removeChild(dialog)
  window.requestAnimationFrame(
    () => window.requestAnimationFrame(() => {
      if (isFocusable(activeElement)) {
        activeElement.focus()
      } else {
        const focusableElements = getFocusableElements(activeElement)
        if (focusableElements && focusableElements.length) {
          focusableElements[0].focus()
        }
      }
    })
  )
}

function handleTab(event, element) {
  const { shiftKey, target } = event
  const focusableEl = getFocusableElements(element)
  const firstFocusableEl = focusableEl[0]
  const lastFocusableEl = focusableEl[focusableEl.length - 1]
  const isTargetFirst = target === firstFocusableEl
  const isTargetLast = target === lastFocusableEl
  const isTargetSelf = target === element

  event.stopPropagation()
  if ((isTargetFirst || isTargetSelf) && shiftKey) {
    event.preventDefault()
    lastFocusableEl && lastFocusableEl.focus()
  } else if ((isTargetLast || isTargetSelf) && !shiftKey) {
    event.preventDefault()
    firstFocusableEl && firstFocusableEl.focus()
  }
}

function isFocusable(element) {
  switch (element.tagName) {
    case 'A':
      return element.href && element.href.length
    case 'INPUT':
      return element.type !== 'radio' || element.checked
    case 'BUTTON':
    case 'SELECT':
    case 'TEXTAREA':
      return true
    default:
      return element.tabindex && element.tabindex !== '-1'
  }
}

function getFocusableElements(element) {
  const focusable = element.querySelectorAll(focusableElementList)
  const focusableArray = Array.prototype.slice.call(focusable)
  const enabledFocusable = focusableArray.filter(el => {
    return !el.disabled
  })
  return enabledFocusable
}

let loading = document.getElementById('loading')
if (!loading && document.body) {
  loading = document.createElement('div')
  loading.setAttribute('id', 'loading')
  loading.style.position = 'fixed'
  loading.style.display = 'none'
  loading.setAttribute('class', 'rvt-loader rvt-loader--sm')
  loading.style.top = '5.5rem'
  loading.style.right = '0.5rem'
  document.body.appendChild(loading)
}

export function showLoadingIndicator() {
  loading.style.display = 'block'
}

export function hideLoadingIndicator() {
  loading.style.display = 'none'
}

export function renderErrorSection(props) {
  const errorMain = document.createElement('div')

  if (props.modal) {
    errorMain.setAttribute('class', 'rvt-modal__inner')
    errorMain.setAttribute('data-rvt-modal-inner', 'true')

    const modalHeader = document.createElement('div')
    modalHeader.setAttribute('class', 'rvt-modal__header')

    const titleH1 = document.createElement('h1')
    titleH1.setAttribute('id', 'error-modal-title')
    titleH1.setAttribute('class', 'rvt-modal__title')
    if (props.status) {
      if (statusCodes[props.status])
        titleH1.textContent = 'HTTP ' + props.status + ' - ' + statusCodes[props.status]
      else if (webSocketCloseResons[props.status])
        titleH1.textContent = 'Web Socket ' + props.status + ' - ' + webSocketCloseResons[props.status]
      else titleH1.textContent = 'Error ' + props.status
    } else titleH1.textContent = 'Internal Error'
    modalHeader.appendChild(titleH1)

    errorMain.appendChild(modalHeader)

    const titleWrapper = document.createElement('div')
    titleWrapper.setAttribute('class', 'rvt-bg-black-000 rvt-border-bottom')

    const titleIconContainer = document.createElement('div')
    titleIconContainer.setAttribute('class', 'rvt-container-sm rvt-prose rvt-flow')

    const titleIconRow = document.createElement('div')
    titleIconRow.setAttribute('class', 'rvt-row')

    const titleCol = document.createElement('div')
    titleCol.setAttribute('class', 'rvt-cols-10')

    if (props.message || props.reload) {
      if (props.message) {
        const messageH2 = document.createElement('h2')
        messageH2.setAttribute('class', 'rvt-ts-xs rvt-m-top-sm rvt-color-black-500 rvt-text-bold')
        messageH2.textContent = props.message
        titleCol.appendChild(messageH2)
      }
      if (props.reload) {
        const messageP = document.createElement('p')
        messageP.setAttribute('class', 'rvt-ts-xxs rvt-color-black-500')
        if (props.reload) messageP.appendChild(document.createTextNode(' Reload page to continue working.'))
        titleCol.appendChild(messageP)
      }
    }

    titleIconRow.appendChild(titleCol)

    const iconCol = document.createElement('div')
    iconCol.setAttribute('class', 'rvt-cols-2 rvt-hide-md-down rvt-p-all-sm')
    iconCol.appendChild(getIcon(props.status))
    titleIconRow.appendChild(iconCol)

    titleIconContainer.appendChild(titleIconRow)
    titleWrapper.appendChild(titleIconContainer)
    errorMain.appendChild(titleWrapper)
  } else {
    const titleWrapper = document.createElement('div')
    titleWrapper.setAttribute('class', 'rvt-bg-black-000 rvt-border-bottom rvt-p-tb-xl')

    const titleIconContainer = document.createElement('div')
    titleIconContainer.setAttribute('class', 'rvt-container-sm rvt-prose rvt-flow')

    const titleIconRow = document.createElement('div')
    titleIconRow.setAttribute('class', 'rvt-row')

    const titleCol = document.createElement('div')
    titleCol.setAttribute('class', 'rvt-cols-9')
    const titleH1 = document.createElement('h1')
    titleH1.setAttribute('class', 'rvt-m-bottom-md')
    if (props.status) {
      if (statusCodes[props.status]) {
        const statusP = document.createElement('p')
        statusP.setAttribute('class', 'rvt-ts-xs rvt-color-crimson rvt-text-uppercase rvt-m-top-xs rvt-m-bottom-none rvt-p-all-none')
        statusP.textContent = 'HTTP ' + props.status
        titleCol.appendChild(statusP)
        titleH1.textContent = statusCodes[props.status]
      } else titleH1.textContent = 'HTTP ' + props.status
    } else titleH1.textContent = 'Internal Error'
    titleCol.appendChild(titleH1)

    if (props.message || props.reload) {
      const messageP = document.createElement('p')
      messageP.setAttribute('class', 'rvt-ts-18 rvt-color-black-500 rvt-width-xxl')
      if (props.message) messageP.appendChild(document.createTextNode(props.message))
      if (props.reload) messageP.appendChild(document.createTextNode(' Reload page to continue working.'))
      titleCol.appendChild(messageP)
    }

    titleIconRow.appendChild(titleCol)

    const iconCol = document.createElement('div')
    iconCol.setAttribute('class', 'rvt-cols-3 rvt-hide-md-down')
    iconCol.appendChild(getIcon(props.status))
    titleIconRow.appendChild(iconCol)

    titleIconContainer.appendChild(titleIconRow)
    titleWrapper.appendChild(titleIconContainer)
    errorMain.appendChild(titleWrapper)
  }

  if (props.severe) {
    const severeAlert = document.createElement('div')
    severeAlert.setAttribute('class', 'rvt-inline-alert rvt-inline-alert--standalone rvt-inline-alert--danger rvt-m-top-none')
    const alertIcon = document.createElement('span')
    alertIcon.setAttribute('class', 'rvt-inline-alert__icon')

    const severeP = document.createElement(props.modal ? 'span' : 'p')
    severeP.setAttribute('class', 'rvt-inline-alert__message')
    severeP.appendChild(document.createTextNode('If you continue to receive this message, contact ' + (props.supportPreText || 'the ')))
    const supportLink = document.createElement('a')
    supportLink.href = props.supportUrl || 'http://kb.iu.edu/data/abxl.html'
    supportLink.textContent = props.supportLabel || 'IU Support Center'
    severeP.appendChild(supportLink)
    severeP.appendChild(document.createTextNode(' and include the error details below.'))
    severeAlert.appendChild(severeP)

    errorMain.appendChild(severeAlert)
  }

  const errorContent = document.createElement('div')
  errorContent.appendChild(labelValue('Current Time', new Date().toString()))
  if (props.requestNumber) errorContent.appendChild(labelValue('Request #', props.requestNumber))
  if (props.nodeId) errorContent.appendChild(labelValue('Node', props.nodeId))
  if (props.modal) {
    errorContent.setAttribute('class', 'rvt-modal__body')
    errorMain.appendChild(errorContent)

    if (props.closeModal) {
      const closeButton = document.createElement('button')
      closeButton.setAttribute('role', 'button')
      closeButton.onclick = props.closeModal
      if (!props.reload) {
        closeButton.setAttribute('class', 'rvt-button rvt-button--plain rvt-modal__close')

        const closeSrLabel = document.createElement('span')
        if (!props.reload) {
          closeSrLabel.setAttribute('class', 'rvt-sr-only')
        }
        closeSrLabel.textContent = 'Close'
        closeButton.appendChild(closeSrLabel)

        const closeIcon = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
        closeIcon.setAttribute('role', 'img')
        closeIcon.setAttribute('width', '16')
        closeIcon.setAttribute('height', '16')
        closeIcon.setAttribute('viewBox', '0 0 16 16')
        const closeIconPath = document.createElementNS('http://www.w3.org/2000/svg', 'path')
        closeIconPath.setAttribute('fill', 'currentColor')
        closeIconPath.setAttribute('d', 'M9.41,8l5.29-5.29a1,1,0,0,0-1.41-1.41L8,6.59,2.71,1.29A1,1,0,0,0,1.29,2.71L6.59,8,1.29,13.29a1,1,0,1,0,1.41,1.41L8,9.41l5.29,5.29a1,1,0,0,0,1.41-1.41Z')
        closeIcon.appendChild(closeIconPath)
        closeButton.appendChild(closeIcon)

        errorMain.appendChild(closeButton)
      } else {
        closeButton.setAttribute('class', 'rvt-button')

        const closeButtonSpan = document.createElement('span')
        closeButtonSpan.textContent = 'Reload Page'
        closeButton.appendChild(closeButtonSpan)

        const controls = document.createElement('div')
        controls.setAttribute('class', 'rvt-modal__controls')
        controls.appendChild(closeButton)

        errorMain.appendChild(controls)
      }
    }
  } else {
    const detailsContainer = document.createElement('div')
    detailsContainer.setAttribute('class', 'rvt-shadow-subtle rvt-p-all-md rvt-m-tb-md rvt-m-lr-xxl-md-up rvt-m-lr-md-xs-up')

    const detailCard = document.createElement('div')
    detailCard.setAttribute('class', 'rvt-card rvt-card--raised rvt-m-lr-xl-md-up')
    const detailCardBody = document.createElement('div')
    detailCardBody.setAttribute('class', 'rvt-card__body')

    const detailCardTitle = document.createElement('h2')
    detailCardTitle.setAttribute('class', 'rvt-card__title')
    detailCardTitle.textContent = 'Error Details'
    detailCardBody.appendChild(detailCardTitle)

    detailsContainer.appendChild(errorContent)

    errorMain.appendChild(detailsContainer)
  }

  return errorMain
}

export function openErrorModal(data, reload) {
  const activeElement = document.activeElement
  const body = document.querySelector('body')
  const scopeWrapper = document.createElement('div')
  scopeWrapper.className = 'rvt-scope'

  const dialog = document.createElement('section')
  dialog.setAttribute('id', 'error-dialog')
  dialog.setAttribute('class', 'rvt-modal')
  dialog.setAttribute('id', 'error-modal')
  dialog.setAttribute('aria-labelledby', 'error-modal-title')
  dialog.setAttribute('data-rvt-modal', 'error-modal')

  dialog.setAttribute('role', 'dialog')
  dialog.setAttribute('tabindex', '-1')
  dialog.addEventListener('keydown', e => {
    if (e.key === 'Escape') {
      reload ? handleModalCloseReload(e) : handleModalClose(activeElement, scopeWrapper, body)
    }
    if (e.key === 'Tab') {
      handleTab(e, dialog)
    }
  })

  const props = {}
  for (const n in data) props[n] = data[n]
  props.modal = true
  props.closeModal = (e) => {
    if (reload) handleModalCloseReload(e)
    else handleModalClose(activeElement, scopeWrapper, body)
  }
  props.reload = reload
  dialog.appendChild(RivetError(props))
  dialog.style.display = 'block'

  scopeWrapper.appendChild(dialog)
  body.appendChild(scopeWrapper)
  dialog.focus()

  return () => handleModalClose(activeElement, scopeWrapper, body)
}
