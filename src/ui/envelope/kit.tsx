import { type CSSProperties } from 'react'
import { cubicBezier, easeOut, motion, useTime, useTransform, type MotionValue } from 'motion/react'
import bodyOpen from '@/assets/illustrations/envelope-parts/body-open.webp'
import flapArt from '@/assets/illustrations/envelope-parts/flap.webp'
import sealArt from '@/assets/illustrations/envelope-parts/seal.webp'
import heartArt from '@/assets/illustrations/envelope-parts/heart.webp'
import { cn } from '../cn'

/** Every layer image, for decoding ahead of an animation. */
export const PARTS = [bodyOpen, flapArt, sealArt, heartArt]

/**
 * Shared pieces for the glass-envelope animations (sending, waiting, opened,
 * hourglass). The layers are cut from envelope-sent.webp, straightened (it is
 * drawn at a ~9° tilt): the open body with the flap and seal painted out, the
 * flap, and the seal with its shadow. Closed and sealed they recompose the
 * original art.
 *
 * Every animation reads one loop clock in seconds and derives each value from
 * it, so parts never drift apart (Motion runs looping opacity keyframes on a
 * separate timeline from transforms).
 */

/** Layer boxes in the straightened art, in px of its 784 × 531 canvas. */
export const ART = {
  w: 784, h: 531,
  /** The flap hinges on its top edge. */
  flap: { x: 32, y: 46, w: 721, h: 323 },
  seal: { x: 281, y: 174, w: 236, h: 242, cx: 121, cy: 120, r: 106 },
  /** The glass a note shows through, rim included. */
  glass: { x: 18, y: 16, w: 748, h: 499 },
}
/** Width of the original tilted art (envelope-sent.webp), which `width` props refer to. */
export const TILTED_W = 854
/** The seal's centre in envelope-sent.webp, as a fraction of its 854 × 630. */
export const TILTED_SEAL = { x: 445 / 854, y: 336 / 630 }

export type Ease = (t: number) => number
export const linear: Ease = (t) => t
/** Stays solid for most of a flight and fades only at the end. */
export const FADE = cubicBezier(0.9, 0, 1, 0.6)

/** Seconds into the loop, held at 0 until `delay` seconds have passed. */
export function useClock(loop: number, delay = 0) {
  const time = useTime()
  return useTransform(time, (ms) => {
    const s = ms / 1000 - delay
    return s <= 0 ? 0 : s % loop
  })
}

/** A value keyed to the loop clock: keyframe times in seconds, clamped outside them. */
export function useTrack(clock: MotionValue<number>, times: number[], values: number[], ease: Ease | Ease[] = linear) {
  return useTransform(clock, times, values, { ease })
}

export const box = (b: { x: number; y: number; w: number; h: number }, k: number): CSSProperties => ({
  left: b.x * k, top: b.y * k, width: b.w * k, height: b.h * k,
})

type MV = MotionValue<number>

/* ───────────────────────── Envelope layers ───────────────────────── */

export function Body() {
  return <img src={bodyOpen} alt="" draggable={false} className="absolute inset-0 z-[3] size-full max-w-none select-none" />
}

/** The flap, folded by `rotateX` (0 shut, ~172 open). Behind the note while it stands up. */
export function Flap({ k, rotateX }: { k: number; rotateX: MV }) {
  const zIndex = useTransform(rotateX, (v) => (v > 90 ? 1 : 4))
  return (
    <motion.img
      src={flapArt}
      alt=""
      draggable={false}
      className="absolute max-w-none select-none"
      style={{ ...box(ART.flap, k), originX: 0.5, originY: 0, rotateX, transformPerspective: 420, zIndex }}
    />
  )
}

export function Seal({ k, style }: { k: number; style: { scale?: MV; y?: MV; rotate?: MV; opacity?: MV } }) {
  const origin = `${(ART.seal.cx / ART.seal.w) * 100}% ${(ART.seal.cy / ART.seal.h) * 100}%`
  return (
    <motion.img
      src={sealArt}
      alt=""
      draggable={false}
      className="absolute z-[6] max-w-none select-none"
      style={{ ...box(ART.seal, k), transformOrigin: origin, ...style }}
    />
  )
}

/** The seal's centre in the straightened envelope, in CSS px. */
export const sealCentre = (k: number) => ({ x: (ART.seal.x + ART.seal.cx) * k, y: (ART.seal.y + ART.seal.cy) * k, r: ART.seal.r * k })

/* ───────────────────────── The note ───────────────────────── */

/** The note card's size and resting box in the envelope's frame (CSS px). */
export function noteBox(k: number) {
  const W = ART.w * k
  const w = W * 0.66
  const h = w * 0.72
  const hinge = ART.flap.y * k
  /** Standing out of the envelope: 70% above the hinge. */
  const outTop = hinge - h * 0.7
  /** All the way in. */
  const inTop = hinge + 6
  return { w, h, left: (W - w) / 2, outTop, inTop }
}

