<template>
  <div class="profile-container p-6">
    <h1 class="text-2xl font-bold mb-4">User Profile</h1>
    <div class="flex gap-6">
      <div class="avatar-section">
        <el-badge :value="role" :offset="[-40, 40]" type="success" badge-style="padding: 15px">
          <el-avatar :src="avatar" :size="200" />
        </el-badge>
      </div>
      <div class="info-section flex-1">
        <el-form label-position="top" label-width="120px">
          <el-form-item label="Name">
            <el-input v-model="name" :readonly="!isEditMode" size="large" />
          </el-form-item>
          <el-form-item label="Description">
            <el-input v-model="description" :readonly="!isEditMode" size="large" />
          </el-form-item>
          <el-form-item label="Address">
            <el-input v-model="address" :readonly="!isEditMode" size="large" />
          </el-form-item>
          <el-form-item label="Phone Number">
            <el-input v-model="phoneNumber" :readonly="!isEditMode" size="large" />
          </el-form-item>
          <el-form-item label="Avatar URL">
            <el-input v-model="avatar" :readonly="!isEditMode" size="large" />
          </el-form-item>
        </el-form>
        <div class="mt-4">
          <el-button type="primary" @click="toggleEditMode">{{ isEditMode ? 'Submit' : 'Edit Info' }}</el-button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';

const name = ref('John Doe');
const description = ref('A passionate developer.');
const role = ref('Admin');
const address = ref('123 Main Street, Cityville');
const phoneNumber = ref('+1234567890');
const avatar = ref('https://via.placeholder.com/150');

const isEditMode = ref(false);

const toggleEditMode = () => {
  if (isEditMode.value) {
    submitInfo();
  }
  isEditMode.value = !isEditMode.value;
};

const submitInfo = () => {
  // Callback function for handling submission
  console.log('Submitting info:', {
    name: name.value,
    description: description.value,
    address: address.value,
    phoneNumber: phoneNumber.value,
    avatar: avatar.value,
  });
};
</script>

<style scoped></style>