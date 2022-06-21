import { del, get, HttpError, postJSON } from '@tkrotoff/fetch';
// Yes, you can use [Jest expect](https://github.com/facebook/jest/tree/v24.9.0/packages/expect) without Jest, how cool it that!
import { expect } from 'expect';
import assert from 'node:assert';

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
    expect(e.message).toEqual('Not Found');
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
    expect(e.message).toEqual('Internal Server Error');
    expect(e.response.status).toEqual(500);
    expect(await e.response.text()).toEqual('500 Internal Server Error');
  }
  console.groupEnd();
}

export async function getCorsBlockedExample() {
  console.group(getCorsBlockedExample.name);
  try {
    await get('https://postman-echo.com/get?foo1=bar1&foo2=bar2');
    // istanbul ignore next
    assert(false, 'Code should not be reached');
  } catch (e) {
    assert(e instanceof TypeError);
    expect(e).toBeInstanceOf(TypeError);
    expect(e.name).toEqual('TypeError');
    expect(e.message).toEqual('Failed to fetch');
  }
  console.groupEnd();
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
    // DOMException does not exist with node-fetch
    //expect(e).toBeInstanceOf(DOMException);
    assert(e instanceof Error);
    expect(e).toBeInstanceOf(Error);
    expect(e.name).toEqual('AbortError');
    expect(e.message).toEqual('The operation was aborted.');
  }

  console.groupEnd();
}
