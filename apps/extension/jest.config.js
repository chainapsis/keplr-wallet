module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  moduleNameMapper: {
    "\\.(css|scss|sass)$": "identity-obj-proxy",
  },
  testMatch: ["**/src/**/?(*.)+(spec|test).[jt]s?(x)"],
};
