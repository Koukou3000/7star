import Vue from 'vue'
import App from './views/Home.vue'
import store from './store';  // vuex
import router from './router'

// import ElementUI from 'element-ui';
import 'element-ui/lib/theme-chalk/index.css';
import {
  Tabs, TabPane,
  Row, Col, Input, Button, Loading,
  Checkbox,
  CheckboxButton,
  CheckboxGroup} from 'element-ui'
  

Vue.use(Tabs);
Vue.use(TabPane);
Vue.use(Row);
Vue.use(Col);
Vue.use(Input);
Vue.use(Button);
Vue.use(Loading);
Vue.use(Checkbox);
Vue.use(CheckboxButton);
Vue.use(CheckboxGroup);



Vue.config.productionTip = false

new Vue({
  el: '#app',
  store,
  router,
  render: h => h(App)
});