import { entriesToObject } from './utils/entriesToObject';
import { isWhatwgFetch } from './utils/isWhatwgFetch';
import { wait } from './utils/wait';
import { createJSONResponsePromise, createResponsePromise } from './createResponsePromise';
import * as Http from './Http';
import { HttpStatus } from './HttpStatus';

test('default Response object', async () => {
  const responsePromise = createResponsePromise('text');
  const response = await responsePromise;
  expect(entriesToObject(response.headers)).toEqual({
    'content-type': 'text/plain;charset=UTF-8'
  });
  expect(response.ok).toEqual(true);
  expect(response.redirected).toEqual(isWhatwgFetch ? undefined : false);
  expect(response.status).toEqual(200);
  expect(response.statusText).toEqual('');
  expect(response.url).toEqual('');
});

describe('body methods', () => {
  test('.arrayBuffer()', async () => {
    const responsePromise = createResponsePromise('test');
    const arrayBuffer = await responsePromise.arrayBuffer();
    expect(Buffer.from(arrayBuffer)).toEqual(Buffer.from('test'));
  });

  test('.blob()', async () => {
    const responsePromise = createResponsePromise('test');
    const blob = await responsePromise.blob();
    expect(blob.size).toEqual(4);
    // FIXME https://github.com/jsdom/jsdom/issues/2555
    if (!isWhatwgFetch) {
      // eslint-disable-next-line jest/no-conditional-expect
      expect(await blob.text()).toEqual('test');
    }
  });

  // FIXME https://github.com/node-fetch/node-fetch/issues/199
  if (isWhatwgFetch) {
    test('.formData()', async () => {
      const responsePromise = createResponsePromise('test');
      const formData = await responsePromise.formData();
      expect(entriesToObject(formData)).toEqual({ test: '' });
    });
  }

  test('.json() with JSON response', async () => {
    const responsePromise = createJSONResponsePromise({ test: 'true' });
    expect(await responsePromise.json()).toEqual({ test: 'true' });
  });

  test('.json() with text response', async () => {
    const responsePromise = createResponsePromise('test');
    await expect(responsePromise.json()).rejects.toThrow(
      'Unexpected token e in JSON at position 1'
    );
  });

  test('.json() with empty response', async () => {
    const responsePromise = createResponsePromise('');
    await expect(responsePromise.json()).rejects.toThrow('Unexpected end of JSON input');
  });

  test('.json() with no response', async () => {
    const responsePromise = createResponsePromise();
    await expect(responsePromise.json()).rejects.toThrow('Unexpected end of JSON input');
  });

  test('.text()', async () => {
    const responsePromise = createResponsePromise('test');
    const text = await responsePromise.text();
    expect(text).toEqual('test');
  });

  // https://github.com/whatwg/fetch/issues/1147
  const nodeFetchBodyAlreadyUsedError = 'body used already for: ';
  const whatwgFetchBodyAlreadyUsedError = 'Already read';
  const bodyAlreadyUsedError = isWhatwgFetch
    ? whatwgFetchBodyAlreadyUsedError
    : nodeFetchBodyAlreadyUsedError;

  test('multiple body calls using helpers', async () => {
    const responsePromise = createJSONResponsePromise({ test: 'true' });
    expect(await responsePromise.json()).toEqual({ test: 'true' });
    await expect(responsePromise.text()).rejects.toThrow(bodyAlreadyUsedError);
  });

  test('multiple body calls using regular response', async () => {
    const response = await createJSONResponsePromise({ test: 'true' });
    expect(await response.json()).toEqual({ test: 'true' });
    await expect(response.text()).rejects.toThrow(bodyAlreadyUsedError);
  });

  test('multiple body calls using helper + regular response', async () => {
    const response = createJSONResponsePromise({ test: 'true' });
    expect(await response.json()).toEqual({ test: 'true' });
    await expect((await response).text()).rejects.toThrow(bodyAlreadyUsedError);
  });
});

