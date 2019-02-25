import { escape } from 'lodash-es';

export class HttpError extends Error {
  constructor(message: string) {
    super(message);

    // See Extending built-ins like Error, Array, and Map may no longer work
    // https://github.com/Microsoft/TypeScript/wiki/Breaking-Changes#extending-built-ins-like-error-array-and-map-may-no-longer-work
    Object.setPrototypeOf(this, HttpError.prototype);
  }

  status!: number;
  response: unknown;
}

// Return something like "POST https://localhost:5001/GoogleCalendar/102888771917469198372/invalid@group.calendar.google.com/Event 404 (Not Found)"
export function responseToString(method: string, response: Response) {
  return `${escape(method)} ${escape(response.url)} ${escape(response.status.toString())} (${escape(
    response.statusText
  )})`;
}

export function createFake404NotFoundResponse(url: string) {
  return {
    url,
    status: 404,
    statusText: 'Not Found',

    // Don't care
    body: null,
    ok: false
  } as Response;
}

export function createFake400BadRequestResponse(url: string) {
  return {
    url,
    status: 400,
    statusText: 'Bad Request',

    // Don't care
    body: null,
    ok: false
  } as Response;
}
