import {
  abortRequestExample,
  del200OKExample,
  get200OKExample,
  get404NotFoundExample,
  get500InternalServerErrorExample,
  postJSON201CreatedExample
} from './requests';

// FIXME Remove when ESM is enabled
// eslint-disable-next-line func-names, unicorn/prefer-top-level-await
(async function () {
  await get200OKExample();
  await postJSON201CreatedExample();
  await del200OKExample();
  await get404NotFoundExample();
  await get500InternalServerErrorExample();
  await abortRequestExample();
})();
