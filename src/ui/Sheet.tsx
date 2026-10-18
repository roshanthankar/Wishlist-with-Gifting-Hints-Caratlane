import { useEffect, type ReactNode } from 'react'
import { AnimatePresence, motion, useDragControls, useReducedMotion, type PanInfo } from 'motion/react'
import { X } from '@phosphor-icons/react'
import { GlassCircle } from './Button'
import { PinkSheetAura, VioletSheetAura } from './Backdrops'
import { cn } from './cn'

/**
 * iOS 27 floating sheet (“Sheet · iOS 27” in Figma):
 *   inset 8px from the screen edges, radius 36 top / 60 bottom (matches the
 *   iPhone corner), white, shadow 0 -2 30 rgba(0,0,0,.14), padding 8/20/24,
 *   grabber 36×6 rgba(0,0,0,.12), scrim #000 at 50%.
 * Drag the grabber/header down to dismiss; tap the scrim to close.
 * Place <Sheet> directly inside <Screen> so it covers the whole phone.
 */
export function Sheet({
  open,
  onClose,
  tone = 'plain',
  children,
  className,
  gap = 14,
  'data-anno': anno,
  label,
}: {
  open: boolean
  onClose?: () => void
  /** Header backdrop: pink = from Rahul (gifts), violet = from Priya (hints). */
  tone?: 'pink' | 'violet' | 'plain'
  children: ReactNode
  className?: string
  /** Vertical gap between direct children (Figma auto layout: 14). */
  gap?: number
  'data-anno'?: string
  /** Accessible name for the dialog. */
  label?: string
}) {
  const drag = useDragControls()
  const reduce = useReducedMotion()

  useEffect(() => {
    if (!open || !onClose) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  const onDragEnd = (_: unknown, info: PanInfo) => {
    if (info.offset.y > 110 || info.velocity.y > 650) onClose?.()
  }

  return (
    <AnimatePresence>
      {open && (
        <div className="absolute inset-0 z-[70]" role="dialog" aria-modal="true" aria-label={label}>
          <motion.div
            className="absolute inset-0 bg-black/50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: reduce ? 0.15 : 0.32, ease: [0.32, 0.72, 0, 1] }}
            onClick={onClose}
          />
          <motion.div
            data-anno={anno}
            className={cn(
              'absolute inset-x-2 bottom-2 flex max-h-[calc(100%-var(--safe-top)-8px)] flex-col overflow-hidden bg-white',
              'rounded-t-[36px] rounded-b-[60px] shadow-[0_-2px_30px_rgba(0,0,0,0.14)]',
            )}
            initial={reduce ? { opacity: 0 } : { y: '105%' }}
            animate={reduce ? { opacity: 1 } : { y: 0 }}
            exit={reduce ? { opacity: 0 } : { y: '105%' }}
            transition={reduce ? { duration: 0.2 } : { type: 'spring', stiffness: 360, damping: 38, mass: 0.9 }}
            drag={onClose ? 'y' : false}
            dragListener={false}
            dragControls={drag}
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={{ top: 0.04, bottom: 0.7 }}
            onDragEnd={onDragEnd}
          >
            {tone !== 'plain' && (
              <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-full overflow-hidden">
                {tone === 'pink' ? <PinkSheetAura /> : <VioletSheetAura />}
              </div>
            )}
            {/* Grabber + drag handle zone */}
            <div
              className="relative z-[1] flex h-[14px] shrink-0 cursor-grab touch-none items-start justify-center pt-2 active:cursor-grabbing"
              onPointerDown={(e) => onClose && drag.start(e)}
            >
              <div className="h-[6px] w-9 rounded-[4px] bg-black/12" />
            </div>
            <div
              className={cn('no-scrollbar relative z-[1] flex min-h-0 flex-col overflow-y-auto overscroll-contain px-5 pb-6 pt-[14px]', className)}
              style={{ gap }}
              onPointerDown={(e) => {
                // Let the header area (first ~60px) drag the sheet, like iOS.
                const top = (e.currentTarget as HTMLElement).getBoundingClientRect().top
                if (onClose && e.clientY - top < 56 && (e.target as HTMLElement).closest('button') === null) drag.start(e)
              }}
            >
              {children}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}

/**
 * Sheet title row: DM Serif Text title (pink or violet) + 36px glass close.
 * Figma: “Row · <title>”, gap 12, title 24/30 (some sheets use 28/34).
 */
export function SheetHeader({
  title,
  tone = 'pink',
  onClose,
  size = 24,
  'data-anno': anno,
}: {
  title: ReactNode
  tone?: 'pink' | 'violet'
  onClose?: () => void
  size?: 24 | 28
  'data-anno'?: string
}) {
  return (
    <div data-anno={anno} className="flex items-center gap-3">
      <h2
        className={cn('serif min-w-0 flex-1', tone === 'pink' ? 'text-pink' : 'text-violet')}
        style={{ fontSize: size, lineHeight: size === 24 ? '30px' : '34px' }}
      >
        {title}
      </h2>
      {onClose && (
        <GlassCircle size={36} label="Close" onClick={onClose}>
          <X size={16} color="#000" />
        </GlassCircle>
      )}
    </div>
  )
}
