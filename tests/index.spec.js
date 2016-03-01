import {expect} from 'chai'
import Extractor from './../src/index.js'
import pkg from '../package.json'

describe('Extractor', () => {
	let extractor

	describe('Interface', () => {
		it('should expose the current version', () => {
			expect(Extractor.VERSION).to.be.a('string')
			expect(Extractor.VERSION).to.have.length.of.at.least(5)
			expect(Extractor.VERSION).equal(pkg.version)
		})
		it('should expose the package name', () => {
			expect(Extractor.NAME).to.be.a('string')
			expect(Extractor.NAME).equal(pkg.name)
		})
		it('should expose an `extract` method', () => {
			expect(Extractor.extract).to.be.a('function')
		})
	})
})