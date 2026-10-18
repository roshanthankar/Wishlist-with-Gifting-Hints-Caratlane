import { useEffect, useLayoutEffect, useRef, useState, type RefObject } from 'react'
import { motion } from 'motion/react'
import { useUi } from './ui'
import { useNav } from './nav'
import type { FrameId } from './frames'
import { ANNOTATIONS } from '@/screens/registry'

/**
 * Annotations: each frame lists what is on screen and why. Elements opt in
 * with `data-anno="<id>"`; the layer finds them inside the active page and
 * pins a numbered marker to each. The side panel lists the notes by number;
 * clicking a note scrolls its element into view and pulses its pin.
 */
export interface Annotation {
  /** Matches `data-anno` on the element. */
  id: string
  title: string
  body: string
}

export type FrameAnnotations = Partial<Record<FrameId, Annotation[]>>

const EMPTY: Annotation[] = []

export function annotationsFor(frame: FrameId): Annotation[] {
  return ANNOTATIONS[frame] ?? EMPTY
}

interface Pin {
  id: string
  n: number
  x: number
  y: number
  rect: { x: number; y: number; w: number; h: number }
  visible: boolean
}

function findTarget(root: HTMLElement, id: string): HTMLElement | null {
  const page = root.querySelector<HTMLElement>('[data-page-active="true"]') ?? root
  return page.querySelector<HTMLElement>(`[data-anno="${CSS.escape(id)}"]`)
}

/** Scroll an annotated element into view inside its scroller. */
export function revealAnnotation(root: HTMLElement | null, id: string) {
  if (!root) return
  const el = findTarget(root, id)
  el?.scrollIntoView({ block: 'center', behavior: 'smooth' })
}

export function AnnotationLayer({ rootRef, scale = 1 }: { rootRef: RefObject<HTMLElement | null>; scale?: number }) {
  const { annotations, activeAnno, setActiveAnno } = useUi()
  const { frame } = useNav()
  const list = annotationsFor(frame)
  const [pins, setPins] = useState<Pin[]>([])
  const last = useRef('')

  useLayoutEffect(() => {
    if (!annotations) {
      if (last.current !== '') setPins([])
      last.current = ''
      return
    }
    let raf = 0
    const tick = () => {
      const root = rootRef.current
      if (root) {
        const box = root.getBoundingClientRect()
        const W = box.width / scale
        const H = box.height / scale
        const next: Pin[] = []
        list.forEach((a, i) => {
          const el = findTarget(root, a.id)
          if (!el) return
          const r = el.getBoundingClientRect()
          const x = (r.left - box.left) / scale
          const y = (r.top - box.top) / scale
          const w = r.width / scale
          const h = r.height / scale
          const visible = w > 0 && h > 0 && y + h > 8 && y < H - 8 && x + w > 0 && x < W
          // Pin sits on the element’s top-left corner, nudged inside the screen.
          let px = Math.min(Math.max(x - 8, 4), W - 26)
          let py = Math.min(Math.max(y - 8, 4), H - 26)
          // Avoid stacking pins on the same spot.
          for (const p of next) {
            if (Math.abs(p.x - px) < 20 && Math.abs(p.y - py) < 20) px = Math.min(p.x + 24, W - 26)
          }
          if (px > W - 26) {
            px = W - 26
            py += 24
          }
          next.push({ id: a.id, n: i + 1, x: px, y: py, rect: { x, y, w, h }, visible })
        })
        const key = JSON.stringify(next.map((p) => [p.id, Math.round(p.x), Math.round(p.y), Math.round(p.rect.w), Math.round(p.rect.h), p.visible]))
        if (key !== last.current) {
          last.current = key
          setPins(next)
        }
      }
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [annotations, list, rootRef, scale])

  // Clear the selected pin when the frame changes.
  useEffect(() => setActiveAnno(null), [frame, setActiveAnno])

  if (!annotations) return null

  return (
    <div className="pointer-events-none absolute inset-0 z-[90]" aria-label="Annotations">
      {pins
        .filter((p) => p.visible)
        .map((p) => (
          <motion.button
            key={`p-${p.id}`}
            type="button"
            aria-label={`Annotation ${p.n}`}
            className="pointer-events-auto absolute flex size-[22px] items-center justify-center rounded-full bg-violet text-[11px] font-bold text-white shadow-[0_2px_8px_rgba(41,20,120,0.35)] ring-2 ring-white"
            style={{ left: p.x, top: p.y }}
            initial={{ scale: 0 }}
            animate={{ scale: activeAnno === p.id ? 1.25 : 1 }}
            transition={{ type: 'spring', stiffness: 600, damping: 24 }}
            onClick={(e) => {
              e.stopPropagation()
              setActiveAnno(activeAnno === p.id ? null : p.id)
            }}
          >
            {p.n}
          </motion.button>
        ))}
    </div>
  )
}