describe('get()', () => {
  test('OK .text()', async () => {
    const getSpy = jest.spyOn(Http, 'get').mockImplementation(() => createResponsePromise('test'));

    const response = await Http.get('url');
    expect(await response.text()).toEqual('test');

    expect(getSpy).toHaveBeenCalledTimes(1);
    expect(getSpy).toHaveBeenCalledWith('url');

    getSpy.mockRestore();
  });

  test('OK .json()', async () => {
    const getSpy = jest
      .spyOn(Http, 'get')
      .mockImplementation(() => createJSONResponsePromise({ test: true }));

    const response = await Http.get('url');
    expect(await response.json()).toEqual({ test: true });

    expect(getSpy).toHaveBeenCalledTimes(1);
    expect(getSpy).toHaveBeenCalledWith('url');

    getSpy.mockRestore();
  });

  test('fail', async () => {
    const getSpy = jest.spyOn(Http, 'get').mockImplementation(() =>
      createResponsePromise('<!DOCTYPE html><title>404</title>', {
        status: HttpStatus._404_NotFound,
        statusText: 'Not Found'
      })
    );

    await expect(Http.get('url')).rejects.toThrow('Not Found');

    expect(getSpy).toHaveBeenCalledTimes(1);
    expect(getSpy).toHaveBeenCalledWith('url');

    getSpy.mockRestore();
  });

  describe('get().text()', () => {
    test('OK', async () => {
      const getSpy = jest
        .spyOn(Http, 'get')
        .mockImplementation(() => createResponsePromise('test'));

      const response = await Http.get('url').text();
      expect(response).toEqual('test');

      expect(getSpy).toHaveBeenCalledTimes(1);
      expect(getSpy).toHaveBeenCalledWith('url');

      getSpy.mockRestore();
    });

    test('fail', async () => {
      const getSpy = jest.spyOn(Http, 'get').mockImplementation(() =>
        createResponsePromise('<!DOCTYPE html><title>404</title>', {
          status: HttpStatus._404_NotFound,
          statusText: 'Not Found'
        })
      );

      await expect(Http.get('url').text()).rejects.toThrow('Not Found');

      expect(getSpy).toHaveBeenCalledTimes(1);
      expect(getSpy).toHaveBeenCalledWith('url');

      getSpy.mockRestore();
    });
  });

  describe('get().json()', () => {
    test('OK', async () => {
      const getSpy = jest
        .spyOn(Http, 'get')
        .mockImplementation(() => createJSONResponsePromise({ test: true }));

      const response = await Http.get('url').json();
      expect(response).toEqual({ test: true });

      expect(getSpy).toHaveBeenCalledTimes(1);
      expect(getSpy).toHaveBeenCalledWith('url');

      getSpy.mockRestore();
    });

    test('fail', async () => {
      const getSpy = jest.spyOn(Http, 'get').mockImplementation(() =>
        createResponsePromise('<!DOCTYPE html><title>404</title>', {
          status: HttpStatus._404_NotFound,
          statusText: 'Not Found'
        })
      );

      await expect(Http.get('url').json()).rejects.toThrow('Not Found');

      expect(getSpy).toHaveBeenCalledTimes(1);
      expect(getSpy).toHaveBeenCalledWith('url');

      getSpy.mockRestore();
    });
  });
});

