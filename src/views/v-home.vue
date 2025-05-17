<template>
  <section class="p-6 text-white min-h-screen">
    <!-- Header Statistics -->
    <header class="mb-8">
      <h1 class="text-2xl font-bold">Tổng quan hệ thống</h1>
    </header>

    <!-- Statistics Section -->
    <section class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
      <el-card shadow="always" class="p-4 rounded-lg shadow bg-transparent">
        <template #header>
          <div class="flex items-center">
            <i class="fi fi-rr-total leading-none mr-2"></i>
            <h2 class="text-lg">Tổng thiết bị</h2>
          </div>
        </template>
        <p class="text-lg animate-pulse">2,657,843</p>
      </el-card>

      <el-card shadow="always" class="p-4 rounded-lg shadow bg-transparent">
        <template #header>
          <div class="flex items-center">
            <i class="fi fi-rr-wifi leading-none mr-2"></i>
            <h2 class="text-lg">Đang online</h2>
          </div>
        </template>
        <p class="text-lg animate-pulse">1,234,567</p>
      </el-card>

      <!-- <el-card shadow="always" class="p-4 rounded-lg shadow bg-transparent">
        <template #header>
          <div class="flex items-center">
            <i class="fi fi-rr-wifi-slash leading-none mr-2"></i>
            <h2 class="text-lg">Đang offline</h2>
          </div>
        </template>
        <p class="text-lg animate-pulse">123,456</p>
      </el-card> -->

      <el-card shadow="always" class="p-4 rounded-lg shadow bg-transparent">
        <template #header>
          <div class="flex items-center">
            <i class="fi fi-rr-comment-dots leading-none mr-2"></i>
            <h2 class="text-lg">Message logger</h2>
          </div>
        </template>
        <p class="text-lg animate-pulse">281,23</p>
      </el-card>

      <el-card shadow="always" class="p-4 rounded-lg shadow bg-transparent">
        <template #header>
          <div class="flex items-center">
            <i class="fi fi-rr-users leading-none mr-2"></i>
            <h2 class="text-lg">User online</h2>
          </div>
        </template>
        <p class="text-lg animate-pulse">281,23</p>
      </el-card>

    </section>

    <!-- Header Chart -->
    <header class="mb-8">
      <h1 class="text-2xl font-bold">Biểu đồ dữ liệu</h1>
    </header>

    <!-- Chart Section -->
    <section class="p-6 rounded-lg shadow mb-8 bg-transparent">
      <div class="w-full h-96">
        <LineChart :chart-data="chartData" :options="chartOptions" />
      </div>
    </section>

    <!-- Header Map -->
    <header class="mb-8">
      <h1 class="text-2xl font-bold">Vị trí thiết bị</h1>
    </header>

    <!-- Map Section -->
    <div style="height:600px;" class="relative">
      <!-- overlay -->
      <div class="absolute inset-0 bg-black opacity-50 hover:opacity-0 transition-opacity z-[999]">
      </div>
      <l-map ref="map" v-model:zoom="zoom" :center="[10.8231, 106.6297]">
        <l-tile-layer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" layer-type="base"
          name="OpenStreetMap"></l-tile-layer>
        <l-marker :lat-lng="coordinates">
          <l-tooltip> ESP32 </l-tooltip>
        </l-marker>
      </l-map>
    </div>
  </section>
</template>

<script setup lang="ts">
import { onMounted, ref, reactive, defineAsyncComponent } from 'vue';

/* area: lib for map show point device */
import "leaflet/dist/leaflet.css";
import type L from "leaflet";
import { LMap, LTileLayer, LMarker, LIcon, LTooltip } from "@vue-leaflet/vue-leaflet";

/* area: lib for line chart */
import { Chart, registerables, type ChartOptions, type ScriptableContext } from 'chart.js';
import { LineChart } from 'vue-chart-3';
Chart.register(...registerables);

const zoom = ref(16);
const coordinates = ref([10.8231, 106.6297] as L.LatLngExpression);

const chartData = reactive({
  labels: [
    'Tháng 1',
    'Tháng 2',
    'Tháng 3',
    'Tháng 4',
    'Tháng 5',
    'Tháng 6',
    'Tháng 7',
    'Tháng 8',
    'Tháng 9',
    'Tháng 10',
    'Tháng 11',
    'Tháng 12'
  ],
  datasets: [
    {
      label: 'device',
      data: [65, 59, 80, 81, 56, 55, 65, 59, 80, 81, 56, 55],
      borderColor: 'rgba(75, 192, 192, 1)',
      tension: 0.4, backgroundColor: (context: ScriptableContext<"line">) => {
        const ctx = context.chart.ctx;
        const gradient = ctx.createLinearGradient(0, 0, 0, 250);
        gradient.addColorStop(0, "rgba(75, 192, 192,0.45)");
        gradient.addColorStop(1, "rgba(75, 192, 192,0.0)");
        return gradient;
      },
      fill: true,
    },
    {
      label: 'app',
      data: [28, 48, 40, 19, 86, 27, 19, 86, 27, 19, 86, 27],
      borderColor: 'rgba(153, 102, 255, 1)',
      tension: 0.4, backgroundColor: (context: ScriptableContext<"line">) => {
        const ctx = context.chart.ctx;
        const gradient = ctx.createLinearGradient(0, 0, 0, 250);
        gradient.addColorStop(0, "rgba(153, 102, 255,0.45)");
        gradient.addColorStop(1, "rgba(153, 102, 255,0.0)");
        return gradient;
      },
      fill: true,
    },
  ],
});

const chartOptions = reactive<ChartOptions>({
  backgroundColor: '#fff',
  interaction: {
    intersect: false,
    mode: 'index',
  },
  scales: {
    y: {
      title: {
        display: true,
        text: 'Gói tin',
        font: {
          size: 14,
        },
      }
    },
    x: {
      title: {
        display: true,
        text: 'Thời gian',
        font: {
          size: 14,
        },
      },
      grid: {
        display: false,
      }
    }
  },
  plugins: {
    title: {
      display: true,
    },
    tooltip: {
      enabled: true,
      mode: 'index',
      intersect: false,
      callbacks: {
        label: function (item) {
          const value = item.raw; // Get the raw value
          return `${item.dataset.label}: ${value} packets`; // Append "packets" as the unit
        },
      }
    }
  }
});

</script>

<style scoped>
/* Add any component-specific styles here */
</style>