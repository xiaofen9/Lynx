'use strict';

var _jsdom = require('jsdom');

global.window = new _jsdom.JSDOM('<!doctype html><html><body></body></html>').window;
global.document = global.window.document;
global.navigator = global.window.navigator;