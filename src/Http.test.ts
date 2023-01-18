import assert from 'node:assert';

import { createTestServer } from './createTestServer/createTestServer';
import { entriesToObject } from './utils/entriesToObject';
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
  expect(defaults.init).toEqual({});

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

    // FIXME await close() is too slow with Fastify 4.10.2
    server.close();
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

    // FIXME await close() is too slow with Fastify 4.10.2
    server.close();
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

    // FIXME await close() is too slow with Fastify 4.10.2
    server.close();
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

  // FIXME await close() is too slow with Fastify 4.10.2
  server.close();
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

  // FIXME await close() is too slow with Fastify 4.10.2
  server.close();
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

  // FIXME await close() is too slow with Fastify 4.10.2
  server.close();
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

  // FIXME await close() is too slow with Fastify 4.10.2
  server.close();
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

  // FIXME await close() is too slow with Fastify 4.10.2
  server.close();
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

  // FIXME await close() is too slow with Fastify 4.10.2
  server.close();
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

  // FIXME await close() is too slow with Fastify 4.10.2
  server.close();
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

  // FIXME await close() is too slow with Fastify 4.10.2
  server.close();
});

test('postJSON() with undefined request body', async () => {
  const server = createTestServer({ silenceErrors: true });

  const url = await server.listen();

  await expect(postJSON(url, undefined as any).text()).rejects.toThrow('Bad Request');

  // FIXME await close() is too slow with Fastify 4.10.2
  server.close();
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

  // FIXME await close() is too slow with Fastify 4.10.2
  server.close();
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

  // FIXME await close() is too slow with Fastify 4.10.2
  server.close();
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

  // FIXME await close() is too slow with Fastify 4.10.2
  server.close();
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

  // FIXME await close() is too slow with Fastify 4.10.2
  server.close();
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

  // FIXME await close() is too slow with Fastify 4.10.2
  server.close();
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

  // FIXME await close() is too slow with Fastify 4.10.2
  server.close();
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

  // FIXME await close() is too slow with Fastify 4.10.2
  server.close();
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

  // FIXME await close() is too slow with Fastify 4.10.2
  server.close();
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

    // FIXME await close() is too slow with Fastify 4.10.2
    server.close();
  });

  test('.arrayBuffer()', async () => {
    const server = createTestServer();

    server.get(path, (request, reply) => {
      reply.send(request.headers.accept);
    });
    const url = await server.listen();

    const response = await get(url).arrayBuffer();
    expect(Buffer.from(response)).toEqual(Buffer.from('*/*'));

    // FIXME await close() is too slow with Fastify 4.10.2
    server.close();
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
    if (process.env.FETCH !== 'whatwg-fetch') {
      // eslint-disable-next-line jest/no-conditional-expect
      expect(await response.text()).toEqual('*/*');
    }

    // FIXME await close() is too slow with Fastify 4.10.2
    server.close();
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

    // FIXME await close() is too slow with Fastify 4.10.2
    server.close();
  });

  test('.json() with JSON reply', async () => {
    const server = createTestServer();

    server.get(path, (request, reply) => {
      reply.send({ accept: request.headers.accept });
    });
    const url = await server.listen();

    const response = await get(url).json();
    expect(response).toEqual({ accept: 'application/json' });

    // FIXME await close() is too slow with Fastify 4.10.2
    server.close();
  });

  test('.json() with text reply', async () => {
    const server = createTestServer();

    server.get(path, (request, reply) => {
      reply.send(request.headers.accept);
    });
    const url = await server.listen();

    const response = await get(url).json();
    expect(response).toEqual('application/json');

    // FIXME await close() is too slow with Fastify 4.10.2
    server.close();
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

    // FIXME await close() is too slow with Fastify 4.10.2
    server.close();
  });

  test('.json() without content-type reply', async () => {
    const server = createTestServer();

    server.get(path, (request, reply) => {
      reply.type('').send(request.headers.accept);
    });
    const url = await server.listen();

    const response = await get(url).json();
    expect(response).toEqual('application/json');

    // FIXME await close() is too slow with Fastify 4.10.2
    server.close();
  });

  test('.text()', async () => {
    const server = createTestServer();

    server.get(path, (request, reply) => {
      reply.send(request.headers.accept);
    });
    const url = await server.listen();

    const response = await get(url).text();
    expect(response).toEqual('text/*');

    // FIXME await close() is too slow with Fastify 4.10.2
    server.close();
  });

  test('should not override existing accept header', async () => {
    const server = createTestServer();

    server.get(path, (request, reply) => {
      reply.send(request.headers.accept);
    });
    const url = await server.listen();

    const response = await get(url, { headers: { accept: 'text/plain' } }).text();
    expect(response).toEqual('text/plain');

    // FIXME await close() is too slow with Fastify 4.10.2
    server.close();
  });

  // https://github.com/whatwg/fetch/issues/1147
  let bodyAlreadyUsedError = '';
  switch (process.env.FETCH) {
    case 'node-fetch': {
      bodyAlreadyUsedError = 'body used already for: ';
      break;
    }
    case 'whatwg-fetch': {
      bodyAlreadyUsedError = 'Already read';
      break;
    }
    case 'undici': {
      bodyAlreadyUsedError = 'Body is unusable';
      break;
    }
    default: {
      assert(false, `Unknown FETCH env '${process.env.FETCH}'`);
    }
  }

  test('multiple body calls using helpers', async () => {
    const server = createTestServer();

    server.get(path, (request, reply) => {
      reply.send({ accept: request.headers.accept });
    });
    const url = await server.listen();

    const response = get(url);
    expect(await response.json()).toEqual({ accept: 'application/json' });
    await expect(response.text()).rejects.toThrow(bodyAlreadyUsedError);

    // FIXME await close() is too slow with Fastify 4.10.2
    server.close();
  });

  test('multiple body calls using regular response', async () => {
    const server = createTestServer();

    server.get(path, (request, reply) => {
      reply.send({ accept: request.headers.accept });
    });
    const url = await server.listen();

    const response = await get(url);
    expect(await response.json()).toEqual({ accept: '*/*' });
    await expect(response.text()).rejects.toThrow(bodyAlreadyUsedError);

    // FIXME await close() is too slow with Fastify 4.10.2
    server.close();
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
    await expect((await response).text()).rejects.toThrow(bodyAlreadyUsedError);

    // FIXME await close() is too slow with Fastify 4.10.2
    server.close();
  });
});

test('cannot connect', async () => {
  const url = 'http://localhost/';

  let requestFailedError = '';
  switch (process.env.FETCH) {
    case 'node-fetch': {
      requestFailedError = `request to ${url} failed, reason: connect ECONNREFUSED 127.0.0.1:80`;
      break;
    }
    case 'whatwg-fetch': {
      requestFailedError = 'Network request failed';
      break;
    }
    case 'undici': {
      requestFailedError = 'fetch failed';
      break;
    }
    default: {
      assert(false, `Unknown FETCH env '${process.env.FETCH}'`);
    }
  }

  // Avoid console to be polluted with whatwg-fetch "Error: connect ECONNREFUSED"
  const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

  try {
    await get(url).text();
  } catch (e) {
    assert(e instanceof Error);
    /* eslint-disable jest/no-conditional-expect */
    expect(e.name).toEqual(process.env.FETCH === 'node-fetch' ? 'FetchError' : 'TypeError');
    expect(e.message).toEqual(requestFailedError);
    /* eslint-enable jest/no-conditional-expect */
  }

  expect(consoleSpy).toHaveBeenCalledTimes(process.env.FETCH === 'whatwg-fetch' ? 1 : 0);

  consoleSpy.mockRestore();
});
