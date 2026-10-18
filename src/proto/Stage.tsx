import { useRef, type ReactNode, type RefObject } from 'react'
import { AnimatePresence, motion, useIsPresent, useReducedMotion, type Variants } from 'motion/react'
import { useNav, type Direction } from './nav'
import type { Transition } from './frames'
import { ROUTES } from '@/screens/registry'

/**
 * Renders the top of the navigation stack with native-feeling transitions:
 *   push  — iOS navigation push/pop (new page slides over, old one parallaxes)
 *   modal — full-screen cover slides up (B3b QR card)
 *   app   — switching apps / devices (WhatsApp → Safari, Rahul → Ananya)
 * A swipe from the left edge goes back, like iOS.
 */
type Custom = { dir: Direction; t: Transition; reduce: boolean }

const EASE = [0.32, 0.72, 0, 1] as const

const variants: Variants = {
  enter: ({ dir, t, reduce }: Custom) => {
    if (reduce || dir === 'none') return { opacity: dir === 'none' ? 1 : 0, x: 0, y: 0, scale: 1, zIndex: 2 }
    if (t === 'push') return dir === 'forward' ? { x: '100%', zIndex: 2 } : { x: '-28%', zIndex: 1 }
    if (t === 'modal') return dir === 'forward' ? { y: '100%', zIndex: 2 } : { scale: 0.94, opacity: 0.6, zIndex: 1 }
    return dir === 'forward' ? { scale: 0.86, opacity: 0, zIndex: 2 } : { scale: 1.06, opacity: 0, zIndex: 1 }
  },
  center: ({ reduce }: Custom) => ({
    x: 0,
    y: 0,
    scale: 1,
    opacity: 1,
    transition: reduce ? { duration: 0.2 } : { duration: 0.5, ease: EASE },
  }),
  exit: ({ dir, t, reduce }: Custom) => {
    const transition = reduce ? { duration: 0.2 } : { duration: 0.5, ease: EASE }
    if (reduce || dir === 'none') return { opacity: 0, zIndex: 1, transition }
    if (t === 'push') return dir === 'forward' ? { x: '-28%', zIndex: 1, transition } : { x: '100%', zIndex: 2, transition }
    if (t === 'modal') return dir === 'forward' ? { scale: 0.94, opacity: 0.6, zIndex: 1, transition } : { y: '100%', zIndex: 2, transition }
    return dir === 'forward'
      ? { scale: 1.06, opacity: 0, zIndex: 1, transition: { duration: 0.35, ease: EASE } }
      : { scale: 0.86, opacity: 0, zIndex: 2, transition: { duration: 0.35, ease: EASE } }
  },
}

export function Stage() {
  const { stack, dir, transition, back, epoch } = useNav()
  const reduce = !!useReducedMotion()
  const top = stack[stack.length - 1]
  const Route = ROUTES[top.route]
  const custom: Custom = { dir, t: transition, reduce }
  const swipe = useRef<{ x: number; y: number; id: number } | null>(null)

  return (
    <div className="absolute inset-0 overflow-hidden bg-black">
      <AnimatePresence initial={false} custom={custom}>
        <Page key={`${top.key}-${epoch}`} pageKey={top.key} custom={custom} shadow={transition === 'push'} onSwipeBack={back} swipe={swipe}>
          <Route frame={top.frame} />
        </Page>
      </AnimatePresence>
    </div>
  )
}

/** One page in the stack. Leaving pages drop `data-page-active` so annotations follow the new page. */
function Page({
  pageKey,
  custom,
  shadow,
  onSwipeBack,
  swipe,
  children,
}: {
  pageKey: string
  custom: Custom
  shadow: boolean
  onSwipeBack: () => void
  swipe: RefObject<{ x: number; y: number; id: number } | null>
  children: ReactNode
}) {
  const present = useIsPresent()
  return (
    <motion.div
      data-page={pageKey}
      data-page-active={present ? 'true' : 'false'}
      custom={custom}
      variants={variants}
      initial="enter"
      animate="center"
      exit="exit"
      className="absolute inset-0 overflow-hidden"
      style={{ boxShadow: shadow ? '-10px 0 40px rgba(0,0,0,0.12)' : undefined, willChange: 'transform', pointerEvents: present ? 'auto' : 'none' }}
      onPointerDownCapture={(e) => {
        const box = (e.currentTarget as HTMLElement).getBoundingClientRect()
        if (e.clientX - box.left < 22) swipe.current = { x: e.clientX, y: e.clientY, id: e.pointerId }
      }}
      onPointerUpCapture={(e) => {
        const s = swipe.current
        swipe.current = null
        if (!s || s.id !== e.pointerId) return
        const dx = e.clientX - s.x
        const dy = Math.abs(e.clientY - s.y)
        if (dx > 70 && dy < dx * 0.6) onSwipeBack()
      }}
    >
      {children}
    </motion.div>
  )
}
