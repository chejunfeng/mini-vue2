// 重写数组中的变异方法
let oldArrayProto = Array.prototype; // 获取数组的原型

// newArrayProto.__proto__ = oldArrayProto
export let newArrayProto = Object.create(oldArrayProto);

let methods = ["push", "pop", "shift", "unshift", "splice", "reverse", "sort"];

methods.forEach((method) => {
  newArrayProto[method] = function (...args) {
    const result = oldArrayProto[method].call(this, ...args); // 内部调用原来的方法，函数的劫持，aop编程
    // 我们需要对新增的数据再次进行劫持
    let inserted;
    let ob = this.__ob__;
    switch (method) {
      case "push":
      case "unshift":
        inserted = args;
        break;
      case "splice":
        inserted = args.splice(2);
      default:
        break;
    }
    // 对新增的内容再次进行观测
    if (inserted) {
      ob.observeArray(inserted);
    }
    return result;
  };
});
