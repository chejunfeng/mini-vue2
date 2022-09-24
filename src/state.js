import Dep from "./observe/dep";
import { observe } from "./observe/index";
import Watcher, { nextTick } from "./observe/watcher";

export function initState(vm) {
  const opts = vm.$options; // 获取用户的配置
  if (opts.data) {
    initData(vm);
  }
  if (opts.computed) {
    initComputed(vm);
  }
  if (opts.watch) {
    initWatch(vm);
  }
}

function initWatch(vm) {
  let watch = vm.$options.watch;
  for (const key in watch) {
    const handler = watch[key];
    if (Array.isArray(handler)) {
      for (let i = 0; i < handler.length; i++) {
        createWatcher(vm, key, handler[i]);
      }
    } else {
      createWatcher(vm, key, handler);
    }
  }
}

function createWatcher(vm, key, handler) {
  if (typeof handler === "string") {
    handler = vm[handler];
  }
  return vm.$watch(key, handler);
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

function initComputed(vm) {
  const computed = vm.$options.computed;
  const watchers = (vm._computedWatchers = {}); // 将计算属性watcher保存到vm上
  for (const key in computed) {
    let userDef = computed[key];
    // 需要监控计算属性中get的变化
    const fn = typeof userDef == "function" ? userDef : userDef.get;
    watchers[key] = new Watcher(vm, fn, { lazy: true });
    defineComputed(vm, key, userDef);
  }
}

export function initStateMixin(Vue) {
  Vue.prototype.$nextTick = nextTick;
  Vue.prototype.$watch = function (exprOrFn, cb) {
    new Watcher(this, exprOrFn, { user: true }, cb);
  };
}

function defineComputed(target, key, userDef) {
  const setter = userDef.set || (() => {});
  Object.defineProperty(target, key, {
    get: createComputedGetter(key),
    set: setter,
  });
}

// 计算属性根本不会收集依赖，只会让自己的依赖属性去收集依赖
function createComputedGetter(key) {
  return function () {
    const watcher = this._computedWatchers[key]; // 获取对应属性的watcher
    if (watcher.dirty) {
      // 如果是脏的就去执行用户传入的函数
      watcher.evaluate(); // 求值后dirty变为了false，下次就不求值了
    }
    if (Dep.target) {
      // 计算属性出栈后还要渲染watcher，应该让计算属性watcher里面的属性也去收集上一层watcher
      watcher.depend();
    }
    return watcher.value;
  };
}
