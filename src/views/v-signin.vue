<template>
  <div class="signin-container flex justify-center items-center min-h-screen bg-gray-50">
    <el-card class="max-w-md w-full">
      <template #header>
        <div class="flex items-center justify-center mb-4">
          <i class="fi fi-rr-user text-2xl mr-2"></i>
          <h1 class="text-xl font-bold">Sign In</h1>
        </div>
      </template>

      <el-form :model="form" :rules="rules" ref="formRef" label-position="top">
        <el-form-item label="Email" prop="email">
          <el-input v-model="form.email" placeholder="Enter your email">
            <template #prefix>
              <i class="fi fi-rr-envelope"></i>
            </template>
          </el-input>
        </el-form-item>

        <el-form-item label="Password" prop="password">
          <el-input v-model="form.password" type="password" placeholder="Enter your password" show-password>
            <template #prefix>
              <i class="fi fi-rr-lock"></i>
            </template>
          </el-input>
        </el-form-item>

        <div class="flex justify-between items-center mb-4">
          <el-checkbox v-model="form.remember">Remember me</el-checkbox>
          <el-link type="primary">Forgot password?</el-link>
        </div>

        <el-button type="primary" class="w-full" @click="handleSubmit">Sign In</el-button>

        <div class="text-center mt-4">
          Don't have an account?
          <router-link to="/signup" class="text-blue-500">Sign up</router-link>
        </div>
      </el-form>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue';
import { useRouter } from 'vue-router';
import type { FormInstance, FormRules } from 'element-plus';

const router = useRouter();
const formRef = ref<FormInstance>();

const form = reactive({
  email: '',
  password: '',
  remember: false
});

const rules = reactive<FormRules>({
  email: [
    { required: true, message: 'Please enter your email', trigger: 'blur' },
    { type: 'email', message: 'Please enter a valid email address', trigger: 'blur' }
  ],
  password: [
    { required: true, message: 'Please enter your password', trigger: 'blur' },
    { min: 6, message: 'Password must be at least 6 characters', trigger: 'blur' }
  ]
});

const handleSubmit = async () => {
  if (!formRef.value) return;

  await formRef.value.validate((valid) => {
    if (valid) {
      console.log('Form submitted:', form);
      // TODO: Add actual authentication logic here
      router.push('/');
    }
  });
};
</script>

<style scoped>
.signin-container {
  padding: 2rem;
}
</style>