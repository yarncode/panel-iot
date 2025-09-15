import type { Ref, ComputedRef, InjectionKey } from 'vue'

export interface WorldBounds {
  minX: number
  maxX: number
  minY: number
  maxY: number
}

export interface GridContext {
  scale: Ref<number>
  translate: { x: Ref<number>; y: Ref<number> }
  worldBounds: ComputedRef<WorldBounds>
  gridSize: Ref<number>
  snapTolerance: Ref<number>
  containerEl: Ref<HTMLElement | null>
  clientToWorld: (clientX: number, clientY: number) => { x: number; y: number }
}

export const GRID_CONTEXT_KEY: InjectionKey<GridContext> = Symbol('SCADA_GRID_CTX')
