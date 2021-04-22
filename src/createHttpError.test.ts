import { isWhatwgFetch } from './utils/isWhatwgFetch';
import { createHttpError, createJSONHttpError } from './createHttpError';
import { entriesToObject } from './Http';

/* eslint-disable unicorn/no-null */

const redirected = isWhatwgFetch ? undefined : false;
const type = isWhatwgFetch ? 'default' : undefined;

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

test('new Response()', async () => {
  const response = new Response();
  // https://github.com/github/fetch/issues/746
  expect(response.body).toEqual(isWhatwgFetch ? undefined : null); // Should be null
  expect(response.bodyUsed).toEqual(false);
  expect(entriesToObject(response.headers)).toEqual({});
  expect(response.ok).toEqual(true);
  expect(response.redirected).toEqual(redirected); // Should be false
  expect(response.status).toEqual(200);
  expect(response.statusText).toEqual('');
  expect(response.type).toEqual(type); // Should be 'default'
  expect(response.url).toEqual('');

  expect(await response.text()).toEqual('');
  expect(response.bodyUsed).toEqual(true);
});

test("new Response('body')", async () => {
  const response = new Response('body');
  // https://github.com/github/fetch/issues/746
  expect(response.body).toEqual(isWhatwgFetch ? undefined : expect.any(Buffer));
  expect(response.bodyUsed).toEqual(false);
  expect(entriesToObject(response.headers)).toEqual({
    'content-type': 'text/plain;charset=UTF-8'
  });
  expect(response.ok).toEqual(true);
  expect(response.redirected).toEqual(redirected); // Should be false
  expect(response.status).toEqual(200);
  expect(response.statusText).toEqual('');
  expect(response.type).toEqual(type); // Should be 'default'
  expect(response.url).toEqual('');

  expect(await response.text()).toEqual('body');
  expect(response.bodyUsed).toEqual(true);
});

if (isWhatwgFetch) {
  test('Response.error()', async () => {
    const response = Response.error();
    expect(response.body).toEqual(undefined); // Should be null
    expect(response.bodyUsed).toEqual(false);
    expect(entriesToObject(response.headers)).toEqual({});
    expect(response.ok).toEqual(false);
    expect(response.redirected).toEqual(undefined); // Should be false
    expect(response.status).toEqual(0);
    expect(response.statusText).toEqual('');
    expect(response.type).toEqual('error');
    expect(response.url).toEqual('');

    expect(await response.text()).toEqual('');
    expect(response.bodyUsed).toEqual(true);
  });
}

test('200 OK', async () => {
  {
    const { name, message, response } = createHttpError('body', 200, 'OK');
    expect(name).toEqual('HttpError');
    expect(message).toEqual('OK');
    expect(response.body).toEqual(isWhatwgFetch ? undefined : expect.any(Buffer));
    expect(response.bodyUsed).toEqual(false);
    expect(entriesToObject(response.headers)).toEqual({
      'content-type': 'text/plain;charset=UTF-8'
    });
    expect(response.ok).toEqual(true);
    expect(response.redirected).toEqual(redirected);
    expect(response.status).toEqual(200);
    expect(response.statusText).toEqual('OK');
    expect(response.type).toEqual(type);
    expect(response.url).toEqual('');

    expect(await response.text()).toEqual('body');
    expect(response.bodyUsed).toEqual(true);
  }

  {
    const { name, message, response } = createJSONHttpError({ body: true }, 200, 'OK');
    expect(name).toEqual('HttpError');
    expect(message).toEqual('OK');
    expect(response.body).toEqual(isWhatwgFetch ? undefined : expect.any(Buffer));
    expect(response.bodyUsed).toEqual(false);
    expect(entriesToObject(response.headers)).toEqual({
      'content-type': 'application/json'
    });
    expect(response.ok).toEqual(true);
    expect(response.redirected).toEqual(redirected);
    expect(response.status).toEqual(200);
    expect(response.statusText).toEqual('OK');
    expect(response.type).toEqual(type);
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
    expect(response.body).toEqual(isWhatwgFetch ? undefined : null);
    expect(response.bodyUsed).toEqual(false);
    expect(entriesToObject(response.headers)).toEqual({});
    expect(response.ok).toEqual(true);
    expect(response.redirected).toEqual(redirected);
    expect(response.status).toEqual(204);
    expect(response.statusText).toEqual('No Content');
    expect(response.type).toEqual(type);
    expect(response.url).toEqual('');

    expect(await response.text()).toEqual('');
    expect(response.bodyUsed).toEqual(true);
  }

  {
    const { name, message, response } = createJSONHttpError({}, 204, 'No Content');
    expect(name).toEqual('HttpError');
    expect(message).toEqual('No Content');
    expect(response.body).toEqual(isWhatwgFetch ? undefined : expect.any(Buffer));
    expect(response.bodyUsed).toEqual(false);
    expect(entriesToObject(response.headers)).toEqual({
      'content-type': 'application/json'
    });
    expect(response.ok).toEqual(true);
    expect(response.redirected).toEqual(redirected);
    expect(response.status).toEqual(204);
    expect(response.statusText).toEqual('No Content');
    expect(response.type).toEqual(type);
    expect(response.url).toEqual('');

    expect(await response.json()).toEqual({});
    expect(response.bodyUsed).toEqual(true);
  }
});

