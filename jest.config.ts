import type { Config } from "jest";

const config: Config = {
  preset: "ts-jest",
  testEnvironment: "node",
  moduleNameMapper: {
    "^@/lib/(.*)$": "<rootDir>/backend/lib/$1",
    "^@/backend/(.*)$": "<rootDir>/backend/$1",
    "^@/frontend/(.*)$": "<rootDir>/frontend/$1",
    "^@/components/(.*)$": "<rootDir>/frontend/shared/components/$1",
    "^@/types/(.*)$": "<rootDir>/frontend/shared/types/$1",
    "^@/hooks/(.*)$": "<rootDir>/frontend/shared/hooks/$1",
    "^@/utils/(.*)$": "<rootDir>/frontend/shared/utils/$1",
    "^@/(.*)$": "<rootDir>/$1",
  },
  setupFiles: ["<rootDir>/jest.env.js"],
  setupFilesAfterEnv: ["<rootDir>/jest.setup.ts"],
  transform: {
    "^.+\\.(ts|tsx)$": ["ts-jest", { tsconfig: "tsconfig.json" }],
  },
  collectCoverage: true,
  coverageDirectory: "coverage",
  coverageReporters: ["text", "lcov"],
};

export default config;
