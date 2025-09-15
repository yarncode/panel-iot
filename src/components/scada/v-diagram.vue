<template>
  <div :style="{ height: '720px' }" class="grid grid-cols-12 gap-4 w-full bg-transparent">
    <aside class="col-span-12 md:col-span-3 lg:col-span-2 border border-amber-300 bg-transparent flex flex-col">
      <header class="px-3 py-2 text-sm font-semibold flex items-center justify-between gap-2 bg-transparent border-b border-amber-300/50">
        <div class="flex items-center gap-2 bg-transparent">
          <i class="fi fi-rr-apps"></i>
          <span>Chọn đối tượng</span>
        </div>
      </header>

      <div class="p-2 bg-transparent">
        <el-input v-model="searchTerm" size="small" clearable placeholder="Tìm kiếm đối tượng..." class="bg-transparent w-full">
          <template #prefix>
            <i class="fi fi-rr-search"></i>
          </template>
        </el-input>
      </div>

      <el-scrollbar class="bg-transparent flex-1">
        <el-tabs v-model="activeTab" class="bg-transparent" stretch>
          <el-tab-pane label="Tất cả" name="all" class="bg-transparent">
            <section class="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-4 lg:grid-cols-3 xl:grid-cols-4 gap-2 p-2 bg-transparent">
              <template v-if="allItems.length">
                <el-tooltip v-for="item in allItems" :key="`all-` + item.name" :content="item.lang.vi" placement="top" effect="light" class="bg-transparent">
                  <button class="h-16 overflow-hidden flex items-center justify-center rounded hover:ring-2 hover:ring-emerald-400/60 transition bg-transparent" @click="addItemDiagram(item)">
                    <component :is="item.component" :disable="true" />
                  </button>
                </el-tooltip>
              </template>
              <template v-else>
                <el-empty description="Không có kết quả" class="bg-transparent" />
              </template>
            </section>
          </el-tab-pane>

          <el-tab-pane v-for="group in filteredGroups" :key="group.name" :label="`${group.lang.vi} (${group.ls.length})`" :name="group.name" class="bg-transparent">
            <section class="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-4 lg:grid-cols-3 xl:grid-cols-4 gap-2 p-2 bg-transparent">
              <template v-if="group.ls.length">
                <el-tooltip v-for="item in group.ls" :key="item.name" :content="item.lang.vi" placement="top" effect="light" class="bg-transparent">
                  <button type="button" class="w-16 h-16 flex items-center justify-center rounded hover:ring-2 hover:ring-emerald-400/60 transition bg-transparent" @click="addItemDiagram(item)">
                    <component :is="item.component" :disable="true" />
                  </button>
                </el-tooltip>
              </template>
              <template v-else>
                <el-empty description="Không có đối tượng" class="bg-transparent" />
              </template>
            </section>
          </el-tab-pane>
        </el-tabs>
      </el-scrollbar>
    </aside>

    <!-- Work area -->
    <section ref="viewDiagram" class="border border-amber-300 col-span-12 md:col-span-9 lg:col-span-10 relative bg-transparent">
      <!-- Grid container -->
      <v-grid-container class="w-full h-full bg-transparent">
        <component v-for="pick in picker" :key="pick.id" :is="pick.component" :map="picker" :resize-mode="pick.resizeMode" />
      </v-grid-container>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, markRaw, computed } from 'vue'
import vShortHorizontalPipe from './v-short-horizontal-pipe.vue'
import vSoleNoidValve from './v-sole-noid-valve.vue'
import vGridContainer from './v-grid-container.vue'

import { ResizeMode, type PickerDiagram, type ScadaElement, type ScadaSymbol } from '@/components/scada/interface/i-diagram'

const vSoleNoidValveEl = markRaw(vSoleNoidValve)
const vShortHorizontalPipeEl = markRaw(vShortHorizontalPipe)

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
        resizeMode: ResizeMode.GRID,
        component: vSoleNoidValveEl,
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
        resizeMode: ResizeMode.FREE,
        component: vShortHorizontalPipeEl,
      },
    ],
  },
])

// Side menu state
const searchTerm = ref('')
const activeTab = ref('all')

const filteredGroups = computed(() => {
  const term = searchTerm.value.trim().toLowerCase()
  if (!term) return elements
  return elements
    .map((g) => ({
      ...g,
      ls: g.ls.filter((i) => i.name.toLowerCase().includes(term) || i.lang.vi.toLowerCase().includes(term) || i.lang.en.toLowerCase().includes(term)),
    }))
    .filter((g) => g.ls.length > 0)
})

const allItems = computed(() => filteredGroups.value.flatMap((g) => g.ls))

const addItemDiagram = (item: ScadaSymbol) => {
  const id = Date.now() + Math.random()
  picker.push(
    markRaw({
      ...item,
      id,
    }),
  )
}
</script>
