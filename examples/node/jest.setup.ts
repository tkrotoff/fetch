import { AbortController, AbortSignal } from 'abort-controller';
import assert from 'node:assert';
import * as nodeFetch from 'node-fetch';

// [console.assert not throwing with v22.4.0](https://github.com/facebook/jest/issues/5634)
// eslint-disable-next-line no-console
console.assert = assert;

globalThis.Headers = nodeFetch.Headers as any;
globalThis.Response = nodeFetch.Response as any;

// FIXME Remove when support for Node.js < 15.0.0 is dropped, https://nodejs.org/en/blog/release/v15.0.0/
globalThis.AbortController = AbortController;
globalThis.AbortSignal = AbortSignal;

(globalThis.fetch as any) = () => {
  throw new Error('You should mock fetch()');
};
