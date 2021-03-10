// Should be named HTTPError or HttpError?
// - [Web APIs](https://developer.mozilla.org/en-US/docs/Web/API) have XMLHttpRequest
// - Node.js uses http: https://nodejs.org/en/docs/guides/anatomy-of-an-http-transaction/
// - Deno uses Http: https://github.com/denoland/deno/blob/v1.5.3/cli/rt/01_errors.js#L116
export class HttpError extends Error {
  response: Response;

  constructor(response: Response) {
    const { status, statusText } = response;

    super(
      // statusText can be empty: https://stackoverflow.com/q/41632077
      statusText || String(status)
    );

    this.name = 'HttpError';
    this.response = response;
  }
}
