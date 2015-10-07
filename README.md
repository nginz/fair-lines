# fair-lines
> Word wrapping with both greedy and balanced (Minimum raggedness) implementations.

Install with [npm](https://www.npmjs.com/)

```sh
$ npm install fair-lines --save
```

## Usage

### Greedy wrapping (basic)
```js
var wrap = require('fair-lines');

var text = "On the other hand, we denounce with righteous indignation and dislike men who are so beguiled and demoralized by the charms of pleasure of the moment, so blinded by desire, they cannot foresee the pain and trouble that are bound to ensue."
var result = wrap.basic(text, { width: 35 });
```

Results in:

```
  On the other hand, we denounce with
  righteous indignation and dislike
  men who are so beguiled and
  demoralized by the charms of
  pleasure of the moment, so blinded
  by desire, they cannot foresee the
  pain and trouble that are bound to
  ensue.
```

### Minimum raggedness (balanced)
```js
var wrap = require('fair-lines');

var text = "On the other hand, we denounce with righteous indignation and dislike men who are so beguiled and demoralized by the charms of pleasure of the moment, so blinded by desire, they cannot foresee the pain and trouble that are bound to ensue."
var result = wrap.balanced(text, { width: 35 });
```

Results in:

```
  On the other hand, we denounce
  with righteous indignation and
  dislike men who are so beguiled
  and demoralized by the charms
  of pleasure of the moment, so
  blinded by desire, they cannot
  foresee the pain and trouble
  that are bound to ensue.
```
## Options

### options.width

Type: `Number`

Default: `30`

The line wrapping length

**Example:**

```js
wrap.balanced(text, {width: 50});
```

### options.indent

Type: `Number`

Default: `0`

The indentation width at the beginning of each line.

**Example:**

```js
wrap.balanced(text, {indent: 10});
```

### options.respectNL

Type: `Boolean`

Default: `false`

Whether or not to respect new line breaks of the text in the output.

**Example:**

```js
wrap.balanced(text, {respectNL: true});
```

## License

Copyright © 2015 Moustafa Badawy
Released under the MIT license.