/*global require: false, module: false, console: false */
'use strict';
var _ = require('underscore');

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

function fn(toHTML, opts, ...schs) {
	var r = _.partial(annotation, toHTML),
		[retSch, ...paramSchs] = schs,
		ret = retSch === null ? '' : ` => ${r(retSch)}`;
	return `<span>fn(${_.map(paramSchs, r).join(', ')}${ret})</span>`;
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

function annotation(toHTML, schema) {
	// eslint is flagging role is as unused?? an eslint bug?
	var [type, {role}, ref] = schema; //eslint-disable-line no-unused-vars
	return type === 'annotation' ? `<span>${toHTML(ref)} <label class='role'>${_.escape(role)}</label></span>` : toHTML(schema);
}

function tuple(toHTML, opts, ...schs) {
	var r = _.partial(annotation, toHTML);
	return `<span class="align-top">[</span>${_.map(schs, r).join(', ')}]`;
}

function list(toHTML, opts, sch) {
	var r = _.partial(annotation, toHTML);
	return `<span class="align-top">[</span>${r(sch)}, ...]`;
}

function linkKey (id) {
	return `<a class="it" href="#${id}">${id}</a>`;
}

function stringKey(type) {
	return cases(type, {
		'value': (value) => value,
		'pattern': (pat) => pat,
		undefined: () => '/.*/'
	});
}


// The goal here is to vertically align the ':' which appears between keys and their
// values, while keeping the open brace left of all the keys. Do this by creating
// three inline blocks (open brace, keys, values), and setting nowrap on the container.

var table = (className, ...children) => `<table class='${className}'><tbody>${children.join('')}</tbody></table>`;
var row = (...children) => `<tr>${children.join('')}</tr>`;
var td = (className, children) => `<td class=${className}>${children}</td>`;
function objRow(toHTML, first, last, [, {title}, stringSchema], sch) {
	var r = _.partial(annotation, toHTML);
    return row(
            td('obj-name', first ? '{' : ''),
            td('obj-keys', `${title ? linkKey(title) : _.escape(stringKey(stringSchema))} :`),
            td('obj-vals', r(sch) + (last ? '}' : '')));
}

function object(toHTML, opts, ...props) {
    return table('obj', ..._.map(props, ([key, sch], i) =>
                objRow(toHTML, i === 0, i === props.length - 1, key, sch)));
}

function dict(toHTML, opts, [[, {title}, stringSchema], sch]) {
	return table('obj', row(
				td('obj-name', '{'),
				td('obj-keys', `${title ? linkKey(title) : _.escape(stringKey(stringSchema))} :`),
				td('obj-vals', `${toHTML(sch)}, ...}`)));
}

var span = className => el => `<span class="${className}">${el}</span>`;

var inlineSpan = span('inline-block');
var nowrapSpan = span('nowrap');

var or = (toHTML, opts, ...schs) =>
	`<p class="inline-block">${_.map(schs, s => inlineSpan(toHTML(s))).join(' | ')}</p>`;

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
				'function': fn,
				'tuple': tuple,
				'list': list,
				'object': object,
				'dict': dict,
				'or': or,
				'null': nullval,
				'boolean': boolean,
				'annotation': () => {throw new Error('annotation should only appear in collection types');}
			}, render));
		} else {
			if (!title) {
				console.warn('Missing title for top-level schema');
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
		background-color: #ECECEC;
		font-size: 90%;
	}
</style>\n`;

module.exports = {
    toHTML: toHTML,
    css: css
};
