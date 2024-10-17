import { createWebHistory, createRouter } from 'vue-router'

import index from '../view/index.vue';
import login from '../view/login_enroll/index.vue';

const routes = [
  { name:'index',path: '/', component: index},
  { name:'login',path: '/login', component: login}
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

export default router;