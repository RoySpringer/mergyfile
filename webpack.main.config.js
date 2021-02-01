const path = require("path");
const CopyPlugin = require("copy-webpack-plugin");
const outputPath = path.resolve(__dirname, ".webpack/main");

module.exports = {
  /**
   * This is the main entry point for your application, it's the first file
   * that runs in the main process.
   */
  entry: "./src/index.ts",
  // Put your normal webpack config below here
  plugins: [
    new CopyPlugin({
      patterns: [
        {
          from: "./icon.png",
          to: path.resolve(outputPath, "assets"),
        },
      ],
    }),
  ],
  module: {
    rules: require("./webpack.rules"),
  },
  output: {
    path: outputPath,
  },
  resolve: {
    extensions: [".js", ".ts", ".jsx", ".tsx", ".css", ".json"],
  },
};
