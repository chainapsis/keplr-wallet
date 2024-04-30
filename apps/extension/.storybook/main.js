import { dirname, join } from "path";
const { ProvidePlugin } = require("webpack");

module.exports = {
  stories: ["../src/**/*.stories.mdx", "../src/**/*.stories.@(js|jsx|ts|tsx)"],

  addons: [
    getAbsolutePath("@storybook/addon-links"),
    getAbsolutePath("@storybook/addon-essentials"),
    getAbsolutePath("@storybook/addon-interactions"),
  ],

  framework: {
    name: getAbsolutePath("@storybook/react-webpack5"),
    options: {},
  },

  webpackFinal: async (config) => {
    config.resolve.fallback = {
      os: require.resolve("os-browserify/browser"),
      buffer: require.resolve("buffer/"),
      http: require.resolve("stream-http"),
      https: require.resolve("https-browserify"),
      crypto: require.resolve("crypto-browserify"),
      stream: require.resolve("stream-browserify"),
      process: require.resolve("process/browser"),
    };

    config.module.rules.push({
      test: /\.tsx?$/,
      loader: "ts-loader",
    });

    config.plugins.push(
      new ProvidePlugin({
        process: "process/browser",
        Buffer: ["buffer", "Buffer"],
      })
    );

    return config;
  },

  docs: {
    autodocs: true,
  },
};

function getAbsolutePath(value) {
  return dirname(require.resolve(join(value, "package.json")));
}
