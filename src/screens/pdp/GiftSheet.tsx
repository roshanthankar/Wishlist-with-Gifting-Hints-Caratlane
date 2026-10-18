import { useEffect, useLayoutEffect, useRef, useState, type PointerEvent as ReactPointerEvent, type ReactNode } from 'react'
import { AnimatePresence, motion, useDragControls, useReducedMotion, type PanInfo } from 'motion/react'
import { PinkSheetAura } from '@/ui'

const SHEET_SPRING = { type: 'spring', stiffness: 360, damping: 38, mass: 0.9 } as const

/**
 * The pink “Sheet · iOS 27” used by A3 and A4/A4b/A4c, built locally because
 * the shared <Sheet> can’t morph: one sheet stays mounted while its content
 * cross-fades and its height springs to the new content (like an iOS detent
 * change), instead of closing and reopening.
 *
 * Same specs as the shared Sheet: inset 8, radius 36 top / 60 bottom, white,
 * shadow 0 -2 30 /14%, grabber 36×6 /12% at 8px, scrim #000 at 50%,
 * floral + rose/violet/peach header auras. Drag the grabber or title down to
 * dismiss; tap the scrim or press Escape to close.
 */
export function GiftSheet({
  open,
  onClose,
  panelKey,
  label,
  children,
  'data-anno': anno,
}: {
  open: boolean
  onClose: () => void
  /** Changing the key cross-fades to the new content and morphs the height. */
  panelKey: string
  label: string
  children: ReactNode
  'data-anno'?: string
}) {
  const drag = useDragControls()
  const reduce = useReducedMotion()

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  const onDragEnd = (_: unknown, info: PanInfo) => {
    if (info.offset.y > 110 || info.velocity.y > 650) onClose()
  }

  /** Grabber + title area (first ~70px) drags the sheet, like iOS. */
  const startDrag = (e: ReactPointerEvent<HTMLDivElement>) => {
    const target = e.target as HTMLElement
    if (target.closest('button, input, a, [role="button"]')) return
    const top = e.currentTarget.getBoundingClientRect().top
    if (e.clientY - top < 70) drag.start(e)
  }

  return (
    <AnimatePresence>
      {open && (
        <div className="absolute inset-0 z-[70]" role="dialog" aria-modal="true" aria-label={label}>
          <motion.div
            data-anno="scrim"
            className="absolute inset-0 bg-black/50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: reduce ? 0.15 : 0.32, ease: [0.32, 0.72, 0, 1] }}
            onClick={onClose}
          />
          <motion.div
            data-anno={anno}
            className="absolute inset-x-2 bottom-2 flex max-h-[calc(100%-var(--safe-top)-8px)] flex-col overflow-hidden rounded-b-[60px] rounded-t-[36px] bg-white shadow-[0_-2px_30px_rgba(0,0,0,0.14)]"
            initial={reduce ? { opacity: 0 } : { y: '105%' }}
            animate={reduce ? { opacity: 1 } : { y: 0 }}
            exit={reduce ? { opacity: 0 } : { y: '105%' }}
            transition={reduce ? { duration: 0.2 } : SHEET_SPRING}
            drag="y"
            dragListener={false}
            dragControls={drag}
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={{ top: 0.04, bottom: 0.7 }}
            onDragEnd={onDragEnd}
          >
            <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
              <PinkSheetAura />
            </div>
            <MorphHeight reduce={!!reduce} onPointerDown={startDrag}>
              {/* Grabber (Figma “Icon” 346×6 at y 8) */}
              <div className="flex h-[14px] cursor-grab touch-none justify-center pt-2 active:cursor-grabbing">
                <div className="h-[6px] w-9 rounded-[4px] bg-black/12" />
              </div>
              <AnimatePresence mode="popLayout" initial={false}>
                <motion.div
                  key={panelKey}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1, transition: { duration: reduce ? 0.12 : 0.26, delay: reduce ? 0 : 0.08, ease: 'easeOut' } }}
                  exit={{ opacity: 0, transition: { duration: reduce ? 0.1 : 0.16, ease: 'easeIn' } }}
                >
                  {children}
                </motion.div>
              </AnimatePresence>
            </MorphHeight>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}

/**
 * Animates its own height to whatever its content measures (ResizeObserver),
 * so swapping content springs the sheet to the new detent. Shrinks and
 * scrolls if the content is taller than the screen allows.
 */
function MorphHeight({
  children,
  reduce,
  onPointerDown,
}: {
  children: ReactNode
  reduce: boolean
  onPointerDown?: (e: ReactPointerEvent<HTMLDivElement>) => void
}) {
  const inner = useRef<HTMLDivElement>(null)
  const [height, setHeight] = useState<number | 'auto'>('auto')

  useLayoutEffect(() => {
    const el = inner.current
    if (!el) return
    const measure = () => setHeight(el.offsetHeight)
    measure()
    const ro = new ResizeObserver(measure)
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  return (
    <motion.div
      className="no-scrollbar relative z-[1] min-h-0 shrink overflow-y-auto overflow-x-hidden overscroll-contain"
      initial={false}
      animate={{ height }}
      transition={reduce ? { duration: 0 } : SHEET_SPRING}
      onPointerDown={onPointerDown}
    >
      <div ref={inner} className="relative">
        {children}
      </div>
    </motion.div>
  )
}
