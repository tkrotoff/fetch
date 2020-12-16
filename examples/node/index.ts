import { AbortController, AbortSignal } from 'abort-controller';
import * as nodeFetch from 'node-fetch';

import {
  abortRequestExample,
  del200OKExample,
  get200OKExample,
  get404NotFoundExample,
  get500InternalServerErrorExample,
  postJSON201CreatedExample
} from './requests';

globalThis.fetch = nodeFetch as any;
globalThis.Headers = nodeFetch.Headers as any;
globalThis.Response = nodeFetch.Response as any;

// FIXME Remove when support for Node.js < 15.0.0 is dropped, https://nodejs.org/en/blog/release/v15.0.0/
globalThis.AbortController = AbortController;
globalThis.AbortSignal = AbortSignal;

// FIXME Remove when support for Node.js < 14.8.0 is dropped, https://nodejs.org/en/blog/release/v14.8.0/
// eslint-disable-next-line func-names
(async function () {
  await get200OKExample();
  await postJSON201CreatedExample();
  await del200OKExample();
  await get404NotFoundExample();
  await get500InternalServerErrorExample();
  await abortRequestExample();
})();
