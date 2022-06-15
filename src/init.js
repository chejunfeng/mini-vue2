import { initState } from "./state";

export function initMixin(Vue) {
    Vue.prototype._init = function (options) {
        // vue vm.$options 就是获取用户的配置
        const vm = this;
        vm.$options = options; // 将用户的选项挂载到实例上

        // 初始化状态
        initState(vm);
    }
}