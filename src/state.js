export function initState(vm) {
    const opts = vm.$options; // 获取用户的配置
    if (opts.data) {
        initData(vm);
    }
}

function initData(vm) {
    let data = vm.$options.data; // data可能是函数或对象
    data = typeof data === 'function' ? data.call(vm) : data;
}