<template>
  <svg :class="disable ? '' : 'absolute'" :width="disable ? '100%' : props.size" ref="svg" @contextmenu.prevent="openMenu">
    <g ref="contentG" :transform="`scale(${scale.x}, ${scale.y})`">
      <slot></slot>
    </g>

    <g v-if="props.disable == false && showCoordinateSymbol">
      <circle v-for="(point, index) in props.mark_point" :key="index" :cx="(point.x / 100) * size.width" :cy="(point.y / 100) * size.height" :r="2" fill="white" stroke="#000" stroke-width="1" />
    </g>

    <!-- Resize overlay -->
    <g v-if="!props.disable && resizing">
      <rect x="0" y="0" :width="size.width" :height="size.height" fill="transparent" stroke="#3b82f6" stroke-width="1.5" stroke-dasharray="4 2" />
      <rect v-for="h in handleDefs" :key="h.dir" :x="h.x - handleSize / 2" :y="h.y - handleSize / 2" :width="handleSize" :height="handleSize" fill="#ffffff" stroke="#1f2937" stroke-width="1" :class="cursorClass(h.dir)" @pointerdown.stop.prevent="beginHandleDrag(h.dir, $event)" />
    </g>
  </svg>
</template>

<script setup lang="ts">
import { ref, onMounted, reactive, h, inject, computed, watch } from 'vue'
import type { PropType } from 'vue'
import * as d3 from 'd3'
import { onClickOutside } from '@vueuse/core'

import { type PickerDiagram, ResizeMode } from '@/components/scada/interface/i-diagram'
import type { IAnchorAbstract, IAnchorCoordinate, IAnchorSizeElement } from '@/components/scada/interface/i-anchor'

import vMenu from '@imengyu/vue3-context-menu'

import { GRID_CONTEXT_KEY } from '@/components/scada/context/grid-context'

const props = defineProps({
  width: { type: Number, default: 400 },
  height: { type: Number, default: 300 },
  size: { type: Number, default: 100 },
  disable: { type: Boolean, default: false },
  anchor_name: { type: String, required: true },
  anchor_snap: { type: Number, default: 10 },
  space_box_resize: { type: Number, default: 10 },
  resizeMode: { type: Object as PropType<ResizeMode>, default: ResizeMode.GRID },
  mark_point: {
    type: Array as PropType<readonly IAnchorAbstract[]>,
    required: true,
  },
  map: { type: Array as PropType<readonly PickerDiagram[]>, default: () => [] },
})
const svg = ref<SVGSVGElement | null>(null)
const contentG = ref<SVGGElement | null>(null)
const showCoordinateSymbol = ref<boolean>(false)
const resizing = ref<boolean>(false)

const size = reactive<IAnchorSizeElement>({
  width: 0,
  height: 0,
})

const originalSize = reactive<{ width: number; height: number }>({
  width: 0,
  height: 0,
})

const scale = reactive<{ x: number; y: number }>({ x: 1, y: 1 })

const pos = reactive<IAnchorCoordinate>({
  x: 0,
  y: 0,
})

const gridCtx = inject(GRID_CONTEXT_KEY, null)
let dragOffset = { dx: 0, dy: 0 }

const handleSize = 8

type ResizeDir = 'n' | 's' | 'e' | 'w' | 'ne' | 'nw' | 'se' | 'sw'

const handleDefs = computed(
  () =>
    [
      { dir: 'n', x: size.width / 2, y: 0 },
      { dir: 's', x: size.width / 2, y: size.height },
      { dir: 'e', x: size.width, y: size.height / 2 },
      { dir: 'w', x: 0, y: size.height / 2 },
      { dir: 'ne', x: size.width, y: 0 },
      { dir: 'nw', x: 0, y: 0 },
      { dir: 'se', x: size.width, y: size.height },
      { dir: 'sw', x: 0, y: size.height },
    ] as Array<{ dir: ResizeDir; x: number; y: number }>,
)

const cursorClass = (dir: ResizeDir) => {
  switch (dir) {
    case 'n':
    case 's':
      return 'cursor-ns-resize'
    case 'e':
    case 'w':
      return 'cursor-ew-resize'
    case 'ne':
    case 'sw':
      return 'cursor-nesw-resize'
    case 'nw':
    case 'se':
      return 'cursor-nwse-resize'
    default:
      return 'cursor-default'
  }
}

const onSvgBlur = (event: PointerEvent) => {
  showCoordinateSymbol.value = false
  resizing.value = false
}

console.log(props.resizeMode)

const closeMenu = () => {}

const openMenu = (event: MouseEvent) => {
  vMenu.showContextMenu({
    x: event.x,
    y: event.y,
    theme: 'mac dark',
    items: [
      {
        icon: h('i', { class: 'fi fi-rr-location-crosshairs leading-none mt-[3px]' }),
        label: 'xem định vị đối tượng',
        onClick: (e?: MouseEvent | KeyboardEvent | undefined) => {
          showCoordinateSymbol.value = true
        },
      },
      {
        icon: h('i', { class: 'fi fi-rr-expand leading-none mt-[3px]' }),
        label: 'chỉnh kích thước',
        onClick: () => {
          resizing.value = true
        },
      },
    ],
  })
}

