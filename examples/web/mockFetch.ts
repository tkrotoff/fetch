// FIXME This is a workaround
//
// "import * as Http from '@tkrotoff/fetch'; jest.spyOn(Http, 'get')..." won't work with Jest 26.6.3:
//
// TypeError: Cannot redefine property: get
//     at Function.defineProperty (<anonymous>)
//
// Couldn't find a Jest GitHub issue that 100% matches this issue:
// https://github.com/jasmine/jasmine/issues/1414
// ["only works when it's transpiled by babel through es6 modules. Won't work on CommonJS"](https://stackoverflow.com/a/54245672)
//
// What about moving this to __mocks__/@tkrotoff/fetch? Does not work: https://github.com/facebook/jest/issues/10419#issuecomment-731176514
//
jest.mock('@tkrotoff/fetch', () => ({
  // FIXME https://github.com/DefinitelyTyped/DefinitelyTyped/pull/44734
  // https://github.com/DefinitelyTyped/DefinitelyTyped/pull/44433#issuecomment-628789936
  ...jest.requireActual<any>('@tkrotoff/fetch'),
  get: jest.fn(),
  postJSON: jest.fn(),
  post: jest.fn(),
  putJSON: jest.fn(),
  patchJSON: jest.fn(),
  patch: jest.fn(),
  del: jest.fn()
}));
