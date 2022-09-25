import Watcher from "./observe/watcher";
import { createElementVNode, createTextVNode } from "./vdom";
import { patch } from "./vdom/patch";

export function initLifeCycle(Vue) {
  Vue.prototype._update = function (vnode) {
    // 将vnode转化成真实dom
    const vm = this;
    const el = vm.$el;
    // patch既有初始化的功能 又有更新的逻辑
    const prevVnode = vm._vnode;
    vm._vnode = vnode; // 把组件第一次产生的虚拟节点保存到_vnode上
    if (prevVnode) {
      // 之前渲染过
      vm.$el = patch(prevVnode, vnode);
    } else {
      vm.$el = patch(el, vnode);
    }
  };
  // _c('div',{},...children);
  Vue.prototype._c = function () {
    return createElementVNode(this, ...arguments);
  };
  // _v(text)
  Vue.prototype._v = function () {
    return createTextVNode(this, ...arguments);
  };
  Vue.prototype._s = function (value) {
    if (typeof value !== "object") {
      return value;
    }
    return JSON.stringify(value);
  };
  Vue.prototype._render = function () {
    // 当渲染的时候会去实例中取值，可以将属性和视图绑定在一起
    return this.$options.render.call(this);
  };
}

export function mountComponent(vm, el) {
  vm.$el = el;
  // 1.调用render方法产生虚拟节点 虚拟DOM
  const updateComponent = () => {
    vm._update(vm._render());
  };

  const watcher = new Watcher(vm, updateComponent, true); // true用于标识是一个渲染watcher
  // 2.根据虚拟DOM产生真实DOM
  // 3.插入到el元素中
}

// Vue的核心流程
// 1）创造响应式数据
// 2）模版转换成ast语法树
// 3）将ast语法树转换成render函数
// 4）执行render函数会产生虚拟节点（使用响应式数据）
// 5) 根据生成的虚拟节点创造真实的DOM
// 后续每次数据更新可以只执行render函数（无需再次执行ast转化的过程）

export function callHook(vm, hook) {
  const handlers = vm.$options[hook];
  if (handlers) {
    handlers.forEach((handler) => handler.call(vm));
  }
}
