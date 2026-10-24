import { useId } from 'react'
import { easeInOut, easeOut, motion, useReducedMotion, useTransform, type MotionValue } from 'motion/react'
import envelopeSent from '@/assets/illustrations/envelope-sent.webp'
import envelopeWaiting from '@/assets/illustrations/envelope-waiting.webp'
import hourglassArt from '@/assets/illustrations/envelope-parts/hourglass.webp'
import { cn } from '../cn'
import { ContactShadow, linear, useClock, useTrack } from './kit'

/**
 * Not opened yet: the sealed envelope waits while the hourglass beside it runs.
 * The sand drains from the top bulb into a growing pile, then the hourglass
 * flips and runs again. Loops (two flips).
 *
 * The hourglass is cut from envelope-waiting.webp with the sand painted out
 * (its left half mirrored from the right, where no envelope sits behind it);
 * the sand is drawn here so it can move. Same 160 × 120 slot as HeroArt, laid
 * out like envelope-waiting.webp. Reduced motion gets that art.
 */

/** The hourglass art's canvas, and its bulbs in that canvas's px. */
const HG = { w: 260, h: 447, cx: 130, cy: 215 }
const TOP_BULB = 'M36 84 L224 84 C232 130 200 170 140 212 L120 212 C60 170 28 130 36 84 Z'
const BOTTOM_BULB = 'M120 218 L140 218 C200 250 232 290 228 330 L228 394 L32 394 L32 330 C28 290 60 250 120 218 Z'
/** Each bulb: neck end, far (cap) end, and how deep a full pile or a full drain reaches. */
const TOP = { neck: 212, cap: 84, drain: 96, edge: 34, peak: 84 }
const BOTTOM = { neck: 218, cap: 394, drain: 100, edge: 38, peak: 92 }

const FLOW = 3.4
const FLIP = 0.8
const LOOP = 2 * (FLOW + FLIP)
/** Phase A: top drains into bottom. Flip. Phase B: bottom (now on top) drains into top. Flip. */
const A = [0, FLOW]
const FA = [FLOW, FLOW + FLIP]
const PB = [FLOW + FLIP, 2 * FLOW + FLIP]
const FB = [2 * FLOW + FLIP, LOOP]

export function HourglassEnvelope({ width = 137, className }: { width?: number; className?: string }) {
  const reduce = useReducedMotion()
  const height = (width * 619) / 893
  return (
    <div aria-hidden className={cn('relative mx-auto h-[120px] w-[160px]', className)}>
      <div className="absolute left-1/2 top-1/2" style={{ width, height, marginLeft: -width / 2, marginTop: -height / 2 }}>
        {reduce ? (
          <img src={envelopeWaiting} alt="" draggable={false} className="block size-full max-w-none select-none" />
        ) : (
          <Scene width={width} height={height} />
        )}
      </div>
    </div>
  )
}

function Scene({ width, height }: { width: number; height: number }) {
  const c = useClock(LOOP)
  // Where envelope-waiting.webp puts things, as fractions of its 893 × 619.
  const env = { w: width * 0.79, left: width * 0.0, top: height * 0.02 }
  const hgH = height * (447 / 619)
  const hgW = hgH * (HG.w / HG.h)
  const hg = { left: width * (750 / 893) - hgW / 2, top: height * (165 / 619) }

  // The envelope waits, nudged a little each time the hourglass turns.
  const envY = useTrack(c, [0, 2.1, 4.2, 6.3, 8.4], [0, -3, 0, -3, 0], easeInOut)
  const envRotate = useTrack(c, [FA[0], FA[0] + 0.2, FA[0] + 0.5, FB[0], FB[0] + 0.2, FB[0] + 0.5], [0, -2.5, 0, 0, -2.5, 0], easeInOut)

  // The hourglass lifts, turns over and sets down.
  const rotate = useTrack(c, [FA[0], FA[1], FB[0], FB[1]], [0, 180, 180, 360], [easeInOut, linear, easeInOut])
  const lift = useTrack(c, [FA[0], FA[0] + FLIP / 2, FA[1], FB[0], FB[0] + FLIP / 2, FB[1]], [0, -6, 0, 0, -6, 0], easeInOut)

  return (
    <>
      <ContactShadow className="-bottom-3 w-[120px]" />
      <motion.img
        src={envelopeSent}
        alt=""
        draggable={false}
        className="absolute max-w-none select-none"
        style={{ width: env.w, left: env.left, top: env.top, y: envY, rotate: envRotate }}
      />
      <motion.div
        className="absolute will-change-transform"
        style={{ width: hgW, height: hgH, left: hg.left, top: hg.top, rotate, y: lift, originX: HG.cx / HG.w, originY: HG.cy / HG.h }}
      >
        <img src={hourglassArt} alt="" draggable={false} className="absolute inset-0 size-full max-w-none select-none" />
        <Sand c={c} />
      </motion.div>
    </>
  )
}

