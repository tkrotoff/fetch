import { entriesToObject } from './utils/entriesToObject';
import { wait } from './utils/wait';
import { HttpError } from './HttpError';

// https://github.com/microsoft/TypeScript/blob/v4.4.4/lib/lib.dom.d.ts#L2446-L2450
export type ResponsePromiseWithBodyMethods = Promise<Response> &
  Pick<Body, 'arrayBuffer' | 'blob' | 'formData' | /*'json' |*/ 'text'> & {
    // FIXME https://github.com/microsoft/TypeScript/issues/26188
    json(): Promise<unknown>;
  };

const ARRAYBUFFER_MIME_TYPE = '*/*';
const BLOB_MIME_TYPE = '*/*';
const FORMDATA_MIME_TYPE = 'multipart/form-data';
export const JSON_MIME_TYPE = 'application/json';
const TEXT_MIME_TYPE = 'text/*';

export function isJSONResponse(response: Response) {
  const contentType = response.headers.get('content-type') ?? '';
  return contentType.includes(JSON_MIME_TYPE);
}

function extendResponsePromiseWithBodyMethods(
  responsePromise: ResponsePromiseWithBodyMethods,
  headers: Headers
) {
  function setAcceptHeader(mimeType: string) {
    headers.set('accept', headers.get('accept') ?? mimeType);
  }

  /* eslint-disable no-param-reassign */

  responsePromise.arrayBuffer = async () => {
    setAcceptHeader(ARRAYBUFFER_MIME_TYPE);
    const response = await responsePromise;
    return response.arrayBuffer();
  };

  responsePromise.blob = async () => {
    setAcceptHeader(BLOB_MIME_TYPE);
    const response = await responsePromise;
    return response.blob();
  };

  responsePromise.formData = async () => {
    setAcceptHeader(FORMDATA_MIME_TYPE);
    const response = await responsePromise;
    return response.formData();
  };

  responsePromise.json = async () => {
    setAcceptHeader(JSON_MIME_TYPE);
    const response = await responsePromise;
    if (isJSONResponse(response)) {
      return response.json();
    }
    return response.text();
  };

  responsePromise.text = async () => {
    setAcceptHeader(TEXT_MIME_TYPE);
    const response = await responsePromise;
    return response.text();
  };

  /* eslint-enable no-param-reassign */
}

export type Init = Omit<RequestInit, 'method' | 'body'>;

export type Config = { init: Init };

export const defaults: Config = {
  init: {
    // https://github.com/github/fetch/blob/v3.6.2/README.md#sending-cookies
    // TODO Remove when old browsers are not supported anymore
    credentials: 'same-origin'
  }
};

type Method = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

// Can throw:
// - HttpError if !response.ok
// - TypeError if request blocked (DevTools or CORS) or network timeout (net::ERR_TIMED_OUT):
//   - Firefox 68: "TypeError: "NetworkError when attempting to fetch resource.""
//   - Chrome 76: "TypeError: Failed to fetch"
// - DOMException if request aborted
function request<T extends BodyInit>(
  input: RequestInfo,
  headers: Headers,
  init: Omit<Init, 'headers'> | undefined,
  method: Method,
  body?: T
) {
  async function _fetch() {
    // Have to wait for headers to be modified inside extendResponsePromiseWithBodyMethods
    await wait(1);

    const response = await fetch(input, {
      ...defaults.init,
      ...init,
      headers,
      method,
      body
    });

    if (!response.ok) throw new HttpError(response);

    return response;
  }

  const responsePromise = _fetch() as ResponsePromiseWithBodyMethods;
  extendResponsePromiseWithBodyMethods(responsePromise, headers);

  return responsePromise;
}

// FIXME Remove when support for [EdgeHTML](https://en.wikipedia.org/wiki/EdgeHTML) will be dropped
function newHeaders(init?: HeadersInit) {
  // Why "?? {}"? Microsoft Edge <= 18 (EdgeHTML) throws "Invalid argument" with "new Headers(undefined)" and "new Headers(null)"
  return new Headers(init ?? {});
}

function getHeaders(init?: Init) {
  // We don't know if defaults.init.headers and init.headers are JSON or Headers instances
  // thus we have to make the conversion
  const defaultInitHeaders = entriesToObject(newHeaders(defaults.init.headers));
  const initHeaders = entriesToObject(newHeaders(init?.headers));
  return newHeaders({ ...defaultInitHeaders, ...initHeaders });
}

function getJSONHeaders(init?: Init) {
  const headers = getHeaders(init);
  headers.set('content-type', JSON_MIME_TYPE);
  return headers;
}

export function get(input: RequestInfo, init?: Init) {
  return request(input, getHeaders(init), init, 'GET');
}

export function post<T extends BodyInit>(input: RequestInfo, body?: T, init?: Init) {
  return request(input, getHeaders(init), init, 'POST', body);
}
// Should be named postJson or postJSON?
// - JS uses JSON.parse(), JSON.stringify(), toJSON()
// - Deno uses [JSON](https://github.com/denoland/deno/blob/v1.5.3/cli/dts/lib.webworker.d.ts#L387) and [Json](https://github.com/denoland/deno/blob/v1.5.3/cli/dts/lib.webworker.d.ts#L260)
//
// Record<string, unknown> is compatible with "type" not with "interface": "Index signature is missing in type 'MyInterface'"
// Best alternative is object, why? https://stackoverflow.com/a/58143592
export function postJSON<T extends object>(input: RequestInfo, body: T, init?: Init) {
  return request(input, getJSONHeaders(init), init, 'POST', JSON.stringify(body));
}
// No need to have postFormData() and friends: the browser already sets the proper request content type
// Something like "content-type: multipart/form-data; boundary=----WebKitFormBoundaryl8VQ0sfwUpJEWna3"

export function put<T extends BodyInit>(input: RequestInfo, body?: T, init?: Init) {
  return request(input, getHeaders(init), init, 'PUT', body);
}
export function putJSON<T extends object>(input: RequestInfo, body: T, init?: Init) {
  return request(input, getJSONHeaders(init), init, 'PUT', JSON.stringify(body));
}

export function patch<T extends BodyInit>(input: RequestInfo, body?: T, init?: Init) {
  return request(input, getHeaders(init), init, 'PATCH', body);
}
export function patchJSON<T extends object>(input: RequestInfo, body: T, init?: Init) {
  return request(input, getJSONHeaders(init), init, 'PATCH', JSON.stringify(body));
}

// Cannot be named delete :-/
export function del(input: RequestInfo, init?: Init) {
  return request(input, getHeaders(init), init, 'DELETE');
}
