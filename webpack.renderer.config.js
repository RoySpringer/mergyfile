const path = require("path");
const rules = require("./webpack.rules");
const plugins = require("./webpack.plugins");
const ExtractCssChunks = require("extract-css-chunks-webpack-plugin");
const outputPath = path.resolve(__dirname, ".webpack/renderer");

rules.push({
  test: /\.css$/,
  use: [
    {
      loader: ExtractCssChunks.loader,
      options: {
        hmr: process.env.NODE_ENV === "development",
      },
    },
    "css-loader",
  ],
});
rules.push({
  test: /\.(ttf|eot)(\?v=\d+\.\d+\.\d+)?$/,
  use: [
    {
      loader: "file-loader",
    },
  ],
});

rules.push({
  test: /\.svg$/,
  use: ["@svgr/webpack", "url-loader"],
});

plugins.push(
  new ExtractCssChunks({
    // Options similar to the same options in webpackOptions.output
    // both options are optional
    filename: "[name].css",
    chunkFilename: "[id].css",
  })
);

module.exports = {
  output: {
    path: outputPath,
  },
  module: {
    rules,
  },
  plugins: plugins,
  resolve: {
    extensions: [".js", ".ts", ".jsx", ".tsx", ".css"],
  },
};
