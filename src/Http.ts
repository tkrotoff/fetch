import 'whatwg-fetch';

import { HttpError } from './HttpError';
import { HttpStatus } from './HttpStatus';

const defaultOptions = {
  credentials: 'same-origin' as RequestCredentials
};

const JSON_MIME_TYPE = 'application/json';

const JSON_HEADERS = {
  Accept: JSON_MIME_TYPE,
  'Content-Type': JSON_MIME_TYPE
};

export async function getJson(url: string) {
  const response = await fetch(url, {
    ...defaultOptions,
    headers: JSON_HEADERS
  });
  const responseJson = await parseResponseJson(response);
  checkStatus(response, responseJson);
  return responseJson;
}

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

export async function patchJson<Request>(url: string, body: Request) {
  const response = await fetch(url, {
    ...defaultOptions,
    method: 'PATCH',
    headers: JSON_HEADERS,
    body: JSON.stringify(body)
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

function isJsonMimeType(headers: Headers) {
  const contentType = headers.get('Content-Type') || '';
  return contentType.includes(JSON_MIME_TYPE);
}

// Exported for tests
export async function parseResponseJson(response: Response) {
  // We don't expect a JSON response with the following cases:
  // - 204 No Content: an empty string is not valid JSON so JSON.parse() fails
  // - 500 Internal Server Error: HTML is not valid JSON so JSON.parse() fails,
  //   this happens when an exception occurs with Apache Tomcat
  if (response.status === HttpStatus._204_NoContent) {
    const responseString = await response.text();
    if (responseString.length > 0) {
      throw new Error(`The response status is '204 No Content' and yet is not empty`);
    } else {
      // Empty JSON object
      return new Promise((resolve, _reject) => resolve({}));
    }
  } else if (response.status === HttpStatus._500_InternalServerError) {
    if (!isJsonMimeType(response.headers)) {
      // Empty JSON object
      return new Promise((resolve, _reject) => resolve({}));
    }
  }

  if (isJsonMimeType(response.headers)) {
    // FIXME Remove the cast when response.json() will return unknown
    return response.json() as unknown;
  } else {
    const contentType = response.headers.get('Content-Type');
    throw new TypeError(
      `The response content-type '${contentType}' should contain '${JSON_MIME_TYPE}'`
    );
  }
}

// See [Handling HTTP error statuses](https://github.com/github/fetch/blob/v3.0.0/README.md#handling-http-error-statuses)
// Exported for tests
export function checkStatus(response: Response, responseJson: unknown) {
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

  if (response.status < HttpStatus._200_OK || response.status >= HttpStatus._300_MultipleChoices) {
    const error = new HttpError(response.statusText);
    error.status = response.status;
    error.response = responseJson;
    throw error;
  }
}
