import assert from 'node:assert';

// [console.assert not throwing with v22.4.0](https://github.com/facebook/jest/issues/5634)
console.assert = assert;

(globalThis.fetch as any) = () => {
  throw new Error('You should mock fetch()');
};
