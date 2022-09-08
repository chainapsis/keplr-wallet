const path = require("path");

module.exports = {
  entry: path.resolve(__dirname, "./src/index.ts"),
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: "ts-loader",
        exclude: /node_modules/,
      },
    ],
  },
  resolve: {
    extensions: [".tsx", ".ts", ".js"],
  },
  output: {
    filename: "injected-provider.js",
    path: path.resolve(__dirname, "dist"),
  },
  devServer: {
    client: false,
    hot: false,
  },
};
