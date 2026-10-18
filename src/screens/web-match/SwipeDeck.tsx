import { useEffect, useImperativeHandle, useRef, type Ref } from 'react'
import {
  AnimatePresence,
  animate,
  motion,
  useMotionValue,
  useReducedMotion,
  useTransform,
  type AnimationPlaybackControls,
  type MotionValue,
  type PanInfo,
} from 'motion/react'
import { ProductPhoto } from '@/ui'
import { haptic } from '@/proto/haptics'
import { DECK, type MatchCard, type Swipe } from './deck'

/**
 * Style match deck (A11 “Card stack”, 370×392). Every card is the 316×368
 * front card; the two behind are the same card scaled (0.943 / 0.88) and
 * fanned exactly as in Figma, so a card can spring forward without
 * re-layout. The front card drags with physics: it tilts with the drag, the
 * a pink / grey edge fades in with distance, and
 * past the threshold (or with enough fling velocity) it flies off.
 */

export interface DeckHandle {
  /** Swipe the front card programmatically (Leave it / Love it buttons). */
  swipe: (dir: Swipe) => void
}

type Role = 'front' | 'second' | 'third' | 'flying'

/** Card poses relative to the stack centre, from the rotated Figma bounds. */
const SHADOW_FRONT = '0px 16px 40px 0px rgba(222,20,99,0.28)'
const SHADOW_BACK = '0px 12px 32px 0px rgba(140,26,77,0.14)'
const POSE = {
  front: { x: 9.9, y: 13.5, rotate: 6, scale: 1, opacity: 1, boxShadow: SHADOW_FRONT },
  second: { x: -5.8, y: -17.8, rotate: -4, scale: 0.943, opacity: 1, boxShadow: SHADOW_BACK },
  third: { x: -8.85, y: -20.9, rotate: -8, scale: 0.88, opacity: 0.6, boxShadow: SHADOW_BACK },
} as const
const ENTER_BEHIND = { ...POSE.third, scale: 0.82, opacity: 0 }

const CARD_W = 316
const CARD_H = 368
/** Far enough to clear a 430px-wide phone even with the tilt. */
const FLY_X = 640
/** Offset (px) after which a release commits the swipe. */
const THRESHOLD = 110
const SETTLE = { type: 'spring', stiffness: 520, damping: 34 } as const
const SLOT_SPRING = { type: 'spring', stiffness: 320, damping: 30, mass: 0.9 } as const

const clamp01 = (v: number) => Math.min(1, Math.max(0, v))

export function SwipeDeck({
  index,
  flying,
  restoring,
  preview,
  disabled,
  dragX,
  onSwipe,
  onGone,
  ref,
  'data-anno': anno,
}: {
  /** Cards already decided (the front card is DECK[index]). */
  index: number
  /** Cards still animating off-screen. */
  flying: string[]
  /** A card brought back by Undo: it re-enters from the side it left. */
  restoring: { id: string; from: Swipe } | null
  /** Tint the front card’s edge without moving it (A11b). */
  preview?: Swipe | null
  disabled?: boolean
  /** Mirrors the front card’s x so the buttons can react to the drag. */
  dragX: MotionValue<number>
  onSwipe: (id: string, dir: Swipe) => void
  onGone: (id: string) => void
  ref?: Ref<DeckHandle>
  'data-anno'?: string
}) {
  const flyers = useRef(new Map<string, (dir: Swipe) => void>())
  const firstPaint = useRef(true)
  useEffect(() => {
    firstPaint.current = false
  }, [])

  const front = DECK[index]
  useImperativeHandle(ref, () => ({
    swipe: (dir) => {
      if (disabled || !front) return
      flyers.current.get(front.id)?.(dir)
    },
  }), [disabled, front])

  const visible: { card: MatchCard; role: Role }[] = []
  DECK.forEach((card, i) => {
    if (flying.includes(card.id)) visible.push({ card, role: 'flying' })
    else if (i === index) visible.push({ card, role: 'front' })
    else if (i === index + 1) visible.push({ card, role: 'second' })
    else if (i === index + 2) visible.push({ card, role: 'third' })
  })

  return (
    <div data-anno={anno} className="relative h-[392px] w-full" role="group" aria-roledescription="card deck">
      <AnimatePresence>
        {visible.map(({ card, role }) => (
          <SwipeCard
            key={card.id}
            card={card}
            role={role}
            position={DECK.indexOf(card) + 1}
            appear={!firstPaint.current}
            enterFrom={restoring?.id === card.id ? restoring.from : undefined}
            preview={role === 'front' ? preview : null}
            disabled={disabled}
            dragX={dragX}
            register={(fn) => {
              if (fn) flyers.current.set(card.id, fn)
              else flyers.current.delete(card.id)
            }}
            onSwipe={(dir) => onSwipe(card.id, dir)}
            onGone={onGone}
          />
        ))}
      </AnimatePresence>
    </div>
  )
}

