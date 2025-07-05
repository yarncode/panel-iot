<template>
  <div class="device-list-container p-6">
    <h1 class="text-2xl font-bold mb-4">Danh sách thiết bị</h1>

    <div class="mb-4 flex items-center justify-between">
      <div class="flex items-center">
        <div class="search-box">
          <el-input v-model="searchQuery" placeholder="Tìm thiết bị..." prefix-icon="Search" clearable
            @input="handleSearch" />
        </div>
        <div class="pagination-selector flex items-center mx-2">
          <p class="">Số bản ghi</p>
          <el-select class="ml-2" style="width: 80px;" v-model="pageSize" @change="handleSizeChange">
            <el-option :value="5" label="5" />
            <el-option :value="10" label="10" />
            <el-option :value="20" label="20" />
          </el-select>
        </div>
      </div>
      <div class="flex items-center gap-2">
        <el-popover placement="bottom-end" trigger="click">
          <template #reference>
            <el-button type="primary">
              <template #icon>
                <i class="fi fi-rr-add"></i>
              </template>
              Thêm thiết bị
            </el-button>
          </template>
          <div class="flex flex-col items-center">
            <el-button class="w-full" type="primary" @click="showAddDeviceModal = true">
              <template #icon>
                <i class="fi fi-rr-wifi"></i>
              </template>
              Bluetooth
            </el-button>
            <el-button class="w-full !mx-0 mt-2" type="primary">
              <template #icon>
                <i class="fi fi-rr-usb-pendrive"></i>
              </template>
              Serial
            </el-button>
          </div>
        </el-popover>
      </div>
    </div>

    <el-table :data="paginatedDevices" stripe v-loading="loading" :flexible="true"
      @selection-change="handleSelectionChange" :row-key="row => row.id" show-select>

      <el-table-column type="selection" width="55" />

      <el-table-column label="STT" width="70">
        <template #default="{ $index }">
          {{ ($index + 1) + (currentPage - 1) * pageSize }}
        </template>
      </el-table-column>

      <el-table-column fixed prop="name" label="Tên" width="200">
        <template #default="{ row }">
          <div class="flex items-center gap-2">
            <el-input v-if="editingRow === row" v-model="row.name" size="small" />
            <span v-else>{{ row.name }}</span>
            <el-button round type="primary" v-if="editingRow !== row" size="small" @click="editName(row)">
              <template #icon>
                <i class="fi fi-rr-pencil"></i>
              </template>
            </el-button>
            <el-button round type="primary" v-if="editingRow === row" size="small" @click="saveName(row)">
              <template #icon>
                <i class="fi fi-rr-cloud-upload"></i>
              </template>
            </el-button>
          </div>
        </template>
      </el-table-column>

      <el-table-column prop="id" label="ID" width="120" />
      <el-table-column prop="mac" label="Địa chỉ MAC" width="180" />

      <el-table-column label="Loại">
        <template #header>
          <div class="flex items-center gap-2 whitespace-nowrap overflow-hidden">
            <el-select v-model="deviceTypeFilter" placeholder="Device Type" size="small" @change="handleFilterChange">
              <el-option :value="''" label="All" />
              <el-option v-for="type in deviceTypes" :key="type" :value="type" :label="type" />
            </el-select>
          </div>
        </template>
        <template #default="{ row }">
          {{ row.deviceType }}
        </template>
      </el-table-column>

      <el-table-column label="Trạng thái">
        <template #header>
          <div class="flex items-center gap-2 whitespace-nowrap overflow-hidden">
            <el-select v-model="statusFilter" placeholder="Status" size="small" @change="handleFilterChange"
              style="min-width: 120px;">
              <el-option :value="''" label="All" />
              <el-option :value="'online'" label="Online" />
              <el-option :value="'offline'" label="Offline" />
            </el-select>
          </div>
        </template>
        <template #default="{ row }">
          <el-tag :type="row.status === 'online' ? 'success' : 'danger'">
            {{ row.status }}
          </el-tag>
        </template>
      </el-table-column>

      <el-table-column prop="firmwareVersion" label="Phiên bản" width="160" />
      <el-table-column prop="operateTime" label="Thời gian hoạt động" width="160" />

      <el-table-column label="Hành động" width="220">
        <template #default="{ row }">
          <div class="flex">
            <el-button size="small" type="primary" @click="viewDevice(row)">View</el-button>
            <el-button size="small" type="warning" @click="editDevice(row)">Edit</el-button>
            <el-button size="small" type="danger" @click="removeDevice(row)">Remove</el-button>
          </div>
        </template>
      </el-table-column>
    </el-table>

    <div class="pagination-container mt-4 flex justify-end">
      <el-pagination v-model:current-page="currentPage" :page-size="pageSize" :total="filteredDevices.length"
        layout="total, prev, pager, next" @current-change="handleCurrentChange" />
    </div>

    <el-dialog draggable v-model="showAddDeviceModal" title="Thêm thiết bị" max-width="50%">
      <div class="flex flex-col gap-4">
        <div class="flex justify-end">
          <el-button type="primary" @click="scanBluetoothDevices">
            <template #icon>
              <i class="fi fi-rr-qr-scan"></i>
            </template>
            Quét thiết bị Bluetooth
          </el-button>
        </div>

        <div v-if="bluetoothDevices.length > 0">
          <el-table v-loading="scanDevice" :data="bluetoothDevices" stripe>
            <el-table-column width="50" prop="stt" label="STT" />
            <el-table-column prop="name" label="Tên thiết bị" />
            <el-table-column prop="mac" label="Địa chỉ MAC" />
          </el-table>
        </div>

        <el-empty v-loading="scanDevice" v-else description="Không tìm thấy thiết bị nào" />
      </div>

      <template #footer>
        <el-button @click="showAddDeviceModal = false">Đóng</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { Search } from '@element-plus/icons-vue';

