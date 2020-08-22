chai            = require 'chai'
sinon           = require 'sinon'
sinonChai       = require 'sinon-chai'
assert          = chai.assert
should          = chai.should()
chai.use(sinonChai)

Path            = require "../src/path"
path            = new Path

#arguments                     result
commonTests = [
     [['/', '/', '.', '..', 'b','c.js'], '/b/c.js'],
     [['.', 'x', 'b', '..', 'b','c.js'], 'x/b/c.js'],
     [['/.', 'x','b', '..', 'b','c.js'], '/x/b/c.js'],
     [['/foo', '../../../bar'], '/bar'],
     [['.','foo', '../../../bar'], '../../bar'],
     [['.','foo/', '../../../bar'], '../../bar'],
     [['.','foo/x', '../../../bar'], '../bar'],
     [['foo/x', './bar'], 'foo/x/bar'],
     [['foo/x/', './bar'], 'foo/x/bar'],
     [['foo/x/', '.', 'bar'], 'foo/x/bar'],
     [['.', '.', '.'], '.'],
     [['.', './', '.'], '.'],
     [['.'], '.'],
     [['', '.'], '.'],
     [['', 'foo'], 'foo'],
     [['', '/foo'], '/foo'],
     [['', '', '/foo'], '/foo'],
     [['', '', 'foo'], 'foo'],
     [['foo', ''], 'foo'],
     [['/'], '/'],
     [['/', '.'], '/'],
     [['/', '..'], '/'],
     [['/', '..', '..'], '/'],
     [[''], '.'],
     [['', ''], '.'],
     [[' /foo'], ' /foo'],
     [[' ', 'foo'], ' /foo'],
     [[' ', '.'], ' '],
     [[' ', ''], ' '],
     [['/', 'foo'], '/foo'],
     [['/', '/foo'], '/foo'],
     [['/', '//foo'], '/foo'],
     [['/', '', '/foo'], '/foo'],
     [['', '/', 'foo'], '/foo'],
     [['', '/', '/foo'], '/foo']
]
joinTests = commonTests.slice()
joinTests.push [['.', '/./', '.'], '.'],
     [['foo', '', '/bar'], 'foo/bar'],
     [['./', '..', '/foo'], '../foo'],
     [['foo', '/bar'], 'foo/bar'],
     [['foo/', ''], 'foo/'],
     [['./', '..', '..', '/foo'], '../../foo'],
     [['.', '..', '..', '/foo'], '../../foo'],
     [['', '.', '..', '..', '/foo'], '../../foo'],
     [[' ', '/'], ' /'],
     [['./'], './'],
     [['.', './'], './'],
     [['.', '/////./', '.'], '.']
resolveTests = commonTests.slice()
resolveTests.push [['.', '/./', '.'], '/'],
     [['foo', '', '/bar'], '/bar'],
     [['./', '..', '/foo'], '/foo'],
     [['foo', '/bar'], '/bar'],
     [['foo/', ''], 'foo'],
     [['./', '..', '..', '/foo'], '/foo'],
     [['.', '..', '..', 'foo'], '../../foo'],
     [['', '.', '..', '..', '/foo'], '/foo'],
     [['', '.', '..', '..', 'foo'], '../../foo'],
     [[' ', '/'], '/'],
     [['./'], '.'],
     [['.', './'], '.'],
     [['/var/lib', '../', 'file/'], '/var/file'],
     [['/var/lib', '/../', 'file/'], '/file'],
     [['a/b/c/', '../../..'], '.'],
     [['/some/dir', '.', '/absolute/'], '/absolute'],
     [['.', '/////./', '.'], '/']
# posix
# arguments                    result
relativeTests = [
  ['/var/lib', '/var', '..'],
  ['/var/lib', '/bin', '../../bin'],
  ['/var/lib', '/var/lib', ''],
  ['/var/lib', '/var/apache', '../apache'],
  ['/var/', '/var/lib', 'lib'],
  ['/', '/var/lib', 'var/lib']
]

