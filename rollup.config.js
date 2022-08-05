import babel from "rollup-plugin-babel";
import resolve from "@rollup/plugin-node-resolve";
export default {
  input: "./src/index.js", // 入口
  output: {
    file: "./dist/vue.js", // 出口
    name: "Vue", // 全局变量名 global.Vue
    format: "umd", // 打包格式
    sourcemap: true, // 是否生成 sourcemap
  },
  plugins: [
    babel({
      exclude: "node_modules/**", // 只编译src目录下的文件
    }),
    resolve(),
  ],
};
