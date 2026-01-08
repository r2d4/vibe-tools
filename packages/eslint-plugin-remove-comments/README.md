# eslint-plugin-remove-comments

An ESLint plugin to automatically remove comments from your code while preserving important directives like `eslint-disable`, TypeScript directives, JSDoc, and more.

## Features

- **Reliable auto-fix** - Removes comments automatically with ESLint's `--fix` option
- **Selective preservation** - Keep important comments like:
  - ESLint directives (`eslint-disable`, `eslint-enable`, etc.)
  - TypeScript directives (`@ts-ignore`, `@ts-expect-error`, etc.)
  - Triple-slash references (`/// <reference ... />`)
  - JSDoc comments (optional)
  - TODO/FIXME/NOTE markers (optional)
  - Empty catch block comments
  - Custom patterns via regex
- **JSX support** - Works with React/JSX files
- **TypeScript support** - Full TypeScript type definitions included
- **Zero dependencies** - Lightweight and fast
- **Fully tested** - 119 comprehensive tests across 6 test suites

## Installation

```bash
npm install --save-dev eslint-plugin-remove-comments
```

## Usage

### Basic Setup

Add to your ESLint config:

```js
// eslint.config.js (ESLint 9+)
import removeComments from 'eslint-plugin-remove-comments';

export default [
  {
    plugins: {
      'remove-comments': removeComments
    },
    rules: {
      'remove-comments/remove-all': 'error'
    }
  }
];
```

Or for ESLint 8:

```js
// .eslintrc.js
module.exports = {
  plugins: ['remove-comments'],
  rules: {
    'remove-comments/remove-all': 'error'
  }
};
```

### Run ESLint with Auto-fix

```bash
npx eslint --fix .
```

## Options

### `preserveJSDoc`

Preserve JSDoc comments (comments starting with `/**`).

```js
{
  rules: {
    'remove-comments/remove-all': ['error', {
      preserveJSDoc: true
    }]
  }
}
```

**Example:**

```js
// Before
/**
 * Calculates the sum of two numbers
 * @param {number} a - First number
 * @param {number} b - Second number
 * @returns {number} The sum
 */
function add(a, b) {
  // This comment will be removed
  return a + b;
}

// After (with preserveJSDoc: true)
/**
 * Calculates the sum of two numbers
 * @param {number} a - First number
 * @param {number} b - Second number
 * @returns {number} The sum
 */
function add(a, b) {
  return a + b;
}
```

### `preserveTodos`

Preserve TODO, FIXME, NOTE, HACK, and XXX comments (case-insensitive, requires colon).

```js
{
  rules: {
    'remove-comments/remove-all': ['error', {
      preserveTodos: true
    }]
  }
}
```

**Example:**

```js
// Before
// TODO: implement error handling
// FIXME: memory leak here
// NOTE: this is important
// Just a regular comment
function process() {
  // ...
}

// After (with preserveTodos: true)
// TODO: implement error handling
// FIXME: memory leak here
// NOTE: this is important
function process() {
  // ...
}
```

### `preservePatterns`

Preserve comments matching custom regex patterns.

```js
{
  rules: {
    'remove-comments/remove-all': ['error', {
      preservePatterns: [
        '^KEEP:',           // Keep comments starting with "KEEP:"
        '@license',         // Keep license comments
        'prettier-ignore'   // Keep Prettier directives
      ]
    }]
  }
}
```

### Combining Options

You can combine multiple options:

```js
{
  rules: {
    'remove-comments/remove-all': ['error', {
      preserveJSDoc: true,
      preserveTodos: true,
      preservePatterns: ['^KEEP:', '@license']
    }]
  }
}
```

## Always Preserved

These comments are **always preserved** regardless of options:

- **ESLint directives**: `// eslint-disable`, `/* eslint-enable */`, etc.
- **TypeScript directives**: `// @ts-ignore`, `// @ts-expect-error`, `// @ts-nocheck`, `// @ts-check`
- **Triple-slash references**: `/// <reference path="..." />`
- **Empty catch blocks**: Comments in empty catch blocks (e.g., `catch (e) { /* ignore */ }`)

## Examples

### Remove All Comments

```js
// Input
function calculate() {
  // Calculate the result
  const x = 1; // Initialize x
  /* Block comment */
  return x * 2;
}

// Output
function calculate() {
  const x = 1;
  return x * 2;
}
```

### Preserve ESLint Directives

```js
// Input & Output (no change)
// eslint-disable-next-line no-console
console.log('Debug info');
```

### Preserve TypeScript Directives

```js
// Input & Output (no change)
// @ts-ignore
const value = unknownApi();
```

### JSX Support

```js
// Input
function Component() {
  // Component logic
  return (
    <div>
      {/* JSX comment */}
      <p>Hello World</p>
    </div>
  );
}

// Output
function Component() {
  return (
    <div>
      <p>Hello World</p>
    </div>
  );
}
```

## Use Cases

- **Minification**: Remove comments before production builds
- **Code cleanup**: Remove outdated or unnecessary comments
- **Consistency**: Enforce a no-comments policy in certain files
- **Pre-processing**: Clean code before further transformations

## License

MIT
