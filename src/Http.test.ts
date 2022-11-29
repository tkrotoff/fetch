import assert from 'node:assert';

import { createTestServer } from './createTestServer/createTestServer';
import { entriesToObject } from './utils/entriesToObject';
import { isWhatwgFetch } from './utils/isWhatwgFetch';
import { defaults, del, get, patch, patchJSON, post, postJSON, put, putJSON } from './Http';

const path = '/';

test('defaults.init', async () => {
  const url = 'http://localhost';

  const spy = jest
    .spyOn(globalThis, 'fetch')
    // Cannot use mockResolvedValue(new Response('test')) otherwise we get the error "TypeError: body used already"
    .mockImplementation(() => Promise.resolve(new Response('test')));

  // Should use defaults.init
  await get(url).text();
  expect(spy).toHaveBeenCalledTimes(1);
  expect(spy).toHaveBeenLastCalledWith(url, {
    credentials: 'same-origin',
    headers: expect.any(Headers),
    method: 'GET'
  });
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  let headers = entriesToObject(spy.mock.calls[0][1]!.headers as Headers);
  expect(headers).toEqual({ accept: 'text/*' });

  // What happens when defaults.init is modified?
  const originalInit = { ...defaults.init };
  defaults.init = {
    mode: 'cors',
    credentials: 'include',
    headers: { test1: 'true' }
  };

  spy.mockClear();
  await get(url).text();
  expect(spy).toHaveBeenCalledTimes(1);
  expect(spy).toHaveBeenLastCalledWith(url, {
    mode: 'cors',
    credentials: 'include',
    headers: expect.any(Headers),
    method: 'GET'
  });
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  headers = entriesToObject(spy.mock.calls[0][1]!.headers as Headers);
  expect(headers).toEqual({ accept: 'text/*', test1: 'true' });

  // Should not overwrite defaults.init.headers
  spy.mockClear();
  await get(url, { mode: 'no-cors', credentials: 'omit', headers: { test2: 'true' } }).text();
  expect(spy).toHaveBeenCalledTimes(1);
  expect(spy).toHaveBeenLastCalledWith(url, {
    mode: 'no-cors',
    credentials: 'omit',
    headers: expect.any(Headers),
    method: 'GET'
  });
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  headers = entriesToObject(spy.mock.calls[0][1]!.headers as Headers);
  expect(headers).toEqual({ accept: 'text/*', test1: 'true', test2: 'true' });

  defaults.init = originalInit;
  expect(defaults.init).toEqual({ credentials: 'same-origin' });

  spy.mockRestore();
});

describe('custom headers', () => {
  test('get() with JSON headers', async () => {
    const server = createTestServer();

    server.get(path, (request, reply) => {
      reply.send(request.headers);
    });
    const url = await server.listen();

    const headers = { test: 'true' };
    const response = await get(url, { headers }).text();
    expect(JSON.parse(response).test).toEqual('true');

    await server.close();
  });

  test('get() with Headers instance', async () => {
    const server = createTestServer();

    server.get(path, (request, reply) => {
      reply.send(request.headers);
    });
    const url = await server.listen();

    const headers = new Headers({ test: 'true' });
    const response = await get(url, { headers }).text();
    expect(JSON.parse(response).test).toEqual('true');

    await server.close();
  });

  test('postJSON()', async () => {
    const server = createTestServer();

    server.post(path, (request, reply) => {
      reply.send(request.headers);
    });
    const url = await server.listen();

    const body = { test: true };
    const headers = { test: 'true' };
    const response = (await postJSON(url, body, { headers }).json()) as typeof body;
    expect(response.test).toEqual('true');

    await server.close();
  });
});

test('get()', async () => {
  const server = createTestServer();

  server.get(path, (request, reply) => {
    expect(request.headers['content-type']).toBeUndefined();
    expect(request.headers['content-length']).toBeUndefined();
    expect(request.body).toBeUndefined();
    reply.send(request.method);
  });
  const url = await server.listen();

  const response = await get(url).text();
  expect(response).toEqual('GET');

  await server.close();
});

test('get() with new URL()', async () => {
  const server = createTestServer();

  server.get(path, (request, reply) => {
    expect(request.headers['content-type']).toBeUndefined();
    expect(request.headers['content-length']).toBeUndefined();
    expect(request.body).toBeUndefined();
    reply.send(request.method);
  });
  const url = await server.listen();

  const response = await get(new URL(url)).text();
  expect(response).toEqual('GET');

  await server.close();
});

