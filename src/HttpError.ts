export class HttpError extends Error {
  constructor(message: string) {
    super(message);

    // See [Extending built-ins like Error, Array, and Map may no longer work](https://github.com/Microsoft/TypeScript/wiki/Breaking-Changes#extending-built-ins-like-error-array-and-map-may-no-longer-work)
    Object.setPrototypeOf(this, HttpError.prototype);
  }

  // https://developer.mozilla.org/en-US/docs/Web/API/Response/status
  status!: number;

  // https://nodejs.org/docs/latest-v12.x/api/http.html#http_response_statuscode
  statusCode!: number;

  response: unknown;
}
