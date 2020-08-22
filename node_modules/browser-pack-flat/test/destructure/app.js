var {
  hello,
  world: [ ...world ]
} = require('./greeting')

console.log(hello, world.join(''))
