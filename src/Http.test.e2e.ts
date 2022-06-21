/* eslint-disable @typescript-eslint/no-shadow, jest/no-standalone-expect */

import { expect, test } from '@playwright/test';
import { UAParser } from 'ua-parser-js';

import { createTestServer } from './createTestServer/createTestServer';
import { wait } from './utils/wait';
import * as Http from '.';

const tkrotoff_fetch = './dist/umd/index.js';

declare global {
  interface Window {
    Http: typeof Http;
  }
}

const path = '/';

test.describe.configure({ mode: 'parallel' });

test('get()', async ({ page }) => {
  const server = createTestServer();

  server.get(path, (request, reply) => {
    expect(request.headers['content-type']).toBeUndefined();
    expect(request.body).toBeNull();
    reply.send(request.method);
  });
  const url = await server.listen(0);

  await page.addScriptTag({ path: tkrotoff_fetch });

  const response = await page.evaluate(url => window.Http.get(url).text(), url);
  expect(response).toEqual('GET');

  await server.close();
});

test('postJSON()', async ({ page }) => {
  const body = { test: true };

  const server = createTestServer();

  server.post(path, (request, reply) => {
    expect(request.headers['content-type']).toEqual('application/json');
    expect(request.body).toEqual(body);
    reply.send(request.method);
  });
  const url = await server.listen(0);

  await page.addScriptTag({ path: tkrotoff_fetch });

  const response = await page.evaluate(({ url, body }) => window.Http.postJSON(url, body).text(), {
    url,
    body
  });
  expect(response).toEqual('POST');

  await server.close();
});

test('404 Not Found', async ({ page }) => {
  const server = createTestServer();

  server.get(path, (_request, reply) => {
    reply.code(404).send();
  });
  const url = await server.listen(0);

  await page.addScriptTag({ path: tkrotoff_fetch });

  await expect(page.evaluate(url => window.Http.get(url).text(), url)).rejects.toThrow('Not Found');

  await server.close();
});

function getCorsErrorMessage(browserEngine: string | undefined) {
  let message = `Unknown browser engine: '${browserEngine}'`;

  switch (browserEngine) {
    case 'Blink':
      message = 'Failed to fetch';
      break;
    case 'Gecko':
      message = 'NetworkError when attempting to fetch resource.';
      break;
    case 'WebKit':
      message = 'Load failed';
      break;
    default:
  }
  return message;
}

test('CORS fail', async ({ page }) => {
  const server = createTestServer({ corsOrigin: false });

  server.get(path, async (request, reply) => {
    reply.send(request.method);
  });
  const url = await server.listen(0);

  await page.addScriptTag({ path: tkrotoff_fetch });

  const userAgent = await page.evaluate(() => window.navigator.userAgent);
  const browserEngine = new UAParser(userAgent).getEngine().name;

  await expect(page.evaluate(url => window.Http.get(url).text(), url)).rejects.toThrow(
    getCorsErrorMessage(browserEngine)
  );

  await server.close();
});

function getAbortedErrorMessage(browserEngine: string | undefined) {
  let message = `Unknown browser engine: '${browserEngine}'`;
  switch (browserEngine) {
    case 'Blink':
      message = 'The user aborted a request.';
      break;
    case 'Gecko':
      message = 'The operation was aborted. ';
      break;
    case 'WebKit':
      message = 'Fetch is aborted';
      break;
    default:
  }
  return message;
}

test('abort request', async ({ page }) => {
  const server = createTestServer();

  server.get(path, async (request, reply) => {
    await wait(20);
    reply.send(request.method);
  });
  const url = await server.listen(0);

  await page.addScriptTag({ path: tkrotoff_fetch });

  const userAgent = await page.evaluate(() => window.navigator.userAgent);
  const browserEngine = new UAParser(userAgent).getEngine().name;

  await expect(
    page.evaluate(async url => {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 10);
      await window.Http.get(url, { signal: controller.signal }).text();
      clearTimeout(timeout);
    }, url)
  ).rejects.toThrow(getAbortedErrorMessage(browserEngine));

  await server.close();
});

test('HTTPS + HTTP/2', async ({ page }) => {
  const userAgent = await page.evaluate(() => window.navigator.userAgent);
  const browserEngine = new UAParser(userAgent).getEngine().name;
  // FIXME Does not work with WebKit and GitHub Actions
  if (browserEngine === 'WebKit') return;

  const server = createTestServer({ http2: true });

  server.get(path, (request, reply) => {
    reply.send(request.method);
  });
  const url = await server.listen(0);
  expect(url).toContain('https://127.0.0.1:');

  await page.addScriptTag({ path: tkrotoff_fetch });

  const response = await page.evaluate(url => window.Http.get(url).text(), url);
  expect(response).toEqual('GET');

  await server.close();
});
