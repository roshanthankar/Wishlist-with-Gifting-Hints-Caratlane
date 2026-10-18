import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { FRAMES, ROUTE_TRANSITION, isFrameId, type FrameId, type RouteId, type Transition } from './frames'
import { FLOWS, defaultFlowFor, flowById, type Flow } from './flows'
import { resetProtoStore } from './store'

export interface Entry {
  key: string
  route: RouteId
  frame: FrameId
  transition: Transition
}

export type Direction = 'forward' | 'back' | 'none'

interface NavState {
  stack: Entry[]
  dir: Direction
  /** Transition used for the last stack change (push or pop). */
  transition: Transition
}

export interface GoOptions {
  /** Override how the new screen enters. */
  transition?: Transition
  /** Before pushing, leave the current screen in this frame (e.g. close its sheet). */
  leaveAs?: FrameId
  /** Animate as a backwards move (used by flow “previous”). */
  backwards?: boolean
}

interface NavApi {
  frame: FrameId
  stack: Entry[]
  dir: Direction
  transition: Transition
  /** Go to a frame: same screen → state change in place; other screen → push. */
  go: (frame: FrameId, opts?: GoOptions) => void
  /** iOS back: pop the stack, or fall back to the screen this one came from. */
  back: () => void
  /** Jump from the shell (sidebar, deep link). Resets history. */
  jump: (frame: FrameId, flowId?: string) => void
  flow: Flow
  setFlow: (id: string) => void
  restart: () => void
  /** Increments on restart so screens remount and replay entrances. */
  epoch: number
}

/** Where “back” goes when a screen was opened directly (deep link / sidebar). */
const BACK_FALLBACK: Partial<Record<RouteId, FrameId>> = {
  'wishlist-rahul': 'A1',
  'list-priya': 'A5',
  dates: 'B1',
  'qr-hint': 'B3',
  'hint-status': 'B1',
  'hint-page': 'C0',
  'hint-closed': 'C0',
}

let keySeq = 0
const entryFor = (frame: FrameId, transition?: Transition): Entry => {
  const route = FRAMES[frame].route
  return { key: `${route}-${++keySeq}`, route, frame, transition: transition ?? ROUTE_TRANSITION[route] }
}

