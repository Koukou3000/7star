import Vue from 'vue';
import VueRouter from 'vue-router';
import { clearAllPendingRequests } from '../api';

Vue.use(VueRouter);

const routes = [
  {
    path: '/',
    redirect: '/plw/history'
  },
  {
    path: '/plw/history',
    name: 'History',
    component: () => import('@/views/History.vue') // 懒加载
  },
  {
    path: '/plw/pair',
    name: 'PairPredict',
    component: () => import('@/views/PairPredict.vue')
  },
  {
    path: '/plw/sym',
    name: 'SymPredict',
    component: () => import('@/views/SymPredict.vue')
  },
  {
    path: '/plw/repeat',
    name: 'RepeatPredict',
    component: () => import('@/views/RepeatPredict.vue')
  },
  {
    path: '/plw/sequence',
    name: 'SequencePredict',
    component: () => import('@/views/SequencePredict.vue')
  },
  {
    path: '/plw/combine',
    name: 'CombinePredict',
    component: () => import('@/views/CombinePredict.vue')
  }
];

const router = new VueRouter({
  mode: 'history', // 使用 HTML5 History 模式，URL 更美观
  routes
});

router.beforeEach((to, from, next) => {
  // 💡 只要不是第一次冷启动进站（from.path有值），并且用户确实切换到了不同的页面，就清除所有pending请求
  if(from.name && from.name !== to.name){
    clearAllPendingRequests('tab切换离开页面')
  }
  next()
})

export default router;