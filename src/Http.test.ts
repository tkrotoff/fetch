import * as Http from './Http';
import fetchMock, { MockResponseObject } from 'fetch-mock';
import { HttpStatus } from './HttpStatus';
import { HttpError } from './HttpError';

// See [whatwg-fetch] add fetch.polyfill https://github.com/DefinitelyTyped/DefinitelyTyped/pull/14759
type WhatwgFetch = typeof fetch & { polyfill: true };

// See Unit testing with Jest: Redux + async actions + fetch https://medium.com/@ferrannp/unit-testing-with-jest-redux-async-actions-fetch-9054ca28cdcd
test('makes sure fetch is the one from the polyfill', () => {
  expect((fetch as WhatwgFetch).polyfill).toBe(true);
});

describe('getJson()', () => {
  test('200 OK', async () => {
    fetchMock.get('http://addressbook.com/contacts/1', {
      id: 1,
      firstName: 'John',
      lastName: 'Lennon',
      email: 'john@beatles.com'
    });

    const json = await Http.getJson('http://addressbook.com/contacts/1');
    expect(json).toEqual({
      id: 1,
      firstName: 'John',
      lastName: 'Lennon',
      email: 'john@beatles.com'
    });

    fetchMock.reset();
  });

  test('500 Internal Server Error', async () => {
    fetchMock.get('http://addressbook.com/contacts/1', HttpStatus._500_InternalServerError);

    await expect(Http.getJson('http://addressbook.com/contacts/1')).rejects.toEqual(
      new HttpError('Internal Server Error')
    );
    try {
      await Http.getJson('http://addressbook.com/contacts/1');
    } catch (e) {
      expect(e).toEqual(new HttpError('Internal Server Error'));
      expect(e.status).toEqual(HttpStatus._500_InternalServerError);
      expect(e.response).toEqual({});
    }

    fetchMock.reset();
  });
});

test('postJson()', async () => {
  fetchMock.post('http://addressbook.com/contacts', {
    status: HttpStatus._201_Created,
    body: { id: 1, firstName: 'John', lastName: 'Lennon', email: 'john@beatles.com' }
  });

  const json = await Http.postJson('http://addressbook.com/contacts', {
    firstName: 'John',
    lastName: 'Lennon',
    email: 'john@beatles.com'
  });
  expect(json).toEqual({ id: 1, firstName: 'John', lastName: 'Lennon', email: 'john@beatles.com' });

  fetchMock.reset();
});

test('putJson()', async () => {
  fetchMock.put('http://addressbook.com/contacts/1', {
    id: 1,
    firstName: 'John',
    lastName: 'Lennon',
    email: 'john@lennon.com'
  });

  const json = await Http.putJson('http://addressbook.com/contacts/1', {
    firstName: 'John',
    lastName: 'Lennon',
    email: 'john@lennon.com'
  });
  expect(json).toEqual({ id: 1, firstName: 'John', lastName: 'Lennon', email: 'john@lennon.com' });

  fetchMock.reset();
});

test('patchJson()', async () => {
  fetchMock.patch('http://addressbook.com/contacts/1', {
    id: 1,
    firstName: 'John',
    lastName: 'Lennon',
    email: 'john@lennon.com'
  });

  const json = await Http.patchJson('http://addressbook.com/contacts/1', {
    email: 'john@lennon.com'
  });
  expect(json).toEqual({ id: 1, firstName: 'John', lastName: 'Lennon', email: 'john@lennon.com' });

  fetchMock.reset();
});

test('deleteJson()', async () => {
  fetchMock.delete('http://addressbook.com/contacts/1', { status: HttpStatus._204_NoContent });

  const json = await Http.deleteJson('http://addressbook.com/contacts/1');
  expect(json).toEqual({});

  fetchMock.reset();
});

async function create200OKResponse(
  url: string,
  body: object | string,
  otherParams?: MockResponseObject
) {
  fetchMock.get(url, { status: HttpStatus._200_OK, body, ...otherParams });
  const response = await fetch(url);
  fetchMock.reset();
  return response;
}

