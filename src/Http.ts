import 'whatwg-fetch';

import { HttpError } from './HttpHelpers';
import { HttpStatus } from './HttpStatus';

const defaultOptions = {
  credentials: 'same-origin' as RequestCredentials
};

const JSON_HEADERS = {
  Accept: 'application/json',
  'Content-Type': 'application/json'
};

export async function postJson<Request>(url: string, body: Request) {
  const response = await fetch(url, {
    ...defaultOptions,
    method: 'POST',
    headers: JSON_HEADERS,
    body: JSON.stringify(body)
  });
  const responseJson = await parseResponseJson(response);
  checkStatus(response, responseJson);
  return responseJson;
}

export async function putJson<Request>(url: string, body: Request) {
  const response = await fetch(url, {
    ...defaultOptions,
    method: 'PUT',
    headers: JSON_HEADERS,
    body: JSON.stringify(body)
  });
  const responseJson = await parseResponseJson(response);
  checkStatus(response, responseJson);
  return responseJson;
}

export async function getJson(url: string, headers?: Headers) {
  const response = await fetch(url, {
    ...defaultOptions,
    headers: { ...JSON_HEADERS, ...headers }
  });
  const responseJson = await parseResponseJson(response);
  checkStatus(response, responseJson);
  return responseJson;
}

export async function deleteJson(url: string) {
  const response = await fetch(url, {
    ...defaultOptions,
    method: 'DELETE',
    headers: JSON_HEADERS
  });
  const responseJson = await parseResponseJson(response);
  checkStatus(response, responseJson);
  return responseJson;
}

// See Handling HTTP error statuses https://github.com/github/fetch#handling-http-error-statuses
function checkStatus(response: Response, responseJson: unknown) {
  // Response examples under Chrome 58:
  //
  // {
  //   body: ReadableStream,
  //   bodyUsed: false,
  //   headers: Headers,
  //   ok: false,
  //   redirected: false,
  //   status: 404,
  //   statusText: 'Not Found',
  //   type: 'basic',
  //   url: 'https://...'
  // }
  //
  // {
  //   body: ReadableStream,
  //   bodyUsed: false,
  //   headers: Headers,
  //   ok: false,
  //   redirected: false,
  //   status: 400,
  //   statusText: 'Bad Request',
  //   type: 'basic',
  //   url: 'https://...'
  // }

  if (response.status >= HttpStatus.OK_200 && response.status < HttpStatus.MultipleChoices_300) {
  } else {
    const error = new HttpError(response.statusText);
    error.status = response.status;
    error.response = responseJson;
    throw error;
  }
}

function parseResponseJson(response: Response) {
  // An empty string is not valid JSON so JSON.parse() fails
  if (response.status !== HttpStatus.NoContent_204) {
    // FIXME Remove the cast when response.json() will return unknown
    return response.json() as unknown;
  } else {
    return new Promise((resolve, _reject) => resolve());
  }
}