test('multiple fetch()', async () => {
  const server = createTestServer();

  server.get(path, (request, reply) => {
    reply.send(request.method);
  });
  const url = await server.listen();

  const response1 = await fetch(url);
  expect(await response1.text()).toEqual('GET');

  const response2 = await fetch(url);
  expect(await response2.text()).toEqual('GET');

  await server.close();
});

test('multiple requests', async () => {
  const server = createTestServer();

  server.get(path, (request, reply) => {
    reply.send(request.method);
  });
  server.post(path, (request, reply) => {
    reply.send(request.method);
  });
  const url = await server.listen();

  const response1 = await get(url).text();
  expect(response1).toEqual('GET');

  const response2 = await get(url).text();
  expect(response2).toEqual('GET');

  const body = { test: true };
  const response3 = postJSON(url, body);
  expect(await response3.text()).toEqual('POST');

  await server.close();
});

test('post()', async () => {
  const server = createTestServer();

  const body = 'test';

  server.post(path, (request, reply) => {
    expect(request.headers['content-type']).toEqual('text/plain;charset=UTF-8');
    expect(request.headers['content-length']).toEqual('4');
    expect(request.body).toEqual(body);
    reply.send(request.method);
  });
  const url = await server.listen();

  const response = await post(url, body).text();
  expect(response).toEqual('POST');

  await server.close();
});

test('post() without body', async () => {
  const server = createTestServer();

  server.post(path, (request, reply) => {
    expect(request.headers['content-type']).toBeUndefined();
    expect(request.headers['content-length']).toEqual('0');
    expect(request.body).toBeUndefined();
    reply.send(request.method);
  });
  const url = await server.listen();

  const response = await post(url).text();
  expect(response).toEqual('POST');

  await server.close();
});

test('postJSON()', async () => {
  const server = createTestServer();

  const body = { test: true };

  server.post(path, (request, reply) => {
    expect(request.headers['content-type']).toEqual('application/json');
    expect(request.body).toEqual(body);
    reply.send(request.method);
  });
  const url = await server.listen();

  const response = await postJSON(url, body).text();
  expect(response).toEqual('POST');

  await server.close();
});

test('postJSON() should override content-type but keep other headers', async () => {
  const server = createTestServer();

  const body = { test: true };

  server.post(path, (request, reply) => {
    expect(request.headers['content-type']).toEqual('application/json');
    expect(request.headers.test).toEqual('true');
    expect(request.body).toEqual(body);
    reply.send(request.method);
  });
  const url = await server.listen();

  const response = await postJSON(url, body, {
    headers: { 'content-type': 'text/plain', test: 'true' }
  }).text();
  expect(response).toEqual('POST');

  await server.close();
});

test('postJSON() with undefined request body', async () => {
  const server = createTestServer({ silenceErrors: true });

  const url = await server.listen();

  await expect(postJSON(url, undefined as any).text()).rejects.toThrow('Bad Request');

  await server.close();
});

test('postJSON() with null request body', async () => {
  const server = createTestServer();

  server.post(path, (request, reply) => {
    expect(request.headers['content-type']).toEqual('application/json');
    expect(request.headers['content-length']).toEqual('4');
    expect(request.body).toBeNull();
    reply.send(request.method);
  });
  const url = await server.listen();

  // eslint-disable-next-line unicorn/no-null
  const response = await postJSON(url, null as any).text();
  expect(response).toEqual('POST');

  await server.close();
});

test('put()', async () => {
  const server = createTestServer();

  const body = 'test';

  server.put(path, (request, reply) => {
    expect(request.headers['content-type']).toEqual('text/plain;charset=UTF-8');
    expect(request.headers['content-length']).toEqual('4');
    expect(request.body).toEqual(body);
    reply.send(request.method);
  });
  const url = await server.listen();

  const response = await put(url, body).text();
  expect(response).toEqual('PUT');

  await server.close();
});

test('put() without body', async () => {
  const server = createTestServer();

  server.put(path, (request, reply) => {
    expect(request.headers['content-type']).toBeUndefined();
    expect(request.headers['content-length']).toEqual('0');
    expect(request.body).toBeUndefined();
    reply.send(request.method);
  });
  const url = await server.listen();

  const response = await put(url).text();
  expect(response).toEqual('PUT');

  await server.close();
});

