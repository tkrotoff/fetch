/* eslint-disable unicorn/no-null, jest/no-conditional-expect */

import assert from 'node:assert';
import { Readable } from 'node:stream';

import { entriesToObject } from './utils/entriesToObject';
import { createHttpError, createJSONHttpError } from './createHttpError';

const redirected = process.env.FETCH === 'whatwg-fetch' ? undefined : false;

// "new Response()" gives a 200 response:
// {
//   body: null
//   bodyUsed: false
//   headers: Headers {}
//   ok: true
//   redirected: false
//   status: 200
//   statusText: '' // Microsoft Edge 44 (EdgeHTML 18): 'OK' instead
//   type: 'default'
//   url: ''
// }
//
// "new Response('body')" sets content-type:
// {
//   body: ReadableStream
//   bodyUsed: false
//   headers: Headers { 'content-type': 'text/plain;charset=UTF-8' }
//   ok: true
//   redirected: false
//   status: 200
//   statusText: ''
//   type: 'default'
//   url: ''
// }
//
// "Response.error()":
// {
//   body: null
//   bodyUsed: false
//   headers: Headers {}
//   ok: false
//   redirected: false
//   status: 0
//   statusText: ""
//   type: "error"
//   url: ""
// }
//
// Tested with:
// - Chrome 88
// - Firefox 84
// - GNOME Web 3.28.6 (WebKit 605.1.15)
// - Microsoft Edge 44 (EdgeHTML 18)
// - IE 11: 'Response' is undefined

function checkBody(body: Body['body']) {
  switch (process.env.FETCH) {
    case 'node-fetch': {
      expect(body).toEqual(expect.any(Readable));
      break;
    }
    case 'whatwg-fetch': {
      expect(body).toEqual(undefined);
      break;
    }
    case 'undici': {
      expect(body).toEqual(expect.any(ReadableStream));
      break;
    }
    default: {
      assert(false, `Unknown FETCH env '${process.env.FETCH}'`);
    }
  }
}

function checkBodyUsedWithNoBody(bodyUsed: Body['bodyUsed']) {
  switch (process.env.FETCH) {
    case 'node-fetch': {
      // FIXME https://github.com/node-fetch/node-fetch/issues/1684
      expect(bodyUsed).toEqual(true);
      break;
    }
    case 'whatwg-fetch': {
      expect(bodyUsed).toEqual(true);
      break;
    }
    case 'undici': {
      expect(bodyUsed).toEqual(false);
      break;
    }
    default: {
      assert(false, `Unknown FETCH env '${process.env.FETCH}'`);
    }
  }
}

test('new Response()', async () => {
  const response = new Response();
  // https://github.com/github/fetch/issues/746
  expect(response.body).toEqual(process.env.FETCH === 'whatwg-fetch' ? undefined : null); // Should be null
  expect(response.bodyUsed).toEqual(false);
  expect(entriesToObject(response.headers)).toEqual({});
  expect(response.ok).toEqual(true);
  expect(response.redirected).toEqual(redirected); // Should be false
  expect(response.status).toEqual(200);
  expect(response.statusText).toEqual('');
  expect(response.type).toEqual('default');
  expect(response.url).toEqual('');

  expect(await response.text()).toEqual('');
  checkBodyUsedWithNoBody(response.bodyUsed);
});

test("new Response('body')", async () => {
  const response = new Response('body');
  checkBody(response.body);
  expect(response.bodyUsed).toEqual(false);
  expect(entriesToObject(response.headers)).toEqual({
    'content-type': 'text/plain;charset=UTF-8'
  });
  expect(response.ok).toEqual(true);
  expect(response.redirected).toEqual(redirected); // Should be false
  expect(response.status).toEqual(200);
  expect(response.statusText).toEqual('');
  expect(response.type).toEqual('default');
  expect(response.url).toEqual('');

  expect(await response.text()).toEqual('body');
  expect(response.bodyUsed).toEqual(true);
});

test('Response.error()', async () => {
  const response = Response.error();
  expect(response.body).toEqual(process.env.FETCH === 'whatwg-fetch' ? undefined : null); // Should be null
  expect(response.bodyUsed).toEqual(false);
  expect(entriesToObject(response.headers)).toEqual({});
  expect(response.ok).toEqual(false);
  expect(response.redirected).toEqual(process.env.FETCH === 'whatwg-fetch' ? undefined : false); // Should be false
  expect(response.status).toEqual(0);
  expect(response.statusText).toEqual('');
  expect(response.type).toEqual('error');
  expect(response.url).toEqual('');

  expect(await response.text()).toEqual('');
  checkBodyUsedWithNoBody(response.bodyUsed);
});

