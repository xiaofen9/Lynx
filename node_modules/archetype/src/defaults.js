'use strict';

module.exports = applyDefaults;

const get = require('./get');
const join = require('./unmarshal/util').join;
const realPathToSchemaPath = require('./unmarshal/util').realPathToSchemaPath;
const shouldSkipPath = require('./util').shouldSkipPath;

function applyDefaults(obj, schema, projection) {
  const keys = Object.keys(schema._obj);
  for (const key of keys) {
    const def = defaults(obj, obj[key], schema, key, projection);
    if (def !== void 0 && obj[key] == null) {
      obj[key] = def;
    }
  }
}

function defaults(root, v, schema, path, projection) {
  if (shouldSkipPath(projection, path) || projection.$noDefaults) {
    return;
  }

  const fakePath = realPathToSchemaPath(path);
  const schemaPath = schema._paths[fakePath];

  if (!schemaPath) {
    return;
  }

  if ('$default' in schemaPath) {
    return handleDefault(schemaPath.$default, root);
  }

  if (schemaPath.$type === Object && schemaPath.$schema) {
    for (const key of Object.keys(schemaPath.$schema)) {
      const fullPath = join(fakePath, key);
      const value = get(v, key);
      // Might have nested defaults even if this level isn't nullish
      const def = defaults(root, value, schema, fullPath, projection);
      if (def !== void 0 && value == null) {
        if (v == null) {
          v = {};
        }
        v[key] = def;
      }
    }

    return v;
  }
  if (schemaPath.$type === Array) {
    const arr = v || [];
    for (let index = 0; index < arr.length; ++index) {
      const value = v[index];
      const def = defaults(root, value, schema,
        join(fakePath, index.toString()), projection);
      if (def !== void 0 && value == null) {
        v[index] = def;
      }
    }

    return v;
  }
}

function handleDefault(obj, ctx) {
  if (typeof obj === 'function') {
    return obj(ctx);
  }
  return obj;
}
