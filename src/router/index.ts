import { createRouter, createWebHistory } from 'vue-router';

import VHome from '@/views/v-home.vue';
import VDeviceList from '@/views/v-device-list.vue';
import VSignin from '@/views/v-signin.vue';
import VSignup from '@/views/v-signup.vue';
import VSystemLogger from '@/views/v-system-logger.vue';
import VFileOTA from '@/views/v-file-ota.vue';
import VUserProfile from '@/views/v-user-profile.vue';
import VDeviceType from '@/views/v-device-type.vue';
import VTreeDma from '@/views/v-tree-dma.vue';
import VScada from '@/views/v-scada.vue';

import AppLayout from '@/layouts/AppLayout.vue';
import AuthLayout from '@/layouts/AuthLayout.vue';

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      component: AppLayout,
      children: [
        {
          path: '',
          name: 'home',
          component: VHome,
        },
        {
          path: 'device-list',
          name: 'device-list',
          component: VDeviceList,
        },
        {
          path: 'logger',
          name: 'system-logger',
          component: VSystemLogger,
        },
        {
          path: 'ota',
          name: 'file-ota',
          component: VFileOTA,
        },
        {
          path: 'profile',
          name: 'profile',
          component: VUserProfile,
        },
        {
          path: 'device-type',
          name: 'device-type',
          component: VDeviceType,
        },
        {
          path: 'tree-dma',
          name: 'tree-dma',
          component: VTreeDma,
        },
        {
          path: 'scada',
          name: 'scada',
          component: VScada,
        },
      ],
    },
    {
      path: '/auth',
      component: AuthLayout,
      children: [
        {
          path: 'signin',
          name: 'signin',
          component: VSignin,
        },
        {
          path: 'signup',
          name: 'signup',
          component: VSignup,
        },
      ],
    },
    {
      path: '/signin',
      redirect: '/auth/signin',
    },
    {
      path: '/signup',
      redirect: '/auth/signup',
    },
  ],
});

export default router;
