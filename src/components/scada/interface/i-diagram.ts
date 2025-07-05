import { type Component } from 'vue'

export interface ScadaSymbol {
  name: string
  lang: {
    en: string
    vi: string
  }
  component: Component
}

export interface PickerDiagram extends ScadaSymbol {
  id: any
}

export interface ScadaElement {
  name: string
  type: string
  lang: {
    en: string
    vi: string
  }
  ls: Array<ScadaSymbol>
}