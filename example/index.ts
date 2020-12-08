import 'core-js/stable';
import 'regenerator-runtime/runtime';
import 'whatwg-fetch';

import { del, get, HttpError, post, postJSON } from '@tkrotoff/fetch';
// Yes, you can use [Jest expect](https://github.com/facebook/jest/tree/v24.9.0/packages/expect) inside a browser, how cool it that!
import expect from 'expect';
import { UAParser } from 'ua-parser-js';

import './index.html';

/* eslint-disable unicorn/prefer-add-event-listener */

const browserEngine = new UAParser().getEngine().name;

async function get200OKExample() {
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
    console.assert(false, 'Code should not be reached');
  }
  console.groupEnd();
}
document.getElementById(get200OKExample.name)!.onclick = get200OKExample;

async function postJSON201CreatedExample() {
  console.group(postJSON201CreatedExample.name);
  try {
    const response = await postJSON('https://jsonplaceholder.typicode.com/posts', {
      title: 'foo',
      body: 'bar',
      userId: 1
    }).json();
    expect(response).toEqual({ id: 101, title: 'foo', body: 'bar', userId: 1 });
  } catch {
    console.assert(false, 'Code should not be reached');
  }
  console.groupEnd();
}
document.getElementById(postJSON201CreatedExample.name)!.onclick = postJSON201CreatedExample;

async function del200OKExample() {
  console.group(del200OKExample.name);
  try {
    const response = await del('https://jsonplaceholder.typicode.com/posts/1').json();
    expect(response).toEqual({});
  } catch {
    console.assert(false, 'Code should not be reached');
  }
  console.groupEnd();
}
document.getElementById(del200OKExample.name)!.onclick = del200OKExample;

// [Special handling for CORS preflight headers?](https://github.com/Readify/httpstatus/issues/25)

async function get404NotFoundExample() {
  console.group(get404NotFoundExample.name);
  try {
    await get('https://httpstat.us/404/cors');
    console.assert(false, 'Code should not be reached');
  } catch (e) {
    expect(e).toBeInstanceOf(HttpError);
    expect(e.name).toEqual('HttpError');

    switch (browserEngine) {
      case 'EdgeHTML':
      case 'Trident':
      case 'WebKit':
      case 'Blink':
        expect(e.message).toEqual('404');
        break;
      case 'Gecko':
        expect(e.message).toEqual('Not Found');
        break;
      default:
        console.assert(false, `Unknown browser engine: '${browserEngine}'`);
    }

    expect(e.response.status).toEqual(404);
    expect(await e.response.text()).toEqual('404 Not Found');
  }
  console.groupEnd();
}
document.getElementById(get404NotFoundExample.name)!.onclick = get404NotFoundExample;

async function get500InternalServerErrorExample() {
  console.group(get500InternalServerErrorExample.name);
  try {
    await get('https://httpstat.us/500/cors');
    console.assert(false, 'Code should not be reached');
  } catch (e) {
    expect(e).toBeInstanceOf(HttpError);
    expect(e.name).toEqual('HttpError');

    switch (browserEngine) {
      case 'EdgeHTML':
      case 'Trident':
      case 'WebKit':
      case 'Blink':
        expect(e.message).toEqual('500');
        break;
      case 'Gecko':
        expect(e.message).toEqual('Internal Server Error');
        break;
      default:
        console.assert(false, `Unknown browser engine: '${browserEngine}'`);
    }

    expect(e.response.status).toEqual(500);
    expect(await e.response.text()).toEqual('500 Internal Server Error');
  }
  console.groupEnd();
}
document.getElementById(
  get500InternalServerErrorExample.name
)!.onclick = get500InternalServerErrorExample;

function checkTypeError(e: TypeError) {
  expect(e).toBeInstanceOf(TypeError);
  expect(e.name).toEqual('TypeError');

  switch (browserEngine) {
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
      console.assert(false, `Unknown browser engine: '${browserEngine}'`);
  }
}

async function getCorsBlockedExample() {
  console.group(getCorsBlockedExample.name);
  try {
    await get('https://postman-echo.com/get?foo1=bar1&foo2=bar2');
    console.assert(false, 'Code should not be reached');
  } catch (e) {
    checkTypeError(e);
  }
  console.groupEnd();
}
document.getElementById(getCorsBlockedExample.name)!.onclick = getCorsBlockedExample;

async function uploadFilesExample() {
  console.group(uploadFilesExample.name);

  const fileField = document.querySelector(
    'input[type="file"][multiple][name="fileField"]'
  ) as HTMLInputElement;

  const formData = new FormData();
  const { files } = fileField;
  for (let i = 0; i < files!.length; i++) {
    formData.append(`file${i}`, files![i]);
  }

  try {
    const response = await post('https://httpbin.org/anything', formData).json();
    expect(response).toHaveProperty('files');
  } catch {
    console.assert(false, 'Code should not be reached');
  }

  console.groupEnd();
}
document.getElementById(uploadFilesExample.name)!.onclick = uploadFilesExample;

function checkAbortError(e: DOMException) {
  expect(e).toBeInstanceOf(DOMException);
  expect(e.name).toEqual('AbortError');

  switch (browserEngine) {
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
      console.assert(false, `Unknown browser engine: '${browserEngine}'`);
  }
}

async function abortRequestExample() {
  console.group(abortRequestExample.name);

  const controller = new AbortController();

  const timeout = setTimeout(() => controller.abort(), 500);

  try {
    await get('https://httpbin.org/drip?duration=2&numbytes=10&code=200&delay=2', {
      signal: controller.signal
    });
    clearTimeout(timeout);
    console.assert(false, 'Code should not be reached');
  } catch (e) {
    checkAbortError(e);
  }

  console.groupEnd();
}
document.getElementById(abortRequestExample.name)!.onclick = abortRequestExample;

// https://github.com/AnthumChris/fetch-progress-indicators/issues/16
//
// https://stackoverflow.com/a/64635408
// https://stackoverflow.com/a/64635024
// https://stackoverflow.com/a/64635519
async function downloadProgressExample() {
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
document.getElementById(downloadProgressExample.name)!.onclick = downloadProgressExample;