function readHash(): { frame?: FrameId; flow?: string } {
  if (typeof window === 'undefined') return {}
  const m = window.location.hash.match(/^#\/([A-Za-z0-9]+)(?:\?f=([\w-]+))?/)
  if (!m) return {}
  const frame = m[1] && isFrameId(m[1]) ? m[1] : undefined
  return { frame, flow: m[2] }
}

const NavContext = createContext<NavApi | null>(null)

export function NavProvider({ children }: { children: ReactNode }) {
  const initial = useMemo(() => {
    const h = readHash()
    // No deep link: start at the first frame of Row 01.
    const frame = h.frame ?? FLOWS[0].frames[0]
    const flow = (h.flow && flowById(h.flow)) || defaultFlowFor(frame)
    return { frame, flow }
  }, [])

  const [state, setState] = useState<NavState>(() => ({
    stack: [entryFor(initial.frame)],
    dir: 'none',
    transition: 'push',
  }))
  const [flowId, setFlowId] = useState(initial.flow.id)
  const [epoch, setEpoch] = useState(0)
  const stateRef = useRef(state)
  stateRef.current = state

  const top = state.stack[state.stack.length - 1]

  const go = useCallback((frame: FrameId, opts: GoOptions = {}) => {
    setState((s) => {
      const stack = s.stack.slice()
      const cur = stack[stack.length - 1]
      const route = FRAMES[frame].route
      if (cur.route === route) {
        stack[stack.length - 1] = { ...cur, frame }
        return { ...s, stack, dir: 'none' }
      }
      // Already further down the stack → go back to it (natural iOS back).
      const idx = stack.findIndex((e) => e.route === route)
      if (idx >= 0 && !opts.transition) {
        const popped = stack[stack.length - 1]
        const next = stack.slice(0, idx + 1)
        next[idx] = { ...next[idx], frame }
        return { stack: next, dir: 'back', transition: popped.transition }
      }
      if (opts.leaveAs) stack[stack.length - 1] = { ...cur, frame: opts.leaveAs }
      // Someone else’s phone (Rahul → Ananya, Priya → Rahul): new history.
      if (FRAMES[frame].persona !== FRAMES[cur.frame].persona) {
        const entry = entryFor(frame, opts.transition ?? 'app')
        return { stack: [entry], dir: opts.backwards ? 'back' : 'forward', transition: entry.transition }
      }
      const entry = entryFor(frame, opts.transition)
      if (opts.backwards) {
        // Flow “previous” into a screen that isn’t in history: replace, animate back.
        return { stack: [entry], dir: 'back', transition: entry.transition }
      }
      stack.push(entry)
      return { stack, dir: 'forward', transition: entry.transition }
    })
  }, [])

  const back = useCallback(() => {
    setState((s) => {
      if (s.stack.length > 1) {
        const popped = s.stack[s.stack.length - 1]
        return { stack: s.stack.slice(0, -1), dir: 'back', transition: popped.transition }
      }
      const cur = s.stack[0]
      const fallback = BACK_FALLBACK[cur.route]
      if (!fallback) return s
      return { stack: [entryFor(fallback)], dir: 'back', transition: cur.transition }
    })
  }, [])

  const jump = useCallback((frame: FrameId, nextFlowId?: string) => {
    if (nextFlowId) setFlowId(nextFlowId)
    setState((s) => {
      const cur = s.stack[s.stack.length - 1]
      if (cur.route === FRAMES[frame].route) {
        const stack = s.stack.slice()
        stack[stack.length - 1] = { ...cur, frame }
        return { ...s, stack, dir: 'none' }
      }
      const entry = entryFor(frame)
      return { stack: [entry], dir: 'forward', transition: entry.transition }
    })
  }, [])

  /** Back to the first frame of Row 01, with all prototype state reset. */
  const restart = useCallback(() => {
    resetProtoStore()
    setFlowId(FLOWS[0].id)
    setEpoch((e) => e + 1)
    setState({ stack: [entryFor(FLOWS[0].frames[0])], dir: 'none', transition: 'push' })
  }, [])

  // Keep the active flow sensible when the viewer taps into another row.
  const flow = flowById(flowId) ?? FLOWS[0]
  useEffect(() => {
    if (!flow.frames.includes(top.frame)) setFlowId(defaultFlowFor(top.frame).id)
  }, [top.frame, flow])

  // Deep links: #/A3?f=row-1 (shareable with a recruiter).
  useEffect(() => {
    const hash = `#/${top.frame}?f=${flow.id}`
    if (window.location.hash !== hash) window.history.replaceState(null, '', hash)
  }, [top.frame, flow.id])

  useEffect(() => {
    const onHash = () => {
      const h = readHash()
      if (h.frame && h.frame !== stateRef.current.stack.at(-1)?.frame) jump(h.frame, h.flow)
    }
    window.addEventListener('hashchange', onHash)
    return () => window.removeEventListener('hashchange', onHash)
  }, [jump])

  const api = useMemo<NavApi>(
    () => ({
      frame: top.frame,
      stack: state.stack,
      dir: state.dir,
      transition: state.transition,
      go,
      back,
      jump,
      flow,
      setFlow: setFlowId,
      restart,
      epoch,
    }),
    [top.frame, state, go, back, jump, flow, restart, epoch],
  )

  return <NavContext.Provider value={api}>{children}</NavContext.Provider>
}

export function useNav(): NavApi {
  const ctx = useContext(NavContext)
  if (!ctx) throw new Error('useNav must be used inside <NavProvider>')
  return ctx
}

/** Every screen in Figma order: Row 01 left to right, then Row 02, and so on. */
const STORY: FrameId[] = FLOWS.flatMap((f) => f.frames)

/** Step through every screen in Figma order, row to row (shell controls + keyboard). */
export function useFlowStepper() {
  const { flow, frame, go, restart } = useNav()
  const index = STORY.indexOf(frame)
  const prevFrame = index > 0 ? STORY[index - 1] : undefined
  const nextFrame = index >= 0 && index < STORY.length - 1 ? STORY[index + 1] : undefined
  return {
    flow,
    index,
    total: STORY.length,
    prev: prevFrame ? () => go(prevFrame, { backwards: FRAMES[prevFrame].route !== FRAMES[frame].route }) : undefined,
    next: nextFrame ? () => go(nextFrame) : undefined,
    toStart: restart,
  }
}
