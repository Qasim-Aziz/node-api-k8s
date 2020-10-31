export default {
  cacheDirectory: '/tmp/jest/cache',
  collectCoverage: false,
  coverageReporters: ['json'],
  globals: {
    'ts-jest': {
      isolatedModules: true,
      diagnostics: false,
    }
  },
  moduleNameMapper: {
    '^(src)/(.*)$': '<rootDir>/$1/$2',
  },
  preset: 'ts-jest',
  roots: [
    '<rootDir>/src/server'
  ],
  testEnvironment: 'node',
  testMatch: [
    '**/*.unittest.ts',
    'src/server/tests/*.ts',
    '**/*.test.ts',
  ],
  testTimeout: 20000,
  transformIgnorePatterns: ['/node_modules/'],
  transform: {
    '.ts$': 'ts-jest'
  }
};
