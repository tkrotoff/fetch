import * as Http from '@tkrotoff/fetch';

import {
  abortRequestExample,
  del200OKExample,
  get200OKExample,
  get404NotFoundExample,
  get500InternalServerErrorExample,
  getCorsBlockedExample,
  postJSON201CreatedExample
} from './requests';

test('get200OKExample()', async () => {
  const mock = jest.spyOn(Http, 'get').mockImplementation(() =>
    Http.createJSONResponsePromise({
      userId: 1,
      id: 1,
      title: 'sunt aut facere repellat provident occaecati excepturi optio reprehenderit',
      body: 'quia et suscipit\nsuscipit recusandae consequuntur expedita et cum\nreprehenderit molestiae ut ut quas totam\nnostrum rerum est autem sunt rem eveniet architecto'
    })
  );

  await get200OKExample();
  expect(mock).toHaveBeenCalledTimes(1);
  expect(mock).toHaveBeenCalledWith('https://jsonplaceholder.typicode.com/posts/1');

  mock.mockRestore();
});

test('postJSON201CreatedExample()', async () => {
  const mock = jest.spyOn(Http, 'postJSON').mockImplementation(() =>
    Http.createJSONResponsePromise({
      id: 101,
      title: 'foo',
      body: 'bar',
      userId: 1
    })
  );

  await postJSON201CreatedExample();
  expect(mock).toHaveBeenCalledTimes(1);
  expect(mock).toHaveBeenCalledWith('https://jsonplaceholder.typicode.com/posts', {
    body: 'bar',
    title: 'foo',
    userId: 1
  });

  mock.mockRestore();
});

test('del200OKExample()', async () => {
  const mock = jest.spyOn(Http, 'del').mockImplementation(() => Http.createJSONResponsePromise({}));

  await del200OKExample();
  expect(mock).toHaveBeenCalledTimes(1);
  expect(mock).toHaveBeenCalledWith('https://jsonplaceholder.typicode.com/posts/1');

  mock.mockRestore();
});

test('get404NotFoundExample()', async () => {
  const mock = jest.spyOn(Http, 'get').mockImplementation(() =>
    Http.createResponsePromise('404 Not Found', {
      status: Http.HttpStatus._404_NotFound,
      statusText: 'Not Found'
    })
  );

  await get404NotFoundExample();
  expect(mock).toHaveBeenCalledTimes(1);
  expect(mock).toHaveBeenCalledWith('https://httpstat.us/404/cors');

  mock.mockRestore();
});

test('get500InternalServerErrorExample()', async () => {
  const mock = jest.spyOn(Http, 'get').mockImplementation(() =>
    Http.createResponsePromise('500 Internal Server Error', {
      status: Http.HttpStatus._500_InternalServerError,
      statusText: 'Internal Server Error'
    })
  );

  await get500InternalServerErrorExample();
  expect(mock).toHaveBeenCalledTimes(1);
  expect(mock).toHaveBeenCalledWith('https://httpstat.us/500/cors');

  mock.mockRestore();
});

test('getCorsBlockedExample()', async () => {
  const mock = jest.spyOn(Http, 'get').mockRejectedValue(new TypeError('Failed to fetch'));

  await getCorsBlockedExample();
  expect(mock).toHaveBeenCalledTimes(1);
  expect(mock).toHaveBeenCalledWith('https://postman-echo.com/get?foo1=bar1&foo2=bar2');

  mock.mockRestore();
});

test('abortRequestExample()', async () => {
  // DOMException does not exist with node-fetch
  //const abortError = new DOMException('The operation was aborted.', 'AbortError')
  const abortError = new Error('The operation was aborted.');
  abortError.name = 'AbortError';

  const mock = jest
    .spyOn(Http, 'get')
    .mockImplementation((_input: RequestInfo, init: Http.Init) => {
      // Mock aborted request
      // https://github.com/github/fetch/blob/v3.4.1/fetch.js#L497
      const response = new Promise((resolve, reject) => {
        setTimeout(() => {
          if (init.signal && init.signal.aborted) {
            reject(abortError);
          }
          resolve('**********');
        }, 600);
      });

      return response as Http.ResponsePromiseWithBodyMethods;
    });

  await abortRequestExample();
  expect(mock).toHaveBeenCalledTimes(1);
  expect(mock).toHaveBeenCalledWith(
    'https://httpbin.org/drip?duration=2&numbytes=10&code=200&delay=2',
    {
      signal: expect.any(AbortSignal)
    }
  );

  mock.mockRestore();
});
