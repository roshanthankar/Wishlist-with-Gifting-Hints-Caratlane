import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'

/**
 * mockup — desktop / tablet: the app runs inside an iPhone 17 frame, with a
 *          drawn status bar, Dynamic Island and home indicator.
 * device — phones: the app fills the real browser, the fake status bar and
 *          fake Safari chrome are hidden and real safe areas are used.
 * figma  — ?view=figma: a bare 402×896 frame with the drawn status bar, for
 *          pixel comparison against the Figma exports (design-refs/).
 * Override for testing with ?view=device or ?view=mockup.
 */
export type ViewMode = 'mockup' | 'device' | 'figma'

const PHONE_QUERY = '(max-width: 600px), (pointer: coarse) and (max-height: 500px)'

function detect(): ViewMode {
  if (typeof window === 'undefined') return 'mockup'
  const forced = new URLSearchParams(window.location.search).get('view')
  if (forced === 'device' || forced === 'mockup' || forced === 'figma') return forced
  return window.matchMedia(PHONE_QUERY).matches ? 'device' : 'mockup'
}

export function useViewMode(): ViewMode {
  const [mode, setMode] = useState<ViewMode>(detect)
  useEffect(() => {
    const mq = window.matchMedia(PHONE_QUERY)
    const on = () => setMode(detect())
    mq.addEventListener('change', on)
    return () => mq.removeEventListener('change', on)
  }, [])
  return mode
}

interface Env {
  mode: ViewMode
  /** true inside the iPhone mockup: draw status bar, island, fake Safari bar. */
  mockup: boolean
}

const EnvContext = createContext<Env>({ mode: 'mockup', mockup: true })

export function EnvProvider({ mode, children }: { mode: ViewMode; children: ReactNode }) {
  return <EnvContext.Provider value={{ mode, mockup: mode !== 'device' }}>{children}</EnvContext.Provider>
}

export const useEnv = () => useContext(EnvContext)
