<template>
  <svg :class="disable ? '' : 'absolute'" :width="disable ? '100%' : size.width" :height="disable ? '100%' : size.height" ref="svg" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" enable-background="new 0 0 100 100" xml:space="preserve">
    <g id="Group_Horizonatal_Short">
      <linearGradient id="SVGID_1_" gradientUnits="userSpaceOnUse" x1="94.2881" y1="-23.0383" x2="123.9873" y2="-23.0383" gradientTransform="matrix(0 -1 1 0 79.2883 124.2117)">
        <stop offset="0.01" style="stop-color: #646566" />
        <stop offset="0.16" style="stop-color: #909091" />
        <stop offset="0.49" style="stop-color: #e0e0e0" />
        <stop offset="1" style="stop-color: #646566" />
      </linearGradient>
      <path fill="url(#SVGID_1_)" d="M112.5,29.924H0V0.224h112.5V29.924z" />
    </g>
  </svg>
</template>

<script setup lang="ts">
import { ref, onMounted, reactive } from 'vue'
import type { PropType } from 'vue'
import * as d3 from 'd3'
import type { PickerDiagram } from '@/components/scada/interface/i-diagram'

const props = defineProps({
  width: { type: Number, default: 400 },
  height: { type: Number, default: 300 },
  radius: { type: Number, default: 30 },
  color: { type: String, default: 'steelblue' },
  disable: { type: Boolean, default: false },
  map: { type: Array as PropType<readonly PickerDiagram[]>, default: () => [] },
})
const svg = ref<SVGSVGElement | null>(null)

const pos = reactive({
  x: props.width / 2,
  y: props.height / 2,
})

const size = reactive({
  width: 100,
  height: 30,
})

const x = ref(pos.x)
const y = ref(pos.y)

onMounted(() => {
  if (props.disable) return
  const drag = d3.drag().on('drag', (event: d3.D3DragEvent<SVGSVGElement, unknown, unknown>) => {
    pos.x = Math.max(0, Math.min(props.width - size.width, event.x - size.width / 2))
    pos.y = Math.max(0, Math.min(props.height - size.height, event.y - size.height / 2))

    d3.select(svg.value).transition().duration(50).ease(d3.easeQuadInOut).attr('transform', `translate(${pos.x}, ${pos.y})`)
  })

  d3.select(svg.value).call(drag as any)
})
</script>
