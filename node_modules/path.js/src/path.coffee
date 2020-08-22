###jslint node: true ###
###
#   the general Path Class
###
'use strict'
defineProperty    = require("util-ex/lib/defineProperty")
isString          = require('util-ex/lib/is/type/string')
isArray           = require('util-ex/lib/is/type/array')
isObject          = require('util-ex/lib/is/type/object')
isNullOrUndefined = require('util-ex/lib/is/type/null-or-undefined')
escapeStrRe       = require('escape-string-regexp')

module.exports = class Path
  _sepRe: /&SEP&/g
  _sep: '/'
  _delimiter: ':'
  _splitPathReStr: '^(&SEP&?|)([\\s\\S]*?)((?:\\.{1,2}|[^' +
     '&SEP&]+?|)(\\.[^.&SEP&]*|))(?:[&SEP&]*)$'

  @isWindows: process.platform == 'win32'

  constructor: (aOptions)->
    defineProperty @, 'sep', undefined,
      get: => @_sep
      set: (value) =>
        if isString(value) and value.length is 1
          @_sep = value
          @updateSplitPathRe()
    defineProperty @, 'delimiter', undefined,
      get: => @_delimiter
      set: (value) =>
        @_delimiter = value if isString(value) and value.length is 1
    defineProperty @, 'splitPathReStr', undefined,
      get: => @_splitPathReStr
      set: (value) =>
        if isString(value) and @_sepRe.test(value)
          @_splitPathReStr = value
          @updateSplitPathRe()
        else
          throw new TypeError('It should be a string and include "&SEP&"')

    if isString aOptions
      @sep = aOptions
    else if isObject aOptions
      @sep = aOptions.sep if isString aOptions.sep
      @delimiter = aOptions.delimiter if isString aOptions.delimiter
      if isString aOptions.splitPathReStr
        @splitPathReStr = aOptions.splitPathReStr
    @updateSplitPathRe() unless @splitPathRe

  isWindows: @isWindows

  updateSplitPathRe: ->
    # Split a filename into [root, dir, basename, ext], unix version
    # 'root' is just a slash, or nothing.
    @splitPathRe=new RegExp @_splitPathReStr.replace @_sepRe, escapeStrRe(@_sep)


  # Split a filename into [root, dir, basename, ext], unix version
  splitPath: (filename) ->
    @splitPathRe.exec(filename).slice 1

  #convert path string to a path array.
  toArray: (aPath) ->
    ###
    while aPath.length and aPath[0] is _sep
      aPath = aPath.substring(1)
    while aPath.length and aPath[aPath.length - 1] is _sep
      aPath = aPath.substring(0, aPath.length - 1)
    ###
    if aPath and aPath.length
      @trimArray aPath.split @sep
    else
      []
  # resolves . and .. elements in a path array with directory names there
  # must be no slashes or device names (c:\) in the array
  # (so also no leading and trailing slashes - it does not distinguish
  # relative and absolute paths)
  # if parts[0] is "." means relative path and allowAboveRoot.
  normalizeArray: (parts, allowAboveRoot) ->
    res = []
    i = 0
    vSep = @_sep
    if isNullOrUndefined(allowAboveRoot) and parts[0] and parts[0].length
      switch parts[i][0]
        when '.'
          allowAboveRoot = true
          i++
          if parts[i-1].length is 1
            i++ while i < parts.length and parts[i] is '.'
        when vSep
          allowAboveRoot = false
          i++
          if parts[i-1].length is vSep.length
            i++ while i < parts.length and parts[i] is vSep
    while i < parts.length
      p = parts[i]
      # ignore empty parts
      if !p or p == '.'
        i++
        continue
      if p == '..'
        if res.length and res[res.length - 1] != '..'
          res.pop()
        else if allowAboveRoot
          res.push '..'
      else
        res.push p
      i++
    res

  # returns an array with empty elements removed from either end of the input
  # array or the original array if no elements need to be removed
  trimArray: trimArray = (arr) ->
    lastIndex = arr.length - 1
    start = 0
    while start <= lastIndex
      if arr[start]
        break
      start++
    end = lastIndex
    while end >= 0
      if arr[end]
        break
      end--
    if start == 0 and end == lastIndex
      return arr
    if start > end
      return []
    arr.slice start, end + 1

  isAbsolute: (path) ->
    path.charAt(0) is @_sep

  normalize: (path) ->
    isAbsPath = @isAbsolute(path)
    trailingSlash = path and path[path.length - 1] is @_sep
    # Normalize the path
    path = @normalizeArray(path.split(@_sep), !isAbsPath).join(@_sep)
    if !path and !isAbsPath
      path = '.'
    if path and trailingSlash
      path += @_sep
    path = @_sep + path if isAbsPath
    return path
  #get the current work directory
  #process.cwd()
  cwd: -> '.'

  # path.resolve([from ...], to)
  # return [root, parts...]
  # root = '/' or '.'
  # the arguments can be string or array
  resolveArray: ->
    resolvedPath = []
    vCwd = @cwd()
    i = arguments.length
    while --i >= -1 and !resolvedAbsolute
      vPath = if i >= 0 then arguments[i] else vCwd
      # Skip empty and invalid entries
      if isArray(vPath)
        if vPath.length == 0
          #treat empty array as root vPath
          resolvedAbsolute = true
        else
          resolvedPath = vPath.filter(Boolean).concat(resolvedPath)
          resolvedAbsolute = vPath[0] != '.'
        continue
      else if not vPath?
        continue
      else if !isString(vPath)
        throw new TypeError 'Arguments to path.resolve must be string or array'
      resolvedPath = vPath.split(@_sep).filter(Boolean).concat(resolvedPath)
      #resolvedPath = vPath + @_sep + resolvedPath
      resolvedAbsolute = vPath.charAt(0) is @_sep

    # At this point the path should be resolved to a full absolute path, but
    # handle relative paths to be safe (might happen when process.cwd() fails)
    # Normalize the path
    #resolvedPath = normalizeArray(resolvedPath.split('/').filter(function(p) {
    #  return !!p;
    #}), !resolvedAbsolute).join('/');
    resolvedPath = @normalizeArray(resolvedPath, !resolvedAbsolute)
    resolvedPath.unshift if resolvedAbsolute then @_sep else '.'
    resolvedPath

  resolve: ->
    resolvedPath = @resolveArray.apply(@, arguments)
    root = resolvedPath[0]
    root = '' if root is '.'
    resolvedPath.shift 0, 1
    (root + resolvedPath.join(@_sep)) or '.'

  # path.join can mixture array and string arguments now!
  # path.join("path1", ["path2", "path3"], "path4")
  # = path1/path2/path3/path4
  _join: ->
    result = []
    vPathSep = @_sep
    i = -1
    while ++i < arguments.length
      segment = arguments[i]
      if isArray(segment)
        if segment.length == 0# and path.length == 0
          segment = vPathSep
        else
          segment = segment.filter(Boolean).join(vPathSep)
      else unless segment? #isNullOrUndefined(segment)
        # Skip empty and invalid entries
        continue
      else if !isString(segment)
        throw new TypeError('Arguments to path.join must be string or arrays')
      result.push segment if segment
    result

  join :->
    result = @_join.apply @, arguments
    @normalize(result.join @_sep)

  _isSame: (aDir1, aDir2) -> aDir1 is aDir2
  # path.relative(from, to)
  # posix version
  relative: (from, to) ->
    vPathSep = @_sep
    fromParts = @resolveArray(from)
    toParts = @resolveArray(to)
    fromParts.shift 0, 1
    toParts.shift 0, 1
    length = Math.min(fromParts.length, toParts.length)
    samePartsLength = length
    i = -1
    while ++i < length
      if not @_isSame fromParts[i], toParts[i]
        samePartsLength = i
        break
    outputParts = []
    i = samePartsLength
    while i < fromParts.length
      outputParts.push '..'
      i++
    outputParts = outputParts.concat(toParts.slice(samePartsLength))
    outputParts.join vPathSep

  dirname: (path) ->
    result = @splitPath(path)
    root = result[0]
    dir = result[1]

    # No dirname whatsoever
    return '.' if !root and !dir
    # It has a dirname, strip trailing slash
    dir = dir.substr(0, dir.length - 1) if dir
    root + dir

  basename: (path, ext) ->
    f = @splitPath(path)[2]
    # TODO: make this comparison case-insensitive on windows?
    if ext and f.substr(-1 * ext.length) == ext
      f = f.substr(0, f.length - (ext.length))
    f
  replaceExt: (path, ext)->
    v = @splitPath(path)
    f = v[2]
    dir = v[0] + v[1]
    oldExt = v[3]
    # TODO: make this comparison case-insensitive on windows?
    if oldExt and f.substr(-1 * oldExt.length) == oldExt
      f = f.substr(0, f.length - (oldExt.length))
    dir+f+ext

  extname: (path) ->
    @splitPath(path)[3]

  format: (pathObject) ->
    if !isObject(pathObject)
      throw new TypeError 'Parameter \'pathObject\' must be an object, not ' +
        typeof pathObject
    root = pathObject.root or ''
    if !isString(root)
      throw new TypeError '
        \'pathObject.root\' must be a string or undefined, not ' +
        typeof pathObject.root
    dir = pathObject.dir
    if dir? and !isString(dir)
      throw new TypeError '
        \'pathObject.dir\' must be a string or undefined, not ' +
        typeof pathObject.dir
    base = pathObject.base or ''
    if not dir
      dir = ''
    else if dir[dir.length-1] isnt @_sep
      dir += @_sep
    dir + base

  parse: (pathString) ->
    if !isString(pathString)
      throw new TypeError 'Parameter \'pathString\' must be a string, not ' +
        typeof pathString
    allParts = @splitPath(pathString)
    if !allParts or allParts.length != 4
      throw new TypeError('Invalid path \'' + pathString + '\'')
    allParts[1] = allParts[1] or ''
    allParts[2] = allParts[2] or ''
    allParts[3] = allParts[3] or ''
    {
      root: allParts[0]
      dir: allParts[0] + allParts[1].slice(0, -1)
      base: allParts[2]
      ext: allParts[3]
      name: allParts[2].slice(0, allParts[2].length - (allParts[3].length))
    }

  _makeLong: (path) -> path

Path.path = new Path
