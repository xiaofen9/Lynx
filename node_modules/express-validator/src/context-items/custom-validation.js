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
class CustomValidation {
    constructor(validator, negated) {
        this.validator = validator;
        this.negated = negated;
    }
    run(context, value, meta) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const result = this.validator(value, meta);
                const actualResult = yield result;
                const isPromise = result && result.then;
                const failed = this.negated ? actualResult : !actualResult;
                // A promise that was resolved only adds an error if negated.
                // Otherwise it always suceeds
                if ((!isPromise && failed) || (isPromise && this.negated)) {
                    context.addError(this.message, value, meta);
                }
            }
            catch (err) {
                if (this.negated) {
                    return;
                }
                context.addError((err instanceof Error ? err.message : err) || this.message, value, meta);
            }
        });
    }
}
exports.CustomValidation = CustomValidation;
