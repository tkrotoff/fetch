import { HttpError } from './HttpError';
import { HttpStatus } from './HttpStatus';

const JSON_MIME_TYPE = 'application/json';

function isJSONMimeType(headers: Headers) {
  const contentType = headers.get('Content-Type') || '';
  return contentType.includes(JSON_MIME_TYPE);
}

// Exported for testing purpose only
export async function parseResponseBody(response: Response) {
  if (isJSONMimeType(response.headers)) {
    // FIXME Remove the cast when response.json() will return unknown
    return response.json() as Promise<unknown>;
  }
  return response.text();
}

export function createHttpError(
  statusText: string,
  status: HttpStatus,
  parsedResponseBody: unknown
) {
  const error = new HttpError(statusText);

  // Fetch API Response has fields status (number) and statusText (string)
  // Node.js http.ServerResponse has fields statusCode (number) and statusMessage (string)
  // They didn't choose the same naming conventions :-/

  error.status = status; // https://developer.mozilla.org/en-US/docs/Web/API/Response/status
  error.statusCode = status; // https://nodejs.org/docs/latest-v12.x/api/http.html#http_response_statuscode

  error.response = parsedResponseBody;

  return error;
}

// See [Handling HTTP error statuses](https://github.com/github/fetch/blob/v3.0.0/README.md#handling-http-error-statuses)
// Exported for testing purpose only
export function checkStatus(response: Response, parsedResponseBody: unknown) {
  // Response examples under Chrome 76:
  //
  // {
  //   body: ReadableStream,
  //   bodyUsed: true,
  //   headers: Headers,
  //   ok: true,
  //   redirected: false,
  //   status: 201,
  //   statusText: 'Created',
  //   type: 'cors',
  //   url: 'https://jsonplaceholder.typicode.com/posts'
  // }
  //
  // {
  //   body: ReadableStream,
  //   bodyUsed: true,
  //   headers: Headers,
  //   ok: false,
  //   redirected: false,
  //   status: 404,
  //   statusText: 'Not Found',
  //   type: 'cors',
  //   url: 'https://jsonplaceholder.typicode.com/posts/101'
  // }
  //
  // {
  //   body: ReadableStream,
  //   bodyUsed: true,
  //   headers: Headers,
  //   ok: false,
  //   redirected: false,
  //   status: 500,
  //   statusText: 'Internal Server Error',
  //   type: 'cors',
  //   url: 'https://httpstat.us/500'
  // }

  if (!response.ok) {
    throw createHttpError(response.statusText, response.status, parsedResponseBody);
  }
}

type Init = Omit<RequestInit, 'method' | 'body'>;

const JSON_HEADERS = {
  Accept: JSON_MIME_TYPE,
  'Content-Type': JSON_MIME_TYPE
};

interface Config {
  init: Init;
}

export const defaults: Config = {
  init: {
    // See https://github.com/github/fetch/blob/v3.0.0/README.md#sending-cookies
    // TODO Remove when old browsers are not supported anymore
    credentials: 'same-origin' as RequestCredentials,
    headers: JSON_HEADERS
  }
};

type Method = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

// Can throw:
// - HttpError with e.response being the response body
// - TypeError if request blocked (DevTools or CORS) or network timeout (net::ERR_TIMED_OUT):
//   - Firefox 68: "TypeError: "NetworkError when attempting to fetch resource.""
//   - Chrome 76: "TypeError: Failed to fetch"
async function fetchJSON<T extends object>(
  url: string,
  init: Init | undefined,
  method: Method,
  body?: T
) {
  const response = await fetch(url, {
    ...defaults.init,
    ...init,
    method,
    body: body !== undefined ? JSON.stringify(body) : undefined
  });

  const parsedResponseBody = await parseResponseBody(response);
  checkStatus(response, parsedResponseBody);
  return parsedResponseBody;
}

export const getJSON = (url: string, init?: Init) => fetchJSON(url, init, 'GET');

export const postJSON = <T extends object>(url: string, body: T, init?: Init) =>
  fetchJSON(url, init, 'POST', body);

export const putJSON = <T extends object>(url: string, body: T, init?: Init) =>
  fetchJSON(url, init, 'PUT', body);

export const patchJSON = <T extends object>(url: string, body: T, init?: Init) =>
  fetchJSON(url, init, 'PATCH', body);

export const deleteJSON = (url: string, init?: Init) => fetchJSON(url, init, 'DELETE');
