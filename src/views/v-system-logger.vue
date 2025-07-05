<template>
  <section class="system-logger-container p-6">
    <header class="mb-4">
      <h1 class="text-2xl font-bold">Hệ thống nhật ký</h1>
      <!-- <p class="text-sm text-gray-500">Các message sẽ ghi nhận theo thời gian thực.</p> -->
    </header>

    <div class="mb-4 grid grid-cols-1 md:grid-cols-6 gap-4">
      <el-input v-model="searchQuery" placeholder="Tìm messages..." class="w-full" clearable></el-input>
      <el-select v-model="filterTag" placeholder="Lọc bởi Tag" class="w-full" clearable>
        <el-option label="All Tags" value=""></el-option>
        <el-option label="API" value="api"></el-option>
        <el-option label="Broker" value="broker"></el-option>
        <el-option label="File" value="file"></el-option>
        <el-option label="Validate" value="validate"></el-option>
        <el-option label="Socket" value="socket"></el-option>
      </el-select>
      <el-select v-model="filterLevel" placeholder="Lọc bởi Level" class="w-full" clearable>
        <el-option label="All Levels" value=""></el-option>
        <el-option label="Debug" value="debug"></el-option>
        <el-option label="Info" value="info"></el-option>
        <el-option label="Warning" value="warning"></el-option>
        <el-option label="Verbose" value="verbose"></el-option>
      </el-select>
      <el-date-picker v-model="filterTime" type="date" placeholder="Lọc bởi thời gian" class="w-full"
        clearable></el-date-picker>
      <el-button round type="primary" @click="exportToCSV"><i class="fi fi-rr-file-export leading-none mr-2"></i> Xuất
        CSV</el-button>
    </div>

    <div class="log-scroll-container overflow-y-auto h-[500px]">
      <article class="log-records space-y-4">
        <div v-for="record in filteredRecords" :key="record.time"
          class="log-record p-2 rounded-lg flex items-start md:items-center hover:shadow-lg transition-shadow cursor-pointer"
          @click="showRecordDetails(record)">
          <div class="flex items-center space-x-2 border-r pr-4">
            <el-tag :type="getTagType(record.tag)" class="text-xs">
              {{ record.tag }}
            </el-tag>
            <el-tag :type="getLevelType(record.level)" class="text-xs">
              {{ record.level }}
            </el-tag>
          </div>
          <div class="flex-1 ml-4">
            <p class="text-sm text-gray-400 truncate">{{ record.message }}</p>
            <time class="text-xs text-gray-700">{{ new Date(record.time).toLocaleString() }}</time>
          </div>
        </div>
      </article>
    </div>

    <el-dialog v-model="isModalVisible" title="Log Record Details" :visible.sync="isModalVisible" width="50%">
      <div>
        <p><strong>Tag:</strong> {{ selectedRecord?.tag }}</p>
        <p><strong>Level:</strong> {{ selectedRecord?.level }}</p>
        <p><strong>Time:</strong> {{ new Date(selectedRecord?.time).toLocaleString() }}</p>
        <p><strong>Message:</strong> {{ selectedRecord?.message }}</p>
      </div>
    </el-dialog>
  </section>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';

interface LogRecord {
  tag: string;
  level: string;
  time: number;
  message: string;
}

const records = ref<LogRecord[]>([]);
const searchQuery = ref('');
const filterTag = ref('');
const filterLevel = ref('');
const filterTime = ref('');
const isModalVisible = ref(false);
const selectedRecord = ref<LogRecord | null>(null);

const getTagType = (tag: string) => {
  switch (tag) {
    case 'api':
      return 'info';
    case 'broker':
      return 'success';
    case 'file':
      return 'warning';
    case 'validate':
      return 'primary';
    case 'socket':
      return 'danger';
    default:
      return '';
  }
};

const getLevelType = (level: string) => {
  switch (level) {
    case 'debug':
      return 'info';
    case 'info':
      return 'success';
    case 'warning':
      return 'warning';
    case 'verbose':
      return 'primary';
    default:
      return '';
  }
};

const filteredRecords = computed(() => {
  return records.value
    .filter(record =>
      record.message.toLowerCase().includes(searchQuery.value.toLowerCase())
    )
    .filter(record => (filterTag.value ? record.tag === filterTag.value : true))
    .filter(record => (filterLevel.value ? record.level === filterLevel.value : true))
    .filter(record =>
      filterTime.value
        ? new Date(record.time).toDateString() ===
        new Date(filterTime.value).toDateString()
        : true
    )
    .sort((a, b) => b.time - a.time); // Sort by newest first
});

const showRecordDetails = (record: LogRecord) => {
  selectedRecord.value = record;
  isModalVisible.value = true;
};

const exportToCSV = () => {
  const headers = ['Tag', 'Level', 'Time', 'Message'];
  const rows = records.value.map(record => [
    record.tag,
    record.level,
    new Date(record.time).toLocaleString(),
    record.message
  ]);

  const csvContent = [headers, ...rows]
    .map(row => row.map(cell => `"${cell}"`).join(','))
    .join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', 'log_records.csv');
  link.style.display = 'none';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

onMounted(() => {
  // Simulate receiving data from socket.io
  setInterval(() => {
    const fakeData: LogRecord = {
      tag: ['api', 'broker', 'file', 'validate', 'socket'][
        Math.floor(Math.random() * 5)
      ],
      level: ['debug', 'info', 'warning', 'verbose'][
        Math.floor(Math.random() * 4)
      ],
      time: Date.now(),
      message: 'This is a simulated log message.',
    };
    records.value.unshift(fakeData); // Add new record to the top
    if (records.value.length > 50) records.value.pop(); // Keep the list manageable
  }, 1000);
});
</script>

<style scoped>
/* Add styles specific to the System Logger view here */
</style>