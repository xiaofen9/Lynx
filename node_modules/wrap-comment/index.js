module.exports = function wrapComment (text) {
  return '/* ' + escape(text) + ' */'
}

function escape (text) {
  return text.replace(/\*\//g, '*\\/')
}
