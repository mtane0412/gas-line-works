/**
 * Jest設定ファイル
 */
module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  roots: ["<rootDir>/__tests__"],
  testMatch: ["**/*.test.ts"],
  moduleFileExtensions: ["ts", "js"],
  collectCoverageFrom: ["src/**/*.ts", "!src/**/*.d.ts"],
  coverageDirectory: "coverage",
  verbose: true,
  transform: {
    "^.+\\.ts$": [
      "ts-jest",
      {
        tsconfig: {
          target: "ES2019",
          module: "CommonJS",
          moduleResolution: "node",
          lib: ["ES2019"],
          strict: true,
          esModuleInterop: true,
          skipLibCheck: true,
          types: ["google-apps-script", "jest", "node"],
        },
      },
    ],
  },
};
