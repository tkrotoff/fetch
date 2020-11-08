import 'core-js/stable';
import 'regenerator-runtime/runtime';
import 'whatwg-fetch';

import {
  defaults,
  deleteJSON,
  getJSON,
  HttpError,
  HttpStatus,
  postFormData,
  postJSON
} from '@tkrotoff/fetch';
// Yes, you can use [Jest expect](https://github.com/facebook/jest/tree/v24.9.0/packages/expect) inside a browser, how cool it that!
import expect from 'expect';
import { UAParser } from 'ua-parser-js';

import './index.html';

/* eslint-disable unicorn/prefer-add-event-listener */

async function getJSON200OKExample() {
  console.group(getJSON200OKExample.name);
  try {
    const response = await getJSON('https://jsonplaceholder.typicode.com/posts/1');
    console.log(response);
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
document.getElementById('getJSON200OKExample')!.onclick = getJSON200OKExample;

async function postJSON201CreatedExample() {
  console.group(postJSON201CreatedExample.name);
  try {
    const response = await postJSON('https://jsonplaceholder.typicode.com/posts', {
      title: 'foo',
      body: 'bar',
      userId: 1
    });
    console.log(response);
    expect(response).toEqual({ id: 101, title: 'foo', body: 'bar', userId: 1 });
  } catch {
    console.assert(false, 'Code should not be reached');
  }
  console.groupEnd();
}
document.getElementById(postJSON201CreatedExample.name)!.onclick = postJSON201CreatedExample;

async function deleteJSON200OKExample() {
  console.group(deleteJSON200OKExample.name);
  try {
    const response = await deleteJSON('https://jsonplaceholder.typicode.com/posts/1');
    console.log(response);
    expect(response).toEqual({});
  } catch {
    console.assert(false, 'Code should not be reached');
  }
  console.groupEnd();
}
document.getElementById(deleteJSON200OKExample.name)!.onclick = deleteJSON200OKExample;

// [Special handling for CORS preflight headers?](https://github.com/Readify/httpstatus/issues/25)

async function getJSON404NotFoundExample() {
  console.group(getJSON404NotFoundExample.name);
  try {
    await getJSON('https://httpstat.us/404/cors');
    console.assert(false, 'Code should not be reached');
  } catch (e) {
    console.dir(e);
    expect(e).toBeInstanceOf(HttpError);
    expect(e.name).toEqual('HttpError');
    // https://stackoverflow.com/q/41632077
    //expect(e.message).toEqual('Not Found');
    expect(e.status).toEqual(HttpStatus._404_NotFound);
    expect(e.statusCode).toEqual(HttpStatus._404_NotFound);
    expect(e.response).toEqual({ code: 404, description: 'Not Found' });
  }
  console.groupEnd();
}
document.getElementById(getJSON404NotFoundExample.name)!.onclick = getJSON404NotFoundExample;

async function getJSON500InternalServerErrorExample() {
  console.group(getJSON500InternalServerErrorExample.name);
  try {
    await getJSON('https://httpstat.us/500/cors');
    console.assert(false, 'Code should not be reached');
  } catch (e) {
    console.dir(e);
    expect(e).toBeInstanceOf(HttpError);
    expect(e.name).toEqual('HttpError');
    // https://stackoverflow.com/q/41632077
    //expect(e.message).toEqual('Internal Server Error');
    expect(e.status).toEqual(HttpStatus._500_InternalServerError);
    expect(e.statusCode).toEqual(HttpStatus._500_InternalServerError);
    expect(e.response).toEqual({ code: 500, description: 'Internal Server Error' });
  }
  console.groupEnd();
}
document.getElementById(
  getJSON500InternalServerErrorExample.name
)!.onclick = getJSON500InternalServerErrorExample;

function checkTypeError(e: TypeError) {
  expect(e).toBeInstanceOf(TypeError);
  expect(e.name).toEqual('TypeError');

  const browser = new UAParser();
  const engine = browser.getEngine().name;

  switch (engine) {
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
      console.assert(false, `Unknown browser engine: '${engine}'`);
  }
}

async function getJSONCorsBlockedExample() {
  console.group(getJSONCorsBlockedExample.name);
  try {
    await getJSON('https://postman-echo.com/get?foo1=bar1&foo2=bar2');
    console.assert(false, 'Code should not be reached');
  } catch (e) {
    console.dir(e);
    checkTypeError(e);
  }
  console.groupEnd();
}
document.getElementById(getJSONCorsBlockedExample.name)!.onclick = getJSONCorsBlockedExample;

async function fetchCorsBlockedExample() {
  console.group(fetchCorsBlockedExample.name);
  try {
    await fetch('https://httpstat.us/whatever', defaults.init);
    console.assert(false, 'Code should not be reached');
  } catch (e) {
    console.dir(e);
    checkTypeError(e);
  }
  console.groupEnd();
}
document.getElementById(fetchCorsBlockedExample.name)!.onclick = fetchCorsBlockedExample;

async function uploadFilesExample() {
  console.group(uploadFilesExample.name);
  const fileField = document.querySelector(
    'input[type="file"][multiple][name="fileField"]'
  ) as HTMLInputElement;

  const data = new FormData();
  const { files } = fileField;
  for (let i = 0; i < files!.length; i++) {
    data.append(`file${i}`, files![i]);
  }

  try {
    const response = await postFormData('https://httpbin.org/anything', data);
    console.log(response);
    expect(response).toHaveProperty('files');
  } catch (e) {
    console.error('Error:', e);
  }
  console.groupEnd();
}
document.getElementById(uploadFilesExample.name)!.onclick = uploadFilesExample;

async function abortRequestExample() {
  console.group(abortRequestExample.name);

  const controller = new AbortController();

  const timeout = setTimeout(() => controller.abort(), 500);

  try {
    await getJSON('https://httpbin.org/drip?duration=2&numbytes=10&code=200&delay=2', {
      signal: controller.signal
    });
    clearTimeout(timeout);
    console.assert(false, 'Code should not be reached');
  } catch (e) {
    console.dir(e);
    expect(e).toBeInstanceOf(DOMException);
    expect(e.name).toEqual('AbortError');
    expect(e.message).toEqual('The user aborted a request.');
    expect(e.stack).toEqual(undefined);
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
  const progressIndicator = document.getElementById(
    'download-progress-indicator'
  ) as HTMLProgressElement;

  const { headers, body } = await fetch(
    'https://fetch-progress.anthum.com/30kbps/images/sunrise-baseline.jpg'
  );

  const contentLength = headers.get('Content-Length');
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
}
document.getElementById(downloadProgressExample.name)!.onclick = downloadProgressExample;
