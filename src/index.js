import { initGlobalAPI } from "./globalAPI";
import { initMixin } from "./init";
import { initLifeCycle } from "./lifecycle";
import { initStateMixin } from "./state";

import { compileToFunction } from "./compiler";
import { createElm, patch } from "./vdom/patch";

function Vue(options) {
  // options就是用户的选项
  this._init(options);
}

initMixin(Vue); // 扩展了init方法
initLifeCycle(Vue);
initGlobalAPI(Vue);
initStateMixin(Vue);

let render1 = compileToFunction(`<ul>
<li key="4">4</li>
<li key="1">1</li>
<li key="2">2</li>
<li key="3">3</li>
</ul>`);
let vm1 = new Vue({ data: { name: "test" } });
let prevVnode = render1.call(vm1);

let el = createElm(prevVnode);
document.body.appendChild(el);

let render2 = compileToFunction(`<ul>
<li key="1">1</li>
<li key="2">2</li>
<li key="3">3</li>
</ul>`);
let vm2 = new Vue({ data: { name: "test12" } });
let nextVnode = render2.call(vm2);

setTimeout(() => {
  patch(prevVnode, nextVnode);
  // let newEl = createElm(nextVnode);
  // el.parentNode.replaceChild(newEl, el);
}, 4000);

export default Vue;
