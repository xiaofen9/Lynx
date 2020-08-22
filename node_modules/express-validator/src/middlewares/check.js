"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const chain_1 = require("../chain");
const utils_1 = require("../utils");
const context_builder_1 = require("../context-builder");
function check(fields = '', locations = [], message) {
    const builder = new context_builder_1.ContextBuilder()
        .setFields(Array.isArray(fields) ? fields : [fields])
        .setLocations(locations)
        .setMessage(message);
    const runner = new chain_1.ContextRunnerImpl(builder);
    const middleware = (req, _res, next) => __awaiter(this, void 0, void 0, function* () {
        try {
            yield runner.run(req);
            next();
        }
        catch (e) {
            next(e);
        }
    });
    return Object.assign(middleware, utils_1.bindAll(runner), utils_1.bindAll(new chain_1.SanitizersImpl(builder, middleware)), utils_1.bindAll(new chain_1.ValidatorsImpl(builder, middleware)), utils_1.bindAll(new chain_1.ContextHandlerImpl(builder, middleware)), { builder });
}
exports.check = check;
