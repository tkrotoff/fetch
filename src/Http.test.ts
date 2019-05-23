import fetchMock, { MockResponseObject } from 'fetch-mock';

import * as Http from './Http';
import { HttpStatus } from './HttpStatus';
import { HttpError } from './HttpError';

describe('getJson()', () => {
  afterEach(fetchMock.reset);

  test('200 OK', async () => {
    fetchMock.get('http://addressbook.com/contacts/1', {
      id: 1,
      firstName: 'John',
      lastName: 'Lennon',
      email: 'john@beatles.com'
    });

    const response = await Http.getJson('http://addressbook.com/contacts/1');
    expect(response).toEqual({
      id: 1,
      firstName: 'John',
      lastName: 'Lennon',
      email: 'john@beatles.com'
    });
  });

  test('200 OK + options', async () => {
    fetchMock.get('http://addressbook.com/contacts/1', {
      id: 1,
      firstName: 'John',
      lastName: 'Lennon',
      email: 'john@beatles.com'
    });
    const spy = jest.spyOn(window, 'fetch');

    const response = await Http.getJson('http://addressbook.com/contacts/1', {
      headers: { Accept: 'test', 'Content-Type': 'test' },
      mode: 'cors'
    });
    expect(response).toEqual({
      id: 1,
      firstName: 'John',
      lastName: 'Lennon',
      email: 'john@beatles.com'
    });

    expect(spy).toHaveBeenCalledTimes(1);
    expect(spy).toHaveBeenCalledWith('http://addressbook.com/contacts/1', {
      credentials: 'same-origin',
      headers: { Accept: 'test', 'Content-Type': 'test' },
      mode: 'cors'
    });

    spy.mockRestore();
  });

  test('500 Internal Server Error', async () => {
    fetchMock.get('http://addressbook.com/contacts/1', {
      status: HttpStatus._500_InternalServerError,
      body: '<!DOCTYPE html><html><head><title>500 Internal Server Error</title></head></html>'
    });

    await expect(Http.getJson('http://addressbook.com/contacts/1')).rejects.toEqual(
      new HttpError('Internal Server Error')
    );
    try {
      await Http.getJson('http://addressbook.com/contacts/1');
    } catch (e) {
      expect(e).toEqual(new HttpError('Internal Server Error'));
      expect(e.status).toEqual(HttpStatus._500_InternalServerError);
      expect(e.response).toEqual(
        '<!DOCTYPE html><html><head><title>500 Internal Server Error</title></head></html>'
      );
    }
  });

  test('204 No Content', async () => {
    fetchMock.get('http://addressbook.com/contacts/1', HttpStatus._204_NoContent);

    const response = await Http.getJson('http://addressbook.com/contacts/1');
    expect(response).toEqual('');
  });
});

describe('postJson()', () => {
  const requestBody = {
    firstName: 'John',
    lastName: 'Lennon',
    email: 'john@beatles.com'
  };

  const responseBody = {
    id: 1,
    ...requestBody
  };

  beforeEach(() => {
    fetchMock.post('http://addressbook.com/contacts', {
      status: HttpStatus._201_Created,
      body: responseBody
    });
  });

  afterEach(fetchMock.reset);

  test('201 Created', async () => {
    const response = await Http.postJson('http://addressbook.com/contacts', requestBody);
    expect(response).toEqual(responseBody);
  });

  test('201 Created + options', async () => {
    const spy = jest.spyOn(window, 'fetch');

    const response = await Http.postJson('http://addressbook.com/contacts', requestBody, {
      headers: { Accept: 'test', 'Content-Type': 'test' },
      mode: 'cors'
    });
    expect(response).toEqual(responseBody);

    expect(spy).toHaveBeenCalledTimes(1);
    expect(spy).toHaveBeenCalledWith('http://addressbook.com/contacts', {
      credentials: 'same-origin',
      method: 'POST',
      headers: { Accept: 'test', 'Content-Type': 'test' },
      mode: 'cors',
      body: JSON.stringify(requestBody)
    });

    spy.mockRestore();
  });

  test('201 Created + options with body', async () => {
    const spy = jest.spyOn(window, 'fetch');

    const response = await Http.postJson('http://addressbook.com/contacts', requestBody, {
      body: 'will be ignored'
    } as any);
    expect(response).toEqual(responseBody);

    expect(spy).toHaveBeenCalledTimes(1);
    expect(spy).toHaveBeenCalledWith('http://addressbook.com/contacts', {
      credentials: 'same-origin',
      method: 'POST',
      headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
      body: JSON.stringify(requestBody)
    });

    spy.mockRestore();
  });
});

describe('putJson()', () => {
  const requestBody = {
    firstName: 'John',
    lastName: 'Lennon',
    email: 'john@beatles.com'
  };

  const responseBody = {
    id: 1,
    ...requestBody
  };

  beforeEach(() => {
    fetchMock.put('http://addressbook.com/contacts/1', responseBody);
  });

  afterEach(fetchMock.reset);

  test('200 OK', async () => {
    const response = await Http.putJson('http://addressbook.com/contacts/1', requestBody);
    expect(response).toEqual(responseBody);
  });

  test('200 OK + options', async () => {
    const spy = jest.spyOn(window, 'fetch');

    const response = await Http.putJson('http://addressbook.com/contacts/1', requestBody, {
      headers: { Accept: 'test', 'Content-Type': 'test' },
      mode: 'cors'
    });
    expect(response).toEqual(responseBody);

    expect(spy).toHaveBeenCalledTimes(1);
    expect(spy).toHaveBeenCalledWith('http://addressbook.com/contacts/1', {
      credentials: 'same-origin',
      method: 'PUT',
      headers: { Accept: 'test', 'Content-Type': 'test' },
      mode: 'cors',
      body: JSON.stringify(requestBody)
    });

    spy.mockRestore();
  });

  test('200 OK + options with body', async () => {
    const spy = jest.spyOn(window, 'fetch');

    const response = await Http.putJson('http://addressbook.com/contacts/1', requestBody, {
      body: 'will be ignored'
    } as any);
    expect(response).toEqual(responseBody);

    expect(spy).toHaveBeenCalledTimes(1);
    expect(spy).toHaveBeenCalledWith('http://addressbook.com/contacts/1', {
      credentials: 'same-origin',
      method: 'PUT',
      headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
      body: JSON.stringify(requestBody)
    });

    spy.mockRestore();
  });
});