const Z: Record<Role, number> = { third: 1, second: 2, front: 3, flying: 4 }

function SwipeCard({
  card,
  role,
  position,
  appear,
  enterFrom,
  preview,
  disabled,
  dragX,
  register,
  onSwipe,
  onGone,
}: {
  card: MatchCard
  role: Role
  position: number
  appear: boolean
  enterFrom?: Swipe
  preview?: Swipe | null
  disabled?: boolean
  dragX: MotionValue<number>
  register: (fly: ((dir: Swipe) => void) | null) => void
  onSwipe: (dir: Swipe) => void
  onGone: (id: string) => void
}) {
  const reduce = !!useReducedMotion()
  const sign = (d: Swipe) => (d === 'love' ? 1 : -1)
  const x = useMotionValue(enterFrom && !reduce ? sign(enterFrom) * FLY_X : 0)
  const y = useMotionValue(0)
  const fade = useMotionValue(enterFrom && reduce ? 0 : 1)
  const hint = useMotionValue(preview === 'love' ? 1 : 0)
  const rotate = useTransform(x, [-260, 0, 260], reduce ? [0, 0, 0] : [-16, 0, 16])
  const love = useTransform(() => Math.max(clamp01((x.get() - 14) / 96), hint.get()))
  const leave = useTransform(() => clamp01((-x.get() - 14) / 96))

  const gone = useRef(false)
  const flight = useRef<AnimationPlaybackControls[]>([])
  const prevRole = useRef(role)
  const isFront = role === 'front'

  const fly = (dir: Swipe, vx = 0, vy = 0) => {
    if (gone.current) return
    gone.current = true
    haptic()
    onSwipe(dir)
    const s = sign(dir)
    if (reduce) {
      flight.current = [animate(fade, 0, { duration: 0.2 })]
      flight.current[0].finished.then(() => gone.current && onGone(card.id))
      return
    }
    const velocity = Math.sign(vx) === s && Math.abs(vx) > 300 ? vx : s * 1100
    flight.current = [
      animate(x, s * FLY_X, { type: 'spring', velocity, stiffness: 160, damping: 24, restDelta: 4, restSpeed: 40 }),
      animate(y, y.get() + vy * 0.12 + 24, { type: 'spring', velocity: vy, stiffness: 160, damping: 24 }),
    ]
    flight.current[0].finished.then(() => gone.current && onGone(card.id))
  }

  // Expose fly() for the buttons while this card is in front.
  useEffect(() => {
    if (!isFront) return
    register(fly)
    return () => register(null)
  })

  // Mirror the drag into the deck so the buttons can lean in.
  useEffect(() => {
    if (!isFront) return
    dragX.set(x.get())
    return x.on('change', (v) => dragX.set(v))
  }, [isFront, dragX, x])

  // Undo: spring back in from the side it left (or straight back mid-flight).
  useEffect(() => {
    const was = prevRole.current
    prevRole.current = role
    const restore = (was === 'flying' && role === 'front') || (enterFrom && role === 'front' && was === role)
    if (!restore) return
    gone.current = false
    flight.current.forEach((c) => c.stop())
    flight.current = []
    const spring = { type: 'spring', stiffness: 260, damping: 28 } as const
    animate(x, 0, reduce ? { duration: 0 } : spring)
    animate(y, 0, reduce ? { duration: 0 } : spring)
    animate(fade, 1, { duration: reduce ? 0.2 : 0.15 })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [role])

  useEffect(() => {
    animate(hint, preview === 'love' ? 1 : 0, { duration: 0.3 })
  }, [preview, hint])

  // Overlay opened mid-drag (time’s up): settle the card back in place.
  useEffect(() => {
    if (!disabled || !isFront || gone.current) return
    animate(x, 0, SETTLE)
    animate(y, 0, SETTLE)
  }, [disabled, isFront, x, y])

  const onDragEnd = (_: unknown, info: PanInfo) => {
    const projected = x.get() + info.velocity.x * 0.18
    if (projected > THRESHOLD) fly('love', info.velocity.x, info.velocity.y)
    else if (projected < -THRESHOLD) fly('leave', info.velocity.x, info.velocity.y)
    else {
      animate(x, 0, SETTLE)
      animate(y, 0, SETTLE)
    }
  }

  const pose = role === 'flying' ? POSE.front : POSE[role]
  const canDrag = isFront && !disabled

  return (
    <motion.div
      className="absolute left-1/2 top-1/2 outline-none"
      style={{
        width: CARD_W,
        height: CARD_H,
        marginLeft: -CARD_W / 2,
        marginTop: -CARD_H / 2,
        x,
        y,
        rotate,
        opacity: fade,
        zIndex: Z[role],
        touchAction: canDrag ? 'none' : undefined,
        cursor: canDrag ? 'grab' : undefined,
        pointerEvents: role === 'flying' ? 'none' : undefined,
      }}
      drag={canDrag}
      dragMomentum={false}
      dragElastic={1}
      onDragEnd={onDragEnd}
      whileDrag={{ scale: 1.02, cursor: 'grabbing' }}
      tabIndex={isFront ? 0 : -1}
      aria-hidden={!isFront}
      aria-label={isFront ? `${card.name}, ${card.tags.join(', ')}. Card ${position} of ${DECK.length}. Swipe right or press the right arrow to love it, left to leave it.` : undefined}
      onKeyDown={(e) => {
        if (!canDrag) return
        if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
          e.preventDefault()
          e.stopPropagation()
          fly(e.key === 'ArrowRight' ? 'love' : 'leave')
        }
      }}
    >
      <motion.div
        className="relative size-full overflow-hidden rounded-[28px] bg-white"
        initial={enterFrom ? POSE.front : appear ? ENTER_BEHIND : false}
        animate={pose}
        exit={{ opacity: 0, transition: { duration: 0.18 } }}
        transition={SLOT_SPRING}
      >
        <ProductPhoto id={card.photo} className="absolute inset-x-0 top-0 h-[280px]" />
        <div className="absolute inset-x-0 top-[280px] flex h-[88px] flex-col items-start gap-[6px] px-5 py-4">
          <p className="whitespace-nowrap text-[20px] font-semibold leading-none text-black">{card.name}</p>
          <div className="flex items-start gap-[6px]">
            {card.tags.map((t) => (
              <span key={t} className="whitespace-nowrap rounded-full bg-[#fff4f8] px-[10px] py-1 text-[12px] font-semibold leading-none text-pink">
                {t}
              </span>
            ))}
          </div>
        </div>
        {/* Edge: soft pink in front, then pink (love) or grey (leave) with the drag */}
        <motion.span
          aria-hidden
          className="pointer-events-none absolute inset-0 rounded-[28px] border-2 border-solid border-[#ffcde1]"
          initial={false}
          animate={{ opacity: role === 'front' || role === 'flying' ? 1 : 0 }}
          transition={{ duration: 0.25 }}
        />
        <motion.span aria-hidden className="pointer-events-none absolute inset-0 rounded-[28px] border-2 border-solid border-pink" style={{ opacity: love }} />
        <motion.span aria-hidden className="pointer-events-none absolute inset-0 rounded-[28px] border-2 border-solid border-[#9b9b9b]" style={{ opacity: leave }} />
      </motion.div>
    </motion.div>
  )
}
