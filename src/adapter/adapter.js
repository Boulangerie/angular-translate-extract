import _ from 'lodash'

export default class Adapter {
  constructor(log, basePath) {
    this.log = log
    this.basePath = basePath
  }

  init(params) {
    this.params = _.defaults(params, this.params)

    try {
      this.log.debug('Init PodAdapter', this.params.dest, this.params.prefix, this.params.suffix)
    } catch(e) {}
  }

  persist() {
    throw new Error('Must be implemented')
  }
}