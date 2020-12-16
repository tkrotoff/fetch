import { AbortController, AbortSignal } from 'abort-controller';
import assert from 'assert';
import * as nodeFetch from 'node-fetch';

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

globalThis.fetch = nodeFetch as any;
globalThis.Headers = nodeFetch.Headers as any;
globalThis.Response = nodeFetch.Response as any;

// FIXME Remove when support for Node.js < 15.0.0 is dropped, https://nodejs.org/en/blog/release/v15.0.0/
globalThis.AbortController = AbortController;
globalThis.AbortSignal = AbortSignal;

(globalThis.fetch as any) = () => {
  throw new Error('You should mock fetch()');
};
