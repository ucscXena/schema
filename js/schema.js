/*global module: false, require: false */
'use strict';
var _ = require('underscore');

function key(v, k) {
    return (k[0] === '/' && k[k.length - 1] === '/') ?
        ['pattern', k.slice(1, k.length - 1), v] :
        ['literal', k, v];
}

var S = module.exports = function (obj) {
    return ['object', ..._.map(obj, key)];
};

// how to represent
//   required (we really want to tag 'optional', not 'required')
//   doc
//   title
var methods = {
    string: function (value) {
        var val = _.isString(value) ? ['value', value] :
            (_.isRegExp(value) ? ['pattern', value] : []);
        return ['string', val];
    },
    number: function (value) {
        var val = _.isArray(value) ?  ['interval', value] :
            (_.isNumber(value) ? ['value', value] : []);
        return ['number', val];
    },
    or: function (...args) {
        return ['or', ...args];
    },
    array: function (...args) {
        return ['array', ['fixed', ...args]];
    }
};

methods.array.of = function (sch) {
    return ['array', ['pattern', sch]];
};

_.extend(S, methods);
