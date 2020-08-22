module.exports = {
    objectToString: require('./object-to-string'),

    isArray: Array.isArray,

    isBoolean: require('./is/type/boolean'),

    isNullOrUndefined: require('./is/type/null-or-undefined'),

    isString: require('./is/type/string'),

    isNumber: require('./is/type/number'),

    isUndefined: require('./is/type/undefined'),
    isNull: require('./is/type/null'),
    isError: require('./is/type/error'),
    isPrimitive: require('./is/type/primitive'),

    format: require('./format'),
    inspect: require('./inspect'),
    log: require('./log'),

    isObject: require('./is/type/object'),

    isFunction: require('./is/type/function'),

    isDate: require('./is/type/date'),
    isRegExp: require('./is/type/regexp'),
    isArguments: require('./is/type/arguments'),
    isEmpty: require('./is/empty'),
    isEmptyObject: require('./is/empty-object'),
    //just replace the ctor.super to superCtor,
    inheritsDirectly: require('inherits-ex/lib/inheritsDirectly'),
    /**
     * Inherit the prototype methods from one constructor into another.
     *
     *
     * The Function.prototype.inherits from lang.js rewritten as a standalone
     * function (not on Function.prototype). NOTE: If this file is to be loaded
     * during bootstrapping this function needs to be rewritten using some native
     * functions as prototype setup using normal JavaScript does not work as
     * expected during bootstrapping (see mirror.js in r114903).
     *
     * @param {function} ctor Constructor function which needs to inherit the
     *     prototype.
     * @param {function} superCtor Constructor function to inherit prototype from.
     */
    inherits: require('inherits-ex/lib/inherits'),
    isInheritedFrom: require('inherits-ex/lib/isInheritedFrom'),
    isInheritedFromStr: require('inherits-ex/lib/isInheritedFromStr'),
    newPrototype: require('inherits-ex/lib/newPrototype'),
    createObjectWith: require('inherits-ex/lib/createObjectWith'),
    createObject: require('inherits-ex/lib/createObject'),
    createObjectOld: function(aClass, aArguments) {
      function F() {
          return aClass.apply(this, aArguments);
      }
      F.prototype = aClass.prototype;
      return new F();
    },
    isEmptyFunction: require('./is/empty-function'),
    _extend: require('./_extend'),
    //make sure the aClass.prototype hook to the aObject instance.
    inheritsObject: require('inherits-ex/lib/inheritsObject'),
    //get latest non-empty constructor function through inherits link:
    getConstructor: require('inherits-ex/lib/getConstructor'),
    inject: require('./inject')
}