describe('post()', () => {
  test('OK .text()', async () => {
    const postSpy = jest
      .spyOn(Http, 'post')
      .mockImplementation(() => createResponsePromise('test'));

    const response = await Http.post('url', 'body');
    expect(await response.text()).toEqual('test');

    expect(postSpy).toHaveBeenCalledTimes(1);
    expect(postSpy).toHaveBeenCalledWith('url', 'body');

    postSpy.mockRestore();
  });

  test('OK .json()', async () => {
    const postSpy = jest
      .spyOn(Http, 'post')
      .mockImplementation(() => createJSONResponsePromise({ test: true }));

    const response = await Http.post('url', 'body');
    expect(await response.json()).toEqual({ test: true });

    expect(postSpy).toHaveBeenCalledTimes(1);
    expect(postSpy).toHaveBeenCalledWith('url', 'body');

    postSpy.mockRestore();
  });

  test('fail', async () => {
    const postSpy = jest.spyOn(Http, 'post').mockImplementation(() =>
      createResponsePromise('<!DOCTYPE html><title>404</title>', {
        status: HttpStatus._404_NotFound,
        statusText: 'Not Found'
      })
    );

    await expect(Http.post('url', 'body')).rejects.toThrow('Not Found');

    expect(postSpy).toHaveBeenCalledTimes(1);
    expect(postSpy).toHaveBeenCalledWith('url', 'body');

    postSpy.mockRestore();
  });

  describe('post().text()', () => {
    test('OK', async () => {
      const postSpy = jest
        .spyOn(Http, 'post')
        .mockImplementation(() => createResponsePromise('test'));

      const response = await Http.post('url', 'body').text();
      expect(response).toEqual('test');

      expect(postSpy).toHaveBeenCalledTimes(1);
      expect(postSpy).toHaveBeenCalledWith('url', 'body');

      postSpy.mockRestore();
    });

    test('fail', async () => {
      const postSpy = jest.spyOn(Http, 'post').mockImplementation(() =>
        createResponsePromise('<!DOCTYPE html><title>500</title>', {
          status: HttpStatus._500_InternalServerError,
          statusText: 'Internal Server Error'
        })
      );

      await expect(Http.post('url', 'body').text()).rejects.toThrow('Internal Server Error');

      expect(postSpy).toHaveBeenCalledTimes(1);
      expect(postSpy).toHaveBeenCalledWith('url', 'body');

      postSpy.mockRestore();
    });
  });

  describe('post().json()', () => {
    test('OK', async () => {
      const postSpy = jest
        .spyOn(Http, 'post')
        .mockImplementation(() => createJSONResponsePromise({ test: true }));

      const response = await Http.post('url', 'body').json();
      expect(response).toEqual({ test: true });

      expect(postSpy).toHaveBeenCalledTimes(1);
      expect(postSpy).toHaveBeenCalledWith('url', 'body');

      postSpy.mockRestore();
    });

    test('fail', async () => {
      const postSpy = jest.spyOn(Http, 'post').mockImplementation(() =>
        createResponsePromise('<!DOCTYPE html><title>500</title>', {
          status: HttpStatus._500_InternalServerError,
          statusText: 'Internal Server Error'
        })
      );

      await expect(Http.post('url', 'body').json()).rejects.toThrow('Internal Server Error');

      expect(postSpy).toHaveBeenCalledTimes(1);
      expect(postSpy).toHaveBeenCalledWith('url', 'body');

      postSpy.mockRestore();
    });
  });
});

const flushPromises = () => wait(0);

describe('flushPromises()', () => {
  // Throws "HttpError: Service Unavailable", this cannot be catched so we have to skip the test :-/
  // eslint-disable-next-line jest/no-disabled-tests, jest/expect-expect
  test.skip('createResponsePromise() not wrapped inside a function should fail with flushPromises()', async () => {
    createResponsePromise('<!DOCTYPE html><title>503</title>', {
      status: HttpStatus._503_ServiceUnavailable,
      statusText: 'Service Unavailable'
    });
    await flushPromises();
  });

  test('createResponsePromise() wrapped inside a function should not fail with flushPromises()', async () => {
    const getSpy = jest.spyOn(Http, 'get').mockImplementation(() =>
      createResponsePromise('<!DOCTYPE html><title>503</title>', {
        status: HttpStatus._503_ServiceUnavailable,
        statusText: 'Service Unavailable'
      })
    );

    await flushPromises();

    await expect(Http.get('url').text()).rejects.toThrow('Service Unavailable');

    expect(getSpy).toHaveBeenCalledTimes(1);
    expect(getSpy).toHaveBeenCalledWith('url');

    getSpy.mockRestore();
  });
});
