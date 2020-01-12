import Vue from 'vue';
import VueRouter from 'vue-router';
import Home from '../views/Home.vue';
import Events from '../views/Events.vue';
import Slots from '../views/Slots.vue';
Vue.use(VueRouter);

const routes = [
  {
    path: '/',
    name: 'home',
    component: Home
  },
  {
    path: '/events',
    name: 'events',
    component: Events
  },
  {
    path: '/slots',
    name: 'slots',
    component: Slots
  }
];

const router = new VueRouter({
  mode: 'history',
  routes
});

export default router;
