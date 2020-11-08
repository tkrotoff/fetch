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
