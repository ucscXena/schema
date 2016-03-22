/*global describe: false, it: false, require: false */
/*eslint new-cap: [0]*/
'use strict';

var assert = require('assert');
//var jsc = require('jsverify');
var S = require('../js/schema');
var {string, number, array, arrayOf, or, desc} = S;
var _ = require('underscore');

function mapTree(t, fn) {
	if (_.isArray(t)) {
		return _.map(fn(t), v => mapTree(v, fn));
	} else if (_.isObject(t)) {
		return _.mapObject(t, v => mapTree(v, fn));
	}
	return t;
}
// XXX Pretty ugly, but makes the asserts simpler. Could also write a custom deepEqual, but it might
// get messy coding the schema vs. non-schema arrays.
var schemaMagic = '_schema';
var curse = schema => mapTree(schema, obj => { _.omit(obj, [schemaMagic, 'toString']); return obj; });
var assertSchemaEqual = (s, v) => assert.deepEqual(curse(s), v);

describe('schema', function () {
	describe('#string', function () {
		it('should return a string schema', function () {
			assertSchemaEqual(string(), ['string', {}, []]); });
		it('should accept a constant', function () {
			assertSchemaEqual(string('foo'), ['string', {}, ['value', 'foo']]); });
		it('should accept a pattern', function () {
			assertSchemaEqual(string(/^fo*/), ['string', {}, ['pattern', /^fo*/]]); });
	});
	describe('#number', function () {
		it('should return a number schema', function () {
			assertSchemaEqual(number(), ['number', {}, []]); });
		it('should accept a constant', function () {
			assertSchemaEqual(number(5), ['number', {}, ['value', 5]]); });
		it('should accept an interval', function () {
			assertSchemaEqual(number([0, Infinity]), ['number', {}, ['interval', [0, Infinity]]]); });
	});
	describe('#or', function () {
		it('should return an or schema', function () {
			assertSchemaEqual(or(number(5), string('foo')),
				['or', {}, ['number', {}, ['value', 5]], ['string', {}, ['value', 'foo']]]); });
	});
	describe('#object', function () {
		it('should return an object schema', function () {
			assertSchemaEqual(S.object({foo: number(5)}),
				['object', {}, [['string', {}, ['value', 'foo']], ['number', {}, ['value', 5]]]]); });
	});
	describe('#object', function () {
		it('should return an object schema with pattern key', function () {
			assertSchemaEqual(S.object({'/fo*/': number(5)}),
				['object', {}, [['string', {}, ['pattern', /fo*/]], ['number', {}, ['value', 5]]]]); });
	});
	describe('#array', function () {
		it('should return an array schema', function () {
			assertSchemaEqual(array(number(5), string('foo')),
				['tuple', {},
					['number', {}, ['value', 5]], ['string', {}, ['value', 'foo']]]); });
	});
	describe('#arrayOf', function () {
		it('should return a array pattern schema', function () {
			assertSchemaEqual(arrayOf(number()),
				['list', {},
					['number', {}, []]]); });
	});
	describe('#desc', function () {
		it('should add doc string', function () {
			assertSchemaEqual(
				desc('doc string', array(number(5), string('foo'))),
				['tuple', {description: 'doc string'},
					['number', {}, ['value', 5]], ['string', {}, ['value', 'foo']]]); });
		it('should add doc and title string', function () {
			assertSchemaEqual(
				desc('title string', 'doc string', array(number(5), string('foo'))),
				['tuple', {title: 'title string', description: 'doc string'},
					['number', {}, ['value', 5]], ['string', {}, ['value', 'foo']]]); });
	});
	describe('#', function () {
		it('should allow literals', function () {
			assertSchemaEqual(S({'/fo*/': 'hork', len: 10}),
				['object', {}, [['string', {}, ['pattern', /fo*/]], ['string', {}, ['value', 'hork']]],
				[['string', {}, ['value', 'len']], ['number', {}, ['value', '10']]]]); });
	});
});
