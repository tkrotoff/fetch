import { ResponsePromiseWithBodyMethods } from './Http';
import { HttpError } from './HttpError';

function extendResponsePromiseWithBodyMethods(
  responsePromise: ResponsePromiseWithBodyMethods,
  response: Response
) {
  // eslint-disable-next-line unicorn/no-array-for-each
  (['arrayBuffer', 'blob', 'formData', 'json', 'text'] as const).forEach(methodName => {
    // eslint-disable-next-line no-param-reassign
    responsePromise[methodName] = () =>
      new Promise<any /* FIXME */>((resolve, reject) => {
        if (response.ok) {
          resolve(response[methodName]());
        } else {
          responsePromise.catch(() => {
            // Silently catch the "root" responsePromise rejection
            // We already reject just below (body method) and
            // we don't want the "root" responsePromise rejection to be unhandled
          });
          reject(new HttpError(response));
        }
      });
  });
}

/**
 * Creates a HTTP promise response ({@link ResponsePromiseWithBodyMethods}), helpful for mocking.
 *
 * Example:
 * ```JS
 * await get(...).text();
 *
 * import * as Http from '@tkrotoff/fetch';
 *
 * jest.spyOn(Http, 'get').mockImplementation(() => createResponsePromise(...));
 * ```
 *
 * How to generate a HTTP error:
 * ```JS
 * jest.spyOn(Http, 'get').mockImplementation(() =>
 *   createResponsePromise('<!DOCTYPE html><title>404</title>', {
 *     status: 404,
 *     statusText: 'Not Found'
 *   })
 * );
 * ```
 *
 * @see {@link createJSONResponsePromise()}
 * @see {@link ResponsePromiseWithBodyMethods}
 */
export function createResponsePromise(body?: BodyInit, init?: ResponseInit) {
  const response = new Response(body, init);

  const responsePromise = new Promise<Response>((resolve, reject) => {
    if (response.ok) {
      resolve(response);
    } else {
      // Let's call this the "root" responsePromise rejection
      // Will be silently caught if we throw inside a body method, see extendResponsePromiseWithBodyMethods
      reject(new HttpError(response));
    }
  }) as ResponsePromiseWithBodyMethods;

  extendResponsePromiseWithBodyMethods(responsePromise, response);
  return responsePromise;
}

/**
 * {@link createResponsePromise()} with a JSON body.
 *
 * ```JS
 * jest.spyOn(Http, 'get').mockImplementation(() =>
 *    Http.createJSONResponsePromise({
 *      foo: 'bar
 *    })
 * );
 * ```
 */
// Record<string, unknown> is compatible with "type" not with "interface": "Index signature is missing in type 'MyInterface'"
// Best alternative is object, why? https://stackoverflow.com/a/58143592
export function createJSONResponsePromise(body: object, init?: ResponseInit) {
  return createResponsePromise(JSON.stringify(body), init);
}
