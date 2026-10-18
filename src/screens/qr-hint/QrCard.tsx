import { useEffect, useRef, useState, type ReactNode } from 'react'
import {
  animate,
  motion,
  useMotionTemplate,
  useMotionValue,
  useAnimationFrame,
  useReducedMotion,
  useSpring,
  useTransform,
  type MotionValue,
  type Transition,
} from 'motion/react'
import { useEnv } from '@/proto/env'
import { haptic } from '@/proto/haptics'
import logo from '@/assets/brand/caratlane-logo.png'

/** Most the card leans toward the pointer or with the phone (degrees). */
const MAX = 14
const TILT_SPRING = { stiffness: 170, damping: 17, mass: 0.9 }
const FLIP_SPRING = { type: 'spring', stiffness: 120, damping: 14, mass: 1 } as const
/** The arrival flips are slower and softer than a tap’s. */
const SHOW_FLIP = { type: 'spring', stiffness: 70, damping: 13, mass: 1 } as const
/** Idle before the card starts swaying on its own again (ms). */
const SWAY_AFTER = 1800

export interface Tilt {
  /** rotateX (deg): positive brings the bottom edge forward. */
  x: MotionValue<number>
  /** rotateY (deg): positive sends the right edge back. */
  y: MotionValue<number>
  /** Lean toward a target; springs follow. */
  lean: (x: number, y: number) => void
  /** Someone is handling the card: stop moving it on its own for a while. */
  touch: () => void
  /** Hold the sway (while the card flips in), then let it start straight away. */
  hold: () => void
  release: () => void
  /** Whether the card moves on its own (not with reduced motion or in ?view=figma). */
  attract: boolean
  /** iOS only shares motion after a tap asks for it. */
  askForMotion: () => void
}

const clamp = (v: number) => Math.max(-MAX, Math.min(MAX, v))

type MotionPermission = { requestPermission?: () => Promise<'granted' | 'denied'> }

/**
 * Card tilt. In the desktop mockup it follows the pointer (see QrCard); on a
 * real phone it follows the gyroscope, relative to however the phone is held.
 * Left alone, it sways slowly on its own so it reads as something to play with.
 */
export function useTilt(): Tilt {
  const { mockup, mode } = useEnv()
  const reduce = useReducedMotion()
  const tx = useMotionValue(0)
  const ty = useMotionValue(0)
  const x = useSpring(tx, TILT_SPRING)
  const y = useSpring(ty, TILT_SPRING)
  const [gyro, setGyro] = useState(0)
  const asked = useRef(false)
  const lastTouch = useRef(performance.now())
  const lastGyro = useRef(0)
  // Not in ?view=figma, which has to match the still Figma frame.
  const attract = !reduce && mode !== 'figma'

  // The sway: two slow sines (a figure-of-eight), easing in once the card has been left alone.
  useAnimationFrame((t) => {
    if (!attract) return
    const now = performance.now()
    const idle = now - Math.max(lastTouch.current, lastGyro.current)
    if (idle < SWAY_AFTER) return
    const amp = Math.min(1, (idle - SWAY_AFTER) / 1400)
    const s = t / 1000
    tx.set(amp * 5 * Math.sin((s * 2 * Math.PI) / 4.6))
    ty.set(amp * 11 * Math.sin((s * 2 * Math.PI) / 6.2 + 0.8))
  })

  useEffect(() => {
    if (mockup || reduce || typeof window === 'undefined' || !('DeviceOrientationEvent' in window)) return
    let base: { b: number; g: number } | null = null
    const on = (e: DeviceOrientationEvent) => {
      if (e.beta == null || e.gamma == null) return
      if (!base) base = { b: e.beta, g: e.gamma }
      // The neutral pose drifts slowly toward how the phone is being held.
      base.b += (e.beta - base.b) * 0.008
      base.g += (e.gamma - base.g) * 0.008
      const nx = clamp(-(e.beta - base.b) * 0.8)
      const ny = clamp((e.gamma - base.g) * 0.8)
      // A real tilt (not hand tremor) hands the card over to the phone.
      if (Math.abs(nx - tx.get()) + Math.abs(ny - ty.get()) > 1.2 || performance.now() - lastGyro.current < SWAY_AFTER) {
        lastGyro.current = performance.now()
        tx.set(nx)
        ty.set(ny)
      }
    }
    window.addEventListener('deviceorientation', on)
    return () => window.removeEventListener('deviceorientation', on)
  }, [mockup, reduce, gyro, tx, ty])

  return {
    x,
    y,
    lean: (lx, ly) => {
      tx.set(clamp(lx))
      ty.set(clamp(ly))
    },
    touch: () => {
      lastTouch.current = performance.now()
    },
    hold: () => {
      lastTouch.current = Infinity
    },
    release: () => {
      if (lastTouch.current === Infinity) lastTouch.current = performance.now() - SWAY_AFTER
    },
    attract,
    askForMotion: () => {
      if (mockup || asked.current) return
      asked.current = true
      const DOE = window.DeviceOrientationEvent as unknown as MotionPermission | undefined
      if (typeof DOE?.requestPermission === 'function') {
        DOE.requestPermission()
          .then((r) => r === 'granted' && setGyro((n) => n + 1))
          .catch(() => {})
      }
    },
  }
}

