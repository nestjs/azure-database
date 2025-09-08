module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testPathIgnorePatterns: ['<rootDir>/sample/', '<rootDir>/dist/'],
  moduleFileExtensions: ['js', 'json', 'ts'],
  rootDir: '.',
  testMatch: ['**/tests/**/*.spec.ts', '**/lib/**/*.spec.ts'],
  collectCoverageFrom: [
    'lib/**/*.(t|j)s',
    '!lib/**/*.spec.ts',
    '!lib/**/index.ts',
  ],
  transform: {
    '^.+\\.(t|j)s$': 'ts-jest',
  },
  globals: {
    'ts-jest': {
      tsconfig: 'tests/tsconfig.json',
    },
  },
};
