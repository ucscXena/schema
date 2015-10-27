/*global module: false, require: false, console: false */
/*eslint new-cap: [0] */
'use strict';
var _ = require('underscore');
var S;

// Allow literal shorthand for some schemas.
function literals(value) {
	if (_.isString(value)) {
		return S.string(value);
	}
	if (_.isNumber(value)) {
		return S.number(value);
	}
	if (_.isObject(value) && !_.isArray(value) && !_.isFunction(value)) {
		return S(value);
	}
	return value;
}

///////////////////////////////////////////
// Horrible hack to allow reference keys, like
// { [myschema]: string() }
// By overriding the toString method of a schema, we can cause it
// to return a unique id when evaluated as an es6 computed key property.
// If we simultaneously cache the schema itself, indexed by this
// unique id, we can then use the key to find the schema in the cache when
// we are processing the key/value pairs of the object schema.
//
// Currently we only do this for schemas with a title, declared with d(). This
// makes sense if we do not plan to in-line schemas for keys, but always link
// to them instead. So all schemas used as keys should be top-level.

// This is a persistent cache. If you process enough reference keys, you will
// eventually run out of memory.
var cache = {};
var magic = '__$$_$_$$'; // don't prefix your schema keys with this.

function refHandler(schema) {
	schema.toString = function () {
		var id = _.uniqueId(magic);
		cache[id] = this;
		return id;
	};
	return schema;
}
///////////////////////////////////////////


function keyType(k) {
	return (k[0] === '/' && k[k.length - 1] === '/') ? 'pattern' :
		(k.indexOf(magic) === 0 ? 'reference' : 'string');
}

var cases = (obj, type) => obj[type]();

// Identify pattern keys from object literal. Since objects can only have string
// keys, we are limited in what we can return here.
function key(schema, k) {
	return cases({
		'pattern': () => [S.string(new RegExp(k.slice(1, k.length - 1))), literals(schema)],
		'string': () => [S.string(k), literals(schema)],
		'reference': () => [cache[k], literals(schema)]
	}, keyType(k));
}

function partitionN(coll, n) {
	return _.range(coll.length / n).map(i => coll.slice(i * n, (i + 1) * n));
}

// In practice, this warning doesn't work because an 'or' of multiple
// string schemas is also correct. To do this properly would require walking
// the tree to ensure that the whole thing resolves to a string.
//function warnBadKey(sch) {
//	var [[type]] = sch;
//	if (type !== 'string') {
//		console.warn(`Bad key type ${type}`);
//	}
//	return sch;
//}

// Allow either an object literal, or a list of alternating keys and values.
// ({foo: bar, ...})
// ('foo', bar, ...)
// In the latter case, the key might be another schema. This is useful in the case
// where the key is defined by a schema object, however in javascript that schema
// object must be a string.
S = module.exports = function (...args) {
	if (args.length === 1) {
		return ['object', {}, ..._.map(args[0], key)];
	} else {
		return ['object', {}, ...partitionN(args, 2).map(schs => schs.map(literals))];
	}
};

// merge, dropping undefined props
var m = (...objs) => _.pick(_.extend.apply(null, [{}, ...objs]), v => v !== undefined);

// how to represent 'required' (we really want to tag 'optional', not 'required')
var methods = {
    string: function (value) {
        var val = _.isString(value) ? ['value', value] :
            (_.isRegExp(value) ? ['pattern', value] : []);
        return ['string', {}, val];
    },
    number: function (value) {
        var val = _.isArray(value) ? ['interval', value] :
            (_.isNumber(value) ? ['value', value] : []);
        return ['number', {}, val];
    },
    or: function (...schemas) {
        return ['or', {}, ..._.map(schemas, literals)];
    },
    array: function (...schemas) {
        return ['array', {}, ['tuple', ..._.map(schemas, literals)]];
    },
    d: function (...args) { // d for 'document'
        if (args.length === 2) {
            args.unshift(undefined);
        }
        var [title, description, [type, opts, ...rest]] = args;
        return refHandler(
			[type,
				m({title: title, description: description}, opts),
				...rest]);
    },
	r: function (role, [type, opts, ...rest]) { // r for 'role'
		return [type, {role: role, ...opts}, ...rest];
	},
	boolean: ['boolean', {}],
	nullval: ['null', {}],
	object: S
};

methods.array.of = function (schema) {
    return ['array', {}, ['list', literals(schema)]];
};

_.extend(S, methods);
