import type { ReactNode } from 'react'
import { easeIn, easeInOut, easeOut, motion, useReducedMotion, useTransform, type MotionValue } from 'motion/react'
import envelopeSent from '@/assets/illustrations/envelope-sent.webp'
import heartArt from '@/assets/illustrations/envelope-parts/heart.webp'
import { cn } from '../cn'
import { ContactShadow, Ripple, Sparkle, TILTED_SEAL, linear, useClock, useTrack } from './kit'

/**
 * The hint as a link preview (WhatsApp, C0): the sealed envelope floats, gives
 * a little knock with a ring from the seal, and two glass hearts rise from
 * behind it: something inside, waiting to be opened. Sealed on purpose: the
 * seal pops when the hint opens (C1). Loops. Same 160 × 120 slot as HeroArt;
 * the hearts rise a little above it. Reduced motion gets the envelope at rest.
 */

const LOOP = 4.2
const KNOCK = 1.4

export function PreviewEnvelope({ width = 112, className }: { width?: number; className?: string }) {
  const reduce = useReducedMotion()
  const height = Math.round((width * 630) / 854)
  const box = { width, height, marginLeft: -width / 2, marginTop: -height / 2 }
  const art = <img src={envelopeSent} alt="" draggable={false} className="block size-full max-w-none select-none" />
  return (
    <div aria-hidden className={cn('relative mx-auto h-[120px] w-[160px]', className)}>
      {reduce ? (
        <div className="absolute left-1/2 top-1/2" style={box}>
          {art}
        </div>
      ) : (
        <Loop width={width} height={height}>
          {art}
        </Loop>
      )}
    </div>
  )
}

function Loop({ width, height, children }: { width: number; height: number; children: ReactNode }) {
  const c = useClock(LOOP)
  const float = useTrack(c, [0, LOOP / 2, LOOP], [0, -4, 0], easeInOut)
  const hop = useTrack(c, [KNOCK, KNOCK + 0.14, KNOCK + 0.4], [0, -4, 0], easeOut)
  const y = useTransform(() => float.get() + hop.get())
  const rotate = useTrack(c, [KNOCK, KNOCK + 0.1, KNOCK + 0.22, KNOCK + 0.34, KNOCK + 0.46], [0, -6, 5, -3, 0], easeInOut)
  const seal = { x: width * TILTED_SEAL.x, y: height * TILTED_SEAL.y, r: width * 0.1 }
  /** Where hearts slip out: just under the top edge, at the middle (the art is tilted ~9°). */
  const mouth = { x: 80 + width * 0.02, y: 60 - height / 2 + height * 0.14 }

  return (
    <>
      <ContactShadow />
      {/* Hearts sit behind the envelope, so they rise out from behind its top edge. */}
      <Heart c={c} start={KNOCK + 0.15} x={mouth.x} y={mouth.y} size={width * 0.2} drift={7} tilt={8} />
      <Heart c={c} start={KNOCK + 0.45} x={mouth.x - width * 0.12} y={mouth.y + 2} size={width * 0.14} drift={-8} tilt={-10} />
      <motion.div
        className="absolute left-1/2 top-1/2 will-change-transform"
        style={{ width, height, marginLeft: -width / 2, marginTop: -height / 2, y, rotate }}
      >
        {children}
        <Ripple c={c} start={KNOCK + 0.05} end={KNOCK + 0.95} x={seal.x} y={seal.y} r={seal.r} from={0.9} to={2.6} peak={0.7} className="border-[#8b6cff]" />
      </motion.div>
      <Sparkle c={c} times={[KNOCK + 0.7, KNOCK + 0.95, KNOCK + 1.25, KNOCK + 1.6]} x={mouth.x + width * 0.24} y={mouth.y - 24} size={9} fill="#ffffff" className="drop-shadow-[0_0_2px_rgba(90,57,227,0.6)]" />
      <Sparkle c={c} times={[KNOCK + 0.95, KNOCK + 1.2, KNOCK + 1.5, KNOCK + 1.85]} x={mouth.x - width * 0.3} y={mouth.y - 14} size={7} fill="#ffffff" className="drop-shadow-[0_0_2px_rgba(90,57,227,0.6)]" />
    </>
  )
}

/** A glass heart that rises from (x, y), drifting sideways, then fades. */
function Heart({ c, start, x, y, size, drift, tilt }: { c: MotionValue<number>; start: number; x: number; y: number; size: number; drift: number; tilt: number }) {
  const t = [start, start + 0.35, start + 1.1, start + 1.5]
  const rise = useTrack(c, t, [0, -14, -34, -42], [easeOut, linear, easeIn])
  const dx = useTrack(c, [t[0], t[3]], [0, drift], easeOut)
  const scale = useTrack(c, t, [0.4, 1, 1, 0.85], easeOut)
  const opacity = useTrack(c, [t[0], t[0] + 0.15, t[2], t[3]], [0, 1, 1, 0], linear)
  const rotate = useTrack(c, [t[0], t[3]], [-tilt, tilt], easeInOut)
  const h = size * (163 / 180)
  return (
    <motion.img
      src={heartArt}
      alt=""
      draggable={false}
      className="absolute max-w-none select-none"
      style={{ width: size, height: h, left: x - size / 2, top: y - h / 2, x: dx, y: rise, scale, opacity, rotate }}
    />
  )
}
