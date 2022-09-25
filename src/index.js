import { initGlobalAPI } from "./globalAPI";
import { initMixin } from "./init";
import { initLifeCycle } from "./lifecycle";
import { initStateMixin } from "./state";

function Vue(options) {
  // options就是用户的选项
  this._init(options);
}

initMixin(Vue); // 扩展了init方法
initLifeCycle(Vue);
initGlobalAPI(Vue);
initStateMixin(Vue);

export default Vue;
