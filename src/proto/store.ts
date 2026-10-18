import { useCallback, useSyncExternalStore } from 'react'

/**
 * Tiny global key/value store for prototype data that has to survive screen
 * changes (e.g. “saved”, the relationship picked in A3, which pick is held).
 * Keys are namespaced by screen family, e.g. `pdp.saved`, `hint.held`.
 * `resetProtoStore()` runs when the viewer restarts a flow.
 */
const values = new Map<string, unknown>()
const listeners = new Set<() => void>()
let version = 0

const emit = () => {
  version++
  listeners.forEach((l) => l())
}

const subscribe = (l: () => void) => {
  listeners.add(l)
  return () => listeners.delete(l)
}

export function getProto<T>(key: string, fallback: T): T {
  return values.has(key) ? (values.get(key) as T) : fallback
}

export function setProto<T>(key: string, value: T) {
  if (Object.is(values.get(key), value)) return
  values.set(key, value)
  emit()
}

export function resetProtoStore() {
  values.clear()
  emit()
}

type SetState<T> = (next: T | ((prev: T) => T)) => void

/** useState, but shared across screens and reset with the flow. */
export function useProtoState<T>(key: string, initial: T): [T, SetState<T>] {
  const value = useSyncExternalStore(
    subscribe,
    () => (values.has(key) ? (values.get(key) as T) : initial),
    () => initial,
  )
  const set = useCallback<SetState<T>>(
    (next) => {
      const prev = values.has(key) ? (values.get(key) as T) : initial
      const v = typeof next === 'function' ? (next as (p: T) => T)(prev) : next
      setProto(key, v)
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [key],
  )
  return [value, set]
}

/** Re-render whenever anything in the store changes (shell uses this). */
export function useProtoVersion() {
  return useSyncExternalStore(subscribe, () => version, () => version)
}
