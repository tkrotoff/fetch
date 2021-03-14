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
  expect(getSpy).toHaveBeenCalledTimes(1);
  expect(getSpy).toHaveBeenCalledWith('https://jsonplaceholder.typicode.com/posts/1');

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
  expect(postJSONSpy).toHaveBeenCalledTimes(1);
  expect(postJSONSpy).toHaveBeenCalledWith('https://jsonplaceholder.typicode.com/posts', {
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
  expect(delSpy).toHaveBeenCalledTimes(1);
  expect(delSpy).toHaveBeenCalledWith('https://jsonplaceholder.typicode.com/posts/1');

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
  expect(getSpy).toHaveBeenCalledTimes(1);
  expect(getSpy).toHaveBeenCalledWith('https://httpstat.us/404/cors');

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
  expect(getSpy).toHaveBeenCalledTimes(1);
  expect(getSpy).toHaveBeenCalledWith('https://httpstat.us/500/cors');

  getSpy.mockRestore();
});

test('getCorsBlockedExample()', async () => {
  const getSpy = jest.spyOn(Http, 'get').mockRejectedValue(new TypeError('Failed to fetch'));

  await getCorsBlockedExample();
  expect(getSpy).toHaveBeenCalledTimes(1);
  expect(getSpy).toHaveBeenCalledWith('https://postman-echo.com/get?foo1=bar1&foo2=bar2');

  getSpy.mockRestore();
});

test('uploadFilesExample()', async () => {
  const postSpy = jest.spyOn(Http, 'post').mockImplementation(() =>
    Http.createJSONResponsePromise({
      files: { file0: 'file0Content', file1: 'file1Content' }
    })
  );

  const file0 = new File(['file0Content'], 'file0', { type: 'text/plain' });
  const file1 = new File(['file1Content'], 'file1', { type: 'text/plain' });

  await uploadFilesExample(([file0, file1] as unknown) as FileList);
  expect(postSpy).toHaveBeenCalledTimes(1);
  expect(postSpy).toHaveBeenCalledWith('https://httpbin.org/anything', expect.any(FormData));

  postSpy.mockRestore();
});

test('abortRequestExample()', async () => {
  const abortError = new DOMException('The user aborted a request.', 'AbortError');

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
  expect(getSpy).toHaveBeenCalledTimes(1);
  expect(getSpy).toHaveBeenCalledWith(
    'https://httpbin.org/drip?duration=2&numbytes=10&code=200&delay=2',
    {
      signal: expect.any(AbortSignal)
    }
  );

  getSpy.mockRestore();
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

  const getSpy = jest.spyOn(Http, 'get').mockImplementation(() =>
    Http.createResponsePromise(stream, {
      headers: {
        'content-length': blob.size.toString()
      }
    })
  );

  await downloadProgressExample();
  expect(getSpy).toHaveBeenCalledTimes(1);
  expect(getSpy).toHaveBeenCalledWith(
    'https://fetch-progress.anthum.com/30kbps/images/sunrise-baseline.jpg'
  );

  getSpy.mockRestore();
});