async function create204NoContentResponse(
  url: string,
  body?: object | string,
  otherParams?: MockResponseObject
) {
  fetchMock.get(url, { status: HttpStatus._204_NoContent, body, ...otherParams });
  const response = await fetch(url);
  fetchMock.reset();
  return response;
}

async function create400BadRequestResponse(
  url: string,
  body: object | string,
  otherParams?: MockResponseObject
) {
  fetchMock.get(url, { status: HttpStatus._400_BadRequest, body, ...otherParams });
  const response = await fetch(url);
  fetchMock.reset();
  return response;
}

async function create500InternalServerErrorResponse(
  url: string,
  body: object | string,
  otherParams?: MockResponseObject
) {
  fetchMock.get(url, { status: HttpStatus._500_InternalServerError, body, ...otherParams });
  const response = await fetch(url);
  fetchMock.reset();
  return response;
}

describe('parseResponseJson()', () => {
  test('200 OK', async () => {
    {
      const response = await create200OKResponse('http://200.com', { hello: 'world' });
      const responseJson = await Http.parseResponseJson(response);
      expect(responseJson).toEqual({ hello: 'world' });
    }

    {
      const response = await create200OKResponse(
        'http://200.com',
        '<!DOCTYPE html><html><head><title>Hello, World!</title></head></html>'
      );
      await expect(Http.parseResponseJson(response)).rejects.toEqual(
        new TypeError("The response content-type 'null' should contain 'application/json'")
      );
    }

    {
      const response = await create200OKResponse(
        'http://200.com',
        '<!DOCTYPE html><html><head><title>Hello, World!</title></head></html>',
        { headers: { 'Content-Type': 'text/html' } }
      );
      await expect(Http.parseResponseJson(response)).rejects.toEqual(
        new TypeError("The response content-type 'text/html' should contain 'application/json'")
      );
    }
  });

  test('204 No Content', async () => {
    {
      const response = await create204NoContentResponse('http://204.com');
      const responseJson = await Http.parseResponseJson(response);
      expect(responseJson).toEqual({});
    }

    {
      const response = await create204NoContentResponse('http://204.com', { hello: 'world' });
      await expect(Http.parseResponseJson(response)).rejects.toEqual(
        new Error("The response status is '204 No Content' and yet is not empty")
      );
    }
  });

  test('500 Internal Server Error', async () => {
    {
      const response = await create500InternalServerErrorResponse('http://500.com', { error: 500 });
      const responseJson = await Http.parseResponseJson(response);
      expect(responseJson).toEqual({ error: 500 });
    }

    {
      const response = await create500InternalServerErrorResponse(
        'http://500.com',
        '<!DOCTYPE html><html><head><title>Error 500</title></head></html>'
      );
      const responseJson = await Http.parseResponseJson(response);
      expect(responseJson).toEqual({});
    }

    {
      const response = await create500InternalServerErrorResponse(
        'http://500.com',
        '<!DOCTYPE html><html><head><title>Error 500</title></head></html>',
        { headers: { 'Content-Type': 'text/html' } }
      );
      const responseJson = await Http.parseResponseJson(response);
      expect(responseJson).toEqual({});
    }
  });
});

test('checkStatus()', async () => {
  {
    const response = await create200OKResponse('http://200.com', { hello: 'world' });
    const responseJson = await Http.parseResponseJson(response);
    expect(() => Http.checkStatus(response, responseJson)).not.toThrow();
  }

  {
    const response = await create400BadRequestResponse('http://400.com', { error: 400 });
    const responseJson = await Http.parseResponseJson(response);
    expect(() => Http.checkStatus(response, responseJson)).toThrow(new HttpError('Bad Request'));
    try {
      Http.checkStatus(response, responseJson);
    } catch (e) {
      expect(e).toEqual(new HttpError('Bad Request'));
      expect(e.status).toEqual(HttpStatus._400_BadRequest);
      expect(e.response).toEqual(responseJson);
    }
  }
});
