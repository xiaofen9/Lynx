/* Copyright 2015-2016 PayPal, Inc. */
"use strict";

var generate = require('../generate');
var api = require('../api');

function invoiceTemplate() {
    var baseURL = '/v1/invoicing/templates/';
    var operations = ['create', 'get', 'list', 'delete'];

    var ret = {
        baseURL: baseURL,
        update: function update(id, data, config, cb) {
            api.executeHttp('PUT', this.baseURL + id, data, config, cb);
        }
    };

    ret = generate.mixin(ret, operations);
    return ret;
}

module.exports = invoiceTemplate;
