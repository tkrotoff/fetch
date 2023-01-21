import assert from 'node:assert';

import { createTestServer } from './createTestServer/createTestServer';
import { get } from './Http';
import { HttpError } from './HttpError';

const path = '/';

test('HttpError with statusText (HTTP/1.1)', async () => {
  expect.assertions(6);

  const server = createTestServer({ silenceErrors: true });

  server.get(path, (_request, reply) => {
    reply.code(404).send(new Error('Not Found'));
  });
  const url = await server.listen();

  try {
    await get(url).text();
  } catch (e) {
    assert(e instanceof HttpError);
    const { name, message, response } = e;
    /* eslint-disable jest/no-conditional-expect */
    expect(name).toEqual('HttpError');
    expect(message).toEqual('Not Found');
    expect(response.status).toEqual(404);
    expect(response.statusText).toEqual('Not Found');
    expect(response.headers.get('content-type')).toEqual('application/json; charset=utf-8');
    expect(await response.json()).toEqual({
      error: 'Not Found',
      message: 'Not Found',
      statusCode: 404
    });
    /* eslint-enable jest/no-conditional-expect */
  }

  await server.close();
});

test('HttpError without statusText because of HTTP/2', async () => {
  // ["HTTP/2 doesn't have reason phrases anymore"](https://stackoverflow.com/q/41632077)
  // Unfortunately HTTP/2 does not work with whatwg-fetch/jsdom and node-fetch so we cannot test using HTTP/2
  // Let's emulate an empty statusText instead

  const body = {
    error: 'Not Found',
    message: 'Not Found',
    statusCode: 404
  };

  // With statusText
  let e = new HttpError(
    new Response(JSON.stringify(body), { status: 404, statusText: 'Not Found' })
  );
  expect(e.name).toEqual('HttpError');
  expect(e.message).toEqual('Not Found');
  expect(e.response.status).toEqual(404);
  expect(e.response.statusText).toEqual('Not Found');
  expect(await e.response.json()).toEqual(body);

  // Without statusText
  e = new HttpError(new Response(JSON.stringify(body), { status: 404 }));
  expect(e.name).toEqual('HttpError');
  expect(e.message).toEqual('404');
  expect(e.response.status).toEqual(404);
  expect(e.response.statusText).toEqual('');
  expect(await e.response.json()).toEqual(body);

  // With empty statusText
  e = new HttpError(new Response(JSON.stringify(body), { status: 404, statusText: '' }));
  expect(e.name).toEqual('HttpError');
  expect(e.message).toEqual('404');
  expect(e.response.status).toEqual(404);
  expect(e.response.statusText).toEqual('');
  expect(await e.response.json()).toEqual(body);
});
