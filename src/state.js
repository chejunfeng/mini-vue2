import { observe } from "./observe/index";

export function initState(vm) {
  const opts = vm.$options; // 获取用户的配置
  if (opts.data) {
    initData(vm);
  }
}

function proxy(vm, target, key) {
  Object.defineProperty(vm, key, {
    get() {
      return vm[target][key];
    },
    set(newValue) {
      vm[target][key] = newValue;
    },
  });
}

function initData(vm) {
  let data = vm.$options.data; // data可能是函数或对象
  data = typeof data === "function" ? data.call(vm) : data; // data是用户返回的对象

  vm._data = data; // 将返回的对象放到_data上
  // 对数据进行劫持 vue2 里采用了Object.defineProperty
  observe(data);
  // 将vm._data用vm来代理就可以了
  for (const key in data) {
    proxy(vm, "_data", key);
  }
}
