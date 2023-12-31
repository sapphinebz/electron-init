import type { Configuration } from "webpack";
import { DefinePlugin } from "webpack";
import { rules } from "./webpack.rules";
import path from "node:path";
import CopyWebpackPlugin from "copy-webpack-plugin";
const modulePath = path.resolve(__dirname, "dist_utility/utility_process");

export const mainConfig: Configuration = {
  /**
   * This is the main entry point for your application, it's the first file
   * that runs in the main process.
   */
  entry: ["./src/index.ts"],

  // Put your normal webpack config below here
  module: {
    rules,
  },
  resolve: {
    extensions: [".js", ".ts", ".jsx", ".tsx", ".css", ".json"],
  },
  plugins: [
    new DefinePlugin({
      UTILITY_PROCESS_MODULE_PATH: JSON.stringify(modulePath),
    }),
    new CopyWebpackPlugin({
      patterns: [
        {
          from: path.resolve(__dirname, "src", "ipc-main", "assets"),
          to: path.resolve(__dirname, ".webpack/main", "assets"),
        },
      ],
    }),
  ],
};
