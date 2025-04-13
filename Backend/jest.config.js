module.exports = {
    testEnvironment: 'node',
    coveragePathIgnorePatterns: [
        '/node_modules/',
        '/tests/'
    ],
    testMatch: [
        '**/__tests__/**/*.js',
        '**/?(*.)+(spec|test).js'
    ],
    verbose: true,
    collectCoverage: true,
    coverageReporters: ['text', 'lcov'],
    setupFilesAfterEnv: ['<rootDir>/tests/setup.js']
}; 