interface Device {
  id: string;
  name: string;
  mac: string;
  deviceType: string;
  status: 'online' | 'offline';
  firmwareVersion: string;
  operateTime: string;
}

// Sample data - this would typically come from an API
const devices = ref<Device[]>([
  { id: 'DEV-001', name: 'Device 1', mac: '00:1B:44:11:3A:B7', deviceType: 'Temperature Sensor', status: 'online', firmwareVersion: 'v1.2.3', operateTime: '2025-05-15 10:00:00' },
  { id: 'DEV-002', name: 'Device 2', mac: '00:1B:44:22:5C:D8', deviceType: 'Humidity Sensor', status: 'offline', firmwareVersion: 'v1.1.5', operateTime: '2025-05-14 14:30:00' },
  { id: 'DEV-003', name: 'Device 3', mac: '00:1B:44:33:7E:F9', deviceType: 'Smart Light', status: 'online', firmwareVersion: 'v2.0.1', operateTime: '2025-05-13 09:15:00' },
  { id: 'DEV-004', name: 'Device 4', mac: '00:1B:44:44:8G:H0', deviceType: 'Motion Detector', status: 'online', firmwareVersion: 'v1.3.7', operateTime: '2025-05-12 11:45:00' },
  { id: 'DEV-005', name: 'Device 5', mac: '00:1B:44:55:9I:J1', deviceType: 'Door Sensor', status: 'offline', firmwareVersion: 'v1.0.2', operateTime: '2025-05-11 08:30:00' },
  { id: 'DEV-006', name: 'Device 6', mac: '00:1B:44:66:0K:L2', deviceType: 'Smart Plug', status: 'online', firmwareVersion: 'v2.1.0', operateTime: '2025-05-10 07:20:00' },
  { id: 'DEV-007', name: 'Device 7', mac: '00:1B:44:77:1M:N3', deviceType: 'Water Sensor', status: 'offline', firmwareVersion: 'v1.5.4', operateTime: '2025-05-09 06:10:00' },
  { id: 'DEV-008', name: 'Device 8', mac: '00:1B:44:88:2O:P4', deviceType: 'Temperature Sensor', status: 'online', firmwareVersion: 'v1.2.3', operateTime: '2025-05-08 05:00:00' },
  { id: 'DEV-009', name: 'Device 9', mac: '00:1B:44:99:3Q:R5', deviceType: 'Humidity Sensor', status: 'online', firmwareVersion: 'v1.1.5', operateTime: '2025-05-07 04:50:00' },
  { id: 'DEV-010', name: 'Device 10', mac: '00:1B:44:00:4S:T6', deviceType: 'Smart Light', status: 'offline', firmwareVersion: 'v2.0.1', operateTime: '2025-05-06 03:40:00' },
  { id: 'DEV-011', name: 'Device 11', mac: '00:1B:44:11:5U:V7', deviceType: 'Motion Detector', status: 'online', firmwareVersion: 'v1.3.7', operateTime: '2025-05-05 02:30:00' },
  { id: 'DEV-012', name: 'Device 12', mac: '00:1B:44:22:6W:X8', deviceType: 'Door Sensor', status: 'offline', firmwareVersion: 'v1.0.2', operateTime: '2025-05-04 01:20:00' },
]);

