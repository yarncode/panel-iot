<template>
  <section class="p-6 text-white min-h-screen">
    <!-- Header -->
    <header class="mb-8">
      <h1 class="text-2xl font-bold">Tổng quan hệ thống</h1>
      <p class="text-gray-400">Thống kê sơ lược</p>
    </header>

    <!-- Statistics Section -->
    <section class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">

      <article class="bg-gray-800 p-4 rounded-lg shadow">
        <div class="flex items-center">
          <i class="fi fi-rr-total leading-none mr-2"></i>
          <h2 class="text-xl">Tổng thiết bị</h2>
        </div>
        <p class="text-lg">2,657,843</p>
      </article>
      <article class="bg-gray-800 p-4 rounded-lg shadow">
        <div class="flex items-center">
          <i class="fi fi-rr-wifi-slash leading-none mr-2"></i>
          <h2 class="text-xl">Đang online</h2>
        </div>
        <p class="text-lg text-green-500">1,234,567</p>
      </article>
      <article class="bg-gray-800 p-4 rounded-lg shadow">
        <div class="flex items-center">
          <i class="fi fi-rr-wifi leading-none mr-2"></i>
          <h2 class="text-xl">Offline Devices</h2>
        </div>
        <p class="text-lg text-yellow-500">123,456</p>
      </article>
    </section>

    <header class="mb-8">
      <h1 class="text-2xl font-bold">Vị trí thiết bị</h1>
      <p class="text-gray-400">Thống kê sơ lược</p>
    </header>

    <!-- Map Section -->
    <div style="height:600px;">
      <l-map ref="map" v-model:zoom="zoom" :center="[10.8231, 106.6297]">
        <l-tile-layer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" layer-type="base"
          name="OpenStreetMap"></l-tile-layer>
        <!-- <l-circle-marker :lat-lng="[41.89026, 12.49238]" :radius="50" /> -->
        <l-marker :lat-lng="coordinates">
          <l-tooltip> ESP32 </l-tooltip>
        </l-marker>
      </l-map>
    </div>
  </section>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import "leaflet/dist/leaflet.css";
import type L from "leaflet";
import { LMap, LTileLayer, LMarker, LIcon, LTooltip } from "@vue-leaflet/vue-leaflet";

const zoom = ref(16);
const coordinates = ref([10.8231, 106.6297] as L.LatLngExpression);

</script>

<style scoped>
/* Add any component-specific styles here */
</style>