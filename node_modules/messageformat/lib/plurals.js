"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getPlural = getPlural;
exports.getAllPlurals = getAllPlurals;

var _pluralCategories = _interopRequireDefault(require("make-plural/umd/pluralCategories"));

var _plurals = _interopRequireDefault(require("make-plural/umd/plurals"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * @class
 * @private
 * @hideconstructor
 * @classdesc Utility getter/wrapper for pluralization functions from
 * {@link http://github.com/eemeli/make-plural.js make-plural}
 */
function wrapPluralFunc(lc, pf, pluralKeyChecks) {
  var fn = function () {
    return pf.apply(this, arguments);
  };

  fn.toString = () => pf.toString();

  if (pluralKeyChecks) {
    const pc = _pluralCategories.default[lc] || {};
    fn.cardinal = pc.cardinal;
    fn.ordinal = pc.ordinal;
  } else {
    fn.cardinal = [];
    fn.ordinal = [];
  }

  return fn;
}

function getPlural(locale, {
  pluralKeyChecks
}) {
  for (let lc = String(locale); lc; lc = lc.replace(/[-_]?[^-_]*$/, '')) {
    const pf = _plurals.default[lc];
    if (pf) return wrapPluralFunc(lc, pf, pluralKeyChecks);
  }

  throw new Error('Localisation function not found for locale ' + JSON.stringify(locale));
}

function getAllPlurals({
  pluralKeyChecks
}) {
  const locales = {};
  const keys = Object.keys(_plurals.default);

  for (let i = 0; i < keys.length; ++i) {
    const lc = keys[i];
    locales[lc] = wrapPluralFunc(lc, _plurals.default[lc], pluralKeyChecks);
  }

  return locales;
}