import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { Check } from '@phosphor-icons/react'
import { FadeText } from '../wishlist-priya/parts'

/**
 * “Hint status step” (DS 834:79226): 22px circle (done = violet with a bold
 * 12px check, upcoming = white with a 1.5px #E0E0E0 ring), a 2×28 connector
 * (violet once the next step is done, #E4E4E7 otherwise) and a stack with
 * pt 2 / pb 10 / gap 6: title Semibold 14 (black or #767676), caption 12.
 * When a step turns done in place (B4 → B4b) the circle fills, the check
 * pops and a soft ring ripples out.
 */
export function HintStatusStep({
  done,
  title,
  caption,
  last,
  lineDone,
  'data-anno': anno,
}: {
  done: boolean
  title: string
  caption: string
  /** Last step has no connector. */
  last?: boolean
  /** The step after this one is done, so the connector is violet. */
  lineDone?: boolean
  'data-anno'?: string
}) {
  const reduce = useReducedMotion()
  const spring = { type: 'spring', stiffness: 520, damping: 30 } as const
  return (
    <motion.div layout="position" data-anno={anno} className="flex gap-3" transition={spring}>
      <div className="flex w-[22px] shrink-0 flex-col items-center">
        <motion.span
          className="relative flex size-[22px] items-center justify-center rounded-full border-[1.5px] border-solid"
          initial={false}
          animate={{ backgroundColor: done ? '#5a39e3' : '#ffffff', borderColor: done ? '#5a39e3' : '#e0e0e0' }}
          transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
        >
          <AnimatePresence initial={false}>
            {done && (
              <motion.span
                key="check"
                className="flex"
                initial={{ scale: 0.2, opacity: 0, rotate: -20 }}
                animate={{ scale: 1, opacity: 1, rotate: 0 }}
                exit={{ scale: 0.4, opacity: 0 }}
                transition={{ type: 'spring', stiffness: 700, damping: 18, delay: 0.12 }}
              >
                <Check size={12} weight="bold" color="#fff" />
              </motion.span>
            )}
          </AnimatePresence>
          <AnimatePresence initial={false}>
            {done && !reduce && (
              <motion.span
                key="ripple"
                aria-hidden
                className="pointer-events-none absolute -inset-[1.5px] rounded-full border-2 border-violet"
                initial={{ scale: 1, opacity: 0.5 }}
                animate={{ scale: 1.9, opacity: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1], delay: 0.1 }}
              />
            )}
          </AnimatePresence>
        </motion.span>
        <AnimatePresence initial={false}>
          {!last && (
            <motion.span
              key="line"
              className="relative w-[2px] overflow-hidden bg-[#e4e4e7]"
              initial={{ height: 0 }}
              animate={{ height: 28 }}
              exit={{ height: 0 }}
              transition={spring}
            >
              <motion.span
                className="absolute inset-0 origin-top bg-violet"
                initial={false}
                animate={{ scaleY: lineDone ? 1 : 0 }}
                transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1], delay: lineDone ? 0.2 : 0 }}
              />
            </motion.span>
          )}
        </AnimatePresence>
      </div>
      <div className="flex min-w-0 flex-1 flex-col gap-[6px] pb-[10px] pt-[2px] leading-[normal]">
        <motion.div initial={false} animate={{ color: done ? '#000000' : '#767676' }} transition={{ duration: 0.28 }}>
          <FadeText text={title} className="text-[14px] font-semibold" />
        </motion.div>
        <FadeText text={caption} className="-my-[1.5px] text-[12px] leading-[15px] text-muted" />
      </div>
    </motion.div>
  )
}
