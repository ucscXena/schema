/*global require: false, module: false */
'use strict';
var _ = require('underscore');

// merge, dropping undefined props
var m = (...objs) => _.pick(_.extend.apply(null, [{}, ...objs]), v => v !== undefined);

function cases([tag, ...data], c) {
	return c[tag](...data);
}

function string(opts, sType) {
	return cases(sType, {
		'value': (value) => ({type: 'string', pattern: `^${value}$`}),
		'pattern': (pat) => ({type: 'string', pattern: pat}),
		undefined: () => ({type: 'string'})
	});
}

function number(opts, nType) {
	return cases(nType, {
		'value': (value) => ({type: 'number', minimum: value, maximum: value}),
		'interval': ([min, max]) => m({type: 'number'}, {minimum: min, maximum: max}),
		undefined: () => ({type: 'number'})
	});
}

var toJSON;

function array(opts, aType) {
	return cases(aType, {
		'tuple': (...schs) => ({type: 'array', items: _.map(schs, toJSON)}),
		'list': (sch) => ({type: 'array', items: toJSON(sch)})
	});
}

function object(opts, ...props) {
	var {pattern, literal} = _.groupBy(props, _.first);
	return {
		type: 'object',
		properties: _.object(_.map(literal, ([, key, sch]) => [key, toJSON(sch)])),
		patternProperties: _.object(_.map(pattern, ([, pat, sch]) => [pat, toJSON(sch)]))
	};
}

var or = (opts, ...schs) => ({anyOf: _.map(schs, toJSON)});

var mergeCommon = (fn) => (opts, ...data) => m(opts, fn(opts, ...data));

toJSON = function (sch) {
	return cases(sch, {
		'string': mergeCommon(string),
		'number': mergeCommon(number),
		'array': mergeCommon(array),
		'object': mergeCommon(object),
        'or': mergeCommon(or)
	});
};

module.exports = {
    toJSON: toJSON
};
