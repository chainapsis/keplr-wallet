/* eslint-disable @typescript-eslint/no-var-requires */
const webpack = require("webpack");
const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const { CleanWebpackPlugin } = require("clean-webpack-plugin");
const ForkTsCheckerWebpackPlugin = require("fork-ts-checker-webpack-plugin");
const CopyWebpackPlugin = require("copy-webpack-plugin");
const WriteFilePlugin = require("write-file-webpack-plugin");

const isEnvDevelopment = process.env.NODE_ENV !== "production";

module.exports = (env, args) => {
  return {
    mode: isEnvDevelopment ? "development" : "production",
    // In development environment, turn on source map.
    devtool: isEnvDevelopment ? "inline-source-map" : false,
    // In development environment, webpack watch the file changes, and recompile
    watch: isEnvDevelopment,
    entry: {
      popup: ["./src/popup/popup.tsx"],
      background: ["./src/background/background.ts"]
    },
    output: {
      path: path.resolve(__dirname, "dist"),
      filename: "[name].bundle.js"
    },
    resolve: {
      extensions: [".ts", ".tsx", ".js", ".jsx", ".css", ".scss"],
      alias: {
        assets: path.resolve(__dirname, "public/assets")
      }
    },
    module: {
      rules: [
        {
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
        },
        { test: /\.tsx?$/, loader: "ts-loader" },
        {
          test: /\.(svg|png|jpe?g|gif)$/i,
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
        }
      ]
    },
    plugins: [
      // Remove all and write anyway
      // TODO: Optimizing build process
      new CleanWebpackPlugin(),
      new ForkTsCheckerWebpackPlugin(),
      new CopyWebpackPlugin(
        [{ from: "./public", to: "./", ignore: ["*.html", "assets/**/*"] }],
        { copyUnmodified: true }
      ),
      new HtmlWebpackPlugin({
        template: "./public/popup.html",
        filename: "popup.html",
        chunks: ["popup"]
      }),
      new WriteFilePlugin(),
      new webpack.EnvironmentPlugin(["NODE_ENV"])
    ]
  };
};
