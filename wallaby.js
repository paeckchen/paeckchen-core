module.exports = function (w) {
  return {
    files: [
      'src/**/*.ts*',
      { pattern: 'test/helper.ts', instrument: false },
      { pattern: 'test/fixtures/**', instrument: false },
      { pattern: 'package.json', instrument: false }
    ],
    tests: [
      'test/**/*-test.ts*'
    ],
    env: {
      type: 'node'
    },
    testFramework: 'ava',
    debug: false
  };
};
