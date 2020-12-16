import { ResponsePromiseWithBodyMethods } from './Http';
import { HttpError } from './HttpError';

function extendResponsePromiseWithBodyMethods(
  responsePromise: ResponsePromiseWithBodyMethods,
  response: Response
) {
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

// await get(...).text();
// ...
// const getSpy = jest.spyOn(Http, 'get').mockImplementation(() => createResponsePromise(...));
//
// await get(...);
// ...
// const getSpy = jest.spyOn(Http, 'get').mockImplementation(() => createResponsePromise(...));
//
// How to generate a HTTP error:
// const getSpy = jest.spyOn(Http, 'get').mockImplementation(() =>
//   createResponsePromise('<!DOCTYPE html><title>404</title>', {
//     status: 404,
//     statusText: 'Not Found'
//   })
// );
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

// Record<string, unknown> is compatible with "type" not with "interface": "Index signature is missing in type 'MyInterface'"
// Best alternative is object, why? https://stackoverflow.com/a/58143592
// eslint-disable-next-line @typescript-eslint/ban-types
export function createJSONResponsePromise(body: object, init?: ResponseInit) {
  return createResponsePromise(JSON.stringify(body), init);
}
