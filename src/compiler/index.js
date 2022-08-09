import { parseHTML } from "./parse";

export function compileToFunction(template) {
  // 1.将template转化成ast语法树
  let ast = parseHTML(template);
  console.log("🚀 ~ file: index.js ~ line 129 ~ compileToFunction ~ ast", ast);
  // 2.生成render方法（render方法执行后的返回结果就是虚拟DOM）
}
