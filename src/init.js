import { initState } from "./state";
import { compileToFunction } from "./compiler";
import { callHook, mountComponent } from "./lifecycle";
import { mergeOptions } from "./utils";

export function initMixin(Vue) {
  Vue.prototype._init = function (options) {
    // vue vm.$options 就是获取用户的配置
    const vm = this;
    vm.$options = mergeOptions(this.constructor.options, options); // 将用户的选项挂载到实例上

    callHook(vm, "beforeCreate");

    // 初始化状态
    initState(vm);

    callHook(vm, "created");

    if (options.el) {
      vm.$mount(options.el); // 实现数据的挂载
    }
  };
  Vue.prototype.$mount = function (el) {
    const vm = this;
    el = document.querySelector(el);
    let ops = vm.$options;
    if (!ops.render) {
      // 先进行查找有没有render函数
      let template; // 没有render看一下是否写了template，没写template采用外部的template
      if (!ops.template && el) {
        // 没有写模版，但写了el
        template = el.outerHTML;
      } else {
        if (el) {
          template = ops.template; // 如果有el，则采用模版的内容
        }
      }
      if (template && el) {
        // 这里需要对模版进行编译
        const render = compileToFunction(template);
        ops.render = render;
      }
    }

    mountComponent(vm, el); // 组件的挂载
  };
}
