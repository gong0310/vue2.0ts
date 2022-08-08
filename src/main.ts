import Vue from "vue";
import App from "./App.vue";
import router from "./router";
import store from "./store";
import "./style/theme/index.css";
// import ElementUI from "element-ui";
import "babel-polyfill";
import VueCookies from "vue-cookies";

Vue.config.productionTip = false;

// Vue.use(ElementUI);
Vue.use(VueCookies);
Vue.prototype.$bus = "自定义";

new Vue({
  router,
  store,
  render: (h) => h(App),
}).$mount("#app");
