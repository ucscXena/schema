/*global module: false, require: false */
'use strict';
var _ = require('underscore');

function key(v, k) {
    return (k[0] === '/' && k[k.length - 1] === '/') ?
        ['pattern', k.slice(1, k.length - 1), v] :
        ['literal', k, v];
}

var S = module.exports = function (obj) {
    return ['object', {}, ..._.map(obj, key)];
};

// merge, dropping undefined props
var p = (...objs) => _.pick(_.extend.apply(null, objs), (v, k) => v !== undefined);

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
    or: function (...args) {
        return ['or', {}, ...args];
    },
    array: function (...args) {
        return ['array', {}, ['fixed', ...args]];
    },
    d: function (...args) {
        if (args.length === 2) {
            args.unshift(undefined);
        }
        var [title, description, [type, opts, ...rest]] = args;
        return [type,
               p({title: title, description: description}, opts),
               ...rest];
    },
};

methods.array.of = function (sch) {
    return ['array', {}, ['pattern', sch]];
};

_.extend(S, methods);
