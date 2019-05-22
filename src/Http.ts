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
export async function parseResponse(response: Response) {
  if (isJsonMimeType(response.headers)) {
    // FIXME Remove the cast when response.json() will return unknown
    return response.json() as Promise<unknown>;
  } else {
    return response.text();
  }
}

// See [Handling HTTP error statuses](https://github.com/github/fetch/blob/v3.0.0/README.md#handling-http-error-statuses)
// Exported for testing purpose only
export function checkStatus(response: Response, parsedResponse: unknown) {
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
    error.response = parsedResponse;
    throw error;
  }
}

export async function getJson(url: string, options?: RequestInit) {
  const response = await fetch(url, {
    ...defaultOptions,
    headers: JSON_HEADERS,
    ...options
  });
  const parsedResponse = await parseResponse(response);
  checkStatus(response, parsedResponse);
  return parsedResponse;
}

export async function postJson<Request>(url: string, body: Request, options?: RequestInit) {
  const response = await fetch(url, {
    ...defaultOptions,
    method: 'POST',
    headers: JSON_HEADERS,
    ...options,
    body: JSON.stringify(body)
  });
  const parsedResponse = await parseResponse(response);
  checkStatus(response, parsedResponse);
  return parsedResponse;
}

export async function putJson<Request>(url: string, body: Request, options?: RequestInit) {
  const response = await fetch(url, {
    ...defaultOptions,
    method: 'PUT',
    headers: JSON_HEADERS,
    ...options,
    body: JSON.stringify(body)
  });
  const parsedResponse = await parseResponse(response);
  checkStatus(response, parsedResponse);
  return parsedResponse;
}

export async function patchJson<Request>(url: string, body: Request, options?: RequestInit) {
  const response = await fetch(url, {
    ...defaultOptions,
    method: 'PATCH',
    headers: JSON_HEADERS,
    ...options,
    body: JSON.stringify(body)
  });
  const parsedResponse = await parseResponse(response);
  checkStatus(response, parsedResponse);
  return parsedResponse;
}

export async function deleteJson(url: string, options?: RequestInit) {
  const response = await fetch(url, {
    ...defaultOptions,
    method: 'DELETE',
    headers: JSON_HEADERS,
    ...options
  });
  const parsedResponse = await parseResponse(response);
  checkStatus(response, parsedResponse);
  return parsedResponse;
}
