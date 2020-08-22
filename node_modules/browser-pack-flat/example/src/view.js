var html = require('nanohtml')

module.exports = function render (props) {
  return html`
    <body>
      <div>${props.counter}</div>
      <button onclick=${onclick}>
        +1
      </button>
    </body>
  `

  function onclick () {
    props.increment()
  }
}
