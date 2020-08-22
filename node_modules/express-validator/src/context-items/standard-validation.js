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
const utils_1 = require("../utils");
class StandardValidation {
    constructor(validator, negated, options = []) {
        this.validator = validator;
        this.negated = negated;
        this.options = options;
    }
    run(context, value, meta) {
        return __awaiter(this, void 0, void 0, function* () {
            const result = this.validator(utils_1.toString(value), ...this.options);
            if (this.negated ? result : !result) {
                context.addError(this.message, value, meta);
            }
        });
    }
}
exports.StandardValidation = StandardValidation;
