<template>
  <div class="signup-container flex justify-center items-center min-h-screen bg-gray-50">
    <el-card class="max-w-md w-full">
      <template #header>
        <div class="flex items-center justify-center mb-4">
          <i class="fi fi-rr-user-add text-2xl mr-2"></i>
          <h1 class="text-xl font-bold">Create Account</h1>
        </div>
      </template>

      <el-form :model="form" :rules="rules" ref="formRef" label-position="top">
        <el-form-item label="Full Name" prop="name">
          <el-input v-model="form.name" placeholder="Enter your full name">
            <template #prefix>
              <i class="fi fi-rr-user"></i>
            </template>
          </el-input>
        </el-form-item>

        <el-form-item label="Email" prop="email">
          <el-input v-model="form.email" placeholder="Enter your email">
            <template #prefix>
              <i class="fi fi-rr-envelope"></i>
            </template>
          </el-input>
        </el-form-item>

        <el-form-item label="Password" prop="password">
          <el-input v-model="form.password" type="password" placeholder="Create a password" show-password>
            <template #prefix>
              <i class="fi fi-rr-lock"></i>
            </template>
          </el-input>
        </el-form-item>

        <el-form-item label="Confirm Password" prop="confirmPassword">
          <el-input v-model="form.confirmPassword" type="password" placeholder="Confirm your password" show-password>
            <template #prefix>
              <i class="fi fi-rr-lock"></i>
            </template>
          </el-input>
        </el-form-item>

        <el-form-item>
          <el-checkbox v-model="form.agreement">
            I agree to the <el-link type="primary">Terms of Service</el-link> and <el-link type="primary">Privacy
              Policy</el-link>
          </el-checkbox>
        </el-form-item>

        <el-button type="primary" class="w-full" @click="handleSubmit">Sign Up</el-button>

        <div class="text-center mt-4">
          Already have an account?
          <router-link to="/signin" class="text-blue-500">Sign in</router-link>
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
  name: '',
  email: '',
  password: '',
  confirmPassword: '',
  agreement: false
});

const validatePass = (rule: any, value: string, callback: any) => {
  if (value === '') {
    callback(new Error('Please enter password'));
  } else if (value.length < 6) {
    callback(new Error('Password must be at least 6 characters'));
  } else {
    if (form.confirmPassword !== '') {
      if (!formRef.value) return;
      formRef.value.validateField('confirmPassword', () => null);
    }
    callback();
  }
};

const validateConfirmPass = (rule: any, value: string, callback: any) => {
  if (value === '') {
    callback(new Error('Please confirm your password'));
  } else if (value !== form.password) {
    callback(new Error('Passwords do not match'));
  } else {
    callback();
  }
};

const validateAgreement = (rule: any, value: boolean, callback: any) => {
  if (!value) {
    callback(new Error('You must agree to the terms and conditions'));
  } else {
    callback();
  }
};

const rules = reactive<FormRules>({
  name: [
    { required: true, message: 'Please enter your name', trigger: 'blur' },
    { min: 2, message: 'Name must be at least 2 characters', trigger: 'blur' }
  ],
  email: [
    { required: true, message: 'Please enter your email', trigger: 'blur' },
    { type: 'email', message: 'Please enter a valid email address', trigger: 'blur' }
  ],
  password: [
    { validator: validatePass, trigger: 'blur' }
  ],
  confirmPassword: [
    { validator: validateConfirmPass, trigger: 'blur' }
  ],
  agreement: [
    { validator: validateAgreement, trigger: 'change' }
  ]
});

const handleSubmit = async () => {
  if (!formRef.value) return;

  await formRef.value.validate((valid) => {
    if (valid) {
      console.log('Form submitted:', form);
      // TODO: Add actual registration logic here
      router.push('/signin');
    }
  });
};
</script>

<style scoped>
.signup-container {
  padding: 2rem;
}
</style>