const loading = ref(true);
const scanDevice = ref(false);
const searchQuery = ref('');
const currentPage = ref(1);
const pageSize = ref(10);
const statusFilter = ref('');
const deviceTypeFilter = ref('');
const editingRow = ref<Device | null>(null);
const selectedRows = ref<Device[]>([]);
const showAddDeviceModal = ref(false);
const bluetoothDevices = ref<{ stt: number; name: string; mac: string }[]>([]);

onMounted(() => {
  // Simulate API loading
  setTimeout(() => {
    loading.value = false;
  }, 500);
});

// Filter devices based on search query and filters
const filteredDevices = computed(() => {
  let result = devices.value;

  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase();
    result = result.filter(device =>
      device.id.toLowerCase().includes(query) ||
      device.name.toLowerCase().includes(query) ||
      device.mac.toLowerCase().includes(query) ||
      device.deviceType.toLowerCase().includes(query) ||
      device.status.toLowerCase().includes(query) ||
      device.firmwareVersion.toLowerCase().includes(query)
    );
  }

  if (statusFilter.value) {
    result = result.filter(device => device.status === statusFilter.value);
  }

  if (deviceTypeFilter.value) {
    result = result.filter(device => device.deviceType === deviceTypeFilter.value);
  }

  return result;
});

// Paginate the filtered devices
const paginatedDevices = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value;
  const end = start + pageSize.value;
  return filteredDevices.value.slice(start, end);
});

// Event handlers
const handleSearch = () => {
  currentPage.value = 1;
};

const handleSizeChange = (val: number) => {
  pageSize.value = val;
  currentPage.value = 1;
};

const handleCurrentChange = (val: number) => {
  currentPage.value = val;
};

const handleFilterChange = () => {
  currentPage.value = 1;
};

const editName = (row: Device) => {
  editingRow.value = row;
};

const saveName = (row: Device) => {
  editingRow.value = null;
  console.log('Name updated:', row.name);
  // Call a callback function to handle the update
  handleNameUpdate(row);
};

const handleNameUpdate = (row: Device) => {
  // Implement the callback logic here
  console.log('Callback for name update:', row);
};

const viewDevice = (device: Device) => {
  console.log('View device', device);
  // Implement view functionality
};

const editDevice = (device: Device) => {
  console.log('Edit device', device);
  // Implement edit functionality
};

const removeDevice = (device: Device) => {
  console.log('Remove device', device);
  // Implement edit functionality
};

const handleSelectionChange = (selection: Device[]) => {
  selectedRows.value = selection;
  console.log('Selected rows:', selectedRows.value);
  // Trigger any additional callback logic here
};

const deviceTypes = computed(() => {
  return Array.from(new Set(devices.value.map(device => device.deviceType)));
});

const scanBluetoothDevices = () => {
  console.log('Scanning for Bluetooth devices...');
  scanDevice.value = true;
  // Simulate scanning logic
  setTimeout(() => {
    bluetoothDevices.value = [
      { stt: 1, name: 'Device A', mac: '00:1A:7D:DA:71:13' },
      { stt: 2, name: 'Device B', mac: '00:1A:7D:DA:71:14' },
    ];
    scanDevice.value = false;
  }, 2000);
};
</script>

<style scoped></style>