describe "general path functions", ->
  _splitPathReStr= '^(&SEP&?|)([\\s\\S]*?)((?:\\.{1,2}|[^' +
     '&SEP&]+?|)(\\.[^.&SEP&]*|))(?:[&SEP&]*)$'

  it "should detect default configs", ->
    path.sep.should.be.equal '/'
    path.delimiter.should.be.equal ':'
    path.splitPathReStr.should.be.equal _splitPathReStr
  it "should change default configs", ->
    path.sep = '?'
    path.sep.should.be.equal '?'
    path.delimiter = ';'
    path.delimiter.should.be.equal ';'
    result = path.splitPath '?sdsd?asas?sdd.com'
    result.should.be.deep.equal ['?', 'sdsd?asas?', 'sdd.com', '.com']

    #restore the default configs
    path.sep = '/'
    path.delimiter = ':'

  it "should have a global path instance on Path class", ->
    Path.should.have.ownProperty 'path'
    Path.path.should.be.instanceof Path

  describe "trimArray", ->

    it "should trim array from left", ->
      result = path.trimArray ['', '', false, undefined, '123', 'abc']
      result.should.be.deep.equal ['123', 'abc']
    it "should trim array from right", ->
      result = path.trimArray ['123', 'abc', '', '', false, undefined]
      result.should.be.deep.equal ['123', 'abc']
    it "should trim array from left and right direction", ->
      result = path.trimArray [
        '', '', false, undefined
        '123', 'abc'
        '', '', false, undefined
      ]
      result.should.be.deep.equal ['123', 'abc']
    it "should trim a trimed array", ->
      result = path.trimArray ['123', 'abc']
      result.should.be.deep.equal ['123', 'abc']
    it "should trim empty array ", ->
      result = path.trimArray ['', '', false, undefined, null]
      result.should.be.deep.equal []

  describe "splitPath", ->
    it 'should split absoluted file path', ->
      result = path.splitPath '/sdsd/asas/sdd.com'
      result.should.be.deep.equal ['/', 'sdsd/asas/', 'sdd.com', '.com']
    it 'should split related file path', ->
      result = path.splitPath 'sdsd/asas/sdd.com'
      result.should.be.deep.equal ['', 'sdsd/asas/', 'sdd.com', '.com']
    it 'should split absoluted path', ->
      result = path.splitPath '/sdsd/asas/sdd'
      result.should.be.deep.equal ['/', 'sdsd/asas/', 'sdd', '']
    it 'should split related path', ->
      result = path.splitPath 'sdsd/asas/sdd'
      result.should.be.deep.equal ['', 'sdsd/asas/', 'sdd', '']

  describe "normalizeArray", ->
    it 'should normalize array', ->
      joinTests.forEach (test) ->
        actual = path.normalizeArray(path.trimArray(test[0]).join(path.sep).split(path.sep))
        expected = path.trimArray(test[1].split(path.sep))
        expected = [] if expected.length is 1 and expected[0] is '.'
        actual.should.be.deep.equal(expected)

  describe "normalize", ->
    it 'should normalize path', ->
      joinTests.forEach (test) ->
        actual = path.normalize(path.trimArray(test[0]).join(path.sep))
        expected = test[1]
        actual.should.be.deep.equal(expected)

  describe "resolve", ->
    it 'should resolve path', ->
      resolveTests.forEach (test) ->
        actual = path.resolve.apply(path, test[0])
        expected = test[1]
        actual.should.be.deep.equal(expected)

  describe "join", ->
    it 'should join path', ->
      path.join().should.be.equal '.'
      joinTests.forEach (test) ->
        actual = path.join.apply(path, test[0])
        expected = test[1]
        actual.should.be.deep.equal(expected)

  describe "relative", ->
    it 'should relative from path to path', ->
      relativeTests.forEach (test) ->
        actual = path.relative(test[0], test[1])
        expected = test[2]
        actual.should.be.deep.equal(expected)

  describe "basename", ->
    it 'should get basename from path', ->
      f = __filename
      assert.equal path.basename(f), 'path-test.coffee'
      assert.equal path.basename(f, '.coffee'), 'path-test'

      assert.equal path.basename(''), ''
      assert.equal path.basename('/dir/basename.ext'), 'basename.ext'
      assert.equal path.basename('/basename.ext'), 'basename.ext'
      assert.equal path.basename('basename.ext'), 'basename.ext'
      assert.equal path.basename('basename.ext/'), 'basename.ext'
      assert.equal path.basename('basename.ext//'), 'basename.ext'

      # On unix a backslash is just treated as any other character.
      assert.equal path.basename('\\dir\\basename.ext'), '\\dir\\basename.ext'
      assert.equal path.basename('\\basename.ext'), '\\basename.ext'
      assert.equal path.basename('basename.ext'), 'basename.ext'
      assert.equal path.basename('basename.ext\\'), 'basename.ext\\'
      assert.equal path.basename('basename.ext\\\\'), 'basename.ext\\\\'

      # POSIX filenames may include control characters
      # c.f. http://www.dwheeler.com/essays/fixing-unix-linux-filenames.html
      f = 'Icon' + String.fromCharCode(13)
      assert.equal path.basename('/a/b/' + f), f

  describe "dirname", ->
    it 'should get dirname from path', ->
      f = __filename
      assert.equal path.dirname(f).substr(-4), 'test'
      assert.equal path.dirname('/a/b/'), '/a'
      assert.equal path.dirname('/a/b'), '/a'
      assert.equal path.dirname('/a'), '/'
      assert.equal path.dirname(''), '.'
      assert.equal path.dirname('/'), '/'
      assert.equal path.dirname('////'), '/'

  describe "extname", ->
    it 'should get ext name from path', ->
      f = __filename
      assert.equal path.extname(f), '.coffee'
      assert.equal path.extname(''), ''
      assert.equal path.extname('/path/to/file'), ''
      assert.equal path.extname('/path/to/file.ext'), '.ext'
      assert.equal path.extname('/path.to/file.ext'), '.ext'
      assert.equal path.extname('/path.to/file'), ''
      assert.equal path.extname('/path.to/.file'), ''
      assert.equal path.extname('/path.to/.file.ext'), '.ext'
      assert.equal path.extname('/path/to/f.ext'), '.ext'
      assert.equal path.extname('/path/to/..ext'), '.ext'
      assert.equal path.extname('file'), ''
      assert.equal path.extname('file.ext'), '.ext'
      assert.equal path.extname('.file'), ''
      assert.equal path.extname('.file.ext'), '.ext'
      assert.equal path.extname('/file'), ''
      assert.equal path.extname('/file.ext'), '.ext'
      assert.equal path.extname('/.file'), ''
      assert.equal path.extname('/.file.ext'), '.ext'
      assert.equal path.extname('.path/file.ext'), '.ext'
      assert.equal path.extname('file.ext.ext'), '.ext'
      assert.equal path.extname('file.'), '.'
      assert.equal path.extname('.'), ''
      assert.equal path.extname('./'), ''
      assert.equal path.extname('.file.ext'), '.ext'
      assert.equal path.extname('.file'), ''
      assert.equal path.extname('.file.'), '.'
      assert.equal path.extname('.file..'), '.'
      assert.equal path.extname('..'), ''
      assert.equal path.extname('../'), ''
      assert.equal path.extname('..file.ext'), '.ext'
      assert.equal path.extname('..file'), '.file'
      assert.equal path.extname('..file.'), '.'
      assert.equal path.extname('..file..'), '.'
      assert.equal path.extname('...'), '.'
      assert.equal path.extname('...ext'), '.ext'
      assert.equal path.extname('....'), '.'
      assert.equal path.extname('file.ext/'), '.ext'
      assert.equal path.extname('file.ext//'), '.ext'
      assert.equal path.extname('file/'), ''
      assert.equal path.extname('file//'), ''
      assert.equal path.extname('file./'), '.'
      assert.equal path.extname('file.//'), '.'
      # On unix, backspace is a valid name component like any other character.
      assert.equal path.extname('.\\'), ''
      assert.equal path.extname('..\\'), '.\\'
      assert.equal path.extname('file.ext\\'), '.ext\\'
      assert.equal path.extname('file.ext\\\\'), '.ext\\\\'
      assert.equal path.extname('file\\'), ''
      assert.equal path.extname('file\\\\'), ''
      assert.equal path.extname('file.\\'), '.\\'
      assert.equal path.extname('file.\\\\'), '.\\\\'

  describe "_makeLong", ->
    it 'should _makeLong from path', ->
      assert.equal path._makeLong(null), null
      assert.equal path._makeLong(100), 100
      assert.equal path._makeLong(path), path
      assert.equal path._makeLong(false), false
      assert.equal path._makeLong(true), true

  describe "parse path format", ->
    unixPaths = [
      '/home/user/dir/file.txt',
      '/home/user/a dir/another File.zip',
      '/home/user/a dir//another&File.',
      '/home/user/a$$$dir//another File.zip',
      'user/dir/another File.zip',
      'file',
      '.\\file',
      './file',
      'C:\\foo'
    ]

    unixSpecialCaseFormatTests = [
      [{dir: 'some/dir'}, 'some/dir/'],
      [{base: 'index.html'}, 'index.html'],
      [{}, '']
    ]

    errors = [
      {method: 'parse', input: [null], message: /Parameter 'pathString' must be a string, not/},
      {method: 'parse', input: [{}], message: /Parameter 'pathString' must be a string, not object/},
      {method: 'parse', input: [true], message: /Parameter 'pathString' must be a string, not boolean/},
      {method: 'parse', input: [1], message: /Parameter 'pathString' must be a string, not number/},
      {method: 'parse', input: [], message: /Parameter 'pathString' must be a string, not undefined/},
      # {method: 'parse', input: [''], message: /Invalid path/}, // omitted because it's hard to trigger!
      {method: 'format', input: [null], message: /Parameter 'pathObject' must be an object, not/},
      {method: 'format', input: [''], message: /Parameter 'pathObject' must be an object, not string/},
      {method: 'format', input: [true], message: /Parameter 'pathObject' must be an object, not boolean/},
      {method: 'format', input: [1], message: /Parameter 'pathObject' must be an object, not number/},
      {method: 'format', input: [{root: true}], message: /'pathObject.root' must be a string or undefined, not boolean/},
      {method: 'format', input: [{root: 12}], message: /'pathObject.root' must be a string or undefined, not number/},
    ]
    checkErrors = (path) ->
      errors.forEach (errorCase) ->
        try
          path[errorCase.method].apply path, errorCase.input
        catch err
          assert.ok err instanceof TypeError
          assert.ok errorCase.message.test(err.message), 'expected ' + errorCase.message + ' to match ' + err.message
          return
        assert.fail 'should have thrown'
        return
      return

    checkParseFormat = (path, paths) ->
      paths.forEach (element, index, array) ->
        output = path.parse(element)
        assert.strictEqual path.format(output), element.replace(/[\/]{2}/g, path.sep)
        assert.strictEqual output.dir, if output.dir then path.dirname(element) else ''
        assert.strictEqual output.base, path.basename(element)
        assert.strictEqual output.ext, path.extname(element)
        return
      return

    checkFormat = (path, testCases) ->
      testCases.forEach (testCase) ->
        assert.strictEqual path.format(testCase[0]), testCase[1]
        return
      return

    it 'should parse path format', ->
      checkParseFormat path, unixPaths
      checkErrors path
      checkFormat path, unixSpecialCaseFormatTests
  describe "toArray", ->
    it 'should convert path string to array', ->
      assert.deepEqual path.toArray('/hi/world/is'), ['hi', 'world', 'is']
      assert.deepEqual path.toArray('hi/world/is'), ['hi', 'world', 'is']
  describe "replaceExt", ->
    it 'should replace the path\'s extname', ->
      assert.strictEqual path.replaceExt('/dd3/coffee/ff.coffee', '.test') , '/dd3/coffee/ff.test'
      assert.strictEqual path.replaceExt('coffee/coffee.coffee', '.test') , 'coffee/coffee.test'
      assert.strictEqual path.replaceExt('coffee.coffee', '.test') , 'coffee.test'
