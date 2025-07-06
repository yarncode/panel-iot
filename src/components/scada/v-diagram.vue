<template>
  <div :style="{ height: '720px' }" class="grid grid-cols-12 gap-4 w-full">
    <div class="col-span-2 border border-amber-300">
      <p>Chọn đối tượng</p>
      <el-scrollbar>
        <el-collapse v-model="activeElement">
          <el-collapse-item :style="{ '--el-collapse-header-height': '30px' }" v-for="el in elements" :key="el.name" :title="`${el.lang.vi} (${el.ls.length})`" :name="el.name">
            <div class="grid grid-cols-12">
              <div v-for="item in el.ls" :key="item.name" class="col-span-3 w-16 h-16" @click="addItemDiagram(item)">
                <component :key="item.name" :is="item.component" :disable="true" />
              </div>
            </div>
          </el-collapse-item>
        </el-collapse>
      </el-scrollbar>
    </div>
    <div ref="view_diagram" class="border border-amber-300 col-span-10 relative">
      <component v-for="pick in picker" :key="pick.id" :is="pick.component" :map="picker" :height="($.refs.view_diagram as HTMLElement).offsetHeight" :width="($.refs.view_diagram as HTMLElement).offsetWidth" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { useTemplateRef, ref, onMounted, reactive, type Component, shallowRef, markRaw } from 'vue'
import * as d3 from 'd3'
import vShortHorizontalPipe from './v-short-horizontal-pipe.vue'
import vSoleNoidValve from './v-sole-noid-valve.vue'

import type { PickerDiagram, ScadaElement, ScadaSymbol } from '@/components/scada/interface/i-diagram'
import { anchorStore } from '@/components/scada/store/anchor'

const picker = reactive<Array<PickerDiagram>>([])
const elements = reactive<Array<ScadaElement>>([
  {
    name: 'valve',
    type: 'valve',
    lang: {
      en: 'Valve',
      vi: 'Van',
    },
    ls: [
      {
        name: 'solenoidvalve',
        lang: {
          en: 'Solenoid Valve',
          vi: 'Van điện từ',
        },
        component: markRaw(vSoleNoidValve),
      },
    ],
  },
  {
    name: 'pipe',
    type: 'pipe',
    lang: {
      en: 'Pipe',
      vi: 'Ống dẫn',
    },
    ls: [
      {
        name: 'short-pipe-horizontal',
        lang: {
          en: 'Short Pipe Horizontal',
          vi: 'Ống ngắn ngang',
        },
        component: markRaw(vShortHorizontalPipe),
      },
    ],
  },
])
const activeElement = ref<Array<string>>(['valve', 'pipe'])

const addItemDiagram = (item: ScadaSymbol) => {
  const id = Date.now()
  picker.push(
    markRaw({
      ...item,
      id,
    }),
  )
}
</script>

<style scoped></style>
