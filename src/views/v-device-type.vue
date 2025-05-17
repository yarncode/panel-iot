<template>
  <section class="p-4">
    <header class="mb-4">
      <h1 class="text-2xl font-bold">Loại thiết bị</h1>
      <p class="text-sm text-gray-500">Các loại thiết bị sẽ được quản lí ở đây.</p>
    </header>

    <!-- Add Device Button -->
    <div class="flex justify-end">
      <el-button type="primary" class="mb-4" @click="openModal">
        <i class="fi fi-rr-add leading-none mr-2"></i> Thêm loại thiết bị
      </el-button>
    </div>

    <!-- Table -->
    <el-table :data="devices" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55"></el-table-column>
      <el-table-column prop="name" label="Name" width="180"></el-table-column>
      <el-table-column prop="description" label="Description"></el-table-column>
      <el-table-column label="Image" width="120">
        <template #default="{ row }">
          <img :src="row.image" alt="Device Image" class="w-16 h-16 object-cover" />
        </template>
      </el-table-column>
      <el-table-column label="Actions" width="180">
        <template #default="{ row }">
          <div class="flex">
            <el-button size="small" type="primary" @click="editDevice(row)">Edit</el-button>
            <el-button size="small" type="primary" @click="removeDevice(row.id)" class="text-red-500">Remove</el-button>
          </div>
        </template>
      </el-table-column>
    </el-table>

    <!-- Modal -->
    <el-dialog v-model="isModalOpen" title="Device Type" width="30%">
      <el-form :model="form" label-width="120px">
        <el-form-item label="Name">
          <el-input v-model="form.name" placeholder="Enter name"></el-input>
        </el-form-item>
        <el-form-item label="Description">
          <el-input v-model="form.description" type="textarea" placeholder="Enter description"></el-input>
        </el-form-item>
        <el-form-item label="Image">
          <div class="w-full">
            <el-switch v-model="isFileUpload" active-text="Upload File" inactive-text="Input URL"></el-switch>

            <div class="mt-2">
              <div v-if="isFileUpload">
                <el-upload class="upload-demo" :on-success="handleUploadSuccess" :file-list="fileList"
                  list-type="picture-card" :auto-upload="false">
                  <i class="fi fi-rr-upload mr-2"></i>
                  <div class="el-upload__text">Upload</div>
                </el-upload>
              </div>

              <div v-else>
                <el-input v-model="form.image" placeholder="Enter image URL"></el-input>
              </div>
            </div>

          </div>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="closeModal">Cancel</el-button>
        <el-button type="primary" @click="saveDevice">Save</el-button>
      </div>
    </el-dialog>
  </section>
</template>

<script setup>
import { ref } from 'vue';
import { ElMessage } from 'element-plus';

const devices = ref([
  { id: 1, name: 'Device A', description: 'Description A', image: 'https://via.placeholder.com/150' },
  { id: 2, name: 'Device B', description: 'Description B', image: 'https://via.placeholder.com/150' },
]);

const selectedDevices = ref([]);
const isModalOpen = ref(false);
const form = ref({ id: null, name: '', description: '', image: '' });
const fileList = ref([]);
const isFileUpload = ref(true);

const openModal = (device = null) => {
  console.log('openModal', device);
  if (device) {
    form.value = { ...device };
  } else {
    form.value = { id: null, name: '', description: '', image: '' };
  }
  isModalOpen.value = true;
};

const closeModal = () => {
  isModalOpen.value = false;
};

const saveDevice = () => {
  if (form.value.id) {
    const index = devices.value.findIndex((d) => d.id === form.value.id);
    if (index !== -1) devices.value.splice(index, 1, { ...form.value });
  } else {
    devices.value.push({ ...form.value, id: Date.now() });
  }
  closeModal();
};

const editDevice = (device) => {
  openModal(device);
};

const removeDevice = (id) => {
  let name;
  devices.value = devices.value.filter((device) => {
    if (device.id === id) {
      name = device.name;
      return false;
    }
    return true;
  });

  ElMessage({
    message: `Device type with name "${name}" was removed`,
    type: 'success',
  });
};

const handleSelectionChange = (selection) => {
  selectedDevices.value = selection;
};

const handleUploadSuccess = (response, file) => {
  form.value.image = file.url || file.name; // Assuming the server returns a URL or file name
};
</script>