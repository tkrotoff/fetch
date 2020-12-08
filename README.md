# @tkrotoff/fetch

[![npm version](https://badge.fury.io/js/%40tkrotoff%2Ffetch.svg)](https://www.npmjs.com/package/@tkrotoff/fetch)
[![Build status](https://travis-ci.org/tkrotoff/fetch.svg?branch=master)](https://travis-ci.org/tkrotoff/fetch)
[![Codecov](https://codecov.io/gh/tkrotoff/fetch/branch/master/graph/badge.svg)](https://codecov.io/gh/tkrotoff/fetch)
[![Bundle size](https://badgen.net/bundlephobia/minzip/@tkrotoff/fetch)](https://bundlephobia.com/result?p=@tkrotoff/fetch)
[![Prettier](https://img.shields.io/badge/code_style-prettier-ff69b4.svg)](https://github.com/prettier/prettier)
[![Airbnb Code Style](https://badgen.net/badge/code%20style/airbnb/ff5a5f?icon=airbnb)](https://github.com/airbnb/javascript)

A [Fetch](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API) wrapper.

- Simplifies the use of Fetch
- Tiny
- Fully tested
- Written in TypeScript

## Why?

When using Fetch, you have to write [some](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch#Uploading_JSON_data) [boilerplate](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch#Checking_that_the_fetch_was_successful):

```JavaScript
const url = 'https://example.com/profile';
const data = { username: 'example' };

try {
  const response = await fetch(url, {
    method: 'POST',
    body: JSON.stringify(data),
    headers: {
      'content-type': 'application/json'
    }
  });
  if (!response.ok) {
    throw new Error('Network response was not ok');
  }
  const json = await response.json();
  console.log('Success:', json);
} catch (e) {
  console.error('Error:', e);
}
```

With @tkrotoff/fetch it becomes:

```JavaScript
try {
  const response = await postJSON(url, data).json();
  console.log('Success:', response);
} catch (e /* HttpError | TypeError */) {
  console.error('Error:', e);
}
```

You don't have to worry about:

- HTTP headers: Accept and Content-Type are already set
- stringifying the request body
- One `await` instead of two
- No need to manually throw an exception on HTTP error status (like 404 or 500)

## Usage

Example: https://codesandbox.io/s/github/tkrotoff/fetch/tree/codesandbox.io/example

`npm install @tkrotoff/fetch`

```JS
import { defaults, postJSON } from '@tkrotoff/fetch';

defaults.init = { /* ... */ };

const response = await postJSON(
  'https://jsonplaceholder.typicode.com/posts',
  {
    title: 'foo',
    body: 'bar',
    userId: 1
  }
).json();
console.log(response);
```

Fetch is not supported by old browsers (IE), use [whatwg-fetch](https://github.com/github/fetch) polyfill
\+ [core-js](https://github.com/zloirock/core-js) for other modern JS features like async/await.

With Node.js use [node-fetch](https://github.com/node-fetch/node-fetch) polyfill.

## API

- `get(url: string, init?:` [`RequestInit`](https://fetch.spec.whatwg.org/#requestinit)`) => ResponsePromiseWithBodyMethods`

- `postJSON(url: string, body: Object, init?: RequestInit) => ResponsePromiseWithBodyMethods`
- `post(url: string, body:` [`BodyInit`](https://fetch.spec.whatwg.org/#bodyinit)`, init?: RequestInit) => ResponsePromiseWithBodyMethods`

- `putJSON(url: string, body: Object, init?: RequestInit) => ResponsePromiseWithBodyMethods`
- `put(url: string, body: BodyInit, init?: Init) => ResponsePromiseWithBodyMethods`

- `patchJSON(url: string, body: Object, init?: RequestInit) => ResponsePromiseWithBodyMethods`
- `patch(url: string, body: BodyInit, init?: Init) => ResponsePromiseWithBodyMethods`

- `del(url: string, init?: RequestInit) => ResponsePromiseWithBodyMethods`

`ResponsePromiseWithBodyMethods` being `Promise<`[`Response`](https://fetch.spec.whatwg.org/#response)`>` with methods from [`Body`](https://fetch.spec.whatwg.org/#body-mixin)

### Configuration

@tkrotoff/fetch exposes `defaults.init` that will be applied to every request.

```JavaScript
import { defaults } from '@tkrotoff/fetch';

defaults.init.mode = 'cors';
defaults.init.credentials = 'include';
```
