/* eslint-disable @typescript-eslint/no-var-requires */

const Sequencer = require('@jest/test-sequencer').default;

// https://stackoverflow.com/a/12646864
function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    // eslint-disable-next-line no-param-reassign
    [array[i], array[j]] = [array[j], array[i]];
  }
}

// This randomizes test files, not be confused with [Ability to run tests within a file in a random order](https://github.com/facebook/jest/issues/4386)
// https://github.com/facebook/jest/issues/6194#issuecomment-582428526
class JestRandomSequencer extends Sequencer {
  // eslint-disable-next-line class-methods-use-this
  sort(tests) {
    // https://stackoverflow.com/a/18650169
    // tests.sort(() => Math.random() - 0.5);
    shuffleArray(tests);
    return tests;
  }
}

module.exports = JestRandomSequencer;
