import { isWhatwgFetch } from '../utils/isWhatwgFetch';
import { createTestServer, randomPort } from './createTestServer';

const path = '/';

test('respond to HTTP requests', async () => {
  const server = createTestServer({ https: false });

  server.get(path, (_request, reply) => {
    reply.send('test');
  });
  const url = await server.listen(randomPort);
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
  const url = await server.listen(randomPort);
  expect(url).toContain('https://127.0.0.1:');

  const response = await fetch(url);
  const text = await response.text();
  expect(text).toEqual('test');

  await server.close();
});

// eslint-disable-next-line jest/no-disabled-tests
test.skip('respond to HTTP/2 requests', () => {
  // Unfortunately HTTP/2 does not work with whatwg-fetch/jsdom and node-fetch so we cannot test using HTTP/2
});

// node-fetch does not care about CORS
if (isWhatwgFetch) {
  test('CORS fail', async () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

    const server = createTestServer({ corsOrigin: false });

    server.get(path, async (_request, reply) => {
      reply.send('test');
    });
    const url = await server.listen(randomPort);

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
  const url = await server.listen(randomPort);

  await fetch(url);

  await server.close();
});

test('silence Fastify errors', async () => {
  const server = createTestServer();

  server.silenceErrors();

  server.get(path, (_request, _reply) => {
    throw new Error('error');
  });
  const url = await server.listen(randomPort);

  const response = await fetch(url);
  const json = await response.json();
  expect(json).toEqual({ error: 'Internal Server Error', message: 'error', statusCode: 500 });

  await server.close();
});
