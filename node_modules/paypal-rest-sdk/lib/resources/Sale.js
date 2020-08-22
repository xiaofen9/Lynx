/* Copyright 2015-2016 PayPal, Inc. */
"use strict";

var generate = require('../generate');

/**
 * Completed payments are referred to as sale transactions
 * @return {Object} sale functions
 */
function sale() {
    var baseURL = '/v1/payments/sale/';
    var operations = ['get', 'refund'];

    var ret = {
        baseURL: baseURL
    };
    ret = generate.mixin(ret, operations);
    return ret;
}

module.exports = sale;
