// filepath: /home/miru/coding/frontend/iot-panel/src/components/scada/context/snap-registry.ts
import { reactive, computed, type ComputedRef } from 'vue'

export interface SnapTargetRect {
  id: string
  x: number
  y: number
  width: number
  height: number
}

export interface SnapRegistry {
  register: (rect: SnapTargetRect) => void
  update: (rect: SnapTargetRect) => void
  unregister: (id: string) => void
  list: ComputedRef<SnapTargetRect[]>
}

export const SNAP_REGISTRY_KEY: unique symbol = Symbol('snap-registry')

export function createSnapRegistry(): SnapRegistry {
  const items = reactive(new Map<string, SnapTargetRect>())
  const register = (rect: SnapTargetRect) => items.set(rect.id, { ...rect })
  const update = (rect: SnapTargetRect) => items.set(rect.id, { ...rect })
  const unregister = (id: string) => items.delete(id)
  const list = computed(() => Array.from(items.values()))
  return { register, update, unregister, list }
}
