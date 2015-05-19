/*global module: false, require: false */
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
	return value;
}

// Identify pattern keys.
function key(schema, k) {
    return (k[0] === '/' && k[k.length - 1] === '/') ?
        ['pattern', k.slice(1, k.length - 1), literals(schema)] :
        ['literal', k, literals(schema)];
}

S = module.exports = function (obj) {
    return ['object', {}, ..._.map(obj, key)];
};

// merge, dropping undefined props
var m = (...objs) => _.pick(_.extend.apply(null, [{}, ...objs]), (v, k) => v !== undefined);

// how to represent
//   required (we really want to tag 'optional', not 'required')
var methods = {
    string: function (value) {
        var val = _.isString(value) ? ['value', value] :
            (_.isRegExp(value) ? ['pattern', value] : []);
        return ['string', {}, val];
    },
    number: function (value) {
        var val = _.isArray(value) ?  ['interval', value] :
            (_.isNumber(value) ? ['value', value] : []);
        return ['number', {}, val];
    },
    or: function (...schemas) {
        return ['or', {}, ..._.map(schemas, literals)];
    },
    array: function (...schemas) {
        return ['array', {}, ['tuple', ..._.map(schemas, literals)]];
    },
    d: function (...args) {
        if (args.length === 2) {
            args.unshift(undefined);
        }
        var [title, description, [type, opts, ...rest]] = args;
        return [type,
               m({title: title, description: description}, opts),
               ...rest];
    },
};

methods.array.of = function (schema) {
    return ['array', {}, ['list', literals(schema)]];
};

_.extend(S, methods);