/** The sand, in the hourglass's own frame: it turns with the glass. */
function Sand({ c }: { c: MotionValue<number> }) {
  const id = useId().replace(/:/g, '')

  // Phase A: the top drains into a pile in the bottom.
  const topDrain = useTrack(c, [A[0], A[1], PB[1], PB[1] + 0.01], [1, 0, 0, 1])
  const bottomPile = useTrack(c, A, [0, 1])
  // Phase B, after the flip: the bottom (now above) drains into a pile in the top.
  const bottomDrain = useTrack(c, PB, [1, 0])
  const topPile = useTrack(c, PB, [0, 1])

  // During each flip the pile tumbles back down to the neck: it fades into a full drain.
  const mid = (f: number[]) => [f[0] + FLIP * 0.2, f[0] + FLIP * 0.7]
  const bottomPileO = useTrack(c, mid(FA), [1, 0], easeOut)
  const bottomDrainO = useTrack(c, mid(FA), [0, 1], easeOut)
  const topPileO = useTrack(c, mid(FB), [1, 0], easeOut)
  const topDrainO = useTrack(c, [A[1], A[1] + 0.01, ...mid(FB)], [1, 0, 0, 1], easeOut)

  // A thin stream falls through the neck while a bulb fills.
  const bottomStream = useTrack(c, [A[0], A[0] + 0.12, A[1] - 0.12, A[1]], [0, 1, 1, 0])
  const topStream = useTrack(c, [PB[0], PB[0] + 0.12, PB[1] - 0.12, PB[1]], [0, 1, 1, 0])
  const grains = useTransform(c, (t) => -t * 90)

  const topDrainD = useTransform(topDrain, (a) => drainPath(TOP, -1, a))
  const topPileD = useTransform(topPile, (a) => pilePath(TOP, 1, a))
  const topPeak = useTransform(topPile, (a) => TOP.cap + a * TOP.peak)
  const bottomDrainD = useTransform(bottomDrain, (a) => drainPath(BOTTOM, 1, a))
  const bottomPileD = useTransform(bottomPile, (a) => pilePath(BOTTOM, -1, a))
  const bottomPeak = useTransform(bottomPile, (a) => BOTTOM.cap - a * BOTTOM.peak)

  return (
    <svg viewBox={`0 0 ${HG.w} ${HG.h}`} className="absolute inset-0 size-full">
      <defs>
        <clipPath id={`${id}t`}><path d={TOP_BULB} /></clipPath>
        <clipPath id={`${id}b`}><path d={BOTTOM_BULB} /></clipPath>
        <pattern id={`${id}g`} width="7" height="7" patternUnits="userSpaceOnUse">
          <circle cx="2" cy="2" r="0.9" fill="#fff" opacity="0.55" />
          <circle cx="5.5" cy="5" r="0.6" fill="#fff" opacity="0.35" />
        </pattern>
        <radialGradient id={`${id}s`} cx="50%" cy="50%" r="65%">
          <stop offset="0%" stopColor="#9a7dff" />
          <stop offset="100%" stopColor="#6c47e8" />
        </radialGradient>
      </defs>
      <g clipPath={`url(#${id}t)`}>
        <SandShape d={topDrainD} opacity={topDrainO} id={id} />
        <SandShape d={topPileD} opacity={topPileO} id={id} />
        <Stream from={TOP.neck} to={topPeak} opacity={topStream} offset={grains} />
      </g>
      <g clipPath={`url(#${id}b)`}>
        <SandShape d={bottomDrainD} opacity={bottomDrainO} id={id} />
        <SandShape d={bottomPileD} opacity={bottomPileO} id={id} />
        <Stream from={BOTTOM.neck} to={bottomPeak} opacity={bottomStream} offset={grains} />
      </g>
    </svg>
  )
}

type Bulb = typeof TOP

/** Sand resting against the neck, its surface `a` of the way out, dipping toward the neck. `dir` points from the neck to the cap. */
function drainPath(b: Bulb, dir: 1 | -1, a: number) {
  const level = b.neck + dir * a * b.drain
  const back = b.neck - dir * 4
  return `M0 ${back} L0 ${level} Q${HG.cx} ${level - dir * 6 * a} ${HG.w} ${level} L${HG.w} ${back} Z`
}

/** A mound on the cap, `a` of the way grown, peaking toward the neck. `dir` points from the cap to the neck. */
function pilePath(b: Bulb, dir: 1 | -1, a: number) {
  const base = b.cap - dir * 6
  const edge = b.cap + dir * a * b.edge
  const peak = b.cap + dir * a * b.peak
  return `M0 ${base} L0 ${edge} C70 ${edge} 100 ${peak} ${HG.cx} ${peak} C160 ${peak} 190 ${edge} ${HG.w} ${edge} L${HG.w} ${base} Z`
}

function SandShape({ d, opacity, id }: { d: MotionValue<string>; opacity: MotionValue<number>; id: string }) {
  return (
    <motion.g style={{ opacity }}>
      <motion.path d={d} fill={`url(#${id}s)`} />
      <motion.path d={d} fill={`url(#${id}g)`} />
    </motion.g>
  )
}

function Stream({ from, to, opacity, offset }: { from: number; to: MotionValue<number>; opacity: MotionValue<number>; offset: MotionValue<number> }) {
  return (
    <motion.line
      x1={HG.cx}
      x2={HG.cx}
      y1={from}
      y2={to}
      stroke="#6c47e8"
      strokeWidth={9}
      strokeLinecap="round"
      strokeDasharray="12 5"
      style={{ opacity, strokeDashoffset: offset }}
    />
  )
}
