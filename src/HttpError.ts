import { HttpStatus } from './HttpStatus';

export class HttpError extends Error {
  // https://developer.mozilla.org/en-US/docs/Web/API/Response/status
  // https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest/status
  status: HttpStatus;

  // https://nodejs.org/docs/latest-v12.x/api/http.html#http_response_statuscode
  statusCode: HttpStatus;

  response: unknown;

  constructor(statusText: string, status: HttpStatus, response: unknown) {
    super(statusText);

    this.name = 'HttpError';

    // Fetch API Response has fields status (number) and statusText (string) (same for XMLHttpRequest)
    // Node.js http.ServerResponse has fields statusCode (number) and statusMessage (string)
    // They didn't choose the same naming conventions :-/
    this.status = status;
    this.statusCode = status;

    this.response = response;

    // [Extending built-ins like Error, Array, and Map may no longer work](https://github.com/Microsoft/TypeScript/wiki/Breaking-Changes#extending-built-ins-like-error-array-and-map-may-no-longer-work)
    Object.setPrototypeOf(this, HttpError.prototype);
  }
}