type NoteMotion = { y: MV; rotate: MV; lines?: MV[]; heart?: MV }

/** The note, plus the same note drawn faintly over the glass so it reads as inside the envelope. */
export function EnvelopeNote({ k, ghost, ...motionProps }: NoteMotion & { k: number; ghost: MV }) {
  return (
    <>
      <NoteCard k={k} {...motionProps} className="z-[2] shadow-[0_2px_6px_rgba(60,30,160,0.16)] ring-1 ring-[#ece6ff]" />
      <div className="absolute z-[5] overflow-hidden blur-[0.5px]" style={box(ART.glass, k)}>
        <NoteCard k={k} {...motionProps} opacity={ghost} offset={{ x: ART.glass.x * k, y: ART.glass.y * k }} />
      </div>
    </>
  )
}

const WAVES = [
  'M13 20 q3.5 -4.5 7 0 t7 0 t7 0 t7 0',
  'M13 35 q3.5 -4.5 7 0 t7 0 t7 0 t7 0 t7 0 t7 0 t7 0 t7 0 t7 0 t7 0',
  'M13 50 q3.5 -4.5 7 0 t7 0 t7 0 t7 0 t7 0 t7 0 t7 0',
]

function NoteCard({ k, y, rotate, lines, heart, opacity, offset = { x: 0, y: 0 }, className }: NoteMotion & {
  k: number; opacity?: MV; offset?: { x: number; y: number }; className?: string
}) {
  const n = noteBox(k)
  return (
    <motion.div
      className={cn('absolute rounded-[3px] bg-[#fffdfa]', className)}
      style={{ left: n.left - offset.x, top: n.outTop - offset.y, width: n.w, height: n.h, y, rotate, opacity }}
    >
      <svg viewBox="0 0 100 72" className="size-full" fill="none" stroke="#5a39e3" strokeWidth={1.8} strokeLinecap="round">
        {WAVES.map((d, i) => (lines ? <Line key={i} d={d} p={lines[i]} /> : <path key={i} d={d} />))}
        <motion.path
          d="M82 59 c-5 -3.4 -8 -6.1 -8 -9 a3.3 3.3 0 0 1 8 -1.6 a3.3 3.3 0 0 1 8 1.6 c0 2.9 -3 5.6 -8 9z"
          fill="#dd1564"
          stroke="none"
          style={heart ? { scale: heart, originX: 0.5, originY: 0.5 } : undefined}
        />
      </svg>
    </motion.div>
  )
}

function Line({ d, p }: { d: string; p: MV }) {
  const opacity = useTransform(p, (v) => (v > 0.01 ? 1 : 0))
  return <motion.path d={d} style={{ pathLength: p, opacity }} />
}

/** The glass heart from envelope-opened.webp, centred over the note (envelope frame, CSS px). */
export function GlassHeart({ k, scale, y }: { k: number; scale: MV; y?: MV }) {
  const W = ART.w * k
  const w = W * 0.27
  const h = w * (163 / 180)
  const at = heartAt(k)
  return (
    <motion.img
      src={heartArt}
      alt=""
      draggable={false}
      className="absolute z-[8] max-w-none select-none"
      style={{ width: w, height: h, left: at.x - w / 2, top: at.y - h / 2, scale, y }}
    />
  )
}

/** Where the heart sits, and its size, over a risen note. */
export function heartAt(k: number) {
  const W = ART.w * k
  const w = W * 0.27
  const h = w * (163 / 180)
  return { x: W / 2 + 4 * (k / 0.1452), y: noteBox(k).outTop - h * 0.55, w, h }
}

/** Crumbs of wax flicked off as the seal breaks at `start`. */
export function Crumbs({ c, k, start }: { c: MV; k: number; start: number }) {
  const seal = sealCentre(k)
  return (
    <>
      {[0, 60, 120, 180, 240, 300].map((deg) => (
        <Crumb key={deg} c={c} deg={deg} x={seal.x} y={seal.y} r={seal.r} start={start} />
      ))}
    </>
  )
}

