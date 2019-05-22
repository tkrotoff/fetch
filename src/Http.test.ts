import * as Http from './Http';
import fetchMock, { MockResponseObject } from 'fetch-mock';
import { HttpStatus } from './HttpStatus';
import { HttpError } from './HttpError';

describe('getJson()', () => {
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

    fetchMock.reset();
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

    fetchMock.reset();
  });

  test('204 No Content', async () => {
    fetchMock.get('http://addressbook.com/contacts/1', HttpStatus._204_NoContent);

    const response = await Http.getJson('http://addressbook.com/contacts/1');
    expect(response).toEqual('');

    fetchMock.reset();
  });
});

test('postJson()', async () => {
  fetchMock.post('http://addressbook.com/contacts', {
    status: HttpStatus._201_Created,
    body: { id: 1, firstName: 'John', lastName: 'Lennon', email: 'john@beatles.com' }
  });

  const response = await Http.postJson('http://addressbook.com/contacts', {
    firstName: 'John',
    lastName: 'Lennon',
    email: 'john@beatles.com'
  });
  expect(response).toEqual({
    id: 1,
    firstName: 'John',
    lastName: 'Lennon',
    email: 'john@beatles.com'
  });

  fetchMock.reset();
});

test('putJson()', async () => {
  fetchMock.put('http://addressbook.com/contacts/1', {
    id: 1,
    firstName: 'John',
    lastName: 'Lennon',
    email: 'john@lennon.com'
  });

  const response = await Http.putJson('http://addressbook.com/contacts/1', {
    firstName: 'John',
    lastName: 'Lennon',
    email: 'john@lennon.com'
  });
  expect(response).toEqual({
    id: 1,
    firstName: 'John',
    lastName: 'Lennon',
    email: 'john@lennon.com'
  });

  fetchMock.reset();
});

test('patchJson()', async () => {
  fetchMock.patch('http://addressbook.com/contacts/1', {
    id: 1,
    firstName: 'John',
    lastName: 'Lennon',
    email: 'john@lennon.com'
  });

  const response = await Http.patchJson('http://addressbook.com/contacts/1', {
    email: 'john@lennon.com'
  });
  expect(response).toEqual({
    id: 1,
    firstName: 'John',
    lastName: 'Lennon',
    email: 'john@lennon.com'
  });

  fetchMock.reset();
});

test('deleteJson()', async () => {
  fetchMock.delete('http://addressbook.com/contacts/1', { status: HttpStatus._204_NoContent });

  const response = await Http.deleteJson('http://addressbook.com/contacts/1');
  expect(response).toEqual('');

  fetchMock.reset();
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
    const parsedResponse = await Http.parseResponse(response);
    expect(parsedResponse).toEqual({ hello: 'world' });
  });

  test('text/plain Content-Type', async () => {
    const response = await createResponse('http://hello.com', 'Hello, World!');
    checkContentType(response, 'text/plain;charset=UTF-8');
    const parsedResponse = await Http.parseResponse(response);
    expect(parsedResponse).toEqual('Hello, World!');
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
    const parsedResponse = await Http.parseResponse(response);
    expect(() => Http.checkStatus(response, parsedResponse)).not.toThrow();
  });

  test('400 Bad Request', async () => {
    const response = await create400BadRequestResponse('http://400.com', { error: 400 });
    const parsedResponse = await Http.parseResponse(response);
    expect(() => Http.checkStatus(response, parsedResponse)).toThrow(new HttpError('Bad Request'));
    try {
      Http.checkStatus(response, parsedResponse);
    } catch (e) {
      expect(e).toEqual(new HttpError('Bad Request'));
      expect(e.status).toEqual(HttpStatus._400_BadRequest);
      expect(e.response).toEqual(parsedResponse);
    }
  });
});
