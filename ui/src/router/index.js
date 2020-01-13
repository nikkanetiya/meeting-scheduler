import Vue from 'vue';
import VueRouter from 'vue-router';
import Home from '../views/Home.vue';
import Events from '../views/Events.vue';
import Slots from '../views/Slots.vue';
import AddSlots from '../views/AddSlots.vue';
Vue.use(VueRouter);

const routes = [
  {
    path: '/',
    name: 'home',
    component: Home
  },
  {
    path: '/meetings',
    name: 'meetings',
    component: Events
  },
  {
    path: '/available-slots',
    name: 'available-slots',
    component: Slots
  },
  {
    path: '/add-slots',
    name: 'add-slots',
    component: AddSlots
  }
];

const router = new VueRouter({
  mode: 'history',
  routes
});

export default router;