/**
 * B3b’s card as a real object: it leans toward the pointer (or with the
 * phone), light slides across it, the QR gradient turns with it, and a tap
 * flips it over to CaratLane on the back, with a springy overshoot. Turning
 * edge-on darkens it, as a card does when it turns away from the light.
 * Every time the screen opens it shows what it can do: two soft flips
 * (CaratLane, then the code again), then a slow sway whenever it’s left alone.
 */
export function QrCard({
  tilt,
  glow,
  front,
  'data-anno': anno,
}: {
  tilt: Tilt
  glow: string
  front: ReactNode
  'data-anno'?: string
}) {
  const reduce = useReducedMotion()
  const flip = useMotionValue(0)
  const [flipped, setFlipped] = useState(false)
  const card = useRef<HTMLDivElement>(null)
  const press = useRef<{ x: number; y: number; t: number } | null>(null)
  const handled = useRef(false)

  const rotateY = useTransform([flip, tilt.y], ([f, t]: number[]) => f + t)
  const rotateX = tilt.x

  // Light from the top left: a pearly sheen and a bright streak slide across as the card leans.
  const lightX = useTransform(tilt.y, (v) => 30 - v * 2.6)
  const lightY = useTransform(tilt.x, (v) => 22 + v * 2.6)
  const sheen = useMotionTemplate`radial-gradient(110% 85% at ${lightX}% ${lightY}%, rgba(90, 57, 227, 0.05) 0%, rgba(221, 21, 100, 0.03) 40%, rgba(255, 255, 255, 0) 72%)`
  // The back is a foil: the same light, in CaratLane violet, pink and gold.
  const foil = useMotionTemplate`radial-gradient(90% 70% at ${lightX}% ${lightY}%, rgba(90, 57, 227, 0.16) 0%, rgba(221, 21, 100, 0.1) 38%, rgba(207, 167, 82, 0.1) 62%, rgba(255, 255, 255, 0) 85%)`
  const streakAngle = useTransform([tilt.x, tilt.y], ([a, b]: number[]) => 115 + b * 2 - a * 1.5)
  const streakPos = useTransform(tilt.y, [-MAX, MAX], [-20, 120])
  const streakIn = useTransform(streakPos, (p) => p - 20)
  const streakOut = useTransform(streakPos, (p) => p + 20)
  const streak = useMotionTemplate`linear-gradient(${streakAngle}deg, rgba(255, 255, 255, 0) ${streakIn}%, rgba(255, 255, 255, 0.6) ${streakPos}%, rgba(255, 255, 255, 0) ${streakOut}%)`
  // Only while the card is leaning, so the code reads at full contrast at rest.
  const streakOpacity = useTransform([tilt.x, tilt.y], ([a, b]: number[]) => Math.min(1, Math.hypot(a, b) / 8))
  // Edge-on, the face turns away from the light.
  const shade = useTransform([rotateY, rotateX], ([ry, rx]: number[]) => (1 - Math.abs(Math.cos((ry * Math.PI) / 180)) * Math.cos((rx * Math.PI) / 180)) * 0.55)
  // The glow under the card narrows as it turns.
  const glowScale = useTransform(rotateY, (ry) => 0.35 + 0.65 * Math.abs(Math.cos((ry * Math.PI) / 180)))

  /** Turn over, always the same way round, like flipping a real card in your fingers. */
  const turn = (transition: Transition) => {
    const half = Math.round(flip.get() / 180) + 1
    setFlipped(half % 2 === 1)
    return animate(flip, half * 180, transition)
  }

  // On arrival it flips twice (CaratLane, then back to the code) and stops; then it just sways.
  useEffect(() => {
    if (!tilt.attract) return
    let alive = true
    const go = () => alive && !handled.current
    const wait = (ms: number) => new Promise((r) => window.setTimeout(r, ms))
    tilt.hold()
    ;(async () => {
      await wait(450)
      if (!go()) return
      await turn(SHOW_FLIP)
      await wait(380)
      if (!go()) return
      await turn(SHOW_FLIP)
      if (alive) tilt.release()
    })()
    return () => {
      alive = false
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tilt.attract])

  const toggle = () => {
    haptic('soft')
    handled.current = true
    tilt.touch()
    tilt.askForMotion()
    turn(reduce ? { duration: 0.2 } : FLIP_SPRING)
  }

  const leanTo = (clientX: number, clientY: number) => {
    const r = card.current?.getBoundingClientRect()
    if (!r) return
    const px = (clientX - r.left) / r.width - 0.5
    const py = (clientY - r.top) / r.height - 0.5
    tilt.lean(-py * 2 * MAX, px * 2 * MAX)
  }

  return (
    <div data-anno={anno} className="relative mt-4 w-[288px] max-w-full [perspective:1100px]">
      {/* A soft, filled glow (not a box-shadow, whose hollow middle shows when the card is edge-on). */}
      <motion.div
        aria-hidden
        className="pointer-events-none absolute inset-x-8 bottom-0 top-14 rounded-[40px] blur-[40px]"
        style={{ scaleX: glowScale, y: 18 }}
        initial={false}
        animate={{ backgroundColor: glow }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      />
      <motion.div
        ref={card}
        role="button"
        tabIndex={0}
        aria-label={flipped ? 'Card back: CaratLane. Tap to see the QR code.' : 'Flip the card'}
        aria-pressed={flipped}
        className="relative cursor-pointer select-none outline-none"
        style={{ rotateX, rotateY, transformStyle: 'preserve-3d', touchAction: 'pan-y' }}
        onPointerDown={(e) => {
          press.current = { x: e.clientX, y: e.clientY, t: performance.now() }
          handled.current = true
          tilt.touch()
          leanTo(e.clientX, e.clientY)
        }}
        onPointerMove={(e) => {
          if (e.pointerType !== 'mouse' && !press.current) return
          tilt.touch()
          leanTo(e.clientX, e.clientY)
        }}
        onPointerUp={(e) => {
          const p = press.current
          press.current = null
          if (p && Math.hypot(e.clientX - p.x, e.clientY - p.y) < 8 && performance.now() - p.t < 600) toggle()
          if (e.pointerType !== 'mouse') tilt.lean(0, 0)
        }}
        onPointerCancel={() => {
          press.current = null
          tilt.lean(0, 0)
        }}
        onPointerLeave={() => {
          press.current = null
          tilt.lean(0, 0)
        }}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault()
            toggle()
          }
        }}
      >
        {/* Front: the QR card from Figma */}
        <Face>
          {front}
          <motion.span aria-hidden className="pointer-events-none absolute inset-0" style={{ background: sheen }} />
          <motion.span aria-hidden className="pointer-events-none absolute inset-0 mix-blend-overlay" style={{ background: streak, opacity: streakOpacity }} />
          <motion.span aria-hidden className="pointer-events-none absolute inset-0 bg-black" style={{ opacity: shade }} />
        </Face>
        {/* Back: CaratLane on a pearly foil */}
        <Face back>
          <div className="flex h-full w-full flex-col items-center justify-center gap-3">
            <img src={logo} alt="CaratLane, a Tata product" width={200} height={50} draggable={false} className="relative z-[1] h-[50px] w-[200px]" />
          </div>
          <motion.span aria-hidden className="pointer-events-none absolute inset-0" style={{ background: foil }} />
          <motion.span aria-hidden className="pointer-events-none absolute inset-0 z-[2] mix-blend-overlay" style={{ background: streak, opacity: streakOpacity }} />
          <motion.span aria-hidden className="pointer-events-none absolute inset-0 bg-black" style={{ opacity: shade }} />
        </Face>
      </motion.div>
    </div>
  )
}

function Face({ back, children }: { back?: boolean; children: ReactNode }) {
  return (
    <div
      className={
        'overflow-hidden rounded-[40px] bg-white [backface-visibility:hidden] [-webkit-backface-visibility:hidden] ' +
        (back ? 'absolute inset-0' : 'relative')
      }
      style={back ? { transform: 'rotateY(180deg)' } : undefined}
    >
      {children}
    </div>
  )
}
