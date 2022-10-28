/* eslint-disable @typescript-eslint/no-var-requires */
const webpack = require("webpack");
const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const { CleanWebpackPlugin } = require("clean-webpack-plugin");
const ForkTsCheckerWebpackPlugin = require("fork-ts-checker-webpack-plugin");
const CopyWebpackPlugin = require("copy-webpack-plugin");
const WriteFilePlugin = require("write-file-webpack-plugin");
const BundleAnalyzerPlugin = require("webpack-bundle-analyzer")
  .BundleAnalyzerPlugin;
const fs = require("fs");

const isEnvDevelopment = process.env.NODE_ENV !== "production";
const isEnvAnalyzer = process.env.ANALYZER === "true";
const commonResolve = (dir) => ({
  extensions: [".ts", ".tsx", ".js", ".jsx", ".css", ".scss"],
  alias: {
    assets: path.resolve(__dirname, dir),
  },
});
const altResolve = () => {
  const p = path.resolve(__dirname, "./src/keplr-torus-signin/index.ts");

  if (fs.existsSync(p)) {
    return {
      alias: {
        "alt-sign-in": path.resolve(
          __dirname,
          "./src/keplr-torus-signin/index.ts"
        ),
      },
    };
  }

  return {};
};
const sassRule = {
  test: /(\.s?css)|(\.sass)$/,
  oneOf: [
    // if ext includes module as prefix, it perform by css loader.
    {
      test: /.module(\.s?css)|(\.sass)$/,
      use: [
        "style-loader",
        {
          loader: "css-loader",
          options: {
            modules: {
              localIdentName: "[local]-[hash:base64]",
            },
            localsConvention: "camelCase",
          },
        },
        {
          loader: "sass-loader",
          options: {
            implementation: require("sass"),
          },
        },
      ],
    },
    {
      use: [
        "style-loader",
        { loader: "css-loader", options: { modules: false } },
        {
          loader: "sass-loader",
          options: {
            implementation: require("sass"),
          },
        },
      ],
    },
  ],
};
const tsRule = { test: /\.tsx?$/, loader: "ts-loader" };
const fileRule = {
  test: /\.(svg|png|jpe?g|gif|woff|woff2|eot|ttf)$/i,
  use: [
    {
      loader: "file-loader",
      options: {
        name: "[name].[ext]",
        publicPath: "assets",
        outputPath: "assets",
      },
    },
  ],
};

const extensionConfig = (env, args) => {
  return {
    name: "extension",
    mode: isEnvDevelopment ? "development" : "production",
    // In development environment, turn on source map.
    devtool: isEnvDevelopment ? "cheap-source-map" : false,
    // In development environment, webpack watch the file changes, and recompile
    watch: isEnvDevelopment,
    entry: {
      popup: ["./src/index.tsx"],
      blocklist: ["./src/pages/blocklist/index.tsx"],
      background: ["./src/background/background.ts"],
      contentScripts: ["./src/content-scripts/content-scripts.ts"],
      injectedScript: ["./src/content-scripts/inject/injected-script.ts"],
    },
    output: {
      path: path.resolve(__dirname, isEnvDevelopment ? "dist" : "build/chrome"),
      filename: "[name].bundle.js",
    },
    optimization: {
      splitChunks: {
        chunks(chunk) {
          return chunk.name === "popup";
        },
        cacheGroups: {
          popup: {
            maxSize: 3_000_000,
          },
        },
      },
    },
    resolve: {
      ...commonResolve("src/public/assets"),
      ...altResolve(),
    },
    module: {
      rules: [sassRule, tsRule, fileRule],
    },
    plugins: [
      // Remove all and write anyway
      // TODO: Optimizing build process
      new CleanWebpackPlugin(),
      new ForkTsCheckerWebpackPlugin(),
      new CopyWebpackPlugin(
        [
          {
            from: "./src/manifest.json",
            to: "./",
          },
          {
            from:
              "../../node_modules/webextension-polyfill/dist/browser-polyfill.js",
          },
        ],
        { copyUnmodified: true }
      ),
      new HtmlWebpackPlugin({
        template: "./src/index.html",
        filename: "popup.html",
        excludeChunks: [
          "blocklist",
          "background",
          "contentScripts",
          "injectedScript",
        ],
      }),
      new HtmlWebpackPlugin({
        template: "./src/index.html",
        filename: "blocklist.html",
        excludeChunks: [
          "popup",
          "background",
          "contentScripts",
          "injectedScript",
        ],
      }),
      new WriteFilePlugin(),
      new webpack.EnvironmentPlugin([
        "NODE_ENV",
        "KEPLR_EXT_ETHEREUM_ENDPOINT",
        "KEPLR_EXT_AMPLITUDE_API_KEY",
      ]),
      new BundleAnalyzerPlugin({
        analyzerMode: isEnvAnalyzer ? "server" : "disabled",
      }),
    ],
  };
};

module.exports = extensionConfig;
