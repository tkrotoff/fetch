/* eslint-disable default-param-last */

import { JSON_MIME_TYPE } from './Http';
import { HttpError } from './HttpError';

export function createHttpError(body?: BodyInit, status = 0, statusText?: string) {
  return new HttpError(
    new Response(body, {
      status,
      statusText
    })
  );
}

// Record<string, unknown> is compatible with "type" not with "interface": "Index signature is missing in type 'MyInterface'"
// Best alternative is object, why? https://stackoverflow.com/a/58143592
// eslint-disable-next-line @typescript-eslint/ban-types
export function createJSONHttpError(body: object, status = 0, statusText?: string) {
  return new HttpError(
    new Response(JSON.stringify(body), {
      status,
      statusText,
      headers: { 'content-type': JSON_MIME_TYPE }
    })
  );
}