onClickOutside(svg, onSvgBlur)

function updateSvgSizeStyle() {
  if (!svg.value) return
  d3.select(svg.value)
    .style('width', props.disable ? '100%' : `${size.width}px`)
    .style('height', props.disable ? '100%' : `${size.height}px`)
}

watch(
  () => [size.width, size.height],
  () => {
    updateSvgSizeStyle()
  },
)

onMounted(() => {
  /* phase: query real pos elment */
  const rect = (d3.select(svg.value).selectChild('g').node() as HTMLElement).getBoundingClientRect()
  const currScale = gridCtx?.scale.value ?? 1
  size.width = rect.width / currScale
  size.height = rect.height / currScale

  originalSize.width = size.width
  originalSize.height = size.height

  // Initial placement: try keep at (0,0) in world space, constrained to current viewport
  if (gridCtx) {
    const wb = gridCtx.worldBounds.value
    pos.x = Math.max(wb.minX, Math.min(wb.maxX - size.width, 0))
    pos.y = Math.max(wb.minY, Math.min(wb.maxY - size.height, 0))
  } else {
    pos.x = (props.width - size.width) / 2
    pos.y = (props.height - size.height) / 2
  }

  d3.select(svg.value)
    .style('width', props.disable ? '100%' : `${size.width}px`)
    .style('height', props.disable ? '100%' : `${size.height}px`)

  if (props.disable) return

  /* phase: init default coordinate */
  d3.select(svg.value).transition().duration(50).ease(d3.easeQuadInOut).attr('transform', `translate(${pos.x}, ${pos.y})`)

  const drag = d3
    .drag<SVGSVGElement, unknown>()
    .on('start', (event: d3.D3DragEvent<SVGSVGElement, unknown, unknown>) => {
      const se = event.sourceEvent as MouseEvent
      if (gridCtx) {
        const p = gridCtx.clientToWorld(se.clientX, se.clientY)
        dragOffset.dx = p.x - pos.x
        dragOffset.dy = p.y - pos.y
      } else {
        dragOffset.dx = size.width / 2
        dragOffset.dy = size.height / 2
      }
    })
    .on('drag', (event: d3.D3DragEvent<SVGSVGElement, unknown, unknown>) => {
      const se = event.sourceEvent as MouseEvent
      if (gridCtx) {
        const p = gridCtx.clientToWorld(se.clientX, se.clientY)
        const gs = gridCtx.gridSize.value
        const wb = gridCtx.worldBounds.value

        let nx = p.x - dragOffset.dx
        let ny = p.y - dragOffset.dy

        // snap to nearest grid cell
        nx = Math.round(nx / gs) * gs
        ny = Math.round(ny / gs) * gs

        // clamp to visible bounds
        nx = Math.max(wb.minX, Math.min(wb.maxX - size.width, nx))
        ny = Math.max(wb.minY, Math.min(wb.maxY - size.height, ny))

        pos.x = nx
        pos.y = ny
      } else {
        // fallback legacy logic
        pos.x = Math.max(0, Math.min(props.width - size.width, event.x - size.width / 2))
        pos.y = Math.max(0, Math.min(props.height - size.height, event.y - size.height / 2))
      }

      d3.select(svg.value).transition().duration(10).ease(d3.easeQuadInOut).attr('transform', `translate(${pos.x}, ${pos.y})`)
    })

  d3.select(svg.value).call(drag as any)
})

function getPointer(e: MouseEvent | PointerEvent) {
  if (gridCtx) return gridCtx.clientToWorld(e.clientX, e.clientY)
  return { x: e.clientX, y: e.clientY }
}

let resizeSession: {
  dir: ResizeDir
  startPointer: { x: number; y: number }
  startPos: { x: number; y: number }
  startSize: { w: number; h: number }
} | null = null

function beginHandleDrag(dir: ResizeDir, e: PointerEvent) {
  if (props.disable) return
  resizing.value = true
  const sp = getPointer(e)
  resizeSession = {
    dir,
    startPointer: sp,
    startPos: { x: pos.x, y: pos.y },
    startSize: { w: size.width, h: size.height },
  }

  const onMove = (ev: PointerEvent) => {
    if (!resizeSession) return
    const p = getPointer(ev)
    const dx = p.x - resizeSession.startPointer.x
    const dy = p.y - resizeSession.startPointer.y
    applyResize(resizeSession.dir, dx, dy)
  }

  const onUp = () => {
    window.removeEventListener('pointermove', onMove)
    window.removeEventListener('pointerup', onUp)
    resizeSession = null
  }

  window.addEventListener('pointermove', onMove)
  window.addEventListener('pointerup', onUp, { once: true })
}

