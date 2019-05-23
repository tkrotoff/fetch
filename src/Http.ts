import { HttpError } from './HttpError';

const defaultOptions = {
  // See https://github.com/github/fetch/blob/v3.0.0/README.md#sending-cookies
  // TODO Remove when old browsers are not supported anymore
  credentials: 'same-origin' as RequestCredentials
};

const JSON_MIME_TYPE = 'application/json';

const JSON_HEADERS = {
  Accept: JSON_MIME_TYPE,
  'Content-Type': JSON_MIME_TYPE
};

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
    const error = new HttpError(response.statusText);
    error.status = response.status;
    error.response = parsedResponseBody;
    throw error;
  }
}

export async function getJson(url: string, options?: RequestInit) {
  const response = await fetch(url, {
    ...defaultOptions,
    headers: JSON_HEADERS,
    ...options
  });
  const parsedResponseBody = await parseResponseBody(response);
  checkStatus(response, parsedResponseBody);
  return parsedResponseBody;
}

export async function postJson<Request>(url: string, body: Request, options?: RequestInit) {
  const response = await fetch(url, {
    ...defaultOptions,
    method: 'POST',
    headers: JSON_HEADERS,
    ...options,
    body: JSON.stringify(body)
  });
  const parsedResponseBody = await parseResponseBody(response);
  checkStatus(response, parsedResponseBody);
  return parsedResponseBody;
}

export async function putJson<Request>(url: string, body: Request, options?: RequestInit) {
  const response = await fetch(url, {
    ...defaultOptions,
    method: 'PUT',
    headers: JSON_HEADERS,
    ...options,
    body: JSON.stringify(body)
  });
  const parsedResponseBody = await parseResponseBody(response);
  checkStatus(response, parsedResponseBody);
  return parsedResponseBody;
}

export async function patchJson<Request>(url: string, body: Request, options?: RequestInit) {
  const response = await fetch(url, {
    ...defaultOptions,
    method: 'PATCH',
    headers: JSON_HEADERS,
    ...options,
    body: JSON.stringify(body)
  });
  const parsedResponseBody = await parseResponseBody(response);
  checkStatus(response, parsedResponseBody);
  return parsedResponseBody;
}

export async function deleteJson(url: string, options?: RequestInit) {
  const response = await fetch(url, {
    ...defaultOptions,
    method: 'DELETE',
    headers: JSON_HEADERS,
    ...options
  });
  const parsedResponseBody = await parseResponseBody(response);
  checkStatus(response, parsedResponseBody);
  return parsedResponseBody;
}
