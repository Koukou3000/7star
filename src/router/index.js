import Vue from 'vue';
import VueRouter from 'vue-router';
import { cancelAllPendingRequests } from '@/api/requestManager';
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
  cancelAllPendingRequests('切换路由') 
  next()
})

export default router;