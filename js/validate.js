/*global require: false, module: false, console: false */
'use strict';
var _ = require('underscore');

function cases([tag, ...data], c, ...params) {
	return c[tag](...params, ...data);
}

function nullval(isvalid, assert, val) {
	return assert(val === null);
}

function boolean(isvalid, assert, val, opts) {
	return assert(val === true || val === false);
}

function string(isvalid, assert, val, opts, sType) {
	return assert(_.isString(val) && cases(sType, {
		'value': value => val === value,
		'pattern': pat => val.match(pat),
		undefined: () => true
	}));
}

// Not much we can validate for a function. We could try
// to do length, bit it's not reliable. We could provide a
// way to validing params in & return value at run-time, but
// that's better done in the function itself.
function fn(isvalid, assert, val,  opts, ...schs) {
	return assert(_.isFunction(val));
}

function minb(v) {
    return _.isUndefined(v) ? -Infinity : v;
}

function maxb(v) {
    return _.isUndefined(v) ? Infinity : v;
}

function number(isvalid, assert, val, opts, nType) {
	return assert(_.isNumber(val) && cases(nType, {
		'value': value => value === val,
		'interval': ([min, max]) =>  minb(min) <= val && val <= maxb(max),
		undefined: () => true
	}));
}

function annotation(isvalid, assert, schema, val) {
	var [type, opts, ref] = schema;
	return type === 'annotation' ? isvalid(ref, val) : isvalid(schema, val);
}

function tuple(isvalid, assert, val, opts, ...schs) {
	var r = (s, i) => annotation(isvalid, assert, s, val[i]);
	return assert(_.isArray(val) && _.every(schs, r));
}

function list(isvalid, assert, val, opts, sch) {
	var r = (v, i) => annotation(isvalid, assert, sch, v);
	return assert(_.isArray(val) && _.every(val, r));
}

// We have to use cases for objects: as a record, or as a dictionary, the difference
// being whether the keys are known at compile time. For record types, assume all
// keys are required, but extra keys are allowed. In the future we can add an isOptional()
// schema method, and perhaps a strict() method to disallow extra keys.
function object(isvalid, assert, val, opts, ...props) {
	// XXX Note this method may count a key in val for two different required props,
	// if one of the props is a pattern key that matches the key in val. Using pattern
	// keys in a record type is sort of missing the point, in any case, so not a large
	// problem.
	return assert(_.isObject(val) &&
				  _.every(props, ([skey, sval]) => _.find(val, (v, k) => isvalid(skey, k) && isvalid(sval, v))));
}

// For dict objects, we verify that every key/val in the object matches the (singleton) key/val schema.
function dict(isvalid, assert, val,  opts, [keySchema, sch]) {
	return assert(_.isObject(val) &&
				  _.every(val, (v, k) => isvalid(keySchema, k) && isvalid(sch, v)));
}

var or = (isvalid, assert, val, opts, ...schs) => _.any(schs, sch => isvalid(sch, val));

function validate(assert, schema, value) {
	function isvalid(s, v) {
		return cases(s, {
			'string': string,
			'number': number,
			'function': fn,
			'tuple': tuple,
			'list': list,
			'object': object,
			'dict': dict,
			'or': or,
			'null': nullval,
			'boolean': boolean,
		}, isvalid, assert, v);
	}

	return isvalid(schema, value);
}

module.exports = {
	valid: _.partial(validate, x => !!x)
};
