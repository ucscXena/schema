/*global describe: false, it: false, require: false */
'use strict';

var assert = require('assert');
//var jsc = require('jsverify');
var S = require('../js/schema');
var {string, number, array, or} = S;

describe('schema', function () {
    describe('#string', function () {
        it('should return a string schema', function () {
            assert.deepEqual(string(), ['string', []]);});
        it('should accept a constant', function () {
            assert.deepEqual(string('foo'), ['string', ['value', 'foo']]);});
        it('should accept a pattern', function () {
            assert.deepEqual(string(/^fo*/), ['string', ['pattern', /^fo*/]]);});
    });
    describe('#number', function () {
        it('should return a number schema', function () {
            assert.deepEqual(number(), ['number', []]);});
        it('should accept a constant', function () {
            assert.deepEqual(number(5), ['number', ['value', 5]]);});
        it('should accept an interval', function () {
            assert.deepEqual(number([0, Infinity]), ['number', ['interval', [0, Infinity]]]);});
    });
    describe('#or', function () {
        it('should return a or schema', function () {
            assert.deepEqual(or(number(5), string('foo')),
                ['or', ['number', ['value', 5]], ['string', ['value', 'foo']]]);});
    });
    describe('#', function () {
        it('should return an object schema', function () {
            assert.deepEqual(S({foo: number(5)}),
                ['object', ['literal', 'foo', ['number', ['value', 5]]]]);});
    });
    describe('#', function () {
        it('should return an object schema with pattern key', function () {
            assert.deepEqual(S({'/fo*/': number(5)}),
                ['object', ['pattern', 'fo*', ['number', ['value', 5]]]]);});
    });
    describe('#array', function () {
        it('should return a array schema', function () {
            assert.deepEqual(array(number(5), string('foo')),
                ['array', ['fixed',
                    ['number', ['value', 5]], ['string', ['value', 'foo']]]]);});
    });
    describe('#array.of', function () {
        it('should return a array pattern schema', function () {
            assert.deepEqual(array.of(number()),
                ['array', ['pattern',
                    ['number', []]]]);});
    });

});
