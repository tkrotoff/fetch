import { HttpError } from './HttpError';

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

// [Handling HTTP error statuses](https://github.com/github/fetch/blob/v3.0.0/README.md#handling-http-error-statuses)
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
    throw new HttpError(response.statusText, response.status, parsedResponseBody);
  }
}

type Init = Omit<RequestInit, 'method' | 'body'>;

const JSON_HEADERS = {
  Accept: JSON_MIME_TYPE,
  'Content-Type': JSON_MIME_TYPE
};

const FORM_DATA_HEADERS = {
  Accept: JSON_MIME_TYPE

  // /!\ Content-Type should *not* be specified, even 'multipart/form-data'
  // otherwise it does not work
};

interface Config {
  init: Init;
}

export const defaults: Config = {
  init: {
    // https://github.com/github/fetch/blob/v3.0.0/README.md#sending-cookies
    // TODO Remove when old browsers are not supported anymore
    credentials: 'same-origin' as RequestCredentials
  }
};

type Method = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

// Can throw:
// - HttpError with e.response being the response body
// - TypeError if request blocked (DevTools or CORS) or network timeout (net::ERR_TIMED_OUT):
//   - Firefox 68: "TypeError: "NetworkError when attempting to fetch resource.""
//   - Chrome 76: "TypeError: Failed to fetch"
async function fetchJSON<T extends Record<string, unknown>>(
  url: string,
  init: Init | undefined,
  method: Method,
  body?: T
) {
  const response = await fetch(url, {
    ...defaults.init,
    headers: { ...defaults.init.headers, ...JSON_HEADERS },
    ...init,
    method,
    body: body !== undefined ? JSON.stringify(body) : undefined
  });

  const parsedResponseBody = await parseResponseBody(response);
  checkStatus(response, parsedResponseBody);
  return parsedResponseBody;
}

async function fetchFormData<T extends FormData>(
  url: string,
  init: Init | undefined,
  method: Method,
  body?: T
) {
  const response = await fetch(url, {
    ...defaults.init,
    headers: { ...defaults.init.headers, ...FORM_DATA_HEADERS },
    ...init,
    method,
    body
  });

  const parsedResponseBody = await parseResponseBody(response);
  checkStatus(response, parsedResponseBody);
  return parsedResponseBody;
}

export const getJSON = (url: string, init?: Init) => fetchJSON(url, init, 'GET');

export const postJSON = <T extends Record<string, unknown>>(url: string, body: T, init?: Init) =>
  fetchJSON(url, init, 'POST', body);
export const postFormData = <T extends FormData>(url: string, body: T, init?: Init) =>
  fetchFormData(url, init, 'POST', body);

export const putJSON = <T extends Record<string, unknown>>(url: string, body: T, init?: Init) =>
  fetchJSON(url, init, 'PUT', body);
export const putFormData = <T extends FormData>(url: string, body: T, init?: Init) =>
  fetchFormData(url, init, 'PUT', body);

export const patchJSON = <T extends Record<string, unknown>>(url: string, body: T, init?: Init) =>
  fetchJSON(url, init, 'PATCH', body);
export const patchFormData = <T extends FormData>(url: string, body: T, init?: Init) =>
  fetchFormData(url, init, 'PATCH', body);

export const deleteJSON = (url: string, init?: Init) => fetchJSON(url, init, 'DELETE');
