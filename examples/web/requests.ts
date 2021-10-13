import { del, get, HttpError, post, postJSON } from '@tkrotoff/fetch';
// Yes, you can use [Jest expect](https://github.com/facebook/jest/tree/v24.9.0/packages/expect) without Jest, how cool it that!
import expect from 'expect';
import { UAParser } from 'ua-parser-js';

let browserEngine = new UAParser().getEngine().name;
// istanbul ignore next
if (window.navigator.userAgent.includes('jsdom')) {
  browserEngine = 'jsdom';
}

// https://devblogs.microsoft.com/typescript/announcing-typescript-3-7/#assertion-functions
function assert(_condition: boolean, _message?: string): asserts _condition {
  // eslint-disable-next-line prefer-rest-params
  console.assert(...arguments);
}

export async function get200OKExample() {
  console.group(get200OKExample.name);
  try {
    const response = await get('https://jsonplaceholder.typicode.com/posts/1').json();
    expect(response).toEqual({
      id: 1,
      title: expect.any(String),
      body: expect.any(String),
      userId: 1
    });
  } catch {
    // istanbul ignore next
    assert(false, 'Code should not be reached');
  }
  console.groupEnd();
}

export async function postJSON201CreatedExample() {
  console.group(postJSON201CreatedExample.name);
  try {
    const response = await postJSON('https://jsonplaceholder.typicode.com/posts', {
      title: 'foo',
      body: 'bar',
      userId: 1
    }).json();
    expect(response).toEqual({ id: 101, title: 'foo', body: 'bar', userId: 1 });
  } catch {
    // istanbul ignore next
    assert(false, 'Code should not be reached');
  }
  console.groupEnd();
}

export async function del200OKExample() {
  console.group(del200OKExample.name);
  try {
    const response = await del('https://jsonplaceholder.typicode.com/posts/1').json();
    expect(response).toEqual({});
  } catch {
    // istanbul ignore next
    assert(false, 'Code should not be reached');
  }
  console.groupEnd();
}

// [Special handling for CORS preflight headers?](https://github.com/Readify/httpstatus/issues/25)

export async function get404NotFoundExample() {
  console.group(get404NotFoundExample.name);
  try {
    await get('https://httpstat.us/404/cors');
    // istanbul ignore next
    assert(false, 'Code should not be reached');
  } catch (e) {
    assert(e instanceof HttpError);
    expect(e).toBeInstanceOf(HttpError);
    expect(e.name).toEqual('HttpError');

    // istanbul ignore next
    switch (browserEngine) {
      case 'EdgeHTML':
      case 'Trident':
      case 'WebKit':
      case 'Blink':
        expect(e.message).toEqual('404');
        break;
      case 'jsdom':
      case 'Gecko':
        expect(e.message).toEqual('Not Found');
        break;
      default:
        assert(false, `Unknown browser engine: '${browserEngine}'`);
    }

    expect(e.response.status).toEqual(404);
    expect(await e.response.text()).toEqual('404 Not Found');
  }
  console.groupEnd();
}

export async function get500InternalServerErrorExample() {
  console.group(get500InternalServerErrorExample.name);
  try {
    await get('https://httpstat.us/500/cors');
    // istanbul ignore next
    assert(false, 'Code should not be reached');
  } catch (e) {
    assert(e instanceof HttpError);
    expect(e).toBeInstanceOf(HttpError);
    expect(e.name).toEqual('HttpError');

    // istanbul ignore next
    switch (browserEngine) {
      case 'EdgeHTML':
      case 'Trident':
      case 'WebKit':
      case 'Blink':
        expect(e.message).toEqual('500');
        break;
      case 'jsdom':
      case 'Gecko':
        expect(e.message).toEqual('Internal Server Error');
        break;
      default:
        assert(false, `Unknown browser engine: '${browserEngine}'`);
    }

    expect(e.response.status).toEqual(500);
    expect(await e.response.text()).toEqual('500 Internal Server Error');
  }
  console.groupEnd();
}

