import VueRouter from 'vue-router';

Vue.use(VueRouter);

import { Main,Page } from '../controller/demo/index';

//路由设置
const routes = [{
        path: '/',
        component: Main,
        name: Main.name
    }, {
        path: '/page',
        component: Page,
        name: Page.name
    }];

//创建路由
const router = new VueRouter({
    base: __dirname,
    routes
})

//全局跳转配置
router.beforeEach((to, from, next) => {
    next();
})

export function createRouter () {
  return router;
}
