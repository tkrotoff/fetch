import * as Http from './Http';
import * as fetchMock from 'fetch-mock';

// See Unit testing with Jest: Redux + async actions + fetch https://medium.com/@ferrannp/unit-testing-with-jest-redux-async-actions-fetch-9054ca28cdcd
test('makes sure fetch is the one from the polyfill', () => {
  expect(fetch.polyfill).toBe(true);
});

test('getJSON', async () => {
  fetchMock.get('helloWord', {hello: 'world'});

  const json = await Http.getJSON('helloWord');
  expect(json).toEqual({hello: 'world'});

  fetchMock.restore();
});
