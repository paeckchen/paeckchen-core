module.exports = function (wallaby) {
  return {
    files: [
      'src/**/*.ts*',
      'test/helper.ts'
    ],
    tests: [
      'test/**/*-test.ts*'
    ],
    env: {
      type: 'node'
    },
    testFramework: 'ava',
    debug: true
  };
};
