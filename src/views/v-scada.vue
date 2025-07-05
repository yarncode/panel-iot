<template>
  <section class="p-4">
    <header class="text-lg font-bold mb-4"><i class="fi fi-rr-tree mr-2"></i> Scada Factory</header>
    <article>
      <v-diagram />
    </article>
  </section>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import VDiagram from '@/components/scada/v-diagram.vue'
</script>

<style scoped></style>
