/*global console: false, require: false, document: false */
'use strict';

var demo = require('./demo-schema');
var {toHTML, css} = require('./html');
var main = document.getElementById('main');
var _ = require('underscore');

var top = _.values(demo);

var docs = _.map(top, s => toHTML(s, top)).join('<br>');
var page =
`<html>
    <body>
    ${css}
	${docs}
    </body>
</html>`;

main.innerHTML = page;
