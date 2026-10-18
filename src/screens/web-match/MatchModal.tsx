import type { ReactNode } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { ProductPhoto, cn } from '@/ui'
import type { MatchCard } from './deck'

/**
 * A11b “Time’s up” layer: the game stays behind a white 55% wash with a
 * background blur (Figma “Scrim”, blur 12), then the white card springs up
 * (354 wide, radius 32, px 24 py 28, gap 12, shadow 0 16 48 pink 22%).
 * The same layer carries the prototype-only result card.
 */
export function MatchOverlay({
  open,
  safariInset,
  children,
}: {
  /** Key of the card to show (cards swap with a short cross-fade). */
  open: string | null
  safariInset: number
  children: ReactNode
}) {
  const reduce = useReducedMotion()
  return (
    <>
      <AnimatePresence>
        {open && (
          <motion.div
            key="scrim"
            data-anno="timesup-scrim"
            aria-hidden
            className="absolute inset-0 z-[70] bg-white/55 backdrop-blur-[6px]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: reduce ? 0.15 : 0.34, ease: [0.32, 0.72, 0, 1] }}
          />
        )}
      </AnimatePresence>
      <div
        className="pointer-events-none absolute inset-x-6 top-0 z-[75] flex items-center justify-center"
        style={{ bottom: safariInset, paddingTop: 23 }}
      >
        <AnimatePresence mode="wait">
          {open && (
            <motion.div
              key={open}
              role="dialog"
              aria-modal="true"
              className="pointer-events-auto w-full"
              initial={reduce ? { opacity: 0 } : { opacity: 0, y: 56, scale: 0.94 }}
              animate={{
                opacity: 1,
                y: 0,
                scale: 1,
                transition: reduce ? { duration: 0.2 } : { type: 'spring', stiffness: 360, damping: 28, delay: 0.14 },
              }}
              exit={{ opacity: 0, y: reduce ? 0 : 12, scale: reduce ? 1 : 0.97, transition: { duration: 0.16 } }}
            >
              {children}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  )
}

/** The white modal card itself. */
export function ModalCard({ title, children, actions, className, 'data-anno': anno }: {
  title: ReactNode
  children: ReactNode
  actions: ReactNode
  className?: string
  'data-anno'?: string
}) {
  return (
    <div
      data-anno={anno}
      className={cn(
        'flex w-full flex-col items-center gap-3 overflow-hidden rounded-[32px] bg-white px-6 py-7 shadow-[0_16px_48px_rgba(222,20,99,0.22)]',
        className,
      )}
    >
      {title}
      {children}
      <div className="flex w-full items-start gap-3 pt-2">{actions}</div>
    </div>
  )
}

/** Small fanned thumbnails of the pieces both of them loved (result card). */
export function LovedFan({ cards }: { cards: MatchCard[] }) {
  const tilt = [-6, 4, -3, 7]
  return (
    <div className="flex items-center justify-center py-1" aria-label={`You both loved ${cards.map((c) => c.name).join(', ')}`}>
      {cards.slice(0, 4).map((c, i) => (
        <motion.div
          key={c.id}
          className={cn('size-[52px] overflow-hidden rounded-[12px] border-2 border-solid border-white bg-white shadow-[0_6px_14px_rgba(140,26,77,0.16)]', i > 0 && '-ml-2')}
          initial={{ opacity: 0, y: 10, rotate: 0 }}
          animate={{ opacity: 1, y: 0, rotate: tilt[i % tilt.length] }}
          transition={{ type: 'spring', stiffness: 420, damping: 24, delay: 0.25 + i * 0.06 }}
        >
          <ProductPhoto id={c.photo} className="size-full" rounded={10} />
        </motion.div>
      ))}
      {cards.length > 4 && (
        <motion.span
          className="-ml-2 flex size-9 items-center justify-center rounded-full border-2 border-solid border-white bg-pink-tint text-[12px] font-bold leading-none text-pink shadow-[0_6px_14px_rgba(140,26,77,0.16)]"
          initial={{ opacity: 0, scale: 0.6 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: 'spring', stiffness: 520, damping: 24, delay: 0.5 }}
        >
          +{cards.length - 4}
        </motion.span>
      )}
    </div>
  )
}
