<template>
  <v-element :width="props.width" :height="props.height" :disable="props.disable" :size="props.size" :anchor_name="ANCHOR_TYPE" :mark_point="MARK_POINT" :map="props.map">
    <g id="Group_Horizonatal_Short" ref="element_group">
      <linearGradient id="SVGID_1_" gradientUnits="userSpaceOnUse" x1="94.2881" y1="-23.0383" x2="123.9873" y2="-23.0383" gradientTransform="matrix(0 -1 1 0 79.2883 124.2117)">
        <stop offset="0.01" style="stop-color: #646566" />
        <stop offset="0.16" style="stop-color: #909091" />
        <stop offset="0.49" style="stop-color: #e0e0e0" />
        <stop offset="1" style="stop-color: #646566" />
      </linearGradient>
      <path fill="url(#SVGID_1_)" d="M112.5,29.924H0V0.224h112.5V29.924z" />
    </g>
  </v-element>
</template>

<script setup lang="ts">
import { ref, onMounted, reactive } from 'vue'
import type { PropType } from 'vue'
import * as d3 from 'd3'
import { v4 } from 'uuid'
import { type PickerDiagram, ResizeMode } from '@/components/scada/interface/i-diagram'
import type { IAnchorAbstract } from '@/components/scada/interface/i-anchor'

import vElement from '@/components/scada/v-element.vue'

const ANCHOR_TYPE = v4()
const MARK_POINT = reactive<Array<IAnchorAbstract>>([
  {
    x: 0,
    y: 0,
  },
  {
    x: 50,
    y: 0,
  },
  {
    x: 100,
    y: 0,
  },
  {
    x: 0,
    y: 50,
  },
  {
    x: 50,
    y: 50,
  },
  {
    x: 100,
    y: 50,
  },
  {
    x: 0,
    y: 100,
  },
  {
    x: 50,
    y: 100,
  },
  {
    x: 100,
    y: 100,
  },
])

const props = defineProps({
  width: { type: Number, default: 400 },
  height: { type: Number, default: 300 },
  size: { type: Number, default: 100 },
  disable: { type: Boolean, default: false },
  resizeMode: { type: Object as PropType<ResizeMode>, default: ResizeMode.GRID },
  map: { type: Array as PropType<readonly PickerDiagram[]>, default: () => [] },
})

console.log('props.resizeMode:', props.resizeMode)

onMounted(() => {
  /* phase: init something */
})
</script>