test('putJSON()', async () => {
  const server = createTestServer();

  const body = { test: true };

  server.put(path, (request, reply) => {
    expect(request.headers['content-type']).toEqual('application/json');
    expect(request.body).toEqual(body);
    reply.send(request.method);
  });
  const url = await server.listen();

  const response = await putJSON(url, body).text();
  expect(response).toEqual('PUT');

  await server.close();
});

test('patch()', async () => {
  const server = createTestServer();

  const body = 'test';

  server.patch(path, (request, reply) => {
    expect(request.headers['content-type']).toEqual('text/plain;charset=UTF-8');
    expect(request.headers['content-length']).toEqual('4');
    expect(request.body).toEqual(body);
    reply.send(request.method);
  });
  const url = await server.listen();

  const response = await patch(url, body).text();
  expect(response).toEqual('PATCH');

  await server.close();
});

test('patch() without body', async () => {
  const server = createTestServer();

  server.patch(path, (request, reply) => {
    expect(request.headers['content-type']).toBeUndefined();
    expect(request.headers['content-length']).toEqual('0');
    expect(request.body).toBeUndefined();
    reply.send(request.method);
  });
  const url = await server.listen();

  const response = await patch(url).text();
  expect(response).toEqual('PATCH');

  await server.close();
});

test('patchJSON()', async () => {
  const server = createTestServer();

  const body = { test: true };

  server.patch(path, (request, reply) => {
    expect(request.headers['content-type']).toEqual('application/json');
    expect(request.body).toEqual(body);
    reply.send(request.method);
  });
  const url = await server.listen();

  const response = await patchJSON(url, body).text();
  expect(response).toEqual('PATCH');

  await server.close();
});

test('del()', async () => {
  const server = createTestServer();

  server.delete(path, (request, reply) => {
    expect(request.headers['content-type']).toBeUndefined();
    expect(request.headers['content-length']).toBeUndefined();
    reply.send(request.method);
  });
  const url = await server.listen();

  const response = await del(url).text();
  expect(response).toEqual('DELETE');

  await server.close();
});

