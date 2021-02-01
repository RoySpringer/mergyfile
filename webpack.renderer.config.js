const rules = require("./webpack.rules");
const plugins = require("./webpack.plugins");

rules.push({
  // test: /\.s[ac]ss$/i,
  test: /\.css$/i,
  use: [
    // Creates `style` nodes from JS strings
    "style-loader",
    // Translates CSS into CommonJS
    "css-loader",
    // Compiles Sass to CSS
    // "sass-loader",
  ],
});

rules.push({
  test: /\.svg$/,
  use: ["@svgr/webpack", "url-loader"],
});

// rules.push({
//   test: /\.(woff(2)?|ttf|eot|svg)(\?v=\d+\.\d+\.\d+)?$/,
//   use: [
//     {
//       loader: "file-loader",
//       options: {
//         name: "[name].[ext]",
//       },
//     },
//   ],
// });

// rules.push({
//   test: /\.(jpg|jpeg|png|gif|woff|woff2|eot|ttf|svg)$/,
//   use: [{ loader: "url-loader?limit=100000" }],
// });

module.exports = {
  module: {
    rules,
  },
  plugins: plugins,
  resolve: {
    extensions: [".js", ".ts", ".jsx", ".tsx", ".css"],
  },
};
