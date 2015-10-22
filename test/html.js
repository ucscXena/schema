/*global describe: false, it: false, require: false */
/*eslint new-cap: [0]*/
'use strict';

var assert = require('assert');
var _ = require('underscore');
//var jsc = require('jsverify');
var S = require('../js/schema');
//var {string, number, array, or, d} = S;
var {string, number, array} = S;
var {toHTML} = require('../js/html');

describe('html', function () {
	describe('#toHTML', function () {
		it('should return an html string with number', function () {
            var s = number(5),
                html = toHTML(s);
            assert(_.isString(html));
            assert.notEqual(html.indexOf('5'), -1); });
		it('should return an html string with string', function () {
            var s = string('foo'),
                html = toHTML(s);
            assert(_.isString(html));
            assert.notEqual(html.indexOf('foo'), -1, 'missing "foo"'); });
		it('should return an html string with string type', function () {
            var s = string(),
                html = toHTML(s);
            assert(_.isString(html));
            assert.notEqual(html.indexOf('string'), -1, 'missing "string"'); });
		it('should return an html string with array elements', function () {
            var s = array(string(), number(), string('foo')),
                html = toHTML(s);
            assert(_.isString(html));
            assert.notEqual(html.indexOf('string'), -1, 'missing "string"');
            assert.notEqual(html.indexOf('foo'), -1, 'missing "foo"');
            assert.notEqual(html.indexOf('number'), -1, 'missing "number"'); });
		it('should return an html string with object properties', function () {
            var s = S({a: string(), b: number(), c: string('foo')}),
                html = toHTML(s);
            assert(_.isString(html));
            assert.notEqual(html.indexOf('string'), -1, 'missing "string"');
            assert.notEqual(html.indexOf('foo'), -1, 'missing "foo"');
            assert.notEqual(html.indexOf('number'), -1, 'missing "number"'); });
    });
});