describe('body methods', () => {
  test('without body method', async () => {
    const server = createTestServer();

    server.get(path, (request, reply) => {
      reply.send(request.headers.accept);
    });
    const url = await server.listen();

    const response = await get(url);
    expect(await response.text()).toEqual('*/*');

    await server.close();
  });

  test('.arrayBuffer()', async () => {
    const server = createTestServer();

    server.get(path, (request, reply) => {
      reply.send(request.headers.accept);
    });
    const url = await server.listen();

    const response = await get(url).arrayBuffer();
    expect(Buffer.from(response)).toEqual(Buffer.from('*/*'));

    await server.close();
  });

  test('.blob()', async () => {
    const server = createTestServer();

    server.get(path, (request, reply) => {
      reply.send(request.headers.accept);
    });
    const url = await server.listen();

    const response = await get(url).blob();
    expect(response.size).toEqual(3);
    // FIXME https://github.com/jsdom/jsdom/issues/2555
    if (!isWhatwgFetch) {
      // eslint-disable-next-line jest/no-conditional-expect
      expect(await response.text()).toEqual('*/*');
    }

    await server.close();
  });

  test('.formData()', async () => {
    const server = createTestServer();

    server.get(path, (request, reply) => {
      reply
        .header('Content-Type', 'application/x-www-form-urlencoded')
        .send(request.headers.accept);
    });
    const url = await server.listen();

    const response = await get(url).formData();
    expect(entriesToObject(response)).toEqual({ 'multipart/form-data': '' });

    await server.close();
  });

  test('.json() with JSON reply', async () => {
    const server = createTestServer();

    server.get(path, (request, reply) => {
      reply.send({ accept: request.headers.accept });
    });
    const url = await server.listen();

    const response = await get(url).json();
    expect(response).toEqual({ accept: 'application/json' });

    await server.close();
  });

  test('.json() with text reply', async () => {
    const server = createTestServer();

    server.get(path, (request, reply) => {
      reply.send(request.headers.accept);
    });
    const url = await server.listen();

    const response = await get(url).json();
    expect(response).toEqual('application/json');

    await server.close();
  });

  test('.json() with empty reply', async () => {
    const server = createTestServer();

    server.get(path, (request, reply) => {
      expect(request.headers.accept).toEqual('application/json');
      reply.send();
    });
    const url = await server.listen();

    const response = await get(url).json();
    expect(response).toEqual('');

    await server.close();
  });

  test('.json() without content-type reply', async () => {
    const server = createTestServer();

    server.get(path, (request, reply) => {
      reply.type('').send(request.headers.accept);
    });
    const url = await server.listen();

    const response = await get(url).json();
    expect(response).toEqual('application/json');

    await server.close();
  });

  test('.text()', async () => {
    const server = createTestServer();

    server.get(path, (request, reply) => {
      reply.send(request.headers.accept);
    });
    const url = await server.listen();

    const response = await get(url).text();
    expect(response).toEqual('text/*');

    await server.close();
  });

  test('should not override existing accept header', async () => {
    const server = createTestServer();

    server.get(path, (request, reply) => {
      reply.send(request.headers.accept);
    });
    const url = await server.listen();

    const response = await get(url, { headers: { accept: 'text/plain' } }).text();
    expect(response).toEqual('text/plain');

    await server.close();
  });

  // https://github.com/whatwg/fetch/issues/1147
  // eslint-disable-next-line unicorn/consistent-function-scoping
  const nodeFetchBodyAlreadyUsedError = (url: string) => `body used already for: ${url}`;
  const whatwgFetchBodyAlreadyUsedError = 'Already read';
  const bodyAlreadyUsedError = (url: string) =>
    isWhatwgFetch ? whatwgFetchBodyAlreadyUsedError : nodeFetchBodyAlreadyUsedError(url);

  test('multiple body calls using helpers', async () => {
    const server = createTestServer();

    server.get(path, (request, reply) => {
      reply.send({ accept: request.headers.accept });
    });
    const url = await server.listen();

    const response = get(url);
    expect(await response.json()).toEqual({ accept: 'application/json' });
    await expect(response.text()).rejects.toThrow(bodyAlreadyUsedError(url));

    await server.close();
  });

  test('multiple body calls using regular response', async () => {
    const server = createTestServer();

    server.get(path, (request, reply) => {
      reply.send({ accept: request.headers.accept });
    });
    const url = await server.listen();

    const response = await get(url);
    expect(await response.json()).toEqual({ accept: '*/*' });
    await expect(response.text()).rejects.toThrow(bodyAlreadyUsedError(url));

    await server.close();
  });

  test('multiple body calls using helper + regular response', async () => {
    const server = createTestServer();

    server.get(path, (request, reply) => {
      reply.send({ accept: request.headers.accept });
    });
    const url = await server.listen();

    const response = get(url);
    expect(await response.json()).toEqual({ accept: 'application/json' });
    // eslint-disable-next-line unicorn/no-await-expression-member
    await expect((await response).text()).rejects.toThrow(bodyAlreadyUsedError(url));

    await server.close();
  });
});

test('cannot connect', async () => {
  const url = 'http://localhost/';

  const nodeFetchRequestFailedError = `request to ${url} failed, reason: connect ECONNREFUSED 127.0.0.1:80`;
  const whatwgFetchRequestFailedError = 'Network request failed';
  const requestFailedError = isWhatwgFetch
    ? whatwgFetchRequestFailedError
    : nodeFetchRequestFailedError;

  // Avoid console to be polluted with whatwg-fetch "Error: connect ECONNREFUSED"
  const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

  try {
    await get(url).text();
  } catch (e) {
    assert(e instanceof Error);
    /* eslint-disable jest/no-conditional-expect */
    expect(e.name).toEqual(isWhatwgFetch ? 'TypeError' : 'FetchError');
    expect(e.message).toEqual(requestFailedError);
    /* eslint-enable jest/no-conditional-expect */
  }

  expect(consoleSpy).toHaveBeenCalledTimes(isWhatwgFetch ? 1 : 0);

  consoleSpy.mockRestore();
});

// FIXME Remove when support for [EdgeHTML](https://en.wikipedia.org/wiki/EdgeHTML) is dropped
test('should not throw under EdgeHTML', async () => {
  const OriginalHeaders = Headers;

  // Simulate Microsoft Edge <= 18 (EdgeHTML) throwing "Invalid argument" with "new Headers(undefined)" and "new Headers(null)"
  globalThis.Headers = class extends OriginalHeaders {
    constructor(init?: HeadersInit) {
      if (init === undefined || init === null) {
        throw new TypeError('Invalid argument');
      }
      super(init);
    }
  };

  const server = createTestServer();

  server.get(path, (_request, reply) => {
    reply.send('should not throw');
  });
  const url = await server.listen();

  const response = await get(url).text();
  expect(response).toEqual('should not throw');

  globalThis.Headers = OriginalHeaders;

  await server.close();
});
