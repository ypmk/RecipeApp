// backend/jest.config.js
module.exports = {
    preset: 'ts-jest',
    testEnvironment: 'node',
    testMatch: ['**/__tests__/**/*.test.ts'],
    roots: ['<rootDir>/src'],
    maxWorkers: 1,
};
