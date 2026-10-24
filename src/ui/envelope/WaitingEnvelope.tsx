import type { ReactNode } from 'react'
import { easeInOut, easeOut, motion, useReducedMotion, useTransform } from 'motion/react'
import envelopeSent from '@/assets/illustrations/envelope-sent.webp'
import { cn } from '../cn'
import { ContactShadow, Ripple, Sparkle, TILTED_SEAL, useClock, useTrack } from './kit'

/**
 * The sealed envelope, out and waiting to be opened: it floats, and every few
 * seconds it gives a little knock while two soft rings pulse out of the seal,
 * like an unread message. Loops. Same 160 × 120 slot as HeroArt.
 */

const LOOP = 4.8
const KNOCK = 2.7

export function WaitingEnvelope({ width = 133, className }: { width?: number; className?: string }) {
  const reduce = useReducedMotion()
  const height = Math.round((width * 630) / 854)
  const art = <img src={envelopeSent} alt="" draggable={false} className="block size-full max-w-none select-none" />
  return (
    <div aria-hidden className={cn('relative mx-auto h-[120px] w-[160px]', className)}>
      {reduce ? (
        <div className="absolute left-1/2 top-1/2" style={{ width, height, marginLeft: -width / 2, marginTop: -height / 2 }}>
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
  const float = useTrack(c, [0, 1.2, 2.4, 3.6, 4.8], [0, -5, 0, -5, 0], easeInOut)
  const hop = useTrack(c, [KNOCK, KNOCK + 0.14, KNOCK + 0.4], [0, -5, 0], easeOut)
  const y = useTransform(() => float.get() + hop.get())
  const rotate = useTrack(c, [KNOCK, KNOCK + 0.12, KNOCK + 0.25, KNOCK + 0.38, KNOCK + 0.5, KNOCK + 0.62], [0, -7, 6, -4, 2, 0], easeInOut)
  const scale = useTrack(c, [KNOCK, KNOCK + 0.15, KNOCK + 0.62], [1, 1.04, 1], easeOut)
  const shadowX = useTransform(y, (v) => 1 + v * 0.025)
  const seal = { x: width * TILTED_SEAL.x, y: height * TILTED_SEAL.y, r: width * 0.1 }

  return (
    <>
      <ContactShadow scaleX={shadowX} />
      <motion.div
        className="absolute left-1/2 top-1/2 will-change-transform"
        style={{ width, height, marginLeft: -width / 2, marginTop: -height / 2, y, rotate, scale }}
      >
        {children}
        {/* Two soft rings out of the seal: still unopened. */}
        <Ripple c={c} start={KNOCK + 0.05} end={KNOCK + 1.0} x={seal.x} y={seal.y} r={seal.r} from={0.9} to={3.2} peak={0.9} className="border-[#8b6cff]" />
        <Ripple c={c} start={KNOCK + 0.32} end={KNOCK + 1.3} x={seal.x} y={seal.y} r={seal.r} from={0.9} to={3.2} peak={0.65} className="border-[#8b6cff]" />
      </motion.div>
      <Sparkle c={c} times={[0.5, 0.75, 1.05, 1.4]} x={80 - width / 2 + 4} y={60 - height / 2 + 6} size={12} />
      <Sparkle c={c} times={[1.7, 1.95, 2.25, 2.6]} x={80 + width / 2 - 2} y={60 + height / 2 - 14} size={10} fill="#b8a6ff" />
      <Sparkle c={c} times={[3.6, 3.85, 4.15, 4.5]} x={80 + width / 2 - 14} y={60 - height / 2 - 2} size={9} fill="#b8a6ff" />
    </>
  )
}
