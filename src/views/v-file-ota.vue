<template>
  <div class="file-ota-container p-6">
    <header class="mb-4">
      <h1 class="text-2xl font-bold">File OTA Management</h1>
      <div class="flex items-center gap-4 mt-2">
        <div class="flex items-center gap-2">
          <i class="fi fi-rr-folder-open"></i>
          <span>Total Files: {{ totalFiles }}</span>
        </div>
        <div class="flex items-center gap-2">
          <i class="fi fi-rr-database"></i>
          <span>Total Size: {{ totalSize }} Bytes</span>
        </div>
      </div>
    </header>

    <!-- Add File Button -->
    <el-button type="primary" class="mb-4" @click="openAddFileModal">
      <i class="fi fi-rr-add leading-none mr-2"></i> Add File
    </el-button>

    <!-- File Table -->
    <el-table :data="files" stripe v-loading="loading" :row-key="row => row.id" class="mb-4">
      <el-table-column prop="name" label="File Name" width="200" />
      <el-table-column prop="description" label="Description" width="250" />
      <el-table-column prop="extension" label="Extension" width="150" />
      <el-table-column prop="version" label="Version" width="150" />
      <el-table-column prop="size" label="Size (Bytes)" width="150" />
      <el-table-column prop="uploadDate" label="Upload Date" width="200" />
      <el-table-column label="Actions" width="200">
        <template #default="{ row }">
          <div class="flex gap-2">
            <el-button size="small" type="primary" @click="editFile(row)">Edit</el-button>
            <el-button size="small" type="danger" @click="deleteFile(row)">Delete</el-button>
          </div>
        </template>
      </el-table-column>
    </el-table>

    <!-- Add File Modal -->
    <el-dialog v-model="isAddFileModalVisible" title="Add New File" width="50%">
      <el-form :model="newFile" label-width="120px">
        <el-form-item label="File Name">
          <el-input v-model="newFile.name" placeholder="Enter file name" />
        </el-form-item>
        <el-form-item label="Description">
          <el-input v-model="newFile.description" placeholder="Enter description" />
        </el-form-item>
        <el-form-item label="Version">
          <el-input v-model="newFile.version" placeholder="Enter version" />
        </el-form-item>
        <el-form-item label="Upload Method">
          <el-switch v-model="isUploadMode" active-text="Upload File" inactive-text="Enter URL" />
        </el-form-item>
        <el-form-item v-if="isUploadMode" label="Upload File">
          <el-upload class="w-full" :auto-upload="false" :on-progress="handleUploadProgress"
            :on-success="handleUploadSuccess" :on-error="handleUploadError" drag>
            <i class="fi fi-rr-upload-cloud text-2xl"></i>
            <div>Drag your file here or <em>click to upload</em></div>
          </el-upload>
        </el-form-item>
        <el-form-item v-else label="File URL">
          <el-input v-model="newFile.url" placeholder="Enter file URL" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="isAddFileModalVisible = false">Cancel</el-button>
        <el-button type="primary" @click="submitNewFile">Submit</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';

interface File {
  id: string;
  name: string;
  description: string;
  extension: string;
  version: string;
  size: number;
  uploadDate: string;
  url?: string;
}

const files = ref<File[]>([
  { id: '1', name: 'OTA_File_1.bin', description: 'First OTA file', extension: '.bin', version: '1.0.0', size: 1024, uploadDate: '2025-05-01' },
  { id: '2', name: 'OTA_File_2.bin', description: 'Second OTA file', extension: '.bin', version: '1.1.0', size: 2048, uploadDate: '2025-05-02' },
]);

const loading = ref(false);
const isAddFileModalVisible = ref(false);
const isUploadMode = ref(true);
const uploadProgress = ref(0);
const uploadedFile = ref<{ size: number; type: string, name: string }>({ size: 0, type: '', name: '' });

const newFile = ref<File>({
  id: '',
  name: '',
  description: '',
  extension: '',
  version: '',
  size: 0,
  uploadDate: '',
});

const totalFiles = computed(() => files.value.length);
const totalSize = computed(() => files.value.reduce((sum, file) => sum + file.size, 0));

const openAddFileModal = () => {
  isAddFileModalVisible.value = true;
};

const handleUploadProgress = (event: { percent: number }) => {
  uploadProgress.value = Math.round(event.percent);
};

const handleUploadSuccess = (response: any, file: any) => {
  uploadedFile.value = { size: file.size, type: file.type, name: file.name };
  console.log('Upload success:', response);
};

const handleUploadError = (error: any) => {
  console.error('Upload error:', error);
};

const submitNewFile = () => {
  if (isUploadMode.value) {
    newFile.value.size = uploadedFile.value.size;
    newFile.value.extension = uploadedFile.value.type;
  }
  newFile.value.uploadDate = new Date().toISOString().split('T')[0];
  files.value.push({ ...newFile.value, id: Date.now().toString() });
  isAddFileModalVisible.value = false;
  console.log('New file added:', newFile.value);
};

const editFile = (file: File) => {
  console.log('Edit file:', file);
};

const deleteFile = (file: File) => {
  files.value = files.value.filter(f => f.id !== file.id);
  console.log('Deleted file:', file);
};
</script>

<style scoped></style>