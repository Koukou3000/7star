import Vue from 'vue'
import App from './views/Home.vue'
import store from './store';  // vuex

import ElementUI from 'element-ui';
import 'element-ui/lib/theme-chalk/index.css';


Vue.use(ElementUI);


Vue.config.productionTip = false

new Vue({
  el: '#app',
  store,
  render: h => h(App)
});