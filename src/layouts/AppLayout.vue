<template>
  <el-container>
    <!-- area: side left side menu -->
    <el-aside>
      <el-menu router>
        <el-menu-item v-for="(item, index) in sideMenuItems" :key="index" :index="item.route">
          <i :class="item.icon" class="leading-none"></i>
          <span>{{ item.title }}</span>
        </el-menu-item>
      </el-menu>
    </el-aside>

    <el-container>
      <!-- area: right side menu -->
      <el-header class="text-right">
        <div class="inline-flex items-center justify-center h-full">
          <el-dropdown size="large" placement="bottom-end" @command="handleCommand">
            <el-button size="large">
              <i class="fi fi-rr-user mr-1 leading-none"></i>
              <span>Chào bạn - {{ 'Miru' }}</span>
            </el-button>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item v-for="(item, index) in userMenuItems" :key="index" :command="item.action">
                  <i :class="item.icon" class="mr-1 leading-none"></i>
                  {{ item.title }}
                </el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </el-header>

      <el-main>
        <!-- Router view to render child routes -->
        <router-view />
      </el-main>
    </el-container>
  </el-container>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();

// Define the side menu items with title, route, and icon
const sideMenuItems = ref([
  {
    title: 'Tổng quan hệ thống',
    route: '/',
    icon: 'fi fi-rr-dashboard'
  },
  {
    title: 'Danh sách thiết bị',
    route: '/device-list',
    icon: 'fi fi-rr-list'
  },
  {
    title: 'Hệ thống logger',
    route: '/logger',
    icon: 'fi fi-rr-chart-histogram'
  },
  {
    title: 'File OTA',
    route: '/ota',
    icon: 'fi fi-rr-file-code'
  }
]);

// Define the user dropdown menu items with title, icon and action
const userMenuItems = ref([
  {
    title: 'Thông tin cá nhân',
    icon: 'fi fi-rr-user',
    action: 'profile'
  },
  {
    title: 'Đăng xuất',
    icon: 'fi fi-rr-exit',
    action: 'logout'
  }
]);

// Handle dropdown menu actions
const handleCommand = (command: string) => {
  switch (command) {
    case 'profile':
      router.push('/profile');
      break;
    case 'logout':
      // Add logout logic here
      router.push('/auth/signin');
      break;
    default:
      break;
  }
};
</script>

<style scoped>
/* Component-specific styles */
.el-menu-item i {
  margin-right: 5px;
}
</style>