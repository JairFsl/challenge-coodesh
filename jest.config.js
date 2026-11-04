module.exports = {
  preset: '@react-native/jest-preset',
  setupFiles: ['<rootDir>/jest.setup.ts', '@shopify/flash-list/jestSetup'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  transformIgnorePatterns: [
    'node_modules/(?!((jest-)?react-native(-[a-z-]+)?|@react-native(-community|-async-storage)?|@react-navigation|@shopify/flash-list|@supabase)/)',
  ],
  testPathIgnorePatterns: ['/node_modules/', '/android/', '/ios/'],
};
