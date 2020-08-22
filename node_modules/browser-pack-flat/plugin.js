var pack = require('./index')

module.exports = function apply (b, opts) {
  // When used as a transform
  if (typeof b !== 'object') {
    throw new Error('browser-pack-flat: must be used as a plugin, not a transform')
  }

  opts = Object.assign({}, opts || {}, {
    raw: true,
    debug: opts.debug || b._options.debug,
    basedir: b._options.basedir || process.cwd()
  })

  function addHooks () {
    var streams = b.pipeline.get('pack')
    var index = streams.indexOf(b._bpack)

    streams.splice(index, 1,
      pack(Object.assign({}, opts, {
        standalone: b._options.standalone,
        standaloneModule: b._options.standaloneModule
      }))
    )
  }

  addHooks()
  b.on('reset', addHooks)
}
