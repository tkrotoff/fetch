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
  const getSpy = jest.spyOn(Http, 'get').mockImplementation(() =>
    Http.createJSONResponsePromise({
      userId: 1,
      id: 1,
      title: 'sunt aut facere repellat provident occaecati excepturi optio reprehenderit',
      body:
        'quia et suscipit\nsuscipit recusandae consequuntur expedita et cum\nreprehenderit molestiae ut ut quas totam\nnostrum rerum est autem sunt rem eveniet architecto'
    })
  );

  await get200OKExample();
  expect(getSpy).toHaveBeenNthCalledWith(1, 'https://jsonplaceholder.typicode.com/posts/1');

  getSpy.mockRestore();
});

test('postJSON201CreatedExample()', async () => {
  const postJSONSpy = jest.spyOn(Http, 'postJSON').mockImplementation(() =>
    Http.createJSONResponsePromise({
      id: 101,
      title: 'foo',
      body: 'bar',
      userId: 1
    })
  );

  await postJSON201CreatedExample();
  expect(postJSONSpy).toHaveBeenNthCalledWith(1, 'https://jsonplaceholder.typicode.com/posts', {
    body: 'bar',
    title: 'foo',
    userId: 1
  });

  postJSONSpy.mockRestore();
});

test('del200OKExample()', async () => {
  const delSpy = jest
    .spyOn(Http, 'del')
    .mockImplementation(() => Http.createJSONResponsePromise({}));

  await del200OKExample();
  expect(delSpy).toHaveBeenNthCalledWith(1, 'https://jsonplaceholder.typicode.com/posts/1');

  delSpy.mockRestore();
});

test('get404NotFoundExample()', async () => {
  const getSpy = jest.spyOn(Http, 'get').mockImplementation(() =>
    Http.createResponsePromise('404 Not Found', {
      status: Http.HttpStatus._404_NotFound,
      statusText: 'Not Found'
    })
  );

  await get404NotFoundExample();
  expect(getSpy).toHaveBeenNthCalledWith(1, 'https://httpstat.us/404/cors');

  getSpy.mockRestore();
});

test('get500InternalServerErrorExample()', async () => {
  const getSpy = jest.spyOn(Http, 'get').mockImplementation(() =>
    Http.createResponsePromise('500 Internal Server Error', {
      status: Http.HttpStatus._500_InternalServerError,
      statusText: 'Internal Server Error'
    })
  );

  await get500InternalServerErrorExample();
  expect(getSpy).toHaveBeenNthCalledWith(1, 'https://httpstat.us/500/cors');

  getSpy.mockRestore();
});

test('getCorsBlockedExample()', async () => {
  const getSpy = jest.spyOn(Http, 'get').mockRejectedValue(new TypeError('Failed to fetch'));

  await getCorsBlockedExample();
  expect(getSpy).toHaveBeenNthCalledWith(1, 'https://postman-echo.com/get?foo1=bar1&foo2=bar2');

  getSpy.mockRestore();
});

test('abortRequestExample()', async () => {
  // DOMException does not exist with node-fetch
  //const abortError = new DOMException('The user aborted a request.', 'AbortError')
  const abortError = new Error('The user aborted a request.');
  abortError.name = 'AbortError';

  const getSpy = jest
    .spyOn(Http, 'get')
    .mockImplementation((_input: RequestInfo, init: Http.Init) => {
      // Mock aborted request
      // https://github.com/github/fetch/blob/v3.4.1/fetch.js#L497
      const response = new Promise((resolve, reject) =>
        setTimeout(() => {
          if (init.signal && init.signal.aborted) {
            reject(abortError);
          }
          resolve('**********');
        }, 600)
      );

      return response as Http.ResponsePromiseWithBodyMethods;
    });

  await abortRequestExample();
  expect(getSpy).toHaveBeenNthCalledWith(
    1,
    'https://httpbin.org/drip?duration=2&numbytes=10&code=200&delay=2',
    {
      signal: expect.any(AbortSignal)
    }
  );

  getSpy.mockRestore();
});