function applyResize(dir: ResizeDir, dx: number, dy: number) {
  if (!resizeSession) return
  const minSize = 10
  let nx = resizeSession.startPos.x
  let ny = resizeSession.startPos.y
  let nw = resizeSession.startSize.w
  let nh = resizeSession.startSize.h

  // propose new values based on handle direction
  if (dir.includes('e')) nw = resizeSession.startSize.w + dx
  if (dir.includes('s')) nh = resizeSession.startSize.h + dy
  if (dir.includes('w')) {
    nx = resizeSession.startPos.x + dx
    nw = resizeSession.startSize.w - dx
  }
  if (dir.includes('n')) {
    ny = resizeSession.startPos.y + dy
    nh = resizeSession.startSize.h - dy
  }

  // helpers
  const clampToBounds = () => {
    if (gridCtx) {
      const wb = gridCtx.worldBounds.value
      // clamp position first
      if (nx < wb.minX) {
        if (dir.includes('w')) nw -= wb.minX - nx
        nx = wb.minX
      }
      if (ny < wb.minY) {
        if (dir.includes('n')) nh -= wb.minY - ny
        ny = wb.minY
      }
      if (nx + nw > wb.maxX) {
        if (dir.includes('e')) nw = wb.maxX - nx
      }
      if (ny + nh > wb.maxY) {
        if (dir.includes('s')) nh = wb.maxY - ny
      }
    } else {
      nx = Math.max(0, nx)
      ny = Math.max(0, ny)
      if (nx + nw > props.width) {
        if (dir.includes('e')) nw = props.width - nx
      }
      if (ny + nh > props.height) {
        if (dir.includes('s')) nh = props.height - ny
      }
    }
  }

  // mode-specific adjustments
  if (props.resizeMode === ResizeMode.FREE) {
    // no snapping
    nw = Math.max(minSize, nw)
    nh = Math.max(minSize, nh)
    clampToBounds()
  } else if (props.resizeMode === ResizeMode.ASPECT) {
    // maintain 1:1 aspect with snapping
    const gs = gridCtx?.gridSize.value ?? props.anchor_snap

    // First, ensure positive sizes respecting min
    nw = Math.max(minSize, nw)
    nh = Math.max(minSize, nh)

    // Make square anchored against opposite edges of the dragged handle
    let side = Math.max(nw, nh)

    // Snap side to grid
    side = Math.max(minSize, Math.round(side / gs) * gs)

    // Determine reference edges before modifying
    const right = nx + nw
    const bottom = ny + nh

    // Adjust position to keep the opposite edge/corner anchored
    if (dir.includes('w')) {
      // keep right edge fixed
      nx = right - side
    }
    if (dir.includes('n')) {
      // keep bottom edge fixed
      ny = bottom - side
    }

    // If dragging only E or W, keep top aligned; only N or S, keep left aligned
    // (handled by not changing ny/nx respectively when not included)

    // Assign square
    nw = side
    nh = side

    // Snap position to grid
    nx = Math.round(nx / gs) * gs
    ny = Math.round(ny / gs) * gs

    // Clamp while preserving square
    if (gridCtx) {
      const wb = gridCtx.worldBounds.value
      // shift inside bounds without breaking square
      nx = Math.min(Math.max(wb.minX, nx), wb.maxX - nw)
      ny = Math.min(Math.max(wb.minY, ny), wb.maxY - nh)
      // ensure still fits; if not, reduce square size to fit
      const maxSide = Math.max(minSize, Math.min(wb.maxX - nx, wb.maxY - ny))
      if (nw > maxSide || nh > maxSide) {
        const newSide = Math.floor(maxSide / gs) * gs
        nw = Math.max(minSize, newSide)
        nh = nw
        // adjust again to keep inside
        nx = Math.min(Math.max(wb.minX, nx), wb.maxX - nw)
        ny = Math.min(Math.max(wb.minY, ny), wb.maxY - nh)
      }
    } else {
      nx = Math.min(Math.max(0, nx), props.width - nw)
      ny = Math.min(Math.max(0, ny), props.height - nh)
      const maxSide = Math.max(minSize, Math.min(props.width - nx, props.height - ny))
      if (nw > maxSide || nh > maxSide) {
        const newSide = Math.floor(maxSide / gs) * gs
        nw = Math.max(minSize, newSide)
        nh = nw
        nx = Math.min(Math.max(0, nx), props.width - nw)
        ny = Math.min(Math.max(0, ny), props.height - nh)
      }
    }
  } else {
    // GRID (default): snap position/size to grid on the axes being changed
    const gs = gridCtx?.gridSize.value ?? props.anchor_snap

    // snap pos: always round, safe if unchanged
    nx = Math.round(nx / gs) * gs
    ny = Math.round(ny / gs) * gs

    // snap size with minimum
    nw = Math.max(minSize, Math.round(nw / gs) * gs)
    nh = Math.max(minSize, Math.round(nh / gs) * gs)

    clampToBounds()
  }

  // apply
  pos.x = nx
  pos.y = ny
  size.width = nw
  size.height = nh

  // update content scale based on original content size
  if (originalSize.width > 0) scale.x = size.width / originalSize.width
  if (originalSize.height > 0) scale.y = size.height / originalSize.height

  // update translation immediately (no transition for responsiveness)
  if (svg.value) d3.select(svg.value).attr('transform', `translate(${pos.x}, ${pos.y})`)
}
</script>
