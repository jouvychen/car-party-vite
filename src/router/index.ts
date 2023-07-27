/* eslint-disable @typescript-eslint/ban-ts-comment */
import { createRouter, createWebHashHistory, RouteRecordRaw } from 'vue-router';
import type { App } from 'vue';
import notFound from '@/components/Exception/index.vue';
// import systemModule from './modules/systemModule'; // 系统管理

export const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    meta: {
      title: '首页',
    },
    name: 'index',
    redirect: '/home',
    component: () => import(/* webpackChunkName: "about" */ '../views/index.vue'),
    children: [
      {
        path: '/home',
        name: 'home',
        meta: {
          title: '首页',
        },
        component: () => import(/* webpackChunkName: "about" */ '@/views/home/index.vue'),
      },
      {
        path: '/lamborghini',
        name: 'lamborghini',
        meta: {
          title: 'Lamborghini',
          keepAlive: true,
        },
        component: () => import(/* webpackChunkName: "about" */ '@/views/lamborghini/index.vue'),
      },
    ],
  },
  {
    path: '/svg-button',
    name: 'SvgButton',
    meta: {
      title: 'svg按钮',
    },
    component: () => import(/* webpackChunkName: "about" */ '@/views/iframe-components/index.vue'),
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'notFound',
    component: notFound, // 引入 组件
  },
];

const router = createRouter({
  history: createWebHashHistory(),
  routes,
});

export default router;
