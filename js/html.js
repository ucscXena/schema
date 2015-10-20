/*global require: false, module: false */
'use strict';
var _ = require('underscore');

// merge, dropping undefined props
//var m = (...objs) => _.pick(_.extend.apply(null, [{}, ...objs]), (v, k) => v !== undefined);

function cases([tag, ...data], c) {
	return c[tag](...data);
}

function string(opts, sType) {
	return cases(sType, {
		'value': (value) => `"${value}"`,
		'pattern': (pat) => `/${pat}/`,
		undefined: () => '<span class="it">string</span>'
	});
}

function minb(v) {
    return _.isUndefined(v) ? '-&infin;' : v;
}

function maxb(v) {
    return _.isUndefined(v) ? '&infin;' : v;
}

function number(opts, nType) {
	return cases(nType, {
		'value': (value) => `${value}`,
		'interval': ([min, max]) => `<span class="it">number [${minb(min)}, ${maxb(max)}]</span>`,
		undefined: () => '<span class="it">number</span>'
	});
}

var toHTML;

function array(opts, aType) {
	return cases(aType, {
		'tuple': (...schs) => `[${_.map(schs, toHTML).join(', ')}]`,
		'list': (sch) => `[${toHTML(sch)}, ...]`
	});
}

// The goal here is to vertically align the :: which appears between keys and their
// values, while keeping the open brace left of all the keys. Do this by creating
// three inline blocks (open brace, keys, values), and setting nowrap on the container.
//function object(opts, ...props) {
//    return `<div class='obj'>` +
//        `<div class='obj-name'>{</div>\n` +
//        `<div class='obj-keys'>${_.map(props, ([t, key]) => `${key} ::`).join('<br>')}</div>\n` +
//        `<div class='obj-vals'>${_.map(props, ([t, k, sch]) => `${toHTML(sch)}`).join(',<br>')}}</div>\n` +
//        `</div>\n`;
//}

var table = (className, ...children)  => `<table class='${className}'><tbody>${children.join('')}</tbody></table>`;
var row = (...children) => `<tr>${children.join('')}</tr>`;
var td = (className, children) => `<td class=${className}>${children}</td>`;
function  objRow(first, last, key, sch) {
    return row(
            td('obj-name', first ? '{' : ''),
            td('obj-keys', `${key} :: `),
            td('obj-vals', toHTML(sch) + (last ? '}' : '')));
}

function object(opts, ...props) {
    return table('obj', ..._.map(props, ([t, key, sch], i) =>
                objRow(i === 0, i === props.length - 1, key, sch)));
}

var or = (opts, ...schs) => _.map(schs, toHTML).join(' | ');

toHTML = function (sch) {
	return cases(sch, {
		'string': string,
		'number': number,
		'array': array,
		'object': object,
        'or': or
	});
};

// How to handle padding with nested elements?
// Only put padding on top-level elements?
var css =
`<style>
    .it {
        font-style: italic;
    }
    .obj {
        display: inline-block;
    }
    .obj, .obj td {
        border-spacing: 0;
        padding: 0;
    }
    .obj-keys {
        vertical-align: top;
    }
    .obj-vals > * {
        vertical-align: bottom;
    }
    .obj-keys {
        text-align: right;
    }
    .obj-desc {
        margin-top: 0;
        margin-left: 8em;
        font-size: .9em;
        background-color: #F0F0F0;
        padding: 0.5em;
    }
</style>\n`;

module.exports = {
    toHTML: toHTML,
    css: css
};
