# Haye

Haye is a simple super fast string expression parser. In support `pipe` and `qs` string expressions ( explained below ).

> **Limitations**
The keys/values inside the expression cannot have any of the reserved keywords, otherwise parser will mis-behave.

---

<details>
<summary> Benchmarks </summary>
<pre>
<code>
haye #pipeToArray x 741,030 ops/sec ±0.97% (90 runs sampled)
haye #pipeToJson x 313,101 ops/sec ±0.95% (87 runs sampled)
haye #qsToArray x 698,688 ops/sec ±0.74% (91 runs sampled)
haye #qsToJson x 303,482 ops/sec ±1.10% (89 runs sampled)
</code>
</pre>
</details>

<details>
<summary> Comparison with 1.0.1 </summary>
<h4> Legacy </h4>
<pre>
<code>
219,138 op/s » haye #pipeToArray #legacy
170,068 op/s » haye #pipeToJson #legacy
147,594 op/s » haye #qsToArray #legacy
121,094 op/s » haye #qsToJson #legacy
</code>
</pre>
  
<h4> Latest </h4>
<pre>
<code>
747,298 op/s » haye #pipeToArray
363,152 op/s » haye #pipeToJson
742,310 op/s » haye #qsToArray
349,075 op/s » haye #qsToJson
</code>
</pre>
</details>

<details>
<summary> Upgrading from 1.0.1 </summary>
<p> There are couple of breaking changes from 1.0.1 to 2.x.x </p>

<ol>
<li>
  All methods to convert <code>Arrays</code> and <code>Objects</code> have been removed.
</li>

<li>
  The `args` property in `toArray` methods is always an array. Earlier it used to be string for single values and array for multiple.
</li>

<li>
  The value in `key/value` pair is always an array. Earlier it used to be string for single values and array for multiple.
</li>
</ol>

</details>

### Pipe expression
The pipe based expression is very popular in Laravel community, due to their [Validation engine](https://laravel.com/docs/validation), and same is adopted by [Indicative](http://indicative.adonisjs.com).

#### Syntax example:

```js
required|email|max:4|range:10,30
```

1. Each item is separated by `|`
2. The values are defined after `:`
3. Multiple values are separated by `,`.
4. White spaces in keys are trimmed.

---

### Qs expression
The query string expression is almost similar to the URL query string, with couple of small modifications to make the expression readable.

#### Syntax example:
```
required,email,max=4,range=[1, 10]
```

1. Each item is separated by `,`
2. The values are defined after `=`
3. Multiple values are separated by `,` inside `[]`.
4. White spaces in keys are trimmed.

## Installation

The module is available on npm

```bash
npm i haye

# yarn
yarn add haye
```

## Usage
Below is the bunch of usage examples

#### Pipe -> Array

```js
const haye = require('haye')
const expression = 'required|email:unique,users'

const parsed = haye.fromPipe(expression).toArray()
```

Output
```js
[
  { name: 'required', args: [] },
  { name: 'email', args: ['unique', 'users'] }
]
```

#### Pipe -> JSON

```js
const haye = require('haye')
const expression = 'required|email:unique,users'

const parsed = haye.fromPipe(expression).toJSON()
```

Output
```js
{
  required: [],
  email: [ 'unique', 'users' ]
}
```

#### Qs -> Array

```js
const haye = require('haye')
const expression = 'required,email=[unique,users]'

const parsed = haye.fromQS(expression).toArray()
```

Output
```js
[
  { name: 'required', args: [] },
  { name: 'email', args: ['unique', 'users'] }
]
```

#### Qs -> JSON

```js
const haye = require('haye')
const expression = 'required,email=[unique,users]'

const parsed = haye.fromQS(expression).toJSON()
```

Output
```js
{
  required: [],
  email: [ 'unique', 'users' ]
}
```
