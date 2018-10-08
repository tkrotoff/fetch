import 'whatwg-fetch';

import { HttpError } from './HttpHelpers';
import HttpStatus from './HttpStatus';

const defaultOptions = {
  credentials: 'same-origin' as RequestCredentials
};

const JSON_HEADERS = {
  Accept: 'application/json',
  'Content-Type': 'application/json'
};

export async function postJSON<Request>(url: string, body: Request) {
  const response = await fetch(url, {
    ...defaultOptions,
    method: 'POST',
    headers: JSON_HEADERS,
    body: JSON.stringify(body)
  });
  checkStatus(response);
  return parseJSON(response);
}

export async function putJSON<Request>(url: string, body: Request) {
  const response = await fetch(url, {
    ...defaultOptions,
    method: 'PUT',
    headers: JSON_HEADERS,
    body: JSON.stringify(body)
  });
  checkStatus(response);
  return parseJSON(response);
}

export async function getJSON(url: string, headers?: Headers) {
  const response = await fetch(url, {
    ...defaultOptions,
    headers: { ...JSON_HEADERS, ...headers }
  });
  checkStatus(response);
  return parseJSON(response);
}

export async function deleteJSON(url: string) {
  const response = await fetch(url, {
    ...defaultOptions,
    method: 'DELETE',
    headers: JSON_HEADERS
  });
  checkStatus(response);
  return parseJSON(response);
}

// See Handling HTTP error statuses https://github.com/github/fetch#handling-http-error-statuses
function checkStatus(response: Response) {
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
    error.response = response;
    throw error;
  }
}

function parseJSON(response: Response) {
  // An empty string is not valid JSON so JSON.parse() fails
  if (response.status !== HttpStatus.NoContent_204) {
    return response.json();
  } else {
    return new Promise((resolve, _reject) => resolve());
  }
}
