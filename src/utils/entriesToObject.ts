interface ObjectWithEntries {
  entries(): IterableIterator<[string, any]>;
}

// https://gist.github.com/userpixel/fedfe80d59aa1c096267600595ba423e
export function entriesToObject<T extends ObjectWithEntries>(object: T) {
  return Object.fromEntries(object.entries());
}
