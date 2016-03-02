import {expect} from 'chai'
import Adapter from './../src/adapter/adapter'

describe('adapter', () => {
  it('should throw error when try to call the non-implemented persist method', () => {
    let adapter = new Adapter(console, './')
    let result = true
    try {
      adapter.persist()
      result = false
    } catch(e) {}
    expect(result).to.be.true
  })
})