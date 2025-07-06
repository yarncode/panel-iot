<template>
  <svg :class="disable ? '' : 'absolute'" :width="disable ? '100%' : props.size" ref="svg" @contextmenu.prevent="openMenu">
    <slot></slot>
    <g v-if="props.disable == false && showCoordinateSymbol">
      <circle v-for="(point, index) in props.mark_point" :key="index" :cx="(point.x / 100) * size.width" :cy="(point.y / 100) * size.height" :r="2" fill="white" stroke="#000" stroke-width="1" />
    </g>
  </svg>
</template>

<script setup lang="ts">
import { ref, onMounted, reactive, h } from 'vue'
import type { PropType } from 'vue'
import * as d3 from 'd3'
import { onClickOutside } from '@vueuse/core'

import type { PickerDiagram } from '@/components/scada/interface/i-diagram'
import type { IAnchorAbstract, IAnchor, IAnchorCoordinate, IAnchorSizeElement } from '@/components/scada/interface/i-anchor'

import vMenu from '@imengyu/vue3-context-menu'

import { anchorStore, convertAbstractToAnchor, getDistance } from '@/components/scada/store/anchor'

const props = defineProps({
  width: { type: Number, default: 400 },
  height: { type: Number, default: 300 },
  size: { type: Number, default: 100 },
  disable: { type: Boolean, default: false },
  anchor_name: { type: String, required: true },
  anchor_snap: { type: Number, default: 10 },
  space_box_resize: { type: Number, default: 10 },
  mark_point: {
    type: Array as PropType<readonly IAnchorAbstract[]>,
    required: true,
  },
  map: { type: Array as PropType<readonly PickerDiagram[]>, default: () => [] },
})
const svg = ref<SVGSVGElement | null>(null)
const showCoordinateSymbol = ref<boolean>(false)

const size = reactive<IAnchorSizeElement>({
  width: 0,
  height: 0,
})

const pos = reactive<IAnchorCoordinate>({
  x: 0,
  y: 0,
})

const onSvgBlur = (event: PointerEvent) => {
  showCoordinateSymbol.value = false
}

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
    ],
  })
}

onClickOutside(svg, onSvgBlur)

onMounted(() => {
  /* phase: query real pos elment */
  size.width = (d3.select(svg.value).selectChild('g').node() as HTMLElement).getBoundingClientRect().width
  size.height = (d3.select(svg.value).selectChild('g').node() as HTMLElement).getBoundingClientRect().height

  pos.x = (props.width - size.width) / 2
  pos.y = (props.height - size.height) / 2

  d3.select(svg.value)
    .style('width', props.disable ? '100%' : `${size.width}px`)
    .style('height', props.disable ? '100%' : `${size.height}px`)

  if (props.disable) return

  /* phase: init default coordinate */
  d3.select(svg.value).transition().duration(50).ease(d3.easeQuadInOut).attr('transform', `translate(${pos.x}, ${pos.y})`)

  /* phase: init anchor */
  props.mark_point.forEach((point: IAnchorAbstract) => {
    anchorStore.add(convertAbstractToAnchor(props.anchor_name, point, size, pos))
  })

  const drag = d3
    .drag()
    .on('drag', (event: d3.D3DragEvent<SVGSVGElement, unknown, unknown>) => {
      pos.x = Math.max(0, Math.min(props.width - size.width, event.x - size.width / 2))
      pos.y = Math.max(0, Math.min(props.height - size.height, event.y - size.height / 2))

      const anchorMatch = props.mark_point.map((point) => getDistance(props.anchor_name, pos.x + (point.x / 100) * size.width, pos.y + (point.y / 100) * size.height)).filter((anchor) => anchor !== undefined)
      const pointMatch = anchorMatch.reduce((min, curr, index, arr) => (curr.dest < min.dest ? curr : min), anchorMatch[0])

      if (pointMatch) {
        const spaceX = pointMatch.anchor.x - pointMatch.src.x
        const spaceY = pointMatch.anchor.y - pointMatch.src.y

        if (pointMatch.dest < props.anchor_snap) {
          pos.x = pos.x + spaceX
          pos.y = pos.y + spaceY
        }
      }

      d3.select(svg.value).transition().duration(50).ease(d3.easeQuadInOut).attr('transform', `translate(${pos.x}, ${pos.y})`)
    })
    .on('end', () => {
      anchorStore.removeByType(props.anchor_name)
      props.mark_point.forEach((point: IAnchorAbstract) => {
        anchorStore.add(convertAbstractToAnchor(props.anchor_name, point, size, pos))
      })
    })

  d3.select(svg.value).call(drag as any)
})
</script>
