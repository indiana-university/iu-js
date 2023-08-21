import crypto from 'crypto'
import util from 'util'
import JSDOMEnvironment from 'jest-environment-jsdom'

export default class IUJestEnvironment extends JSDOMEnvironment {
  constructor (config, context) {
    super(config, context)

    Object.defineProperties(this.global, {
      TextEncoder: { value: util.TextEncoder },
      TextDecoder: { value: util.TextDecoder },
      crypto: { value: crypto.webcrypto }
    })
  }
}
