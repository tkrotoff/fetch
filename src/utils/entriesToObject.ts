// [Headers.entries()](https://github.com/microsoft/TypeScript/blob/v4.4.4/lib/lib.dom.iterable.d.ts#L120)
// [FormData.entries()](https://github.com/microsoft/TypeScript/blob/v4.4.4/lib/lib.dom.iterable.d.ts#L84)
interface ObjectWithEntries {
  entries(): IterableIterator<[string, any]>;
}

/**
 * Converts the [HTTP response headers]({@link Response.headers}) to a plain JavaScript object.
 */
// https://gist.github.com/userpixel/fedfe80d59aa1c096267600595ba423e
export function entriesToObject<T extends ObjectWithEntries>(object: T) {
  return Object.fromEntries(object.entries());
}