function Crumb({ c, deg, x, y, r, start }: { c: MV; deg: number; x: number; y: number; r: number; start: number }) {
  const rad = (deg * Math.PI) / 180
  const dist = r * 1.9
  const dx = useTrack(c, [start, start + 0.4], [0, Math.cos(rad) * dist], easeOut)
  const dy = useTrack(c, [start, start + 0.4], [0, Math.sin(rad) * dist - 4], easeOut)
  const opacity = useTrack(c, [start - 0.01, start + 0.02, start + 0.4], [0, 1, 0], easeOut)
  const scale = useTrack(c, [start, start + 0.4], [1, 0.4], easeOut)
  const size = Math.max(3, r * 0.3)
  return (
    <motion.span
      className="absolute z-[7] rounded-full bg-[#5a39e3]"
      style={{ width: size, height: size, left: x + Math.cos(rad) * r * 0.7 - size / 2, top: y + Math.sin(rad) * r * 0.7 - size / 2, x: dx, y: dy, opacity, scale }}
    />
  )
}

/* ───────────────────────── Effects ───────────────────────── */

const STREAKS = [
  { y: -14, w: 34, gap: 6, lag: 0.03 },
  { y: 0, w: 56, gap: 0, lag: 0 },
  { y: 14, w: 26, gap: 10, lag: 0.06 },
]

/**
 * Speed streaks behind a moving envelope. Place inside the envelope's frame;
 * `angle` is the direction of travel in that frame, `behind` how far back from
 * its centre they start, and they show from `start` to `end` (seconds).
 */
export function Streaks({ c, angle, behind, start, end }: { c: MV; angle: number; behind: number; start: number; end: number }) {
  return (
    <div className="absolute left-1/2 top-1/2 size-0" style={{ transform: `rotate(${angle}deg)` }}>
      {STREAKS.map((s, i) => (
        <StreakLine key={i} c={c} {...s} behind={behind} start={start} end={end} />
      ))}
    </div>
  )
}

function StreakLine({ c, y, w, gap, lag, behind, start, end }: { c: MV; y: number; w: number; gap: number; lag: number; behind: number; start: number; end: number }) {
  const span = end - start
  const times = [start + lag, start + span * 0.3 + lag, start + span * 0.7 + lag, end]
  const scaleX = useTrack(c, times, [0, 1, 1.5, 0], easeOut)
  const opacity = useTrack(c, [start - 0.01, ...times], [0, 0, 1, 0.8, 0], easeOut)
  return (
    <motion.span
      className="absolute h-1 origin-right rounded-full"
      style={{
        width: w,
        top: y - 2,
        right: behind + gap,
        background: 'linear-gradient(90deg, rgba(123, 92, 240, 0), rgba(123, 92, 240, 0.85))',
        scaleX,
        opacity,
      }}
    />
  )
}

/** A four-point sparkle that pops and spins away over `times` (4 keys, seconds), centred on (x, y). */
export function Sparkle({ c, times, x, y, size, fill = '#9b82ff', className }: {
  c: MV; times: number[]; x: number; y: number; size: number; fill?: string; className?: string
}) {
  const scale = useTrack(c, times, [0, 1.15, 1, 0], easeOut)
  const rotate = useTrack(c, times, [0, 30, 45, 90], easeOut)
  const opacity = useTrack(c, times, [0, 1, 1, 0], easeOut)
  return (
    <motion.svg
      viewBox="0 0 24 24"
      className={cn('absolute', className)}
      style={{ width: size, height: size, left: x - size / 2, top: y - size / 2, scale, rotate, opacity }}
    >
      <path d="M12 0C12 6.6 17.4 12 24 12C17.4 12 12 17.4 12 24C12 17.4 6.6 12 0 12C6.6 12 12 6.6 12 0Z" fill={fill} />
    </motion.svg>
  )
}

/** A ring that swells out and fades over [start, end], centred on (x, y) with radius r. */
export function Ripple({ c, start, end, x, y, r, to = 2, from = 1, peak = 0.8, className }: {
  c: MV; start: number; end: number; x: number; y: number; r: number; to?: number; from?: number; peak?: number; className?: string
}) {
  const scale = useTrack(c, [start, end], [from, to], easeOut)
  const opacity = useTrack(c, [start - 0.01, start + 0.03, end], [0, peak, 0], easeOut)
  return (
    <motion.span
      className={cn('absolute rounded-full border-2 border-[#a993ff]', className)}
      style={{ left: x - r, top: y - r, width: r * 2, height: r * 2, scale, opacity }}
    />
  )
}

/**
 * Soft violet contact shadow along the bottom of a 160 × 120 slot. A gradient
 * that fades out inside its own box, not a blur filter: Safari crops blurs at
 * the edge of a transformed parent, which drew a hard line under the art.
 */
export function ContactShadow({ opacity, scaleX, className }: { opacity?: MV; scaleX?: MV; className?: string }) {
  return (
    <motion.span
      className={cn('absolute inset-x-0 bottom-0 mx-auto h-[18px] w-[130px]', className)}
      style={{ opacity, scaleX, background: 'radial-gradient(closest-side, rgba(90, 57, 227, 0.16), rgba(90, 57, 227, 0))' }}
    />
  )
}
