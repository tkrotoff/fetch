import { jsonMimeType } from './Http';
import { HttpError } from './HttpError';

/**
 * Creates a {@link HttpError} with the given response and an undefined request.
 *
 * @see {@link createJSONHttpError()}
 */
export function createHttpError(body: BodyInit | undefined, status: number, statusText?: string) {
  return new HttpError(
    undefined!,
    new Response(body, {
      status,
      statusText
    })
  );
}

/**
 * Creates a {@link HttpError} with a JSON {@link Response} response body and an undefined request.
 *
 * @see {@link createHttpError()}
 */
// Record<string, unknown> is compatible with "type" not with "interface": "Index signature is missing in type 'MyInterface'"
// Best alternative is object, why? https://stackoverflow.com/a/58143592
export function createJSONHttpError(body: object, status: number, statusText?: string) {
  return new HttpError(
    undefined!,
    // FIXME Replace with [Response.json()](https://twitter.com/lcasdev/status/1564598435772342272)
    new Response(JSON.stringify(body), {
      status,
      statusText,
      headers: { 'content-type': jsonMimeType }
    })
  );
}
