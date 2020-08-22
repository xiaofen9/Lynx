###
# Module variables.
# @private
###
mediaTyper      = require('media-typer')
minimatch       = require('minimatch')
isArray         = require('util-ex/lib/is/type/array')
isString        = require('util-ex/lib/is/type/string')
isFunction      = require('util-ex/lib/is/type/function')
defineProperty  = require('util-ex/lib/defineProperty')
path            = require('path.js')

extractTypeRegExp = /^\s*([^;\s]*)(?:;|\s|$)/
textTypeRegExp = /^text\//i

###
# Module exports.
# TODO: will deprecate this to use the ES6 module.
# @public
###
module.exports = class MimeTypes
  'use strict'

  dupDefault: 0
  dupSkip: 1
  dupOverwrite: 2
  dupAppend: 3

  constructor: (db, duplicationProcessWay)->
    return new MimeTypes db, duplicationProcessWay if not (this instanceof MimeTypes)
    defineProperty @, 'types', {}

    defineProperty @, 'dup', @dupDefault
    defineProperty @, 'extensions', undefined, get: ->
      result = {}
      for k in Object.keys(@)
        mime = @[k]
        result[k] = mime.extensions
      result

    if duplicationProcessWay and duplicationProcessWay in [0..3]
      @dup = duplicationProcessWay
    @load(db) if db

  ###
  # Get the default charset for a MIME type.
  #
  # @param {string} type
  # @return {boolean|string}
  ###
  charset: (type) ->
    if type and isString type
      try
        obj = mediaTyper.parse(type)
        result = obj.parameters.charset
        if not result
          obj.parameters = undefined
          type = mediaTyper.format(obj)
          result = @[type] and @[type].charset
        # default text/* to utf-8
        result = 'utf-8' if !result and obj.type is 'text'
    result

  ###
  # Create a full Content-Type header given a MIME type or extension.
  #
  # @param {string} str
  # @return {boolean|string}
  ###
  contentType: (str) ->
    `var charset`
    # TODO: should this even be in this module?
    if str and isString str
      mime = if str.indexOf('/') == -1 then @lookup(str) else str
      if mime
        # TODO: use content-type or other module
        if mime.indexOf('charset') == -1
          charset = @charset(mime)
          if charset
            mime += '; charset=' + charset.toLowerCase()
    mime

  ###
  # Get the default extension for a MIME type.
  #
  # @param {string} type
  # @return {boolean|string}
  ###
  extension: (type) ->
    if type and isString type
      # TODO: use media-typer
      result = extractTypeRegExp.exec(type)
      # get extensions
      result = result and @[result[1].toLowerCase()]
      if result
        result = result.defaultExtension or result.extensions[0]
    result

  ###
  # Lookup the MIME types for a file path/extension.
  #
  # @param {string} path
  # @return {undefined|string|array}
  ###
  lookup: (aPath) ->
    if aPath and isString aPath
      # get the extension ("ext" or ".ext" or full path)
      extension = path.extname('x.' + aPath).toLowerCase().substr(1)
      result = @types[extension] if extension
    result
  ###
  # Return all MIME types which matching a pattern
  #   [spec](http://tools.ietf.org/html/rfc2616#section-14.1)
  # @param {string} pattern the mime type pattern, For example "video/*", "audio/*", ..
  # @return {array}
  ###
  glob: (pattern)->
    return [ 'application/octet-stream' ] if pattern == '*/*'
    result = Object.keys(@).filter (name)->
      minimatch(name, pattern)
    result

  ###
  # Whether the mime type is exist.
  # @param {string} type the mime type
  # @return {boolean}
  ###
  exist: Object::hasOwnProperty #(type)-> @hasOwnProperty type

  # source preference (least -> most)
  refSources = [
    'nginx'
    'apache'
    undefined
    'iana'
  ]

  ###
  # Add a custom mime/extension mapping
  # @param (string) type:  mime type
  # @param (object) mime:  mime object
  #  * "source": "iana",
  #  * "charset": "UTF-8",
  #  * "compressible": true,
  #  * "extensions": ["js"]
  # @return {array}: the added extensions
  ###
  define: (type, mime, dup)->
    return unless type and mime and mime.extensions and
      !@hasOwnProperty type
    dup = @dup unless dup?
    exts = mime.extensions
    mime.extensions = [exts] unless isArray exts
    exts = []
    mime.charset = mime.charset.toLowerCase() if mime.charset
    for extension in mime.extensions
      t = @types[extension]
      if t
        switch dup
          when @dupSkip
            continue
          when @dupAppend
            t = [t] if isString t
            t.push type unless type in t
          when @dupOverwrite
            t = type
          when @dupDefault
            t = t[0] if isArray t
            from = refSources.indexOf(@[t].source)
            to = refSources.indexOf(mime.source)
            # skip the remapping
            if t != 'application/octet-stream' and
               from > to or from == to and t.substr(0, 12) == 'application/'
              if process.env.DEBUG_MIME
                console.warn """
                   defineMime(#{type}): the #{extension} extension is exists on
                   #{t} skipped it.
                """
              continue
            else
              t = type
      else
        t = type
      # set the extension -> mime type name
      @types[extension] = t
      exts.push extension
    if exts.length
      mime.extensions = exts
      @[type] = mime
    exts
  ###
  # load mime-types from db.
  ###
  load: (mimes, duplicationProcessWay) ->
    result = 0
    Object.keys(mimes).forEach (type) =>
      t = @define(type, mimes[type], duplicationProcessWay)
      result++ if t and t.length
    result
  ###
  # remove the specified mime-type.
  ###
  delete: (type)->
    result = @exist type
    if result
      # remove from the index of extension.
      for k, v of @types
        if isArray(v)
          i = v.indexOf type
          if i isnt -1
            v.splice(i, 1)
            @types[k] = v[0] if v.length is 1
        else if type is v
          delete @types[k]
      delete @[type]
    result
  ###
  # clear the mime-types.
  ###
  clear: (filter) ->
    result = 0
    for k, v of @
      if @hasOwnProperty(k)
        if isFunction filter
          if filter(k,v)
            @delete(k)
            result++
        else if isString filter
          if minimatch(k, filter)
            @delete(k)
            result++
        else
          @delete(k)
          result++
    result

# the ES6 Module import default:
defineProperty module.exports, 'default', MimeTypes

