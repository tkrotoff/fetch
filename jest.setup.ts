import assert from 'node:assert';

// [console.assert not throwing with v22.4.0](https://github.com/facebook/jest/issues/5634)
// eslint-disable-next-line no-console
console.assert = assert;

/* eslint-disable global-require, @typescript-eslint/no-var-requires */
const fetchPolyfill = process.env.FETCH;
switch (fetchPolyfill) {
  case 'whatwg-fetch': {
    const whatwgFetch = require('whatwg-fetch');
    globalThis.fetch = whatwgFetch.fetch;
    // Tests are very slow with whatwg-fetch (150s) vs node-fetch (2s)
    jest.setTimeout(10_000);
    break;
  }
  case 'node-fetch': {
    const nodeFetch = require('node-fetch');
    globalThis.fetch = nodeFetch.default;
    globalThis.Response = nodeFetch.Response;
    globalThis.Headers = nodeFetch.Headers;
    break;
  }
  default:
    assert(false, `Invalid fetch polyfill: '${fetchPolyfill}'`);
}
/* eslint-enable global-require, @typescript-eslint/no-var-requires */
