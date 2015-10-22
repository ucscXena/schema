/*global describe: false, it: false, require: false */
'use strict';

var assert = require('assert');
//var jsc = require('jsverify');
//var S = require('../js/schema');
//var {string, number, array, or, d} = S;
var _ = require('underscore');

var {toJSON} = require('../js/jsonSchema');
var col = require('../js/demo-schema').Column;

describe('jsonSchema', function () {
	describe('#toJSON', function () {
		it('should return a JSON schema', function () {
			var s = toJSON(col);
			assert(_.isObject(s)); });
	});
});
