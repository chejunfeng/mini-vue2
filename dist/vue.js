(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
  typeof define === 'function' && define.amd ? define(factory) :
  (global = typeof globalThis !== 'undefined' ? globalThis : global || self, global.Vue = factory());
})(this, (function () { 'use strict';

  function _typeof(obj) {
    "@babel/helpers - typeof";

    return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (obj) {
      return typeof obj;
    } : function (obj) {
      return obj && "function" == typeof Symbol && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
    }, _typeof(obj);
  }

  function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
  }

  function _defineProperties(target, props) {
    for (var i = 0; i < props.length; i++) {
      var descriptor = props[i];
      descriptor.enumerable = descriptor.enumerable || false;
      descriptor.configurable = true;
      if ("value" in descriptor) descriptor.writable = true;
      Object.defineProperty(target, descriptor.key, descriptor);
    }
  }

  function _createClass(Constructor, protoProps, staticProps) {
    if (protoProps) _defineProperties(Constructor.prototype, protoProps);
    if (staticProps) _defineProperties(Constructor, staticProps);
    Object.defineProperty(Constructor, "prototype", {
      writable: false
    });
    return Constructor;
  }

  // 重写数组中的变异方法
  var oldArrayProto = Array.prototype; // 获取数组的原型
  // newArrayProto.__proto__ = oldArrayProto

  var newArrayProto = Object.create(oldArrayProto);
  var methods = ["push", "pop", "shift", "unshift", "splice", "reverse", "sort"];
  methods.forEach(function (method) {
    newArrayProto[method] = function () {
      var _oldArrayProto$method;

      for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
      }

      var result = (_oldArrayProto$method = oldArrayProto[method]).call.apply(_oldArrayProto$method, [this].concat(args)); // 内部调用原来的方法，函数的劫持，aop编程
      // 我们需要对新增的数据再次进行劫持


      var inserted;
      var ob = this.__ob__;

      switch (method) {
        case "push":
        case "unshift":
          inserted = args;
          break;

        case "splice":
          inserted = args.splice(2);
      } // 对新增的内容再次进行观测


      if (inserted) {
        ob.observeArray(inserted);
      }

      return result;
    };
  });

  var Observer = /*#__PURE__*/function () {
    function Observer(data) {
      _classCallCheck(this, Observer);

      // 给数据加了一个标识，如果数据上有__ob__则说明这个属性被观测过了
      Object.defineProperty(data, "__ob__", {
        value: this,
        enumerable: false // 将__ob__变成不可枚举（循环的时候无法获取到）

      }); // Object.defineProperty只能劫持已经存在的属性（Vue里面会为此单独写一些api $set $delete）

      if (Array.isArray(data)) {
        // 这里我们可以重写数组中的变异方法
        // 7个变异方法 push pop shift unshift splice reverse sort 是可以修改数组本身的
        data.__proto__ = newArrayProto; // 需要保留数组原有的特性，并且可以重写部分方法

        this.observeArray(data);
      } else {
        this.walk(data);
      }
    }

    _createClass(Observer, [{
      key: "walk",
      value: function walk(data) {
        // 循环对象 对属性依次劫持
        // 重新定义属性（存在性能问题，Vue3使用proxy解决）
        Object.keys(data).forEach(function (key) {
          return defineReactive(data, key, data[key]);
        });
      }
    }, {
      key: "observeArray",
      value: function observeArray(data) {
        // 观测数组
        // 如果数组中放的是对象 也可以监控到对象的变化
        data.forEach(function (item) {
          return observe(item);
        });
      }
    }]);

    return Observer;
  }();

  function defineReactive(target, key, value) {
    observe(value); // 对所有的对象都进行属性劫持
    // 闭包 属性劫持

    Object.defineProperty(target, key, {
      get: function get() {
        return value;
      },
      set: function set(newValue) {
        if (newValue === value) return; // 用户设置的值也需要进行代理（存在将原属性值设置为新对象的情况）

        observe(newValue);
        value = newValue;
      }
    });
  }
  function observe(data) {
    // 对这个对象进行劫持
    if (_typeof(data) !== "object" || data == null) {
      return; // 只对对象进行劫持
    }

    if (data.__ob__ instanceof Observer) {
      // 说明这个对象被代理过了
      return data.__ob__;
    } // 如果一个对象被劫持过了，那就不需要再被劫持了（要判断一个对象是否被劫持过，可以增添一个实例，用实例来判断是否被劫持过）


    return new Observer(data);
  }

  function initState(vm) {
    var opts = vm.$options; // 获取用户的配置

    if (opts.data) {
      initData(vm);
    }
  }

  function proxy(vm, target, key) {
    Object.defineProperty(vm, key, {
      get: function get() {
        return vm[target][key];
      },
      set: function set(newValue) {
        vm[target][key] = newValue;
      }
    });
  }

  function initData(vm) {
    var data = vm.$options.data; // data可能是函数或对象

    data = typeof data === "function" ? data.call(vm) : data; // data是用户返回的对象

    vm._data = data; // 将返回的对象放到_data上
    // 对数据进行劫持 vue2 里采用了Object.defineProperty

    observe(data); // 将vm._data用vm来代理就可以了

    for (var key in data) {
      proxy(vm, "_data", key);
    }
  }

  function compileToFunction(template) {// 1.将template转化成ast语法树
    // 2.生成render方法（render方法执行后的返回结果就是虚拟DOM）
  }

  function initMixin(Vue) {
    Vue.prototype._init = function (options) {
      // vue vm.$options 就是获取用户的配置
      var vm = this;
      vm.$options = options; // 将用户的选项挂载到实例上
      // 初始化状态

      initState(vm);

      if (options.el) {
        vm.$mount(options.el); // 实现数据的挂载
      }
    };

    Vue.prototype.$mount = function (el) {
      var vm = this;
      el = document.querySelector(el);
      var ops = vm.$options;

      if (!ops.render) {
        // 先进行查找有没有render函数
        var template; // 没有render看一下是否写了template，没写template采用外部的template

        if (!ops.template && el) {
          // 没有写模版，但写了el
          template = el.outerHTML;
        } else {
          if (el) {
            template = ops.template; // 如果有el，则采用模版的内容
          }
        }

        if (template) {
          // 这里需要对模版进行编译
          var render = compileToFunction();
          ops.render = render;
        }
      }

      ops.render; // 最终就可以获取render方法
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
