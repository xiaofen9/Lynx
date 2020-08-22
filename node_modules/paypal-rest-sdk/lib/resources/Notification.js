/* Copyright 2015-2016 PayPal, Inc. */
"use strict";

var generate = require('../generate');
var api = require('../api');
var https = require('https');
var crypto = require('crypto');
var crc32 = require('buffer-crc32');

/**
 * Exposes REST endpoints for creating and managing webhooks
 * @return {Object} webhook functions
 */
function webhook() {
    var baseURL = '/v1/notifications/webhooks/';
    var operations = ['create', 'list', 'get', 'del', 'delete'];

    var ret = {
        baseURL: baseURL,
        replace: function replace(id, data, config, cb) {
            api.executeHttp('PATCH', this.baseURL + id, data, config, cb);
        },
        eventTypes: function eventTypes(id, config, cb) {
            api.executeHttp('GET', this.baseURL + id + '/event-types', {}, config, cb);
        }
    };
    ret = generate.mixin(ret, operations);
    return ret;
}

/**
 * Exposes REST endpoints for working with subscribed webhooks events
 *
 * https://developer.paypal.com/webapps/developer/docs/integration/direct/rest-webhooks-overview/#events
 * @return {Object} webhook event functions
 */
function webhookEvent() {
    var baseURL = '/v1/notifications/webhooks-events/';
    var operations = ['list', 'get'];

    /**
     * Instead of calling this method, it is recommended that you initiate a GET request in your code for the webhook
     * event data and use the returned information from the webhook or use the updated verify() function. See
     * https://github.com/paypal/PayPal-node-SDK/wiki/Webhook-Validation
     *
     * @example
     * var paypal = require('paypal-rest-sdk');
     * function(request, response) {
     *     try {
     *         // Get the Webhook event id from the incoming event request
     *         var webhookEventId = JSON.parse(request.body).id;
     *
     *         paypal.notification.webhookEvent.get(webhookEventId, function (error, webhookEvent) {
     *             if (error) {
     *                 console.log(error);
     *                 // The webhook event data could not be found.
     *                 // Send a HTTP 503 response status code ( http://www.w3.org/Protocols/rfc2616/rfc2616-sec10.html#sec10.5.4 )
     *                 // to signal to PayPal to resend the request at a later time.
     *                 response.sendStatus(503);
     *             } else {
     *                 // Proceed to use the data from PayPal
     *                 console.log("Get webhookEvent Response");
     *                 console.log(JSON.stringify(webhookEvent));
     *                 response.sendStatus(200);
     *             }
     *         });
     *     } catch (e) {
     *         // The webhook id could not be found or any other error occurred.
     *         // Send a HTTP 503 response status code ( http://www.w3.org/Protocols/rfc2616/rfc2616-sec10.html#sec10.5.4 )
     *         // to signal to PayPal to resend the request at a later time
     *         response.sendStatus(503);
     *     }
     * }
     *
     * @deprecated
     * @param  {String}   body raw body of request
     * @param  {Function} cb   callback function
     */
    function getAndVerify(body, cb) {
        var response = false;
        var err = null;
        try {
            var webhookEventId = JSON.parse(body).id;
            api.executeHttp('GET', baseURL + webhookEventId, {}, function (error, res) {
                if (error) {
                    cb(error, response);
                } else {
                    cb(err, true);
                }
            });
        } catch (e) {
            err = new Error("Webhook Event Id attribute not found. Possible reason could be invalid JSON Object.");
            cb(err, response);
        }
    }

    /**
     * @param {Object} headers from request
     * @param {String} raw body of request
     * @param {String} webhook id
     * @param {Function} callback function
     */
    function verify(headers, body, webhookId, callback) {
        // In an effort not to break existing applications, accept old arguments temporarily
        if (arguments.length > 4) {
            /* jshint validthis: true */
            return verifyLegacy.apply(this, arguments);
        }

        if (typeof headers !== 'object') {
            return callback(new Error("headers is not an object"), false);
        }

        // Normalizes headers
        Object.keys(headers).forEach(function (header) {
            headers[header.toUpperCase()] = headers[header];
        });

        var webhookEventBody = (typeof body === "string") ? JSON.parse(body) : body;

        var payload = {
            'auth_algo': headers['PAYPAL-AUTH-ALGO'],
            'cert_url': headers['PAYPAL-CERT-URL'],
            'transmission_id': headers['PAYPAL-TRANSMISSION-ID'],
            'transmission_sig': headers['PAYPAL-TRANSMISSION-SIG'],
            'transmission_time': headers['PAYPAL-TRANSMISSION-TIME'],
            'webhook_id': webhookId,
            'webhook_event': webhookEventBody
        };

        api.executeHttp('POST', '/v1/notifications/verify-webhook-signature', payload, callback);
    }

    function verifyLegacy(certURL, transmissionId, timeStamp, webhookId, eventBody, ppTransmissionSig, cb) {
        // Emit a warning that the arguments have changed
        if (process.env.NODE_ENV === 'development') {
            console.log('PayPal-Node-SDK: Webhook verify arguments have changed. Please check the latest documentation on https://developer.paypal.com/docs/integration/direct/rest-webhooks-overview/#event-signature.');
        }

        var headers = {
            // This is currently the default auth algorithm. If this changes, need to change. Legacy method did
            // not pass in the algorithm.
            'PAYPAL-AUTH-ALGO': 'SHA256withRSA',
            'PAYPAL-CERT-URL': certURL,
            'PAYPAL-TRANSMISSION-ID': transmissionId,
            'PAYPAL-TRANSMISSION-SIG': ppTransmissionSig,
            'PAYPAL-TRANSMISSION-TIME': timeStamp
        };

        function legacyCallback(error, response) {
            if (error) {
                cb(error, false);
            } else {
                // Verification status must be SUCCESS
                if (response.verification_status === "SUCCESS") {
                    cb(null, true);
                } else {
                    cb(null, false);
                }
            }
        }

        return verify(headers, eventBody, webhookId, legacyCallback);
    }

    var ret = {
        baseURL: baseURL,
        verify: verify,
        getAndVerify: getAndVerify,
        resend: function resend(id, config, cb) {
            api.executeHttp('POST', this.baseURL + id + '/resend', {}, config, cb);
        }
    };
    ret = generate.mixin(ret, operations);
    return ret;
}

/**
 * Exposes REST endpoint for listing available event types for webhooks
 * @return {Object} webhook event type functions
 */
function webhookEventType() {
    var baseURL = '/v1/notifications/webhooks-event-types/';
    var operations = ['list'];

    var ret = {
        baseURL: baseURL
    };
    ret = generate.mixin(ret, operations);
    return ret;
}

/**
 * Exposes the namespace for webhook and webhook event functionalities
 * 
 * https://developer.paypal.com/webapps/developer/docs/api/#notifications
 * @return {Object} notification functions
 */
function notification() {
    return {
        webhook: webhook(),
        webhookEvent: webhookEvent(),
        webhookEventType: webhookEventType()
    };
}

module.exports = notification;