test('404 Not Found', async () => {
  {
    const { name, message, response } = createHttpError('error', 404, 'Not Found');
    expect(name).toEqual('HttpError');
    expect(message).toEqual('Not Found');
    expect(response.body).toEqual(isWhatwgFetch ? undefined : expect.any(Buffer));
    expect(response.bodyUsed).toEqual(false);
    expect(entriesToObject(response.headers)).toEqual({
      'content-type': 'text/plain;charset=UTF-8'
    });
    expect(response.ok).toEqual(false);
    expect(response.redirected).toEqual(redirected);
    expect(response.status).toEqual(404);
    expect(response.statusText).toEqual('Not Found');
    expect(response.type).toEqual(type);
    expect(response.url).toEqual('');

    expect(await response.text()).toEqual('error');
    expect(response.bodyUsed).toEqual(true);
  }

  {
    const { name, message, response } = createJSONHttpError({ error: 404 }, 404, 'Not Found');
    expect(name).toEqual('HttpError');
    expect(message).toEqual('Not Found');
    expect(response.body).toEqual(isWhatwgFetch ? undefined : expect.any(Buffer));
    expect(response.bodyUsed).toEqual(false);
    expect(entriesToObject(response.headers)).toEqual({
      'content-type': 'application/json'
    });
    expect(response.ok).toEqual(false);
    expect(response.redirected).toEqual(redirected);
    expect(response.status).toEqual(404);
    expect(response.statusText).toEqual('Not Found');
    expect(response.type).toEqual(type);
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
    expect(response.body).toEqual(isWhatwgFetch ? undefined : expect.any(Buffer));
    expect(response.bodyUsed).toEqual(false);
    expect(entriesToObject(response.headers)).toEqual({
      'content-type': 'text/plain;charset=UTF-8'
    });
    expect(response.ok).toEqual(true);
    expect(response.redirected).toEqual(redirected);
    expect(response.status).toEqual(200);
    expect(response.statusText).toEqual('');
    expect(response.type).toEqual(type);
    expect(response.url).toEqual('');

    expect(await response.text()).toEqual('body');
    expect(response.bodyUsed).toEqual(true);
  }

  {
    const { name, message, response } = createJSONHttpError({ body: true }, 200);
    expect(name).toEqual('HttpError');
    expect(message).toEqual('200');
    expect(response.body).toEqual(isWhatwgFetch ? undefined : expect.any(Buffer));
    expect(response.bodyUsed).toEqual(false);
    expect(entriesToObject(response.headers)).toEqual({
      'content-type': 'application/json'
    });
    expect(response.ok).toEqual(true);
    expect(response.redirected).toEqual(redirected);
    expect(response.status).toEqual(200);
    expect(response.statusText).toEqual('');
    expect(response.type).toEqual(type);
    expect(response.url).toEqual('');

    expect(await response.json()).toEqual({ body: true });
    expect(response.bodyUsed).toEqual(true);
  }
});

// FIXME https://github.com/node-fetch/node-fetch/pull/1078
if (isWhatwgFetch) {
  test('no status', async () => {
    {
      const { name, message, response } = createHttpError('body');
      expect(name).toEqual('HttpError');
      expect(message).toEqual('0');
      expect(response.body).toEqual(undefined);
      expect(response.bodyUsed).toEqual(false);
      expect(entriesToObject(response.headers)).toEqual({
        'content-type': 'text/plain;charset=UTF-8'
      });
      expect(response.ok).toEqual(false);
      expect(response.redirected).toEqual(redirected);
      expect(response.status).toEqual(0);
      expect(response.statusText).toEqual('');
      expect(response.type).toEqual(type);
      expect(response.url).toEqual('');

      expect(await response.text()).toEqual('body');
      expect(response.bodyUsed).toEqual(true);
    }

    {
      const { name, message, response } = createJSONHttpError({ body: true });
      expect(name).toEqual('HttpError');
      expect(message).toEqual('0');
      expect(response.body).toEqual(undefined);
      expect(response.bodyUsed).toEqual(false);
      expect(entriesToObject(response.headers)).toEqual({
        'content-type': 'application/json'
      });
      expect(response.ok).toEqual(false);
      expect(response.redirected).toEqual(redirected);
      expect(response.status).toEqual(0);
      expect(response.statusText).toEqual('');
      expect(response.type).toEqual(type);
      expect(response.url).toEqual('');

      expect(await response.json()).toEqual({ body: true });
      expect(response.bodyUsed).toEqual(true);
    }
  });

  test('no params', async () => {
    const { name, message, response } = createHttpError();
    expect(name).toEqual('HttpError');
    expect(message).toEqual('0');
    expect(response.body).toEqual(undefined);
    expect(response.bodyUsed).toEqual(false);
    expect(entriesToObject(response.headers)).toEqual({});
    expect(response.ok).toEqual(false);
    expect(response.redirected).toEqual(redirected);
    expect(response.status).toEqual(0);
    expect(response.statusText).toEqual('');
    expect(response.type).toEqual(type);
    expect(response.url).toEqual('');

    expect(await response.text()).toEqual('');
    expect(response.bodyUsed).toEqual(true);
  });
}
