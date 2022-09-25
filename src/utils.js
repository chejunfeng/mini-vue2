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

strategies.components = function (parentVal, childVal) {
  const res = Object.create(parentVal);
  if (childVal) {
    for (const key in childVal) {
      // 返回的是构造的对象 可以拿到父亲原型上的属性 并且将儿子的都拷贝到自己身上
      res[key] = childVal[key];
    }
  }
  return res;
};

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