function checkTypeError(e: TypeError) {
  expect(e).toBeInstanceOf(TypeError);
  expect(e.name).toEqual('TypeError');

  // istanbul ignore next
  switch (browserEngine) {
    case 'jsdom':
      expect(e.message).toEqual('Failed to fetch');
      break;
    case 'Blink':
      expect(e.message).toEqual('Failed to fetch');
      expect(e.stack).toEqual('TypeError: Failed to fetch');
      break;
    case 'Gecko':
      expect(e.message).toEqual('NetworkError when attempting to fetch resource.');
      expect(e.stack).toEqual('');
      break;
    case 'WebKit':
      expect(e.message).toEqual({
        asymmetricMatch: (actual: string) =>
          /^Origin .* is not allowed by Access-Control-Allow-Origin\.$/.test(actual) ||
          actual === 'Preflight response is not successful'
      });
      expect(e.stack).toBe(undefined);
      break;
    case 'Trident':
      expect(e.message).toEqual('Network request failed');
      expect(e.stack).toEqual({
        asymmetricMatch: (actual: string) =>
          /^TypeError: Network request failed.*$/m.test(actual) || actual === undefined
      });
      break;
    case 'EdgeHTML':
      expect(e.message).toEqual('Failed to fetch');
      expect(e.stack).toEqual({
        asymmetricMatch: (actual: string) =>
          /^TypeError: Failed to fetch.*$/m.test(actual) || actual === undefined
      });
      break;
    default:
      assert(false, `Unknown browser engine: '${browserEngine}'`);
  }
}

export async function getCorsBlockedExample() {
  console.group(getCorsBlockedExample.name);
  try {
    await get('https://postman-echo.com/get?foo1=bar1&foo2=bar2');
    // istanbul ignore next
    assert(false, 'Code should not be reached');
  } catch (e) {
    assert(e instanceof TypeError);
    checkTypeError(e);
  }
  console.groupEnd();
}

export async function uploadFilesExample(files: FileList) {
  console.group(uploadFilesExample.name);

  const formData = new FormData();
  for (let i = 0; i < files.length; i++) {
    formData.append(`file${i}`, files![i]);
  }

  try {
    const response = await post('https://httpbin.org/anything', formData).json();
    expect(response).toHaveProperty('files');
  } catch {
    // istanbul ignore next
    assert(false, 'Code should not be reached');
  }

  console.groupEnd();
}

function checkAbortError(e: DOMException) {
  expect(e).toBeInstanceOf(DOMException);
  expect(e.name).toEqual('AbortError');

  // istanbul ignore next
  switch (browserEngine) {
    case 'jsdom':
    case 'Blink':
      expect(e.message).toEqual('The user aborted a request.');
      break;
    case 'Gecko':
      expect(e.message).toEqual('The operation was aborted. ');
      break;
    case 'WebKit':
      expect(e.message).toEqual('Fetch is aborted');
      break;
    case 'EdgeHTML':
      expect(e.message).toEqual('');
      break;
    default:
      assert(false, `Unknown browser engine: '${browserEngine}'`);
  }
}

export async function abortRequestExample() {
  console.group(abortRequestExample.name);

  const controller = new AbortController();

  const timeout = setTimeout(() => controller.abort(), 500);

  try {
    await get('https://httpbin.org/drip?duration=2&numbytes=10&code=200&delay=2', {
      signal: controller.signal
    });
    // istanbul ignore next
    clearTimeout(timeout);
    // istanbul ignore next
    assert(false, 'Code should not be reached');
  } catch (e) {
    assert(e instanceof DOMException);
    checkAbortError(e);
  }

  console.groupEnd();
}

// https://github.com/AnthumChris/fetch-progress-indicators/issues/16
//
// https://stackoverflow.com/a/64635408
// https://stackoverflow.com/a/64635024
// https://stackoverflow.com/a/64635519
// istanbul ignore next
export async function downloadProgressExample() {
  console.group(downloadProgressExample.name);

  const progressIndicator = document.getElementById(
    'download-progress-indicator'
  ) as HTMLProgressElement;

  const { headers, body } = await get(
    'https://fetch-progress.anthum.com/30kbps/images/sunrise-baseline.jpg'
  );

  const contentLength = headers.get('content-length');
  if (contentLength === null) throw new Error('No Content-Length response header');
  const totalBytes = Number.parseInt(contentLength, 10);
  progressIndicator.max = totalBytes;

  if (body === null) throw new Error('No response body');
  const reader = body.getReader();

  const content = new Array<Uint8Array>();
  let bytesReceived = 0;

  // eslint-disable-next-line no-constant-condition
  while (true) {
    // eslint-disable-next-line no-await-in-loop
    const { done, value } = await reader.read();
    if (done) break;

    content.push(value!);
    bytesReceived += value!.byteLength;

    progressIndicator.value = bytesReceived;
  }

  (document.getElementById('download-progress-img') as HTMLImageElement).src = URL.createObjectURL(
    new Blob(content)
  );

  console.groupEnd();
}
