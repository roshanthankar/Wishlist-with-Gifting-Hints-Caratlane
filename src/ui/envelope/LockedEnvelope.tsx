import { easeIn, easeInOut, easeOut, motion, useMotionValue, useReducedMotion, useTime, useTransform } from 'motion/react'
import envelopeClosed from '@/assets/illustrations/envelope-closed.webp'
import padlockBody from '@/assets/illustrations/envelope-parts/padlock-body.webp'
import padlockShackle from '@/assets/illustrations/envelope-parts/padlock-shackle.webp'
import { cn } from '../cn'
import { ART, Body, ContactShadow, Flap, Ripple, Sparkle, TILTED_W, useTrack } from './kit'

/**
 * The hint link has closed: the envelope settles, a padlock drops onto it
 * with its shackle up, lands, and the shackle snaps shut with a click. Then it
 * idles: a gentle float, and every few seconds the lock rattles as if someone
 * tried it. Same 160 × 120 slot as HeroArt. Reduced motion gets
 * envelope-closed.webp.
 *
 * The envelope is the shared layers, shut with no seal; the padlock is cut
 * from envelope-closed.webp in two pieces (shackle and body) so the shackle
 * can open and close.
 */

/** The padlock pieces in envelope-closed.webp (846 × 642 px). */
const LOCK = {
  body: { x: 323, y: 313, w: 276, h: 239 },
  shackle: { x: 347, y: 197, w: 208, h: 183 },
  /** Body centre, which sits on the flap's tip. */
  cx: 461, cy: 432.5,
  /** Padlock width as a share of the envelope's width. */
  share: 0.337,
}
/** Where the lock's body centre goes on the straightened envelope (canvas px). */
const ON = { x: 392, y: 358 }

const INTRO = 2.2
const IDLE = 4.4

export function LockedEnvelope({ width = 131, className }: { width?: number; className?: string }) {
  const reduce = useReducedMotion()
  return (
    <div aria-hidden className={cn('relative mx-auto h-[120px] w-[160px]', className)}>
      {reduce ? (
        <img src={envelopeClosed} alt="" draggable={false} className="absolute left-[14.5px] top-[10.5px] h-[99px] w-[131px] select-none object-contain" />
      ) : (
        <Scene k={width / TILTED_W} />
      )}
    </div>
  )
}

/** Seconds since mount, clamped to the intro, and seconds into the idle loop after it. */
function useClocks() {
  const time = useTime()
  const intro = useTransform(time, (ms) => Math.min(ms / 1000, INTRO))
  const idle = useTransform(time, (ms) => {
    const s = ms / 1000 - INTRO
    return s <= 0 ? 0 : s % IDLE
  })
  return { intro, idle }
}

function Scene({ k }: { k: number }) {
  const { intro: c, idle } = useClocks()
  const W = ART.w * k
  const H = ART.h * k
  /** Art px of envelope-closed.webp → CSS px; the envelope spans 760 of the canvas's 784. */
  const s = (W * (760 / 784) * LOCK.share) / LOCK.body.w
  const shutFlap = useMotionValue(0)
  const at = { x: ON.x * k, y: ON.y * k }
  const place = (b: { x: number; y: number; w: number; h: number }) => ({
    left: (b.x - LOCK.cx) * s, top: (b.y - LOCK.cy) * s, width: b.w * s, height: b.h * s,
  })

  // The envelope settles in, jolts when the lock lands and when it clicks, then floats.
  const appear = useTrack(c, [0, 0.4], [0, 1], easeOut)
  const settle = useTrack(c, [0, 0.4], [0.9, 1], easeOut)
  const jolt = useTrack(c, [0.75, 0.83, 0.95, 1.16, 1.22, 1.32], [0, 2.5, 0, 0, 1.5, 0], easeOut)
  const float = useTrack(idle, [0, IDLE / 2, IDLE], [0, -3, 0], easeInOut)
  const y = useTransform(() => jolt.get() + float.get())

  // The padlock drops in with its shackle up, lands, and the shackle snaps shut.
  const lockY = useTrack(c, [0.35, 0.75, 0.86, 0.96], [-46, 0, -5, 0], [easeIn, easeOut, easeIn])
  const lockO = useTrack(c, [0.35, 0.5], [0, 1])
  const lockIn = useTrack(c, [0.35, 0.75], [-10, 0], easeOut)
  const shut = useTrack(c, [1.05, 1.16, 1.28], [1.4, 0.94, 1], [easeIn, easeOut])
  const squash = useTrack(c, [1.14, 1.2, 1.32], [1, 0.95, 1], easeOut)

  // Idle: every few seconds someone tries the lock. It rattles; the shackle tugs and holds.
  const R = 2.6
  const rattle = useTrack(idle, [R, R + 0.08, R + 0.17, R + 0.26, R + 0.35, R + 0.46], [0, -9, 8, -6, 4, 0], easeInOut)
  const tug = useTrack(idle, [R, R + 0.1, R + 0.3], [1, 1.07, 1], easeOut)
  const rotate = useTransform(() => lockIn.get() + rattle.get())
  const shackleY = useTransform(() => shut.get() * tug.get())

  return (
    <>
      <ContactShadow opacity={appear} />
      <motion.div
        className="absolute left-1/2 top-1/2 will-change-transform"
        style={{ width: W, height: H, marginLeft: -W / 2, marginTop: -H / 2, y, rotate: -5, scale: settle, opacity: appear }}
      >
        <Flap k={k} rotateX={shutFlap} />
        <Body />

        <motion.div
          className="absolute z-[6] size-0"
          style={{ left: at.x, top: at.y, y: lockY, opacity: lockO, rotate, scaleY: squash, originX: 0.5, originY: 0 }}
        >
          <motion.img
            src={padlockShackle}
            alt=""
            draggable={false}
            className="absolute max-w-none select-none"
            style={{ ...place(LOCK.shackle), scaleY: shackleY, originY: 1 }}
          />
          <img src={padlockBody} alt="" draggable={false} className="absolute max-w-none select-none" style={place(LOCK.body)} />
        </motion.div>
        <Ripple c={c} start={1.16} end={1.6} x={at.x} y={at.y - 6} r={W * 0.16} to={2.1} peak={0.7} className="z-[7]" />
        <Ripple c={idle} start={R + 0.1} end={R + 0.7} x={at.x} y={at.y - 6} r={W * 0.16} to={1.8} peak={0.45} className="z-[7]" />
        <Sparkle c={c} times={[1.18, 1.32, 1.5, 1.75]} x={at.x - W * 0.2} y={at.y - W * 0.2} size={9} className="z-[7]" />
        <Sparkle c={c} times={[1.22, 1.36, 1.55, 1.8]} x={at.x + W * 0.21} y={at.y - W * 0.12} size={7} fill="#b8a6ff" className="z-[7]" />
      </motion.div>
    </>
  )
}
