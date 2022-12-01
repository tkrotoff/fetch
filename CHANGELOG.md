## 0.14.2 (2022/12/01)

- Update npm packages
- Test with Node.js 18 (#29)

## 0.14.1 (2022/07/08)

- Accept URL as input

## 0.14.0 (2022/07/08)

- Ship again ESM modules, https://github.com/rollup/rollup/wiki/pkg.module

## 0.13.0 (2022/07/07)

- Just ship CommonJS
- More JSDoc

## 0.12.6 (2022/06/21)

- Update npm packages

## 0.12.5 (2022/04/10)

- Optional body for post(), put() & patch(), reasons:
  - https://stackoverflow.com/q/4191593
  - https://stackoverflow.com/q/1233372
  - https://stackoverflow.com/q/46956374

## 0.12.4 (2022/03/15)

- Fix web example
- Update npm packages
- Improve documentation
- Upload coverage to Code Climate & Codecov
- Remove Travis CI support

## 0.12.3 (2021/12/30)

- Update to node-fetch 3
- Update other npm packages
- Switch to @playwright/test

## 0.12.2 (2021/10/18)

### Features

- Update npm packages

## 0.12.1 (2021/08/04)

### Features

- Update npm packages

## 0.12.0 (2021/04/22)

### Breaking Changes

- Switch HttpStatus from an enum to an object to reduce bundle size
- Do not bundle export entriesToObject()

### Features

- Document isJSONResponse() & improve documentation
- Change internal file organization

## 0.11.4 (2021/04/20)

### Features

- Improve documentation
- Various internal improvements
- Update npm packages

## 0.11.3 (2021/03/15)

### Fixes

- Use Rollup to generate CommonJS and UMD outputs
  - No need anymore for mockFetch.ts: no more "TypeError: Cannot redefine property: ..." with Jest thx to Rollup CommonJS output
- Fix HttpError name when minified

## 0.11.1 (2021/03/10)

### Features

- More HTTP status codes
- Update npm packages

## 0.11.0 (2021/01/27)

### Features

- Introduce createHttpError() & createJSONHttpError()

## 0.10.2 (2021/01/22)

### Fixes

- Fix for Microsoft Edge <= 18 (EdgeHTML)

### Features

- Document HttpError

## 0.10.1 (2021/01/06)

### Features

- Update documentation: use RequestInfo as first parameter
- Update npm packages

## 0.10.0 (2020/12/16)

### Breaking Changes

- Make everything more generic: add Body methods to Promise<Response>
- New Node.js example

### Features

- Update npm packages
- Add postFormData(), putFormData(), patchFormData()
- Improve types

## 0.6.0 (2020/11/08)

### Features

- Update npm packages
- Add postFormData(), putFormData(), patchFormData()
- Improve types

## 0.5.1 (2020/03/16)

### Features

- Update npm packages

## 0.5.0 (2020/03/13)

### Breaking Changes

- Rework HttpError, remove createHttpError()

## 0.4.0 (2020/01/26)

### Breaking Changes

- Rename Json to JSON

## 0.3.4 (2020/01/14)

### Features

- Add error.statusCode because of Node.js http.ServerResponse.statusCode

## 0.3.3 (2020/01/04)

### Features

- Update npm packages

## 0.3.2 (2019/09/25)

### Fixes

- Do not publish test files, see c730ea

## 0.3.1 (2019/09/23)

### Features

- Better documentation
- Add an example for browsers

## 0.3.0 (2019/09/03)

### Features

- Expose defaults.init
- Document TypeError exception
- Upgrade npm packages

## 0.2.1 (2019/08/02)

### Features

- Export createHttpError()
- Upgrade npm packages

## 0.2.0 (2019/06/03)

### Features

- Improve typings thx to TypeScript 3.5
- Simplify code
- Improve tests

## 0.1.0 (2019/05/23)

### Features

- Allow to pass options
- Upgrade npm packages

### Fixes

- Do not reinterpret the response, see 00b5ec

## 0.0.4 (2019/03/25)

### Fixes

- No package.json side effects

## 0.0.3 (2019/03/18)

### Features

- Add Husky
- Upgrade npm packages
- Set a repository URL for npmjs.com
- Improve ESLint

## 0.0.2 (2019/02/28)

First release

### Features

- Http.ts: `getJson()`, `postJson()`, `putJson()`, `patchJson()`, `deleteJson()`
- HttpStatus.ts: `enum HttpStatus`
- HttpError.ts: `class HttpError extends Error`
- 100% code coverage