describe('patchJson()', () => {
  const requestBody = {
    email: 'john@beatles.com'
  };

  const responseBody = {
    id: 1,
    firstName: 'John',
    lastName: 'Lennon',
    email: 'john@beatles.com'
  };

  beforeEach(() => {
    fetchMock.patch('http://addressbook.com/contacts/1', responseBody);
  });

  afterEach(fetchMock.reset);

  test('200 OK', async () => {
    const response = await Http.patchJson('http://addressbook.com/contacts/1', requestBody);
    expect(response).toEqual(responseBody);
  });

  test('200 OK + options', async () => {
    const spy = jest.spyOn(window, 'fetch');

    const response = await Http.patchJson('http://addressbook.com/contacts/1', requestBody, {
      headers: { Accept: 'test', 'Content-Type': 'test' },
      mode: 'cors'
    });
    expect(response).toEqual(responseBody);

    expect(spy).toHaveBeenCalledTimes(1);
    expect(spy).toHaveBeenCalledWith('http://addressbook.com/contacts/1', {
      credentials: 'same-origin',
      method: 'PATCH',
      headers: { Accept: 'test', 'Content-Type': 'test' },
      mode: 'cors',
      body: JSON.stringify(requestBody)
    });

    spy.mockRestore();
  });

  test('200 OK + options with body', async () => {
    const spy = jest.spyOn(window, 'fetch');

    const response = await Http.patchJson('http://addressbook.com/contacts/1', requestBody, {
      body: 'will be ignored'
    } as any);
    expect(response).toEqual(responseBody);

    expect(spy).toHaveBeenCalledTimes(1);
    expect(spy).toHaveBeenCalledWith('http://addressbook.com/contacts/1', {
      credentials: 'same-origin',
      method: 'PATCH',
      headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
      body: JSON.stringify(requestBody)
    });

    spy.mockRestore();
  });
});

describe('deleteJson()', () => {
  beforeEach(() => {
    fetchMock.delete('http://addressbook.com/contacts/1', { status: HttpStatus._204_NoContent });
  });

  afterEach(fetchMock.reset);

  test('204 No Content', async () => {
    const response = await Http.deleteJson('http://addressbook.com/contacts/1');
    expect(response).toEqual('');
  });

  test('204 No Content + options', async () => {
    const spy = jest.spyOn(window, 'fetch');

    const response = await Http.deleteJson('http://addressbook.com/contacts/1', {
      headers: { Accept: 'test', 'Content-Type': 'test' },
      mode: 'cors'
    });
    expect(response).toEqual('');

    expect(spy).toHaveBeenCalledTimes(1);
    expect(spy).toHaveBeenCalledWith('http://addressbook.com/contacts/1', {
      credentials: 'same-origin',
      method: 'DELETE',
      headers: { Accept: 'test', 'Content-Type': 'test' },
      mode: 'cors'
    });

    spy.mockRestore();
  });
});

async function createResponse(
  url: string,
  body?: object | string,
  otherParams?: MockResponseObject
) {
  fetchMock.get(url, { body, ...otherParams });
  const response = await fetch(url);
  fetchMock.reset();
  return response;
}

function checkContentType(response: Response, contentTypeExpected: string) {
  expect(response.headers.get('Content-Type')).toEqual(contentTypeExpected);
}

describe('parseResponse()', () => {
  test('application/json Content-Type', async () => {
    const response = await createResponse('http://hello.com', { hello: 'world' });
    checkContentType(response, 'application/json');
    const parsedResponseBody = await Http.parseResponseBody(response);
    expect(parsedResponseBody).toEqual({ hello: 'world' });
  });

  test('text/plain Content-Type', async () => {
    const response = await createResponse('http://hello.com', 'Hello, World!');
    checkContentType(response, 'text/plain;charset=UTF-8');
    const parsedResponseBody = await Http.parseResponseBody(response);
    expect(parsedResponseBody).toEqual('Hello, World!');
  });
});

async function create200OKResponse(url: string, body: object | string) {
  return createResponse(url, body, { status: HttpStatus._200_OK });
}

async function create400BadRequestResponse(url: string, body: object | string) {
  return createResponse(url, body, { status: HttpStatus._400_BadRequest });
}

describe('checkStatus()', () => {
  test('200 OK', async () => {
    const response = await create200OKResponse('http://200.com', { hello: 'world' });
    const parsedResponseBody = await Http.parseResponseBody(response);
    expect(() => Http.checkStatus(response, parsedResponseBody)).not.toThrow();
  });

  test('400 Bad Request', async () => {
    const response = await create400BadRequestResponse('http://400.com', { error: 400 });
    const parsedResponseBody = await Http.parseResponseBody(response);
    expect(() => Http.checkStatus(response, parsedResponseBody)).toThrow(
      new HttpError('Bad Request')
    );
    try {
      Http.checkStatus(response, parsedResponseBody);
    } catch (e) {
      expect(e).toEqual(new HttpError('Bad Request'));
      expect(e.status).toEqual(HttpStatus._400_BadRequest);
      expect(e.response).toEqual(parsedResponseBody);
    }
  });
});
