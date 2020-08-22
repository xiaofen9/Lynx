/* Copyright 2015-2016 PayPal, Inc. */
"use strict";

var generate = require('../generate');

/**
 * Store credit cards information securely in vault
 * @return {Object} Credit Card functions
 */
function creditCard() {
    var baseURL = '/v1/vault/credit-cards/';
    var operations = ['create', 'get', 'update', 'del', 'delete', 'list'];

    var ret = {
        baseURL: baseURL
    };
    ret = generate.mixin(ret, operations);
    return ret;
}

module.exports = creditCard;
