import { isSameVnode } from "./index";

function createComponent(vnode) {
  let i = vnode.data;
  if ((i = i.hook) && (i = i.init)) {
    i(vnode); // 初始化组件
  }
  if (vnode.componentInstance) {
    return true;
  }
}

export function createElm(vnode) {
  let { tag, data, children, text } = vnode;
  if (typeof tag === "string") {
    // 创建真实元素也要区分是组件还是元素
    if (createComponent(vnode)) {
      // 是组件
      return vnode.componentInstance.$el;
    }

    vnode.el = document.createElement(tag);
    patchProps(vnode.el, {}, data);
    children.forEach((child) => {
      vnode.el.appendChild(createElm(child)); // 会将组件创建的元素插入到父元素中
    });
  } else {
    vnode.el = document.createTextNode(text);
  }
  return vnode.el;
}

export function patchProps(el, oldProps = {}, props = {}) {
  // 老的节点中有的样式，新的没有 要删除老的
  let oldStyles = oldProps.style || {};
  let newStyles = props.style || {};
  for (const key in oldStyles) {
    if (!newStyles[key]) {
      el.style[key] = "";
    }
  }

  // 老的节点中有的属性，新的没有 要删除老的
  for (const key in oldProps) {
    if (!props[key]) {
      el.removeAttribute(key);
    }
  }

  // 用新的覆盖掉老的
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

export function patch(oldVNode, newVNode) {
  if (!oldVNode) {
    // 组件的挂载
    return createElm(newVNode);
  }
  // 是否是真实节点(dom)，nodeType为dom上的原生属性
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
    // 1.两个节点不是同一个节点 直接删除老的换上新的
    // 2.两个节点是同一个节点（判断节点的tag和节点的key）比较两个节点的属性是否有差异（复用老的节点，将差异的属性更改）
    // 3.节点比较完毕后就需要比较两人的儿子
    return patchVnode(oldVNode, newVNode);
  }
}

function patchVnode(oldVNode, newVNode) {
  if (!isSameVnode(oldVNode, newVNode)) {
    // tag == tag   key == key
    // 用老节点的父亲进行替换
    let el = createElm(newVNode);
    oldVNode.el.parentNode.replaceChild(el, oldVNode.el);
    return el;
  }

  // 文本情况 比较一下文本的内容
  let el = (newVNode.el = oldVNode.el); // 复用老节点的元素
  if (!oldVNode.tag) {
    // 是文本
    if (oldVNode.text != newVNode.text) {
      el.textContent = newVNode.text; // 用新的文本覆盖掉老的
    }
  }

  // 是标签 比较标签的属性
  patchProps(el, oldVNode.data, newVNode.data);

  // 比较儿子节点 比较的时候一方有儿子 一方没有儿子
  // 或者两方都有儿子
  let oldChildren = oldVNode.children || [];
  let newChildren = newVNode.children || [];
  if (oldChildren.length > 0 && newChildren.length > 0) {
    // 完整的diff算法 需要比较两个人的儿子
    updateChildren(el, oldChildren, newChildren);
  } else if (newChildren.length > 0) {
    // 老的没有 新的有
    mountChildren(el, newChildren);
  } else if (oldChildren.length > 0) {
    // 新的没有 老的有 要删除
    el.innerHTML = "";
  }

  return el;
}

function mountChildren(el, newChildren) {
  for (let i = 0; i < newChildren.length; i++) {
    let child = newChildren[i];
    el.appendChild(createElm(child));
  }
}

function updateChildren(el, oldChildren, newChildren) {
  // 采用双指针的方式 比较两个节点
  let oldStartIndex = 0;
  let newStartIndex = 0;
  let oldEndIndex = oldChildren.length - 1;
  let newEndIndex = newChildren.length - 1;

  let oldStartVnode = oldChildren[0];
  let newStartVnode = newChildren[0];

  let oldEndVnode = oldChildren[oldEndIndex];
  let newEndVnode = newChildren[newEndIndex];

  function makeIndexByKey(children) {
    let map = {};
    children.forEach((child, index) => {
      map[child.key] = index;
    });
    return map;
  }
  let map = makeIndexByKey(oldChildren);

  while (oldStartIndex <= oldEndIndex && newStartIndex <= newEndIndex) {
    // 如果有节点为空则指向下一个
    if (!oldStartVnode) {
      oldStartVnode = oldChildren[++oldStartIndex];
    } else if (!oldEndVnode) {
      oldEndVnode = oldChildren[--oldEndIndex];
    }
    // 双方有一方头指针大于尾部指针则停止循环
    else if (isSameVnode(oldStartVnode, newStartVnode)) {
      // 比较 头头 节点
      patchVnode(oldStartVnode, newStartVnode); // 如果是相同节点 则递归比较子节点
      oldStartVnode = oldChildren[++oldStartIndex];
      newStartVnode = newChildren[++newStartIndex];
    } else if (isSameVnode(oldEndVnode, newEndVnode)) {
      // 比较 尾尾 节点
      patchVnode(oldEndVnode, newEndVnode); // 如果是相同节点 则递归比较子节点
      oldEndVnode = oldChildren[--oldEndIndex];
      newEndVnode = newChildren[--newEndIndex];
    } else if (isSameVnode(oldEndVnode, newStartVnode)) {
      // 比较 尾头 节点
      patchVnode(oldEndVnode, newStartVnode);
      el.insertBefore(oldEndVnode.el, oldStartVnode.el);
      oldEndVnode = oldChildren[--oldEndIndex];
      newStartVnode = newChildren[++newStartIndex];
    } else if (isSameVnode(oldStartVnode, newEndVnode)) {
      // 比较 头尾 节点
      patchVnode(oldStartVnode, newEndVnode);
      el.insertBefore(oldStartVnode.el, oldEndVnode.el.nextSibling);
      oldStartVnode = oldChildren[++oldStartIndex];
      newEndVnode = newChildren[--newEndIndex];
    } else {
      // 乱序比对
      // 根据老的列表做一个映射关系，用新的去找，如果找到则移动，找不到则添加，最后多余的老元素就删除
      let moveIndex = map[newStartVnode.key]; // 如果找到则说明是要移动的元素
      if (moveIndex !== undefined) {
        let moveVnode = oldChildren[moveIndex];
        el.insertBefore(moveVnode.el, oldStartVnode.el);
        oldChildren[moveIndex] = undefined; // 表示这个节点已经移动走了
        patchVnode(moveVnode, newStartVnode);
      } else {
        el.insertBefore(createElm(newStartVnode), oldStartVnode.el); // 找不到则添加一个新元素
      }
      newStartVnode = newChildren[++newStartIndex];
    }
  }

  // 多余的新节点插入进去
  if (newStartIndex <= newEndIndex) {
    for (let i = newStartIndex; i <= newEndIndex; i++) {
      let childEl = createElm(newChildren[i]);
      // 当前新的尾节点后面没有元素时 则为向后追加多余的新节点 如果有则向前追加多余的新节点
      let anchor = newChildren[newEndIndex + 1]
        ? newChildren[newEndIndex + 1].el
        : null; // 获取下一个元素
      el.insertBefore(childEl, anchor); // anchor为null时则为appendChild
    }
  }

  // 多余的老节点删除
  if (oldStartIndex <= oldEndIndex) {
    for (let i = oldStartIndex; i <= oldEndIndex; i++) {
      if (oldChildren[i]) {
        let childEl = oldChildren[i].el;
        el.removeChild(childEl);
      }
    }
  }
}