test('200 OK', async () => {
  {
    const { name, message, response } = createHttpError('body', 200, 'OK');
    expect(name).toEqual('HttpError');
    expect(message).toEqual('OK');
    checkBody(response.body);
    expect(response.bodyUsed).toEqual(false);
    expect(entriesToObject(response.headers)).toEqual({
      'content-type': 'text/plain;charset=UTF-8'
    });
    expect(response.ok).toEqual(true);
    expect(response.redirected).toEqual(redirected);
    expect(response.status).toEqual(200);
    expect(response.statusText).toEqual('OK');
    expect(response.type).toEqual('default');
    expect(response.url).toEqual('');

    expect(await response.text()).toEqual('body');
    expect(response.bodyUsed).toEqual(true);
  }

  {
    const { name, message, response } = createJSONHttpError({ body: true }, 200, 'OK');
    expect(name).toEqual('HttpError');
    expect(message).toEqual('OK');
    checkBody(response.body);
    expect(response.bodyUsed).toEqual(false);
    expect(entriesToObject(response.headers)).toEqual({
      'content-type': 'application/json'
    });
    expect(response.ok).toEqual(true);
    expect(response.redirected).toEqual(redirected);
    expect(response.status).toEqual(200);
    expect(response.statusText).toEqual('OK');
    expect(response.type).toEqual('default');
    expect(response.url).toEqual('');

    expect(await response.json()).toEqual({ body: true });
    expect(response.bodyUsed).toEqual(true);
  }
});

test('204 No Content', async () => {
  {
    const { name, message, response } = createHttpError(undefined, 204, 'No Content');
    expect(name).toEqual('HttpError');
    expect(message).toEqual('No Content');
    expect(response.body).toEqual(process.env.FETCH === 'whatwg-fetch' ? undefined : null);
    expect(response.bodyUsed).toEqual(false);
    expect(entriesToObject(response.headers)).toEqual({});
    expect(response.ok).toEqual(true);
    expect(response.redirected).toEqual(redirected);
    expect(response.status).toEqual(204);
    expect(response.statusText).toEqual('No Content');
    expect(response.type).toEqual('default');
    expect(response.url).toEqual('');

    expect(await response.text()).toEqual('');
    checkBodyUsedWithNoBody(response.bodyUsed);
  }

  switch (process.env.FETCH) {
    case 'node-fetch': {
      // FIXME https://github.com/node-fetch/node-fetch/issues/1685
      expect(() => createJSONHttpError({}, 204, 'No Content')).not.toThrow();
      break;
    }
    case 'whatwg-fetch': {
      // FIXME https://github.com/github/fetch/issues/1213
      expect(() => createJSONHttpError({}, 204, 'No Content')).not.toThrow();
      break;
    }
    case 'undici': {
      // FIXME Chrome 107: "TypeError: Failed to construct 'Response': Response with null body status cannot have body"
      expect(() => createJSONHttpError({}, 204, 'No Content')).toThrow(
        'Response constructor: Invalid response status code 204'
      );
      break;
    }
    default: {
      assert(false, `Unknown FETCH env '${process.env.FETCH}'`);
    }
  }
});

test('404 Not Found', async () => {
  {
    const { name, message, response } = createHttpError('error', 404, 'Not Found');
    expect(name).toEqual('HttpError');
    expect(message).toEqual('Not Found');
    checkBody(response.body);
    expect(response.bodyUsed).toEqual(false);
    expect(entriesToObject(response.headers)).toEqual({
      'content-type': 'text/plain;charset=UTF-8'
    });
    expect(response.ok).toEqual(false);
    expect(response.redirected).toEqual(redirected);
    expect(response.status).toEqual(404);
    expect(response.statusText).toEqual('Not Found');
    expect(response.type).toEqual('default');
    expect(response.url).toEqual('');

    expect(await response.text()).toEqual('error');
    expect(response.bodyUsed).toEqual(true);
  }

  {
    const { name, message, response } = createJSONHttpError({ error: 404 }, 404, 'Not Found');
    expect(name).toEqual('HttpError');
    expect(message).toEqual('Not Found');
    checkBody(response.body);
    expect(response.bodyUsed).toEqual(false);
    expect(entriesToObject(response.headers)).toEqual({
      'content-type': 'application/json'
    });
    expect(response.ok).toEqual(false);
    expect(response.redirected).toEqual(redirected);
    expect(response.status).toEqual(404);
    expect(response.statusText).toEqual('Not Found');
    expect(response.type).toEqual('default');
    expect(response.url).toEqual('');

    expect(await response.json()).toEqual({ error: 404 });
    expect(response.bodyUsed).toEqual(true);
  }
});

