import Vue from 'vue'
import VueRouter from 'vue-router'
import { routes } from './routes'

Vue.use(VueRouter)

export const router = new VueRouter({
  routes: [
    {
      path: '/',
      name: routes.home.name,
      component: () => import('../pages/Home.vue')
    },
    {
      path: '/tradeSettings',
      name: routes.notification.name,
      component: () => import('../pages/Notification.vue')
    },
    {
      path: '/securitySettings',
      name: routes.securitySettings.name,
      component: () => import('../pages/SecuritySettings.vue')
    },
    {
      path: '/tradeSettings',
      name: routes.tradeSettings.name,
      component: () => import('../pages/TradeSettings.vue')
    },
    {
      path: '/about',
      name: routes.about.name,
      component: () => import('../pages/About.vue')
    },
  ],
})
