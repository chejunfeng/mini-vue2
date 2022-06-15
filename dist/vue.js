(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
    typeof define === 'function' && define.amd ? define(factory) :
    (global = typeof globalThis !== 'undefined' ? globalThis : global || self, global.Vue = factory());
})(this, (function () { 'use strict';

    function initState(vm) {
      var opts = vm.$options; // 获取用户的配置

      if (opts.data) {
        initData(vm);
      }
    }

    function initData(vm) {
      var data = vm.$options.data; // data可能是函数或对象

      data = typeof data === 'function' ? data.call(vm) : data;
    }

    function initMixin(Vue) {
      Vue.prototype._init = function (options) {
        // vue vm.$options 就是获取用户的配置
        var vm = this;
        vm.$options = options; // 将用户的选项挂载到实例上
        // 初始化状态

        initState(vm);
      };
    }

    function Vue(options) {
      // options就是用户的选项
      this._init(options);
    }

    initMixin(Vue); // 扩展了init方法

    return Vue;

}));
//# sourceMappingURL=vue.js.map
