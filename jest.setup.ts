import assert from 'assert';

// [console.assert not throwing with v22.4.0](https://github.com/facebook/jest/issues/5634)
// eslint-disable-next-line no-console
console.assert = assert;

// [Event: 'unhandledRejection'](https://nodejs.org/api/process.html#process_event_unhandledrejection)
// [Bluebird Error management configuration](http://bluebirdjs.com/docs/api/error-management-configuration.html)
//
// Node.js error:
// (node:38141) UnhandledPromiseRejectionWarning: Unhandled promise rejection.
// This error originated either by throwing inside of an async function without a catch block,
// or by rejecting a promise which was not handled with .catch(). (rejection id: 4)
// (node:38141) [DEP0018] DeprecationWarning: Unhandled promise rejections are deprecated.
// In the future, promise rejections that are not handled will terminate the Node.js process with a non-zero exit code.
//
process.on('unhandledRejection', (reason: Error | any, _promise: Promise<any>) => {
  throw reason;
});

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
