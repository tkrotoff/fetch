/* eslint-disable no-throw-literal, jest/no-conditional-expect */

import { getErrorMessage } from './getErrorMessage';

test('throw new Error()', () => {
  try {
    throw new Error('message');
  } catch (e) {
    expect(getErrorMessage(e)).toEqual('message');
  }
});

test('throw without new Error()', () => {
  try {
    throw 'message';
  } catch (e) {
    expect(getErrorMessage(e)).toEqual('"message"');
  }

  try {
    throw 666;
  } catch (e) {
    expect(getErrorMessage(e)).toEqual('666');
  }

  try {
    throw { error: 'message' };
  } catch (e) {
    expect(getErrorMessage(e)).toEqual('{"error":"message"}');
  }

  try {
    throw [1, 2, 3];
  } catch (e) {
    expect(getErrorMessage(e)).toEqual('[1,2,3]');
  }

  try {
    throw undefined;
  } catch (e) {
    expect(getErrorMessage(e)).toEqual('');
  }

  try {
    // eslint-disable-next-line unicorn/no-null
    throw null;
  } catch (e) {
    expect(getErrorMessage(e)).toEqual('null');
  }
});

test('circular reference', () => {
  {
    const circular = {
      error: 'message'
    };
    // @ts-ignore
    circular.myself = circular;

    try {
      JSON.stringify(circular);
    } catch (e) {
      expect(getErrorMessage(e)).toEqual(
        'Converting circular structure to JSON\n' +
          "    --> starting at object with constructor 'Object'\n" +
          "    --- property 'myself' closes the circle"
      );
    }

    try {
      throw circular;
    } catch (e) {
      expect(getErrorMessage(e)).toEqual('[object Object]');
    }
  }

  {
    const circular = [1, 2, 3];
    // @ts-ignore
    circular[0] = circular;

    try {
      JSON.stringify(circular);
    } catch (e) {
      expect(getErrorMessage(e)).toEqual(
        'Converting circular structure to JSON\n' +
          "    --> starting at object with constructor 'Array'\n" +
          '    --- index 0 closes the circle'
      );
    }

    try {
      throw circular;
    } catch (e) {
      expect(getErrorMessage(e)).toEqual(',2,3');
    }
  }

  {
    class Circular {
      error = 'message';

      myself = this;
    }

    const circular = new Circular();

    try {
      JSON.stringify(circular);
    } catch (e) {
      expect(getErrorMessage(e)).toEqual(
        'Converting circular structure to JSON\n' +
          "    --> starting at object with constructor 'Circular'\n" +
          "    --- property 'myself' closes the circle"
      );
    }

    try {
      throw circular;
    } catch (e) {
      expect(getErrorMessage(e)).toEqual('[object Object]');
    }
  }
});
