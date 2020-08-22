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
const base_1 = require("../base");
class CustomCondition {
    constructor(condition) {
        this.condition = condition;
    }
    run(_context, value, meta) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const result = this.condition(value, meta);
                yield result;
                // if the promise resolved or the result is truthy somehow, then there's no validation halt.
                if (!result) {
                    // the error thrown here is symbolic, it will be re-thrown in the catch clause anyway.
                    throw new Error();
                }
            }
            catch (e) {
                throw new base_1.ValidationHalt();
            }
        });
    }
}
exports.CustomCondition = CustomCondition;
