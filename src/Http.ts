import { HttpError } from './HttpError';
import { HttpStatus } from './HttpStatus';

const JSON_MIME_TYPE = 'application/json';

function isJsonMimeType(headers: Headers) {
  const contentType = headers.get('Content-Type') || '';
  return contentType.includes(JSON_MIME_TYPE);
}

// Exported for testing purpose only
export async function parseResponseBody(response: Response) {
  if (isJsonMimeType(response.headers)) {
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
  error.status = status;
  error.response = parsedResponseBody;
  return error;
}

// See [Handling HTTP error statuses](https://github.com/github/fetch/blob/v3.0.0/README.md#handling-http-error-statuses)
// Exported for testing purpose only
export function checkStatus(response: Response, parsedResponseBody: unknown) {
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

  if (!response.ok) {
    throw createHttpError(response.statusText, response.status, parsedResponseBody);
  }
}

type Options = Omit<RequestInit, 'method' | 'body'>;

type RequestMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

async function fetchJson<T extends object>(
  url: string,
  options: Options | undefined,
  method: RequestMethod,
  body?: T
) {
  const response = await fetch(url, {
    // See https://github.com/github/fetch/blob/v3.0.0/README.md#sending-cookies
    // TODO Remove when old browsers are not supported anymore
    credentials: 'same-origin' as RequestCredentials,

    headers: { Accept: JSON_MIME_TYPE, 'Content-Type': JSON_MIME_TYPE },
    ...options,
    method,
    body: body !== undefined ? JSON.stringify(body) : undefined
  });

  const parsedResponseBody = await parseResponseBody(response);
  checkStatus(response, parsedResponseBody);
  return parsedResponseBody;
}

export function getJson(url: string, options?: Options) {
  return fetchJson(url, options, 'GET');
}

export function postJson<T extends object>(url: string, body: T, options?: Options) {
  return fetchJson(url, options, 'POST', body);
}

export function putJson<T extends object>(url: string, body: T, options?: Options) {
  return fetchJson(url, options, 'PUT', body);
}

export function patchJson<T extends object>(url: string, body: T, options?: Options) {
  return fetchJson(url, options, 'PATCH', body);
}

export function deleteJson(url: string, options?: Options) {
  return fetchJson(url, options, 'DELETE');
}
