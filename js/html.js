/*global require: false, module: false, console: false */
'use strict';
var _ = require('underscore');

// merge, dropping undefined props
//var m = (...objs) => _.pick(_.extend.apply(null, [{}, ...objs]), (v, k) => v !== undefined);

function cases([tag, ...data], c) {
	return c[tag](...data);
}

function nullval() {
	return '<span class="it">null</span>';
}

function boolean() {
	return '<span class="it">boolean</span>';
}

function string(toHTML, opts, sType) {
	return cases(sType, {
		'value': (value) => `<span class="nowrap">"${_.escape(value)}"</span>`,
		'pattern': (pat) => `<span class="nowrap">${_.escape(pat)}</span>`,
		undefined: () => '<span class="it">string</span>'
	});
}

function minb(v) {
    return _.isUndefined(v) ? '-&infin;' : v;
}

function maxb(v) {
    return _.isUndefined(v) ? '&infin;' : v;
}

function number(toHTML, opts, nType) {
	return cases(nType, {
		'value': (value) => `${value}`,
		'interval': ([min, max]) => `<span class="it">number [${minb(min)}, ${maxb(max)}]</span>`,
		undefined: () => '<span class="it">number</span>'
	});
}

function role(toHTML, schema) {
	// eslint is flagging role is as unused?? an eslint bug?
	var [, {role}] = schema, //eslint-disable-line no-unused-vars
		html = toHTML(schema);
	return role ? `<span>${html} <label class='role'>${_.escape(role)}</label></span>` : html;
}

function array(toHTML, opts, aType) {
	var r = _.partial(role, toHTML);
	return cases(aType, {
		'tuple': (...schs) => `<span class="align-top">[</span>${_.map(schs, r).join(', ')}]`,
		'list': (sch) => `<span class="align-top">[</span>${r(sch)}, ...]`
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

function linkKey (k) {
	var id = k.slice(1, k.length - 1);
	return `<a class="it" href="#${id}">${id}</a>`;
}

var isLink = k => k[0] === '<';

var table = (className, ...children) => `<table class='${className}'><tbody>${children.join('')}</tbody></table>`;
var row = (...children) => `<tr>${children.join('')}</tr>`;
var td = (className, children) => `<td class=${className}>${children}</td>`;
function objRow(toHTML, first, last, key, sch) {
    return row(
            td('obj-name', first ? '{' : ''),
            td('obj-keys', `${isLink(key) ? linkKey(key) : _.escape(key)} :`),
            td('obj-vals', toHTML(sch) + (last ? '}' : '')));
}

function object(toHTML, opts, ...props) {
    return table('obj', ..._.map(props, ([t, key, sch], i) =>
                objRow(toHTML, i === 0, i === props.length - 1, key, sch)));
}

var or = (toHTML, opts, ...schs) => `<p class="inline-block">${_.map(schs, toHTML).join(' | ')}</p>`;

var partialAll = (o, ...args) => _.mapObject(o, f => _.partial(f, ...args));

function toHTML(sch, top = []) {
	var [, {title, description}] = sch,
		h = (title ? `<h3 id="${title}"}>${title}</h3>` : '') +
			(description ? `<p class='subtitle'>${description}</p>` : '');
	function render(s) {
		var [, {title}] = s;
		if (sch === s || top.indexOf(s) === -1) {
			return cases(s, partialAll({
				'string': string,
				'number': number,
				'array': array,
				'object': object,
				'or': or,
				'null': nullval,
				'boolean': boolean
			}, render));
		} else {
			if (!title) {
				console.warn('Missing title for top-level sema');
			}
			return title ? `<a href="#${title}"><em>${title}</em></a>` : '';
		}
	}
	return h + render(sch);
}

// How to handle padding with nested elements?
// Only put padding on top-level elements?
var css =
`<style>
	p {
		max-width: 50em;
		margin: 0;
	}
	.inline-block {
		display: inline-block;
	}
	.nowrap {
		white-space: nowrap;
	}
    .it {
        font-style: italic;
    }
	.subtitle {
		margin-top: -1em;
		margin-bottom: 1em;
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
        text-align: right;
    }
	td.obj-keys {
		padding-right: 0.5em;
	}
    .obj-vals > * {
        vertical-align: bottom;
    }
	.obj-vals > .align-top {
		vertical-align: top;
	}
	.obj-name {
		vertical-align: top;
	}
    .obj-desc {
        margin-top: 0;
        margin-left: 8em;
        font-size: .9em;
        background-color: #F0F0F0;
        padding: 0.5em;
    }
	.role {
		border-radius: 3px;
		padding: 0px 2px 0px 2px;
		color: white;
		background-color: gray;
		font-size: 90%;
	}
</style>\n`;

module.exports = {
    toHTML: toHTML,
    css: css
};
