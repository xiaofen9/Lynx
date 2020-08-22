'use strict'

inherits  = require 'inherits-ex'
isString  = require 'util-ex/lib/is/type/string'
isArray   = require 'util-ex/lib/is/type/array'
Path      = require '../path'

class WinPath
  inherits WinPath, Path

  # Regex to split a windows path into three parts: [*, device, slash,
  # tail] windows-only
  splitDeviceRe = ///
    ^
    ([a-zA-Z]:|[\\\/]{2}[^\\\/.]+[\\\/]+[^\\\/.]+)? # 1. device name(c:) or UNCRoot
    ([\\\/])?                                       # 2. root separator
    ([\s\S]*?)                                      # 3. the left path
    $
  ///
  # Regex to split the tail part of the above into [*, dir, basename, ext]
  splitTailRe = /^([\s\S]*?)((?:\.{1,2}|[^\\\/]+?|)(\.[^.\/\\]*|))(?:[\\\/]*)$/

  constructor: -> super
    sep: '\\'
    delimiter: ';'

  cwd: -> process.cwd().replace(/[\\\/]+/g, '\\')

  _isSame: (aDir1, aDir2) -> aDir1.toLowerCase() is aDir2.toLowerCase()

  normalizeUNCRoot: (device) ->
    '\\\\' + device.replace(/^[\\\/]+/, '').replace(/[\\\/]+/g, '\\')

  #convert path string to a path array.
  toArray: (aPath) ->
    ###
    while aPath.length and aPath[0] is _sep
      aPath = aPath.substring(1)
    while aPath.length and aPath[aPath.length - 1] is _sep
      aPath = aPath.substring(0, aPath.length - 1)
    ###
    if aPath and aPath.length
      arr = @splitPath aPath
      root = arr[0]
      result = @trimArray arr[1].split /[\\\/]+/
      result.unshift root if root and (root isnt '\\' or root isnt '/')
      result.push arr[2]
      result
    else
      result = []
    result

  # Function to split a filename into [root, dir, basename, ext]
  splitPath: (filename) ->
    # Separate device+slash from tail
    result = splitDeviceRe.exec(filename)
    device = (result[1] or '') + (result[2] or '')
    tail = result[3] or ''
    # Split the tail into dir, basename and extension
    result2 = splitTailRe.exec(tail)
    dir = result2[1]
    basename = result2[2]
    ext = result2[3]
    [
      device
      dir
      basename
      ext
    ]

  statPath: (path) ->
    result = splitDeviceRe.exec(path)
    device = result[1] or ''
    #UNC paths are always absolute
    isUnc = !!device and device[1] != ':'
    {
      device: device
      isUnc: isUnc
      isAbsolute: isUnc or !!result[2]
      tail: result[3]
    }

  isAbsolute: (path)->@statPath(path).isAbsolute

  _makeLong: (path) ->
    # Note: this will *probably* throw somewhere.
    return path unless isString(path)
    return '' unless path
    resolvedPath = @resolve(path)
    if /^[a-zA-Z]\:\\/.test(resolvedPath)
      # path is local filesystem path, which needs to be converted
      # to long UNC path.
      result = '\\\\?\\' + resolvedPath
    else if /^\\\\[^?.]/.test(resolvedPath)
      # path is network UNC path, which needs to be converted
      # to long UNC path.
      result = '\\\\?\\UNC\\' + resolvedPath.substring(2)
    else
      result = path
    result


  join :->
    result = @_join.apply @, arguments
    if !(/^[\\\/]{2}[^\\\/]/.test(result[0]))
      result = result.join(@_sep)
      result = result.replace(/^[\\\/]{2,}/, '\\')
    else
      result = result.join(@_sep)
    @normalize result
  normalize: (path) ->
    result = @statPath(path)
    device = result.device
    isUnc = result.isUnc
    isAbsolute = result.isAbsolute
    tail = result.tail
    trailingSlash = /[\\\/]$/.test(tail)
    # Normalize the tail path
    tail = @normalizeArray(tail.split(/[\\\/]+/), !isAbsolute).join('\\')
    if !tail and !isAbsolute
      tail = '.'
    if tail and trailingSlash
      tail += @_sep
    # Convert slashes to backslashes when `device` points to an UNC root.
    # Also squash multiple slashes into a single one where appropriate.
    device = @normalizeUNCRoot(device) if isUnc
    device + (if isAbsolute then '\\' else '') + tail

  resolveArray: ->
    resolvedPath = []
    resolvedDevice = ''
    resolvedAbsolute = false
    isUnc = false
    tail = ''

    resolveAbsolutePath = (aPath)=>
      st = @statPath(aPath)
      device = st.device
      if device and resolvedDevice and device.toLowerCase() != resolvedDevice.toLowerCase()
        #This path points to another device so it is not applicable
        return false
      isUnc = st.isUnc
      resolvedDevice = device unless resolvedDevice
      tail = st.tail
      result = resolvedAbsolute
      resolvedAbsolute = st.isAbsolute unless resolvedAbsolute
      return !result

    vCwd = @cwd()
    i = arguments.length
    while --i >= -1 and !(resolvedAbsolute and resolvedDevice)
      if i >= 0
        vPath = arguments[i]
      else if (!resolvedDevice)
        vPath = vCwd
      else
        # Windows has the concept of drive-specific current working
        # directories. If we've resolved a drive letter but not yet an
        # absolute path, get cwd for that drive. We're sure the device is not
        # an unc path at this points, because unc paths are always absolute.
        vpath = process.env['=' + resolvedDevice]
        # Verify that a drive-local cwd was found and that it actually points
        # to our drive. If not, default to the drive's root.
        if !vpath or vpath.substr(0, 3).toLowerCase() != resolvedDevice.toLowerCase() + '\\'
          vpath = resolvedDevice + '\\'

      # Skip empty and invalid entries
      if isArray(vPath)
        if vPath.length == 0
          #treat empty array as root vPath
          resolvedAbsolute = true
        else
          if resolveAbsolutePath(vPath[0])
            resolvedPath = vPath.slice(1).filter(Boolean).concat(resolvedPath)
        continue
      else if not vPath?
        continue
      else if !isString(vPath)
        throw new TypeError 'Arguments to path.resolve must be string or array'
      if resolveAbsolutePath(vPath)
        resolvedPath = tail.split(/[\\\/]+/).filter(Boolean).concat(resolvedPath)

    resolvedDevice = @normalizeUNCRoot(resolvedDevice) if isUnc
    # At this point the path should be resolved to a full absolute path, but
    # handle relative paths to be safe (might happen when process.cwd() fails)
    # Normalize the path
    #resolvedPath = normalizeArray(resolvedPath.split('/').filter(function(p) {
    #  return !!p;
    #}), !resolvedAbsolute).join('/');
    resolvedPath = @normalizeArray(resolvedPath, !resolvedAbsolute)
    resolvedDevice = resolvedDevice + if resolvedAbsolute then @_sep else ''
    resolvedPath.unshift if resolvedDevice then resolvedDevice else '.'
    resolvedPath

  relative: (from, to) ->
    vPathSep = @_sep
    fromParts = @resolveArray(from)
    toParts = @resolveArray(to)
    length = Math.min(fromParts.length, toParts.length)
    samePartsLength = length
    i = -1
    while ++i < length
      if not @_isSame fromParts[i], toParts[i]
        samePartsLength = i
        break
    return @join(toParts) unless samePartsLength
    outputParts = []
    i = samePartsLength
    while i < fromParts.length
      outputParts.push '..'
      i++
    outputParts = outputParts.concat(toParts.slice(samePartsLength))
    outputParts.join vPathSep

module.exports = new WinPath
