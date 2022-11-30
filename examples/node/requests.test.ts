import {
  createJSONResponsePromise,
  createResponsePromise,
  del,
  get,
  HttpStatus,
  Init,
  postJSON,
  ResponsePromiseWithBodyMethods
} from '@tkrotoff/fetch';

import {
  abortRequestExample,
  del200OKExample,
  get200OKExample,
  get404NotFoundExample,
  get500InternalServerErrorExample,
  getCorsBlockedExample,
  postJSON201CreatedExample
} from './requests';

beforeEach(() => jest.resetAllMocks());

jest.mock('@tkrotoff/fetch', () => ({
  ...jest.requireActual('@tkrotoff/fetch'),
  get: jest.fn(),
  //post: jest.fn(),
  postJSON: jest.fn(),
  //put: jest.fn(),
  //putJSON: jest.fn(),
  //patch: jest.fn(),
  //patchJSON: jest.fn(),
  del: jest.fn()
}));

test('get200OKExample()', async () => {
  jest.mocked(get).mockImplementation(() =>
    createJSONResponsePromise({
      userId: 1,
      id: 1,
      title: 'sunt aut facere repellat provident occaecati excepturi optio reprehenderit',
      body: 'quia et suscipit\nsuscipit recusandae consequuntur expedita et cum\nreprehenderit molestiae ut ut quas totam\nnostrum rerum est autem sunt rem eveniet architecto'
    })
  );

  await get200OKExample();
  expect(get).toHaveBeenCalledTimes(1);
  expect(get).toHaveBeenCalledWith('https://jsonplaceholder.typicode.com/posts/1');
});

test('postJSON201CreatedExample()', async () => {
  jest.mocked(postJSON).mockImplementation(() =>
    createJSONResponsePromise({
      id: 101,
      title: 'foo',
      body: 'bar',
      userId: 1
    })
  );

  await postJSON201CreatedExample();
  expect(postJSON).toHaveBeenCalledTimes(1);
  expect(postJSON).toHaveBeenCalledWith('https://jsonplaceholder.typicode.com/posts', {
    body: 'bar',
    title: 'foo',
    userId: 1
  });
});

test('del200OKExample()', async () => {
  jest.mocked(del).mockImplementation(() => createJSONResponsePromise({}));

  await del200OKExample();
  expect(del).toHaveBeenCalledTimes(1);
  expect(del).toHaveBeenCalledWith('https://jsonplaceholder.typicode.com/posts/1');
});

test('get404NotFoundExample()', async () => {
  jest.mocked(get).mockImplementation(() =>
    createResponsePromise('404 Not Found', {
      status: HttpStatus._404_NotFound,
      statusText: 'Not Found'
    })
  );

  await get404NotFoundExample();
  expect(get).toHaveBeenCalledTimes(1);
  expect(get).toHaveBeenCalledWith('https://httpstat.us/404/cors');
});

test('get500InternalServerErrorExample()', async () => {
  jest.mocked(get).mockImplementation(() =>
    createResponsePromise('500 Internal Server Error', {
      status: HttpStatus._500_InternalServerError,
      statusText: 'Internal Server Error'
    })
  );

  await get500InternalServerErrorExample();
  expect(get).toHaveBeenCalledTimes(1);
  expect(get).toHaveBeenCalledWith('https://httpstat.us/500/cors');
});

test('getCorsBlockedExample()', async () => {
  jest.mocked(get).mockRejectedValue(new TypeError('Failed to fetch'));

  await getCorsBlockedExample();
  expect(get).toHaveBeenCalledTimes(1);
  expect(get).toHaveBeenCalledWith('https://postman-echo.com/get?foo1=bar1&foo2=bar2');
});

test('abortRequestExample()', async () => {
  // DOMException does not exist with node-fetch
  //const abortError = new DOMException('The operation was aborted.', 'AbortError')
  const abortError = new Error('The operation was aborted.');
  abortError.name = 'AbortError';

  jest.mocked(get).mockImplementation((_input, init) => {
    // Mock aborted request
    // https://github.com/github/fetch/blob/v3.4.1/fetch.js#L497
    const response = new Promise((resolve, reject) => {
      setTimeout(() => {
        if (init!.signal && init!.signal.aborted) {
          reject(abortError);
        }
        resolve('**********');
      }, 600);
    });

    return response as ResponsePromiseWithBodyMethods;
  });

  await abortRequestExample();
  expect(get).toHaveBeenCalledTimes(1);
  expect(get).toHaveBeenCalledWith(
    'https://httpbin.org/drip?duration=2&numbytes=10&code=200&delay=2',
    {
      signal: expect.any(AbortSignal)
    }
  );
});
