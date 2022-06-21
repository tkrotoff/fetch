import { AbortController, AbortSignal } from 'abort-controller';
import * as nodeFetch from 'node-fetch';

import {
  abortRequestExample,
  del200OKExample,
  get200OKExample,
  get404NotFoundExample,
  get500InternalServerErrorExample,
  postJSON201CreatedExample
} from './requests.js';

globalThis.fetch = nodeFetch.default as any;
globalThis.Headers = nodeFetch.Headers as any;
globalThis.Response = nodeFetch.Response as any;

// FIXME Remove when support for Node.js < 15.0.0 is dropped, https://nodejs.org/en/blog/release/v15.0.0/
globalThis.AbortController = AbortController as any;
globalThis.AbortSignal = AbortSignal as any;

await get200OKExample();
await postJSON201CreatedExample();
await del200OKExample();
await get404NotFoundExample();
await get500InternalServerErrorExample();
await abortRequestExample();
