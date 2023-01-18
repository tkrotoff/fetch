import {
  abortRequestExample,
  del200OKExample,
  get200OKExample,
  get404NotFoundExample,
  get500InternalServerErrorExample,
  postJSON201CreatedExample
} from './requests.js';

await get200OKExample();
await postJSON201CreatedExample();
await del200OKExample();
await get404NotFoundExample();
await get500InternalServerErrorExample();
await abortRequestExample();
