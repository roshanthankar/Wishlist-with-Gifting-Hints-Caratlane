import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'

/** Shell-level UI state: annotation toggle and the highlighted annotation. */
interface UiState {
  annotations: boolean
  setAnnotations: (v: boolean | ((p: boolean) => boolean)) => void
  activeAnno: string | null
  setActiveAnno: (id: string | null) => void
}

const UiContext = createContext<UiState | null>(null)
const KEY = 'cl-proto.annotations'

export function UiProvider({ children }: { children: ReactNode }) {
  const [annotations, setAnnotations] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false
    const q = new URLSearchParams(window.location.search).get('notes')
    if (q === '1' || q === '0') return q === '1'
    return window.localStorage.getItem(KEY) === '1'
  })
  const [activeAnno, setActiveAnno] = useState<string | null>(null)

  useEffect(() => {
    window.localStorage.setItem(KEY, annotations ? '1' : '0')
    if (!annotations) setActiveAnno(null)
  }, [annotations])

  const value = useMemo(() => ({ annotations, setAnnotations, activeAnno, setActiveAnno }), [annotations, activeAnno])
  return <UiContext.Provider value={value}>{children}</UiContext.Provider>
}

export function useUi() {
  const ctx = useContext(UiContext)
  if (!ctx) throw new Error('useUi must be used inside <UiProvider>')
  return ctx
}
