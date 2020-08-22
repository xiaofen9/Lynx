/* Copyright 2015-2016 PayPal, Inc. */
"use strict";

var http = require('http');
var https = require('https');
var querystring = require('querystring');
var configuration = require('./configure');
var semver = require('semver');

/**
 * Wraps the http client, handles request parameters, populates request headers, handles response
 * @param  {String}   http_method        HTTP Method GET/POST
 * @param  {String}   path               url endpoint
 * @param  {Object}   data               Payload for HTTP Request
 * @param  {Object}   http_options_param Configuration parameters
 * @param  {Function} cb                 [description]
 */
var invoke = exports.invoke = function invoke(http_method, path, data, http_options_param, cb) {
    var client = (http_options_param.schema === 'http') ? http : https;

    var request_data = data;

    if (http_method === 'GET') {
        //format object parameters into GET request query string
        if (typeof request_data !== 'string') {
            request_data = querystring.stringify(request_data);
        }
        if (request_data) {
            path = path + "?" + request_data;
            request_data = "";
        }
    } else if (typeof request_data !== 'string') {
        request_data = JSON.stringify(request_data);
    }

    var http_options = {};

    if (http_options_param) {

        http_options = JSON.parse(JSON.stringify(http_options_param));

        if (!http_options.headers) {
            http_options.headers = {};
        }
        http_options.path = path;
        http_options.method = http_method;
        if (request_data) {
            http_options.headers['Content-Length'] = Buffer.byteLength(request_data, 'utf-8');
        }

        if (!http_options.headers.Accept) {
            http_options.headers.Accept = 'application/json';
        }

        if (!http_options.headers['Content-Type']) {
            http_options.headers['Content-Type'] = 'application/json';
        }

        http_options.headers['User-Agent'] = configuration.userAgent;
        http_options.withCredentials = false;
    }

    // Enable full request response logging in development/non-production environment only
    if (configuration.default_options.mode !== 'live' && process.env.PAYPAL_DEBUG) {
        console.dir(JSON.stringify(http_options.headers));
        console.dir(request_data);
    }

    //PCI compliance
    if (process.versions !== undefined && process.versions.openssl !== undefined && semver.lt(process.versions.openssl.slice(0, 5), '1.0.1')) {
        console.warn('WARNING: openssl version ' + process.versions.openssl + ' detected. Per PCI Security Council mandate (https://github.com/paypal/TLS-update), you MUST update to the latest security library.');
    }

    var req = client.request(http_options);
    req.on('error', function (e) {
        console.log('problem with request: ' + e.message);
        cb(e, null);
    });

    req.on('response', function (res) {
        var response = '';
        //do not setEndcoding with browserify
        if (res.setEncoding) {
            res.setEncoding('utf8');
        }

        res.on('data', function (chunk) {
            response += chunk;
        });

        res.on('end', function () {
            var err = null;

            try {
                //export PAYPAL_DEBUG to development to get access to paypal-debug-id
                //for questions to merchant technical services.
                if (res.headers['paypal-debug-id'] !== undefined && process.env.PAYPAL_DEBUG) {
                    console.log('paypal-debug-id: ' + res.headers['paypal-debug-id']);

                    if (configuration.default_options.mode !== 'live') {
                        console.dir(JSON.stringify(res.headers));
                        console.dir(response);
                    }
                }

                // Set response to an empty object if no data was received
                if (response.trim() === '') {
                    response = {};
                } else if (typeof res.headers['content-type'] === "string" &&
                    res.headers['content-type'].match(/^application\/json(?:;.*)?$/) !== null) {
                    // Set response to be parsed JSON object if data received is json
                    // expect that content-type header has application/json when it
                    // returns data
                    response = JSON.parse(response);
                }
                response.httpStatusCode = res.statusCode;
            } catch (e) {
                err = new Error('Invalid JSON Response Received. If the response received is empty, please check' +
                 'the httpStatusCode attribute of error message for 401 or 403. It is possible that the client credentials' +
                  'are invalid for the environment you are using, be it live or sandbox.');
                err.error = {
                    name: 'Invalid JSON Response Received, JSON Parse Error.'
                };
                err.response = response;
                err.httpStatusCode = res.statusCode;
                response = null;
            }

            if (!err && (res.statusCode < 200 || res.statusCode >= 300)) {
                err = new Error('Response Status : ' + res.statusCode);
                // response contains the full json description of the error
                // that PayPal returns and information link
                err.response = response;
                if (process.env.PAYPAL_DEBUG) {
                    err.response_stringified = JSON.stringify(response);
                }
                err.httpStatusCode = res.statusCode;
                response = null;
            }
            cb(err, response);
        });
    });

    if (request_data) {
        req.write(request_data);
    }
    req.end();
};
