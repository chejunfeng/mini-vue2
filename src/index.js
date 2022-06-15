import { initMixin } from "./init";

function Vue(options) { // options就是用户的选项
    this._init(options);
}

initMixin(Vue); // 扩展了init方法

export default Vue;