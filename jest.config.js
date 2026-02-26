// jest.config.js
export default {
  testEnvironment: "node",
  transform: {
    '^.+\\.tsx?$': [
      'ts-jest',
      {
        tsconfig: {
          skipLibCheck: true,
          noEmit: true,
          allowJs: true,
          esModuleInterop: true,
          module: "esnext",
          moduleResolution: "node",
        },
        
        diagnostics: false, // Disable type checking
      },
    ],
  },
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/src/$1",
    "^@subgraphs/(.*)$": "<rootDir>/src/subgraphs/$1",
    "^@infrastructure/(.*)$": "<rootDir>/src/infrastructure/$1"
  },
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  testMatch: ['**/__tests__/**/*.test.(ts|tsx|js)'],
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
  ],
};
