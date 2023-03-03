import 'whatwg-fetch';

import assert from 'node:assert';

// [console.assert not throwing with v22.4.0](https://github.com/facebook/jest/issues/5634)
// eslint-disable-next-line no-console
console.assert = assert;

(window.fetch as any) = () => {
  throw new Error('You should mock fetch()');
};
