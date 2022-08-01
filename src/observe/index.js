import newArrayProto from "./array";
class Observer {
  constructor(data) {
    data.__ob__ = this; // 给数据加了一个标识，如果数据上有__ob__则说明这个属性被观测过了
    // Object.defineProperty只能劫持已经存在的属性（Vue里面会为此单独写一些api $set $delete）
    if (Array.isArray(data)) {
      // 这里我们可以重写数组中的变异方法
      // 7个变异方法 push pop shift unshift splice reverse sort 是可以修改数组本身的
      data.__proto__ = newArrayProto; // 需要保留数组原有的特性，并且可以重写部分方法
      this.observeArray(data);
    } else {
      this.walk(data);
    }
  }
  walk(data) {
    // 循环对象 对属性依次劫持
    // 重新定义属性（存在性能问题，Vue3使用proxy解决）
    Object.keys(data).forEach((key) => defineReactive(data, key, data[key]));
  }
  observeArray(data) {
    // 观测数组
    // 如果数组中放的是对象 也可以监控到对象的变化
    data.forEach((item) => observe(item));
  }
}

export function defineReactive(target, key, value) {
  observe(value); // 对所有的对象都进行属性劫持
  // 闭包 属性劫持
  Object.defineProperty(target, key, {
    get() {
      return value;
    },
    set(newValue) {
      if (newValue === value) return;
      // 用户设置的值也需要进行代理（存在将原属性值设置为新对象的情况）
      observe(newValue);
      value = newValue;
    },
  });
}

export function observe(data) {
  // 对这个对象进行劫持
  if (typeof data !== "object" || data == null) {
    return; // 只对对象进行劫持
  }
  if (data.__ob__ instanceof Observer) {
    // 说明这个对象被代理过了
    return data.__ob__;
  }
  // 如果一个对象被劫持过了，那就不需要再被劫持了（要判断一个对象是否被劫持过，可以增添一个实例，用实例来判断是否被劫持过）
  return new Observer(data);
}
