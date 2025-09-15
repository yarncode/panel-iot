import { type Component } from 'vue'

export enum ResizeMode {
  GRID = 'grid',
  FREE = 'free',
  ASPECT = 'aspect',
}

export interface ScadaSymbol {
  name: string
  lang: {
    en: string
    vi: string
  }
  resizeMode: ResizeMode
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