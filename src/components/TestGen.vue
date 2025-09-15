<script setup lang="ts">
import { ref } from 'vue'

interface Field {
  type: 'string' | 'object' | 'array'
  key: string
  value?: string
  children?: Field[]
}

const fields = ref<Field[]>([])

function addField(type: Field['type'], parent?: Field) {
  const newField: Field = { type, key: '', value: '', children: [] }
  if (type === 'string') delete newField.children

  if (parent && parent.children) {
    parent.children.push(newField)
  } else {
    fields.value.push(newField)
  }
}

function generateTemplate(f: Field[], indent = 0): string {
  const pad = '  '.repeat(indent)
  return f
    .map((field) => {
      if (field.type === 'string') {
        return `${pad}${field.key}: {{ ${field.value} }}`
      }
      if (field.type === 'object') {
        return `${pad}${field.key}:\n${generateTemplate(field.children || [], indent + 1)}`
      }
      if (field.type === 'array') {
        return `${pad}${field.key}: [{% for item in ${field.key} %}\n${generateTemplate(field.children || [], indent + 1)}\n${pad}{% endfor %}]`
      }
      return ''
    })
    .join('\n')
}

const nunjucksTemplate = ref('')

function buildTemplate() {
  nunjucksTemplate.value = generateTemplate(fields.value)
}
</script>

<template>
  <div class="p-4 space-y-4">
    <div>
      <button @click="addField('string')" class="px-2 py-1 bg-blue-500 text-white rounded">+ Field</button>
      <button @click="addField('object')" class="px-2 py-1 bg-green-500 text-white rounded">+ Object</button>
      <button @click="addField('array')" class="px-2 py-1 bg-purple-500 text-white rounded">+ Array</button>
    </div>

    <div>
      <FieldEditor v-for="(f, i) in fields" :key="i" v-model="fields[i]" />
    </div>

    <button @click="buildTemplate" class="px-2 py-1 bg-orange-500 text-white rounded">Generate Nunjucks</button>

    <pre class="bg-gray-100 p-2 mt-4">{{ nunjucksTemplate }}</pre>
  </div>
</template>

<script lang="ts">
// FieldEditor.vue - Component con để edit field
import { defineComponent, PropType } from 'vue'

export default defineComponent({
  name: 'FieldEditor',
  props: {
    modelValue: { type: Object as PropType<Field>, required: true },
  },
  emits: ['update:modelValue'],
  methods: {
    update(key: keyof Field, value: any) {
      this.$emit('update:modelValue', { ...this.modelValue, [key]: value })
    },
    addChild(type: Field['type']) {
      if (!this.modelValue.children) this.modelValue.children = []
      this.modelValue.children.push({ type, key: '', value: '', children: [] })
    },
  },
  template: `
    <div class="border p-2 m-2">
      <input v-model="modelValue.key" placeholder="Key" class="border px-1" />
      <template v-if="modelValue.type === 'string'">
        <input v-model="modelValue.value" placeholder="Value" class="border px-1 ml-2" />
      </template>

      <template v-if="modelValue.type !== 'string'">
        <div class="mt-1 space-x-1">
          <button @click="addChild('string')" class="bg-blue-400 px-1 text-white">+ Field</button>
          <button @click="addChild('object')" class="bg-green-400 px-1 text-white">+ Object</button>
          <button @click="addChild('array')" class="bg-purple-400 px-1 text-white">+ Array</button>
        </div>
        <FieldEditor
          v-for="(child, idx) in modelValue.children"
          :key="idx"
          v-model="modelValue.children[idx]"
        />
      </template>
    </div>
  `,
})
</script>
