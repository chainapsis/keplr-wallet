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

const envDefaults = {
  NODE_ENV: process.env.NODE_ENV,
  PROD_AMPLITUDE_API_KEY: process.env["PROD_AMPLITUDE_API_KEY"] || "",
  DEV_AMPLITUDE_API_KEY: process.env["DEV_AMPLITUDE_API_KEY"] || "",
  KEPLR_EXT_ETHEREUM_ENDPOINT: process.env["KEPLR_EXT_ETHEREUM_ENDPOINT"] || "",
  KEPLR_EXT_TRANSAK_API_KEY: process.env["KEPLR_EXT_TRANSAK_API_KEY"] || "",
  KEPLR_EXT_MOONPAY_API_KEY: process.env["KEPLR_EXT_MOONPAY_API_KEY"] || "",
  KEPLR_EXT_KADO_API_KEY: process.env["KEPLR_EXT_KADO_API_KEY"] || "",
  KEPLR_EXT_COINGECKO_ENDPOINT:
    process.env["KEPLR_EXT_COINGECKO_ENDPOINT"] ||
    "https://api.coingecko.com/api/v3",
  KEPLR_EXT_COINGECKO_GETPRICE:
    process.env["KEPLR_EXT_COINGECKO_GETPRICE"] || "/simple/price",
};
const commonResolve = () => ({
  extensions: [".ts", ".tsx", ".js", ".jsx", ".css", ".scss", ".svg", ".wasm"],
  alias: {
    "@components": path.resolve(__dirname, "src/components"),
    "@layouts": path.resolve(__dirname, "src/layouts"),
    "@chatStore": path.resolve(__dirname, "src/stores/chats"),
    "@graphQL": path.resolve(__dirname, "src/graphQL"),
    "@chatTypes": path.resolve(__dirname, "src/@types/chat"),
    "@hooks": path.resolve(__dirname, "src/hooks"),
    "@assets": path.resolve(__dirname, "src/public/assets"),
    "@utils": path.resolve(__dirname, "src/utils"),
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
const wasmRule = {
  test: /\.wasm$/,
  type: "webassembly/async", // or 'webassembly/sync' for sync modules
};
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

const extensionConfig = () => {
  return {
    name: "extension",
    mode: isEnvDevelopment ? "development" : "production",
    // In development environment, turn on source map.
    devtool: isEnvDevelopment ? "cheap-source-map" : false,
    // In development environment, webpack watch the file changes, and recompile
    watch: isEnvDevelopment,
    entry: {
      background: ["./src/background/background.ts"],
      popup: ["./src/index.tsx"],
      blocklist: ["./src/pages/blocklist/index.tsx"],
      ledgerGrant: ["./src/pages/ledger-grant/index.tsx"],
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
          if (chunk.name === "reactChartJS") {
            return false;
          }

          return (
            chunk.name !== "contentScripts" && chunk.name !== "injectedScript"
          );
        },
        cacheGroups: {
          background: {
            maxSize: 3_000_000,
            maxInitialRequests: 100,
            maxAsyncRequests: 100,
          },
          popup: {
            maxSize: 3_000_000,
            maxInitialRequests: 100,
            maxAsyncRequests: 100,
          },
          blocklist: {
            maxSize: 3_000_000,
            maxInitialRequests: 100,
            maxAsyncRequests: 100,
          },
          ledgerGrant: {
            maxSize: 3_000_000,
            maxInitialRequests: 100,
            maxAsyncRequests: 100,
          },
        },
      },
    },
    resolve: {
      ...commonResolve(),
      ...altResolve(),
      fallback: {
        process: false,
        crypto: require.resolve("crypto-browserify"),
        stream: require.resolve("stream-browserify"),
        path: require.resolve("path-browserify"),
      },
    },
    module: {
      rules: [sassRule, tsRule, fileRule, wasmRule],
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
        template: "./src/background.html",
        filename: "background.html",
        excludeChunks: [
          "popup",
          "blocklist",
          "ledgerGrant",
          "contentScripts",
          "injectedScript",
        ],
      }),
      new HtmlWebpackPlugin({
        template: "./src/index.html",
        filename: "popup.html",
        excludeChunks: [
          "background",
          "blocklist",
          "ledgerGrant",
          "contentScripts",
          "injectedScript",
        ],
      }),
      new HtmlWebpackPlugin({
        template: "./src/index.html",
        filename: "blocklist.html",
        excludeChunks: [
          "background",
          "popup",
          "ledgerGrant",
          "contentScripts",
          "injectedScript",
        ],
      }),
      new HtmlWebpackPlugin({
        template: "./src/index.html",
        filename: "ledger-grant.html",
        excludeChunks: [
          "background",
          "popup",
          "blocklist",
          "contentScripts",
          "injectedScript",
        ],
      }),
      new WriteFilePlugin(),
      new webpack.EnvironmentPlugin(envDefaults),
      new BundleAnalyzerPlugin({
        analyzerMode: isEnvAnalyzer ? "server" : "disabled",
      }),
      new webpack.ProvidePlugin({
        process: "process/browser",
        Buffer: ["buffer", "Buffer"],
      }),
      new webpack.IgnorePlugin({ resourceRegExp: /^(fs|process)$/ }),
    ],
    experiments: {
      asyncWebAssembly: true,
    },
  };
};

module.exports = extensionConfig;
