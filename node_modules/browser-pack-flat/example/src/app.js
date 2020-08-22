var morph = require('nanomorph')
var view = require('./view')
var counter = 0

function render () {
  morph(document.body, view({
    counter: counter,
    increment: function () {
      counter++
      render()
    }
  }))
}

render()
