// 静态方法
const strategies = {};
const LIFECYCLE = ["beforeCreate", "created"];
LIFECYCLE.forEach((hook) => {
  strategies[hook] = function (p, c) {
    if (c) {
      // 如果儿子有 父亲有 让父亲和儿子拼在一起
      if (p) {
        return p.concat(c);
      } else {
        // 儿子有 父亲没有 将儿子包装成数组
        return [c];
      }
    } else {
      // 儿子没有 用父亲的
      return p;
    }
  };
});

export function mergeOptions(parent, child) {
  const options = {};
  for (const key in parent) {
    mergeField(key);
  }
  for (const key in child) {
    if (!parent.hasOwnProperty(key)) {
      mergeField(key);
    }
  }
  function mergeField(key) {
    // 策略模式 减少if-else
    if (strategies[key]) {
      options[key] = strategies[key](parent[key], child[key]);
    } else {
      options[key] = child[key] || parent[key]; // 优先采用儿子，在采用父亲
    }
  }
  return options;
}
