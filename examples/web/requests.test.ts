import {
  createJSONResponsePromise,
  createResponsePromise,
  del,
  get,
  HttpStatus,
  post,
  postJSON,
  ResponsePromiseWithBodyMethods
} from '@tkrotoff/fetch';

import {
  abortRequestExample,
  del200OKExample,
  downloadProgressExample,
  get200OKExample,
  get404NotFoundExample,
  get500InternalServerErrorExample,
  getCorsBlockedExample,
  postJSON201CreatedExample,
  uploadFilesExample
} from './requests';

beforeEach(() => jest.resetAllMocks());

jest.mock('@tkrotoff/fetch', () => ({
  ...jest.requireActual('@tkrotoff/fetch'),
  get: jest.fn(),
  post: jest.fn(),
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

test('uploadFilesExample()', async () => {
  jest.mocked(post).mockImplementation(() =>
    createJSONResponsePromise({
      files: { file0: 'file0Content', file1: 'file1Content' }
    })
  );

  const file0 = new File(['file0Content'], 'file0', { type: 'text/plain' });
  const file1 = new File(['file1Content'], 'file1', { type: 'text/plain' });

  await uploadFilesExample([file0, file1] as unknown as FileList);
  expect(post).toHaveBeenCalledTimes(1);
  expect(post).toHaveBeenCalledWith('https://httpbin.org/anything', expect.any(FormData));
});

test('abortRequestExample()', async () => {
  const abortError = new DOMException('The user aborted a request.', 'AbortError');

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

// FIXME jsdom does not support Blob.stream https://github.com/jsdom/jsdom/issues/2555
// "TypeError: blob.stream is not a function"
// eslint-disable-next-line jest/no-disabled-tests
test.skip('downloadProgressExample()', async () => {
  document.body.innerHTML =
    '<progress id="download-progress-indicator" value="0"></progress>' +
    '<img id="download-progress-img" alt="download-progress-img" src="data:," />';

  // Use File instead? https://developer.mozilla.org/en-US/docs/Web/API/File/File
  const content = new Uint8Array([
    /* https://stackoverflow.com/a/64635408 */
  ]);
  const blob = new Blob([content.buffer]);
  const stream = blob.stream();

  jest.mocked(get).mockImplementation(() =>
    createResponsePromise(stream, {
      headers: {
        'content-length': blob.size.toString()
      }
    })
  );

  await downloadProgressExample();
  expect(get).toHaveBeenCalledTimes(1);
  expect(get).toHaveBeenCalledWith(
    'https://fetch-progress.anthum.com/30kbps/images/sunrise-baseline.jpg'
  );
});
