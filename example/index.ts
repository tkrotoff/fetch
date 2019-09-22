import 'core-js/stable';
import 'regenerator-runtime/runtime';
import 'whatwg-fetch';

// Yes, you can use [Jest expect](https://github.com/facebook/jest/tree/v24.9.0/packages/expect) inside a browser, how cool it that!
import expect from 'expect';

import { UAParser } from 'ua-parser-js';

import { defaults, postJson, getJson, deleteJson, HttpError, HttpStatus } from '@tkrotoff/fetch';

import './index.html';

async function getJson200OKExample() {
  console.group(getJson200OKExample.name);
  try {
    const response = await getJson('https://jsonplaceholder.typicode.com/posts/1');
    console.log(response);
    expect(response).toEqual({
      id: 1,
      title: expect.any(String),
      body: expect.any(String),
      userId: 1
    });
  } catch (e) {
    console.assert(false, 'Code should not be reached');
  }
  console.groupEnd();
}
document.getElementById('getJson200OKExample')!.onclick = getJson200OKExample;

async function postJson201CreatedExample() {
  console.group(postJson201CreatedExample.name);
  try {
    const response = await postJson('https://jsonplaceholder.typicode.com/posts', {
      title: 'foo',
      body: 'bar',
      userId: 1
    });
    console.log(response);
    expect(response).toEqual({ id: 101, title: 'foo', body: 'bar', userId: 1 });
  } catch (e) {
    console.assert(false, 'Code should not be reached');
  }
  console.groupEnd();
}
document.getElementById(postJson201CreatedExample.name)!.onclick = postJson201CreatedExample;

async function deteleJson200OKExample() {
  console.group(deteleJson200OKExample.name);
  try {
    const response = await deleteJson('https://jsonplaceholder.typicode.com/posts/1');
    console.log(response);
    expect(response).toEqual({});
  } catch (e) {
    console.assert(false, 'Code should not be reached');
  }
  console.groupEnd();
}
document.getElementById(deteleJson200OKExample.name)!.onclick = deteleJson200OKExample;

// See [Special handling for CORS preflight headers?](https://github.com/Readify/httpstatus/issues/25)

async function getJson404NotFoundExample() {
  console.group(getJson404NotFoundExample.name);
  try {
    await getJson('https://httpstat.us/404/cors');
    console.assert(false, 'Code should not be reached');
  } catch (e) {
    console.dir(e);
    expect(e).toBeInstanceOf(HttpError);
    expect(e.message).toEqual('Not Found');
    expect(e.status).toEqual(HttpStatus._404_NotFound);
    expect(e.response).toEqual({ code: 404, description: 'Not Found' });
  }
  console.groupEnd();
}
document.getElementById(getJson404NotFoundExample.name)!.onclick = getJson404NotFoundExample;

async function getJson500InternalServerErrorExample() {
  console.group(getJson500InternalServerErrorExample.name);
  try {
    await getJson('https://httpstat.us/500/cors');
    console.assert(false, 'Code should not be reached');
  } catch (e) {
    console.dir(e);
    expect(e).toBeInstanceOf(HttpError);
    expect(e.message).toEqual('Internal Server Error');
    expect(e.status).toEqual(HttpStatus._500_InternalServerError);
    expect(e.response).toEqual({ code: 500, description: 'Internal Server Error' });
  }
  console.groupEnd();
}
document.getElementById(
  getJson500InternalServerErrorExample.name
)!.onclick = getJson500InternalServerErrorExample;

function checkTypeError(e: any) {
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

async function getJsonCorsBlockedExample() {
  console.group(getJsonCorsBlockedExample.name);
  try {
    await getJson('https://postman-echo.com/get?foo1=bar1&foo2=bar2');
    console.assert(false, 'Code should not be reached');
  } catch (e) {
    console.dir(e);
    expect(e).toBeInstanceOf(TypeError);
    checkTypeError(e);
  }
  console.groupEnd();
}
document.getElementById(getJsonCorsBlockedExample.name)!.onclick = getJsonCorsBlockedExample;

async function fetchCorsBlockedExample() {
  console.group(fetchCorsBlockedExample.name);
  try {
    await fetch('https://httpstat.us/whatever', defaults.init);
    console.assert(true, 'Code should not be reached');
  } catch (e) {
    console.dir(e);
    expect(e).toBeInstanceOf(TypeError);
    checkTypeError(e);
  }
  console.groupEnd();
}
document.getElementById(fetchCorsBlockedExample.name)!.onclick = fetchCorsBlockedExample;
