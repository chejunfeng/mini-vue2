import Watcher from "./observe/watcher";
import { createElementVNode, createTextVNode } from "./vdom";
function createElm(vnode) {
  let { tag, data, children, text } = vnode;
  if (typeof tag === "string") {
    vnode.el = document.createElement(tag);
    patchProps(vnode.el, data);
    children.forEach((child) => {
      vnode.el.appendChild(createElm(child));
    });
  } else {
    vnode.el = document.createTextNode(text);
  }
  return vnode.el;
}
function patchProps(el, props) {
  for (const key in props) {
    if (key == "style") {
      for (const styleName in props.style) {
        el.style[styleName] = props.style[styleName];
      }
    } else {
      el.setAttribute(key, props[key]);
    }
  }
}
function patch(oldVNode, newVNode) {
  const isRealElement = oldVNode.nodeType;
  if (isRealElement) {
    const elm = oldVNode; // 获取真实元素
    const parentElm = elm.parentNode; // 拿到父元素
    let newElm = createElm(newVNode);
    parentElm.insertBefore(newElm, elm.nextSibling); // 将新元素插入到老元素的后面
    parentElm.removeChild(elm); // 删除老元素
    return newElm;
  } else {
    // diff算法
  }
}
export function initLifeCycle(Vue) {
  Vue.prototype._update = function (vnode) {
    // 将vnode转化成真实dom
    const vm = this;
    const el = vm.$el;
    // patch既有初始化的功能 又有更新的逻辑
    vm.$el = patch(el, vnode);
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
