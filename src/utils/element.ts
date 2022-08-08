import Vue from "vue";
import WxContainer from "../components/HelloWorld.vue";
import { Message } from "element-ui";
import { Icon } from "element-ui";

//按需引入
const elemComponents = [{ name: "el-icon", component: Icon }];

//自己封装组件
const selfComponent = [{ name: "wx-container", component: WxContainer }];
selfComponent.forEach((item) => {
  Vue.component(item.name, item.component);
});
//element组件
elemComponents.forEach((item) => {
  Vue.component(item.name, item.component);
});
Vue.prototype.$message = Message;
