/* eslint-disable @typescript-eslint/no-var-requires */
const webpack = require("webpack");
const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const ForkTsCheckerWebpackPlugin = require("fork-ts-checker-webpack-plugin");
const CopyWebpackPlugin = require("copy-webpack-plugin");
const BundleAnalyzerPlugin =
  require("webpack-bundle-analyzer").BundleAnalyzerPlugin;
const fs = require("fs");

const isBuildManifestV2 = process.env.BUILD_MANIFEST_V2 === "true";

const isEnvDevelopment = process.env.NODE_ENV !== "production";
const isDisableSplitChunks = process.env.DISABLE_SPLIT_CHUNKS === "true";
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
  DEV_AUTH_CLIENT_ID: process.env["DEV_AUTH_CLIENT_ID"] || "",
  PROD_AUTH_CLIENT_ID: process.env["PROD_AUTH_CLIENT_ID"] || "",
};
const commonResolve = () => ({
  extensions: [".ts", ".tsx", ".js", ".jsx", ".css", ".scss", ".svg", ".wasm"],
  alias: {
    "@new-components": path.resolve(__dirname, "src/new-components"),
    "@new-layouts": path.resolve(__dirname, "src/new-layouts"),
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
  test: /\.(svg|png|webm|mp4|jpe?g|gif|woff|woff2|eot|ttf)$/i,
  type: "asset/resource",
  generator: {
    filename: "assets/[name][ext]",
  },
};
const wasmRule = {
  test: /\.wasm$/,
  type: "webassembly/async", // or 'webassembly/sync' for sync modules
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
      path: path.resolve(
        __dirname,
        isEnvDevelopment ? "dist" : process.env.BUILD_OUTPUT || "build/default"
      ),
      filename: "[name].bundle.js",
    },
    optimization: {
      splitChunks: {
        chunks(chunk) {
          if (isDisableSplitChunks) {
            return false;
          }

          const servicePackages = ["contentScripts", "injectedScript"];

          if (!isBuildManifestV2) {
            servicePackages.push("background");
          }

          return !servicePackages.includes(chunk.name);
        },
        cacheGroups: {
          ...(() => {
            const res = {
              popup: {
                maxSize: 3_000_000,
                maxInitialRequests: 100,
                maxAsyncRequests: 100,
              },
              register: {
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
            };

            if (isBuildManifestV2) {
              res.background = {
                maxSize: 3_000_000,
                maxInitialRequests: 100,
                maxAsyncRequests: 100,
              };
            }

            return res;
          })(),
        },
      },
    },
    resolve: {
      ...commonResolve(),
      ...altResolve(),
      fallback: {
        os: require.resolve("os-browserify/browser"),
        buffer: require.resolve("buffer/"),
        http: require.resolve("stream-http"),
        https: require.resolve("https-browserify"),
        crypto: require.resolve("crypto-browserify"),
        stream: require.resolve("stream-browserify"),
        process: require.resolve("process/browser"),
        path: require.resolve("path-browserify"),
        zlib: require.resolve("browserify-zlib"),
        fs: false,
        assert: require.resolve("assert"),
        url: require.resolve("url"),
      },
    },
    module: {
      rules: [
        sassRule,
        tsRule,
        fileRule,
        wasmRule,
        {
          test: /\.m?js/,
          resolve: {
            fullySpecified: false,
          },
        },
        {
          test: /\.css$/,
          exclude: /swiper-bundle\.min\.css/,
          use: ["style-loader", "css-loader"],
        },
      ],
    },
    plugins: [
      new webpack.ProvidePlugin({
        process: "process/browser",
        Buffer: ["buffer", "Buffer"],
      }),
      new webpack.EnvironmentPlugin(envDefaults),
      new ForkTsCheckerWebpackPlugin(),
      new CopyWebpackPlugin({
        patterns: [
          ...(() => {
            if (isBuildManifestV2) {
              return [
                {
                  from: "./src/manifest.v2.json",
                  to: "./manifest.json",
                },
              ];
            }

            return [
              {
                from: "./src/manifest.v3.json",
                to: "./manifest.json",
              },
            ];
          })(),
          {
            from: "../../node_modules/webextension-polyfill/dist/browser-polyfill.js",
            to: "./",
          },
        ],
      }),
      new HtmlWebpackPlugin({
        template: "./src/index.html",
        filename: "popup.html",
        chunks: ["popup"],
      }),
      new HtmlWebpackPlugin({
        template: "./src/index.html",
        filename: "blocklist.html",
        chunks: ["blocklist"],
      }),
      new HtmlWebpackPlugin({
        template: "./src/index.html",
        filename: "ledger-grant.html",
        chunks: ["ledgerGrant"],
      }),
      ...(() => {
        if (isBuildManifestV2) {
          return [
            new HtmlWebpackPlugin({
              template: "./src/background.html",
              filename: "background.html",
              chunks: ["background"],
            }),
          ];
        }

        return [];
      })(),
      new BundleAnalyzerPlugin({
        analyzerMode: isEnvAnalyzer ? "server" : "disabled",
      }),
    ],
    experiments: {
      asyncWebAssembly: true,
    },
  };
};

module.exports = extensionConfig;
