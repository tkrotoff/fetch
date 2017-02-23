import * as Http from './Http';
import * as fetchMock from 'fetch-mock';

// See [whatwg-fetch] add fetch.polyfill https://github.com/DefinitelyTyped/DefinitelyTyped/pull/14759
type WhatwgFetch = typeof fetch & { polyfill: true };

// See Unit testing with Jest: Redux + async actions + fetch https://medium.com/@ferrannp/unit-testing-with-jest-redux-async-actions-fetch-9054ca28cdcd
test('makes sure fetch is the one from the polyfill', () => {
  expect((fetch as WhatwgFetch).polyfill).toBe(true);
});

test('getJSON', async () => {
  fetchMock.get('helloWord', {hello: 'world'});

  const json = await Http.getJSON('helloWord');
  expect(json).toEqual({hello: 'world'});

  fetchMock.restore();
});
