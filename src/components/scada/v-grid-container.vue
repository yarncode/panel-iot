<template>
  <section ref="containerRef" class="relative w-full h-full overflow-hidden bg-transparent" @wheel.prevent="onWheel" @mousedown="onMouseDown">
    <!-- Helper actions (Element Plus) -->
    <header class="absolute top-2 right-2 flex items-center gap-2 z-20 bg-transparent">
      <el-tooltip placement="left" content="Giữ Ctrl + chuột trái để kéo. Dùng con lăn chuột để phóng to/thu nhỏ.">
        <button type="button" class="p-2 rounded cursor-help hover:bg-black/5">
          <i class="fi fi-rr-info"></i>
        </button>
      </el-tooltip>
      <el-button size="small" @click="zoomOut" :disabled="scale <= minScale">
        <i class="fi fi-rr-zoom-out"></i>
      </el-button>
      <span class="text-xs select-none text-gray-500 text-center">{{ Math.round(scale * 100) }}%</span>
      <el-button size="small" @click="zoomIn" :disabled="scale >= maxScale">
        <i class="fi fi-rr-zoom-in"></i>
      </el-button>
      <el-button size="small" @click="resetView">
        <i class="fi fi-rr-undo"></i>
      </el-button>
    </header>

    <!-- Grid -->
    <svg v-if="showGrid" class="absolute inset-0 pointer-events-none z-0 bg-transparent" :width="dims.width" :height="dims.height">
      <g :transform="`translate(${translate.x}, ${translate.y}) scale(${scale})`">
        <!-- Vertical lines -->
        <line v-for="x in vLines" :key="`vx-${x}`" :x1="x" :x2="x" :y1="infiniteGrid ? infMin : worldBounds.minY" :y2="infiniteGrid ? infMax : worldBounds.maxY" stroke="#a1a1a1c7" stroke-width="0.2" vector-effect="non-scaling-stroke" />
        <!-- Horizontal lines -->
        <line v-for="y in hLines" :key="`hy-${y}`" :x1="infiniteGrid ? infMin : worldBounds.minX" :x2="infiniteGrid ? infMax : worldBounds.maxX" :y1="y" :y2="y" stroke="#a1a1a1c7" stroke-width="0.2" vector-effect="non-scaling-stroke" />
      </g>
    </svg>

    <!-- Content -->
    <article
      ref="contentRef"
      class="absolute inset-0 bg-transparent z-10"
      :class="isPanning ? 'cursor-grabbing' : 'cursor-grab'"
      :style="{
        transform: `translate(${translate.x}px, ${translate.y}px) scale(${scale})`,
        transformOrigin: '0 0',
      }"
    >
      <slot />
    </article>
  </section>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, onBeforeUnmount, computed, provide, toRef } from 'vue'
import { GRID_CONTEXT_KEY } from '@/components/scada/context/grid-context'
import { createSnapRegistry, SNAP_REGISTRY_KEY } from '@/components/scada/context/snap-registry'

const props = withDefaults(
  defineProps<{
    minScale?: number
    maxScale?: number
    step?: number
    initialScale?: number
    showGrid?: boolean
    gridSize?: number
    infiniteGrid?: boolean
    snapTolerance?: number
  }>(),
  {
    minScale: 0.2,
    maxScale: 4,
    step: 0.1,
    initialScale: 1,
    showGrid: true,
    gridSize: 50,
    infiniteGrid: true,
    snapTolerance: 8,
  },
)

const containerRef = ref<HTMLElement | null>(null)
const contentRef = ref<HTMLElement | null>(null)

const scale = ref<number>(props.initialScale)
const translate = reactive({ x: 0, y: 0 })
const isPanning = ref(false)
let start = { x: 0, y: 0 }
let startTranslate = { x: 0, y: 0 }

const dims = reactive({ width: 0, height: 0 })
let ro: ResizeObserver | null = null

const clamp = (v: number, min: number, max: number) => Math.max(min, Math.min(max, v))

const panStart = (clientX: number, clientY: number) => {
  isPanning.value = true
  start = { x: clientX, y: clientY }
  startTranslate = { ...translate }
}

const panMove = (clientX: number, clientY: number) => {
  if (!isPanning.value) return
  const dx = clientX - start.x
  const dy = clientY - start.y
  translate.x = startTranslate.x + dx
  translate.y = startTranslate.y + dy
}

const panEnd = () => {
  isPanning.value = false
}

