module.exports = {
  preset: "ts-jest",
  testEnvironment: "jsdom",
  moduleDirectories: ["node_modules", "src"],
  transform: {
    "^.+\\.svg$": "<rootDir>/plugins/svgTransform.js"
  },
  moduleNameMapper: {
    "\\.(css|scss)$": "<rootDir>/__mocks__/styleMock.js"
  },
  globals: {
    "ts-jest": {
      diagnostics: {
        pathRegex: /\.test\.tsx?$/
      }
    }
  }
};
