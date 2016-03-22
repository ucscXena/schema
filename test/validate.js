/*global describe: false, it: false, require: false */
/*eslint new-cap: [0]*/
'use strict';

var assert = require('assert');
//var jsc = require('jsverify');
var S = require('../js/schema');
var {fn, boolean, object, list, nullval, string, number, array, arrayOf, or, desc} = S;
var _ = require('underscore');
var {valid} = require('../js/validate');

describe('validate', function () {
	describe('#valid', function () {
		// booleans
		it('should accept true as boolean', function () {
			assert(valid(boolean, true)); });
		it('should accept false as boolean', function () {
			assert(valid(boolean, false)); });
		it('should not accept 5 as boolean', function () {
			assert(!valid(boolean, 5)); });

		// null
		it('should accept null as null', function () {
			assert(valid(nullval, null)); });
		it('should not accept undefined as null', function () {
			assert(!valid(nullval, undefined)); });

		// numbers
		it('should accept 5 as number > 0', function () {
			assert(valid(number([0]), 5)); });
		it('should not accept -5 as number > 0', function () {
			assert(!valid(number([0]), -5)); });

		// strings
		it('should accept "foo" as string "foo"', function () {
			assert(valid(string("foo"), "foo")); });
		it('should not accept "bar" as string "foo"', function () {
			assert(!valid(string("foo"), "bar")); });
		it('should accept "foo" as string', function () {
			assert(valid(string(), "foo")); });
		it('should accept "foobar" as string pattern /f[o]*b.r/', function () {
			assert(valid(string(/f[o]*b.r/), "foobar")); });
		it('should not accept "foobar" as string pattern /f[o]*br/', function () {
			assert(!valid(string(/f[o]*br/), "foobar")); });

		// arrays
		it('should accept [true, true] as tuple of boolean', function () {
			assert(valid(array(boolean, boolean), [true, true])); });
		it('should not accept [true, 5] as tuple of boolean', function () {
			assert(!valid(array(boolean, boolean), [true, 5])); });
		it('should accept [5, 2] as arrayOf number > 0', function () {
			assert(valid(arrayOf(number([0])), [5, 2])); });
		it('should not accept [5, true, 2] as arrayOf number > 0', function () {
			assert(!valid(arrayOf(number([0])), [5, true, 2])); });

		// objects
		it('should accept {a: true, b: 5} as object {a: boolean, b: number}', function () {
			assert(valid(S({a: boolean, b: number()}), {a: true, b: 5})); });
		it('should not accept {a: true} as object {a: boolean, b: number}', function () {
			assert(!valid(S({a: boolean, b: number()}), {a: true})); });
		it('should accept {a: true, b: 5} as object {a: boolean}', function () {
			// Have to force to object (not dict) since there's only one key.
			assert(valid(object({a: boolean}), {a: true, b: 5})); });
		it('should accept {foo1: true, foo2: false} as dict {/foo[0-9]+/: boolean}', function () {
			var FooKey = desc('FooKey', 'foo key', string(/foo[0-9]+/));
			assert(valid(S({[FooKey]: boolean}), {foo1: true, foo2: false})); });
		it('should not accept {foo1: true, bar: false} as dict {/foo[0-9]+/: boolean}', function () {
			var FooKey = desc('FooKey', 'foo key', string(/foo[0-9]+/));
			assert(!valid(S({[FooKey]: boolean}), {foo1: true, bar: false})); });

		// or
		it('should accept 5 as boolean | number > 0', function () {
			assert(valid(or(boolean, number([0])), 5)); });
		it('should not accept 5 as boolean | "foo"', function () {
			assert(!valid(or(boolean, "foo"), 5)); });
		it('should accept "foo" as boolean | "foo" > 0', function () {
			assert(valid(or(boolean, "foo"), "foo")); });

		// function
		it('should accept x => x + 1 as fn', function () {
			assert(valid(fn(boolean, number([0])), x => x + 1)); });
		it('should not accept 5 as fn', function () {
			assert(!valid(fn(boolean, number([0])), 5)); });
	});
});
