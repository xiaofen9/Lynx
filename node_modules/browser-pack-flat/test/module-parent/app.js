require('./child')

if (module.parent) {
  throw Error('should be entry point')
}
