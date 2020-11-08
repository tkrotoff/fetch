# @tkrotoff/fetch

[![npm version](https://badge.fury.io/js/%40tkrotoff%2Ffetch.svg)](https://www.npmjs.com/package/@tkrotoff/fetch)
[![Build status](https://travis-ci.org/tkrotoff/fetch.svg?branch=master)](https://travis-ci.org/tkrotoff/fetch)
[![Codecov](https://codecov.io/gh/tkrotoff/fetch/branch/master/graph/badge.svg)](https://codecov.io/gh/tkrotoff/fetch)
[![Bundle size](https://badgen.net/bundlephobia/minzip/@tkrotoff/fetch)](https://bundlephobia.com/result?p=@tkrotoff/fetch)
[![Prettier](https://img.shields.io/badge/code_style-prettier-ff69b4.svg)](https://github.com/prettier/prettier)
[![Airbnb Code Style](https://badgen.net/badge/code%20style/airbnb/ff5a5f?icon=airbnb)](https://github.com/airbnb/javascript)

A [Fetch](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API) wrapper for JSON.

- Simplifies the use of Fetch with JSON
- Tiny: less than [100 lines of code](src/Http.ts), [less than 1 kB min.gz](https://bundlephobia.com/result?p=@tkrotoff/fetch) vs [4.3 kB for Axios](https://bundlephobia.com/result?p=axios@0.19.0)
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
      'Content-Type': 'application/json'
    }
  });
  if (!response.ok) {
    throw new Error('Network response was not ok');
  }
  const json = await response.json();
  console.log('Success:', JSON.stringify(json));
} catch (e) {
  console.error('Error:', e);
}
```

With @tkrotoff/fetch it becomes:

```JavaScript
try {
  const response = await postJSON(url, data);
  console.log('Success:', response);
} catch (e /* HttpError | TypeError */) {
  console.error('Error:', e);
}
```

You don't have to worry about:

- HTTP headers: Accept and Content-Type are already set to application/json inside `defaults.init`
- stringifying the input data
- stringifying the [response body](https://fetch.spec.whatwg.org/#body)
- `await response.json()`: one `await` instead of two
- `response.ok()`: no need to manually throw an exception on HTTP error status (like 404 or 500)

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
);
console.log(response);
```

Fetch is not supported by IE and old browsers, use [whatwg-fetch](https://github.com/github/fetch) polyfill
(+ [core-js](https://github.com/zloirock/core-js) for other modern JS features like async/await).

## API

- `getJSON(url: string, init?:` [`RequestInit`](https://fetch.spec.whatwg.org/#requestinit)`) => response`

- `postJSON(url: string, body: Object, init?: RequestInit) => response`
- `postFormData(url: string, body:` [`FormData`](https://xhr.spec.whatwg.org/#formdata)`, init?: RequestInit) => response`

- `putJSON(url: string, body: Object, init?: RequestInit) => response`
- `putFormData(url: string, body: FormData, init?: Init) => response`

- `patchJSON(url: string, body: Object, init?: RequestInit) => response`
- `patchFormData(url: string, body: FormData, init?: Init) => response`

- `deleteJSON(url: string, init?: RequestInit) => response`

### Configuration

@tkrotoff/fetch exposes `defaults.init` that will be applied to every request.

```JavaScript
import { defaults } from '@tkrotoff/fetch';

defaults.init.mode = 'cors';
defaults.init.credentials = 'include';
```
