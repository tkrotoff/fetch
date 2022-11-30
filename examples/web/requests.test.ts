import * as Http from '@tkrotoff/fetch';

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

// https://github.com/aelbore/esbuild-jest/issues/26#issuecomment-968853688
// https://github.com/swc-project/swc/issues/5059
jest.mock('@tkrotoff/fetch', () => ({
  __esModule: true,
  ...jest.requireActual('@tkrotoff/fetch')
}));

beforeEach(jest.restoreAllMocks);

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
});

test('del200OKExample()', async () => {
  const mock = jest.spyOn(Http, 'del').mockImplementation(() => Http.createJSONResponsePromise({}));

  await del200OKExample();
  expect(mock).toHaveBeenCalledTimes(1);
  expect(mock).toHaveBeenCalledWith('https://jsonplaceholder.typicode.com/posts/1');
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
});

test('getCorsBlockedExample()', async () => {
  const mock = jest.spyOn(Http, 'get').mockRejectedValue(new TypeError('Failed to fetch'));

  await getCorsBlockedExample();
  expect(mock).toHaveBeenCalledTimes(1);
  expect(mock).toHaveBeenCalledWith('https://postman-echo.com/get?foo1=bar1&foo2=bar2');
});

test('uploadFilesExample()', async () => {
  const mock = jest.spyOn(Http, 'post').mockImplementation(() =>
    Http.createJSONResponsePromise({
      files: { file0: 'file0Content', file1: 'file1Content' }
    })
  );

  const file0 = new File(['file0Content'], 'file0', { type: 'text/plain' });
  const file1 = new File(['file1Content'], 'file1', { type: 'text/plain' });

  await uploadFilesExample([file0, file1] as unknown as FileList);
  expect(mock).toHaveBeenCalledTimes(1);
  expect(mock).toHaveBeenCalledWith('https://httpbin.org/anything', expect.any(FormData));
});

test('abortRequestExample()', async () => {
  const abortError = new DOMException('The user aborted a request.', 'AbortError');

  const mock = jest.spyOn(Http, 'get').mockImplementation((_input, init) => {
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

  const mock = jest.spyOn(Http, 'get').mockImplementation(() =>
    Http.createResponsePromise(stream, {
      headers: {
        'content-length': blob.size.toString()
      }
    })
  );

  await downloadProgressExample();
  expect(mock).toHaveBeenCalledTimes(1);
  expect(mock).toHaveBeenCalledWith(
    'https://fetch-progress.anthum.com/30kbps/images/sunrise-baseline.jpg'
  );
});
