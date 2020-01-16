/* eslint-disable @typescript-eslint/no-var-requires */
const webpack = require("webpack");
const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const { CleanWebpackPlugin } = require("clean-webpack-plugin");
const ForkTsCheckerWebpackPlugin = require("fork-ts-checker-webpack-plugin");
const CopyWebpackPlugin = require("copy-webpack-plugin");
const WriteFilePlugin = require("write-file-webpack-plugin");

const isEnvDevelopment = process.env.NODE_ENV !== "production";
const commonResolve = dir => ({
  extensions: [".ts", ".tsx", ".js", ".jsx", ".css", ".scss"],
  alias: {
    assets: path.resolve(__dirname, dir)
  }
});
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
              localIdentName: "[local]-[hash:base64]"
            },
            localsConvention: "camelCase"
          }
        },
        "sass-loader"
      ]
    },
    {
      use: [
        "style-loader",
        { loader: "css-loader", options: { modules: false } },
        "sass-loader"
      ]
    }
  ]
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
        outputPath: "assets"
      }
    }
  ]
};

const extensionConfig = (env, args) => {
  return {
    name: "extension",
    mode: isEnvDevelopment ? "development" : "production",
    // In development environment, turn on source map.
    devtool: isEnvDevelopment ? "inline-source-map" : false,
    // In development environment, webpack watch the file changes, and recompile
    watch: isEnvDevelopment,
    entry: {
      popup: ["./src/ui/popup/popup.tsx"],
      background: ["./src/background/background.ts"],
      contentScripts: ["./src/content-scripts/content-scripts.ts"],
      injectedScript: ["./src/content-scripts/inject/injected-script.ts"]
    },
    output: {
      path: path.resolve(
        __dirname,
        isEnvDevelopment ? "dist/extension" : "prod/extension"
      ),
      filename: "[name].bundle.js"
    },
    resolve: commonResolve("src/ui/popup/public/assets"),
    module: {
      rules: [sassRule, tsRule, fileRule]
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
            to: "./"
          }
        ],
        { copyUnmodified: true }
      ),
      new HtmlWebpackPlugin({
        template: "./src/popup.html",
        filename: "popup.html",
        chunks: ["popup"]
      }),
      new WriteFilePlugin(),
      new webpack.EnvironmentPlugin(["NODE_ENV"])
    ]
  };
};

const webConfig = (env, args) => {
  return {
    name: "web",
    mode: isEnvDevelopment ? "development" : "production",
    // In development environment, turn on source map.
    devtool: isEnvDevelopment ? "inline-source-map" : false,
    // In development environment, webpack watch the file changes, and recompile
    watch: isEnvDevelopment,
    devServer: {
      port: 8081
    },
    entry: {
      main: ["./src/ui/web/web.tsx"]
    },
    output: {
      path: path.resolve(__dirname, isEnvDevelopment ? "dist/web" : "prod/web"),
      filename: "[name].bundle.js"
    },
    resolve: commonResolve("src/ui/web/public/assets"),
    module: {
      rules: [sassRule, tsRule, fileRule]
    },
    plugins: [
      new ForkTsCheckerWebpackPlugin(),
      new HtmlWebpackPlugin({
        template: "./src/web.html",
        filename: "index.html",
        chunks: ["main"]
      }),
      new webpack.EnvironmentPlugin(["NODE_ENV"])
    ]
  };
};

module.exports = [extensionConfig, webConfig];
