<template>
  <div ref="container" class="w-16 h-16 grid place-items-center overflow-hidden bg-transparent">
    <div
      class="inline-flex items-center justify-center bg-transparent"
      :style="{
        transform: `scale(${scale})`,
        transformOrigin: 'center center',
      }"
    >
      <div ref="content" class="bg-transparent">
        <component :is="component" :disable="true" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, nextTick, type Component as VueComponent } from 'vue'

const props = defineProps<{ component: VueComponent }>()

const container = ref<HTMLDivElement | null>(null)
const content = ref<HTMLDivElement | null>(null)
const scale = ref(1)

let containerObserver: ResizeObserver | null = null
let contentObserver: ResizeObserver | null = null

const updateScale = () => {
  const c = container.value
  const el = content.value
  if (!c || !el) return
  const cRect = c.getBoundingClientRect()
  const elRect = el.getBoundingClientRect()
  const w = elRect.width || 1
  const h = elRect.height || 1
  const sw = cRect.width / w
  const sh = cRect.height / h
  const s = Math.min(sw, sh, 1)
  scale.value = Number.isFinite(s) && s > 0 ? s : 1
}

onMounted(async () => {
  await nextTick()
  updateScale()
  if (container.value) {
    containerObserver = new ResizeObserver(updateScale)
    containerObserver.observe(container.value)
  }
  if (content.value) {
    contentObserver = new ResizeObserver(updateScale)
    contentObserver.observe(content.value)
  }
  window.addEventListener('resize', updateScale)
})

onBeforeUnmount(() => {
  containerObserver?.disconnect()
  contentObserver?.disconnect()
  window.removeEventListener('resize', updateScale)
})
</script>
