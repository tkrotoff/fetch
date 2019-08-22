# @tkrotoff/fetch

[![npm version](https://badge.fury.io/js/%40tkrotoff%2Ffetch.svg)](https://www.npmjs.com/package/@tkrotoff/fetch)
[![Build Status](https://travis-ci.org/tkrotoff/fetch.svg?branch=master)](https://travis-ci.org/tkrotoff/fetch)
[![Codecov](https://codecov.io/gh/tkrotoff/fetch/branch/master/graph/badge.svg)](https://codecov.io/gh/tkrotoff/fetch)
[![npm bundle size](https://img.shields.io/bundlephobia/min/%40tkrotoff/fetch.svg)](https://bundlephobia.com/result?p=@tkrotoff/fetch)

A [Fetch](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API) wrapper for JSON.

## Usage

`npm install @tkrotoff/fetch`

```JS
import { defaults, postJson } from '@tkrotoff/fetch';

// ...

defaults.init = { /* ... */ };

const response = await postJson(
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
