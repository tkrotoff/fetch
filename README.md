# @tkrotoff/fetch

[![npm version](https://badge.fury.io/js/%40tkrotoff%2Ffetch.svg)](https://www.npmjs.com/package/@tkrotoff/fetch)
[![Node.js CI](https://github.com/tkrotoff/fetch/workflows/Node.js%20CI/badge.svg?branch=master)](https://github.com/tkrotoff/fetch/actions)
[![Codecov](https://codecov.io/gh/tkrotoff/fetch/branch/master/graph/badge.svg)](https://codecov.io/gh/tkrotoff/fetch)
[![Bundle size](https://badgen.net/bundlephobia/minzip/@tkrotoff/fetch)](https://bundlephobia.com/result?p=@tkrotoff/fetch)
[![Prettier](https://img.shields.io/badge/code_style-prettier-ff69b4.svg)](https://github.com/prettier/prettier)
[![Airbnb Code Style](https://badgen.net/badge/code%20style/airbnb/ff5a5f?icon=airbnb)](https://github.com/airbnb/javascript)

A [Fetch](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API) wrapper.

- Simplifies the use of Fetch
- Tiny
- No dependencies
- Fully tested
- Written in TypeScript
- Comes with test utilities

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
} catch (e /* HttpError | TypeError | DOMException */) {
  console.error('Error:', e);
}
```

You don't have to worry about:

- HTTP headers: Accept and Content-Type are already set
- stringifying the request body
- One `await` instead of two
- No need to manually throw an exception on HTTP error status (like 404 or 500)

## Usage

Examples:

- https://codesandbox.io/s/github/tkrotoff/fetch/tree/codesandbox.io/examples/web
- https://codesandbox.io/s/github/tkrotoff/fetch/tree/codesandbox.io/examples/node

`npm install @tkrotoff/fetch`

```JavaScript
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

[Fetch](https://caniuse.com/fetch) is not supported by old browsers (IE), use [whatwg-fetch](https://github.com/github/fetch) polyfill
\+ [core-js](https://github.com/zloirock/core-js) for other modern JS features like async/await.

With Node.js use [node-fetch](https://github.com/node-fetch/node-fetch) polyfill.

## API

- `get(input:` [`RequestInfo`](https://fetch.spec.whatwg.org/#requestinfo)`, init?:` [`RequestInit`](https://fetch.spec.whatwg.org/#requestinit)`) => ResponsePromiseWithBodyMethods`

- `postJSON(input: RequestInfo, body: Object, init?: RequestInit) => ResponsePromiseWithBodyMethods`
- `post(input: RequestInfo, body:` [`BodyInit`](https://fetch.spec.whatwg.org/#bodyinit)`, init?: RequestInit) => ResponsePromiseWithBodyMethods`

- `putJSON(input: RequestInfo, body: Object, init?: RequestInit) => ResponsePromiseWithBodyMethods`
- `put(input: RequestInfo, body: BodyInit, init?: Init) => ResponsePromiseWithBodyMethods`

- `patchJSON(input: RequestInfo, body: Object, init?: RequestInit) => ResponsePromiseWithBodyMethods`
- `patch(input: RequestInfo, body: BodyInit, init?: Init) => ResponsePromiseWithBodyMethods`

- `del(input: RequestInfo, init?: RequestInit) => ResponsePromiseWithBodyMethods`

`ResponsePromiseWithBodyMethods` being `Promise<`[`Response`](https://fetch.spec.whatwg.org/#response)`>` with added methods from [`Body`](https://fetch.spec.whatwg.org/#body-mixin).

### HttpError

@tkrotoff/fetch throws [`HttpError`](src/HttpError.ts) with a [`response`](https://fetch.spec.whatwg.org/#response) property when the HTTP status code is < `200` or >= `300`.

### Test utilities

- `createResponsePromise(body?: BodyInit, init?:` [`ResponseInit`](https://fetch.spec.whatwg.org/#responseinit)`) => ResponsePromiseWithBodyMethods`
- `createJSONResponsePromise(body: Object, init?: ResponseInit) => ResponsePromiseWithBodyMethods`

- `createHttpError(body?: BodyInit, status = 0, statusText?: string) => HttpError`
- `createJSONHttpError(body: Object, status = 0, statusText?: string) => HttpError`

### HttpStatus

Instead of writing HTTP statuses as numbers `201`, `403`, `503`... you can replace them with [`HttpStatus`](src/HttpStatus.ts) and write more explicit code:

```JavaScript
import { HttpStatus } from '@tkrotoff/fetch';

console.log(HttpStatus._201_Created);
console.log(HttpStatus._403_Forbidden);
console.log(HttpStatus._503_ServiceUnavailable);
```

### Configuration

@tkrotoff/fetch exposes `defaults.init` that will be applied to every request.

```JavaScript
import { defaults } from '@tkrotoff/fetch';

defaults.init.mode = 'cors';
defaults.init.credentials = 'include';
```

## Testing

When testing your code, use `createResponsePromise()` and `createJSONResponsePromise()`:

```JavaScript
import * as Http from '@tkrotoff/fetch';

test('OK', async () => {
  const getSpy = jest.spyOn(Http, 'get').mockImplementation(() =>
    Http.createResponsePromise('test')
  );

  const response = await Http.get(url).text();
  expect(response).toEqual('test');

  expect(getSpy).toHaveBeenNthCalledWith(1, url);

  getSpy.mockRestore();
});

test('fail', async () => {
  const getSpy = jest.spyOn(Http, 'get').mockImplementation(() =>
    Http.createResponsePromise('<!DOCTYPE html><title>404</title>', {
      status: 404,
      statusText: 'Not Found'
    })
  );

  await expect(Http.get(url).text()).rejects.toThrow('Not Found');

  expect(getSpy).toHaveBeenNthCalledWith(1, url);

  getSpy.mockRestore();
});
```

Check [examples/node](examples/node) and [examples/web](examples/web).
