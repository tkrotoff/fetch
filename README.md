# @tkrotoff/fetch

A [Fetch](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API) wrapper for JSON.

## Usage

`yarn add @tkrotoff/fetch` or `npm install @tkrotoff/fetch`

```JS
import * as Http from '@tkrotoff/fetch';

// ...

const response = await Http.postJson(
  'https://jsonplaceholder.typicode.com/posts',
  {
    title: 'foo',
    body: 'bar',
    userId: 1
  }
);

console.log(response);

// ...
```
