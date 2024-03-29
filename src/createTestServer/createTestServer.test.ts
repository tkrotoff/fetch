import { createTestServer } from './createTestServer';

const path = '/';

test('respond to HTTP requests', async () => {
  const server = createTestServer({ https: false });

  server.get(path, (_request, reply) => {
    reply.send('test');
  });
  const url = await server.listen();
  expect(url).toContain('http://127.0.0.1:');

  const response = await fetch(url);
  const text = await response.text();
  expect(text).toEqual('test');

  await server.close();
});

test('respond to HTTPS requests', async () => {
  const server = createTestServer();

  server.get(path, (_request, reply) => {
    reply.send('test');
  });
  const url = await server.listen();
  expect(url).toContain('https://127.0.0.1:');

  const response = await fetch(url);
  const text = await response.text();
  expect(text).toEqual('test');

  await server.close();
});

// FIXME Undici and whatwg-fetch/jsdom don't support HTTP/2
// https://github.com/nodejs/undici/issues/399
// eslint-disable-next-line jest/no-disabled-tests
test.skip('respond to HTTP/2 requests', async () => {
  const server = createTestServer({ http2: true });

  server.get(path, (_request, reply) => {
    reply.send('test');
  });
  const url = await server.listen();
  expect(url).toContain('https://[::1]:');

  const response = await fetch(url);
  const text = await response.text();
  expect(text).toEqual('test');

  await server.close();
});

// Undici doesn't care about CORS
if (process.env.FETCH === 'whatwg-fetch') {
  test('CORS fail', async () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

    const server = createTestServer({ corsOrigin: false });

    server.get(path, async (_request, reply) => {
      reply.send('test');
    });
    const url = await server.listen();

    await expect(fetch(url)).rejects.toThrow('Network request failed');

    await server.close();

    expect(consoleSpy).toHaveBeenCalledTimes(1);

    consoleSpy.mockRestore();
  });
}

// eslint-disable-next-line jest/no-disabled-tests
test.skip('should show Jest errors from expect() inside handlers', async () => {
  const server = createTestServer();

  server.get(path, (_request, _reply) => {
    expect('test').toEqual('fail');
  });
  const url = await server.listen();

  await fetch(url);

  await server.close();
});

test('silence Fastify errors', async () => {
  const server = createTestServer({ silenceErrors: true });

  server.get(path, (_request, _reply) => {
    throw new Error('error');
  });
  const url = await server.listen();

  const response = await fetch(url);
  const json = await response.json();
  expect(json).toEqual({ error: 'Internal Server Error', message: 'error', statusCode: 500 });

  await server.close();
});
