import Dep from "./dep";

let id = 0;

// 1）当我们创建渲染watcher的时候我们会把当前的渲染watcher放到Dep.target上
// 2）调用_render()会取值 走到get上
// 每个属性都有一个dep（属性就是被观察者，属性变化了会通知观察者来更新），watcher就是观察者 -> 观察者模式

class Watcher {
  constructor(vm, fn, options) {
    this.id = id++;
    this.renderWatcher = options; // 是一个渲染watcher
    this.getter = fn; // getter意味着调用这个函数可以发生取值操作
    this.deps = []; // 实现计算属性和一些清理工作需要用到
    this.depsId = new Set();
    this.get();
  }
  addDep(dep) {
    // 一个组件 对应多个属性 重复的属性不用记录
    let id = dep.id;
    if (!this.depsId.has(id)) {
      this.deps.push(dep);
      this.depsId.add(id);
      dep.addSub(this); // watcher已经记住了dep而且去重了，此时让dep也记住watcher
    }
  }
  get() {
    Dep.target = this; // 静态属性就是只有一份
    this.getter(); // 会去vm上取值 vm._update(vm._render)
    Dep.target = null; // 渲染完毕后就清空
  }
  update() {
    queueWatcher(this); // 把当前的watcher暂存起来
  }
  run() {
    this.get();
  }
}

let queue = [];
let has = {};
let pending = false;

function flushSchedulerQueue() {
  let flushQueue = queue.slice(0);
  queue = [];
  has = {};
  pending = false;
  flushQueue.forEach((q) => q.run()); // 在刷新的过程中可能还有新的watcher 重新放到queue中
}

function queueWatcher(watcher) {
  const id = watcher.id;
  if (!has[id]) {
    queue.push(watcher);
    has[id] = true;
    // 不管update执行多少次，最终只执行一轮刷新操作
    if (!pending) {
      nextTick(flushSchedulerQueue);
      pending = true;
    }
  }
}

let callbacks = [];
let waiting = false;
function flushCallbacks() {
  let cbs = callbacks.slice(0);
  waiting = false;
  callbacks = [];
  cbs.forEach((cb) => cb()); // 按照顺序依次执行
}

// nextTick没有直接使用某个api 而是采用优雅降级的方式
let timerFunc;
if (Promise) {
  timerFunc = () => {
    Promise.resolve().then(flushCallbacks);
  };
} else if (MutationObserver) {
  let observer = new MutationObserver(flushCallbacks); // 这里传入的回调是异步执行的
  let textNode = document.createTextNode(1);
  observer.observe(textNode, {
    characterData: true,
  });
  timerFunc = () => {
    textNode.textContent = 2;
  };
} else if (setImmediate) {
  timerFunc = () => {
    setImmediate(flushCallbacks);
  };
} else {
  timerFunc = () => {
    setTimeout(flushCallbacks);
  };
}

export function nextTick(cb) {
  callbacks.push(cb);
  if (!waiting) {
    timerFunc();
    waiting = true;
  }
}

export default Watcher;
