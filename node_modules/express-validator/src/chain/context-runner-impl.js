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
const select_fields_1 = require("../select-fields");
const base_1 = require("../base");
class ContextRunnerImpl {
    constructor(builder, selectFields = select_fields_1.selectFields) {
        this.builder = builder;
        this.selectFields = selectFields;
    }
    run(req, options = {}) {
        return __awaiter(this, void 0, void 0, function* () {
            const context = this.builder.build();
            const instances = this.selectFields(req, context.fields, context.locations);
            context.addFieldInstances(instances);
            const haltedInstances = new Set();
            for (const contextItem of context.stack) {
                const promises = context.getData({ requiredOnly: true }).map((instance) => __awaiter(this, void 0, void 0, function* () {
                    const instanceKey = `${instance.location}:${instance.path}`;
                    if (haltedInstances.has(instanceKey)) {
                        return;
                    }
                    try {
                        yield contextItem.run(context, instance.value, {
                            req,
                            location: instance.location,
                            path: instance.path,
                        });
                    }
                    catch (e) {
                        if (e instanceof base_1.ValidationHalt) {
                            haltedInstances.add(instanceKey);
                            return;
                        }
                        throw e;
                    }
                }));
                yield Promise.all(promises);
            }
            if (options.saveContext === undefined || options.saveContext) {
                const internalReq = req;
                internalReq[base_1.contextsSymbol] = (internalReq[base_1.contextsSymbol] || []).concat(context);
            }
            return context;
        });
    }
}
exports.ContextRunnerImpl = ContextRunnerImpl;