test('no statusText', async () => {
  {
    const { name, message, response } = createHttpError('body', 200);
    expect(name).toEqual('HttpError');
    expect(message).toEqual('200');
    checkBody(response.body);
    expect(response.bodyUsed).toEqual(false);
    expect(entriesToObject(response.headers)).toEqual({
      'content-type': 'text/plain;charset=UTF-8'
    });
    expect(response.ok).toEqual(true);
    expect(response.redirected).toEqual(redirected);
    expect(response.status).toEqual(200);
    expect(response.statusText).toEqual('');
    expect(response.type).toEqual('default');
    expect(response.url).toEqual('');

    expect(await response.text()).toEqual('body');
    expect(response.bodyUsed).toEqual(true);
  }

  {
    const { name, message, response } = createJSONHttpError({ body: true }, 200);
    expect(name).toEqual('HttpError');
    expect(message).toEqual('200');
    checkBody(response.body);
    expect(response.bodyUsed).toEqual(false);
    expect(entriesToObject(response.headers)).toEqual({
      'content-type': 'application/json'
    });
    expect(response.ok).toEqual(true);
    expect(response.redirected).toEqual(redirected);
    expect(response.status).toEqual(200);
    expect(response.statusText).toEqual('');
    expect(response.type).toEqual('default');
    expect(response.url).toEqual('');

    expect(await response.json()).toEqual({ body: true });
    expect(response.bodyUsed).toEqual(true);
  }
});

test('status 0', async () => {
  switch (process.env.FETCH) {
    case 'node-fetch': {
      // FIXME https://github.com/node-fetch/node-fetch/issues/1685
      expect(() => createHttpError('body', 0)).not.toThrow();
      break;
    }
    case 'whatwg-fetch': {
      // FIXME https://github.com/github/fetch/issues/1213
      expect(() => createHttpError('body', 0)).not.toThrow();
      break;
    }
    case 'undici': {
      expect(() => createHttpError('body', 0)).toThrow(
        'init["status"] must be in the range of 200 to 599, inclusive.'
      );
      break;
    }
    default: {
      assert(false, `Unknown FETCH env '${process.env.FETCH}'`);
    }
  }

  switch (process.env.FETCH) {
    case 'node-fetch': {
      // FIXME https://github.com/node-fetch/node-fetch/issues/1685
      expect(() => createJSONHttpError({ body: true }, 0)).not.toThrow();
      break;
    }
    case 'whatwg-fetch': {
      // FIXME https://github.com/github/fetch/issues/1213
      expect(() => createJSONHttpError({ body: true }, 0)).not.toThrow();
      break;
    }
    case 'undici': {
      expect(() => createJSONHttpError({ body: true }, 0)).toThrow(
        'init["status"] must be in the range of 200 to 599, inclusive.'
      );
      break;
    }
    default: {
      assert(false, `Unknown FETCH env '${process.env.FETCH}'`);
    }
  }
});

test('no status', async () => {
  {
    // @ts-ignore
    const { name, message, response } = createHttpError('body');
    expect(name).toEqual('HttpError');
    expect(message).toEqual('200');
    checkBody(response.body);
    expect(response.bodyUsed).toEqual(false);
    expect(entriesToObject(response.headers)).toEqual({
      'content-type': 'text/plain;charset=UTF-8'
    });
    expect(response.ok).toEqual(true);
    expect(response.redirected).toEqual(redirected);
    expect(response.status).toEqual(200);
    expect(response.statusText).toEqual('');
    expect(response.type).toEqual('default');
    expect(response.url).toEqual('');

    expect(await response.text()).toEqual('body');
    expect(response.bodyUsed).toEqual(true);
  }

  {
    // @ts-ignore
    const { name, message, response } = createJSONHttpError({ body: true });
    expect(name).toEqual('HttpError');
    expect(message).toEqual('200');
    checkBody(response.body);
    expect(response.bodyUsed).toEqual(false);
    expect(entriesToObject(response.headers)).toEqual({
      'content-type': 'application/json'
    });
    expect(response.ok).toEqual(true);
    expect(response.redirected).toEqual(redirected);
    expect(response.status).toEqual(200);
    expect(response.statusText).toEqual('');
    expect(response.type).toEqual('default');
    expect(response.url).toEqual('');

    expect(await response.json()).toEqual({ body: true });
    expect(response.bodyUsed).toEqual(true);
  }
});

test('no params', async () => {
  // @ts-ignore
  const { name, message, response } = createHttpError();
  expect(name).toEqual('HttpError');
  expect(message).toEqual('200');
  expect(response.body).toEqual(process.env.FETCH === 'whatwg-fetch' ? undefined : null);
  expect(response.bodyUsed).toEqual(false);
  expect(entriesToObject(response.headers)).toEqual({});
  expect(response.ok).toEqual(true);
  expect(response.redirected).toEqual(redirected);
  expect(response.status).toEqual(200);
  expect(response.statusText).toEqual('');
  expect(response.type).toEqual('default');
  expect(response.url).toEqual('');

  expect(await response.text()).toEqual('');
  checkBodyUsedWithNoBody(response.bodyUsed);
});