const onMouseDown = (e: MouseEvent) => {
  if (e.button !== 0) return
  if (!e.ctrlKey) return
  e.preventDefault()
  panStart(e.clientX, e.clientY)
  window.addEventListener('mousemove', onMouseMove)
  window.addEventListener('mouseup', onMouseUp, { once: true })
}

const onMouseMove = (e: MouseEvent) => {
  panMove(e.clientX, e.clientY)
}

const onMouseUp = () => {
  panEnd()
  window.removeEventListener('mousemove', onMouseMove)
}

const zoomAtPoint = (clientX: number, clientY: number, direction: 'in' | 'out') => {
  const rect = containerRef.value?.getBoundingClientRect()
  if (!rect) return
  const step = props.step
  const prev = scale.value
  const next = clamp(prev * (direction === 'in' ? 1 + step : 1 - step), props.minScale, props.maxScale)
  if (next === prev) return

  // cursor relative to container
  const px = clientX - rect.left
  const py = clientY - rect.top
  const ratio = next / prev

  // keep the cursor pointing to the same content point
  translate.x = translate.x * ratio + px * (1 - ratio)
  translate.y = translate.y * ratio + py * (1 - ratio)
  scale.value = next
}

const onWheel = (e: WheelEvent) => {
  e.preventDefault()
  const direction = e.deltaY < 0 ? 'in' : 'out'
  zoomAtPoint(e.clientX, e.clientY, direction)
}

const zoomIn = () => {
  const rect = containerRef.value?.getBoundingClientRect()
  if (!rect) return
  zoomAtPoint(rect.left + rect.width / 2, rect.top + rect.height / 2, 'in')
}

const zoomOut = () => {
  const rect = containerRef.value?.getBoundingClientRect()
  if (!rect) return
  zoomAtPoint(rect.left + rect.width / 2, rect.top + rect.height / 2, 'out')
}

const resetView = () => {
  scale.value = props.initialScale
  translate.x = 0
  translate.y = 0
}

const clientToWorld = (clientX: number, clientY: number) => {
  const rect = containerRef.value?.getBoundingClientRect()
  const s = scale.value || 1
  if (!rect) return { x: 0, y: 0 }
  const px = clientX - rect.left
  const py = clientY - rect.top
  return {
    x: (px - translate.x) / s,
    y: (py - translate.y) / s,
  }
}

// Grid calculations in world space based on viewport
const worldBounds = computed(() => {
  const s = scale.value || 1
  return {
    minX: -translate.x / s,
    maxX: (dims.width - translate.x) / s,
    minY: -translate.y / s,
    maxY: (dims.height - translate.y) / s,
  }
})

const vLines = computed(() => {
  const size = props.gridSize
  const start = Math.floor(worldBounds.value.minX / size) * size
  const end = Math.ceil(worldBounds.value.maxX / size) * size
  const ls: number[] = []
  for (let x = start; x <= end; x += size) ls.push(x)
  return ls
})

const hLines = computed(() => {
  const size = props.gridSize
  const start = Math.floor(worldBounds.value.minY / size) * size
  const end = Math.ceil(worldBounds.value.maxY / size) * size
  const ls: number[] = []
  for (let y = start; y <= end; y += size) ls.push(y)
  return ls
})

// Infinite span limits (world space). Large enough to appear boundless.
const INF = 100000
const infMin = computed(() => -INF)
const infMax = computed(() => INF)

onMounted(() => {
  const el = containerRef.value
  if (el) {
    const rect = el.getBoundingClientRect()
    dims.width = Math.round(rect.width)
    dims.height = Math.round(rect.height)
    ro = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const cr = entry.contentRect
        dims.width = Math.round(cr.width)
        dims.height = Math.round(cr.height)
      }
    })
    ro.observe(el)
  }
})

onBeforeUnmount(() => {
  window.removeEventListener('mousemove', onMouseMove)
  if (ro && containerRef.value) ro.unobserve(containerRef.value)
  ro = null
})

// Provide context to children
provide(GRID_CONTEXT_KEY, {
  scale,
  translate: { x: toRef(translate, 'x'), y: toRef(translate, 'y') },
  worldBounds,
  gridSize: toRef(props, 'gridSize'),
  snapTolerance: toRef(props, 'snapTolerance'),
  containerEl: containerRef,
  clientToWorld,
})

// Provide snap registry so children can register their rects
const snapRegistry = createSnapRegistry()
provide(SNAP_REGISTRY_KEY, snapRegistry)
</script>
