import { easeIn, easeInOut, easeOut, motion, useReducedMotion } from 'motion/react'
import envelopeOpened from '@/assets/illustrations/envelope-opened.webp'
import { cn } from '../cn'
import {
  ART, Body, ContactShadow, Crumbs, EnvelopeNote, Flap, GlassHeart, Seal, Sparkle, Streaks, TILTED_W, heartAt, noteBox, useClock, useTrack,
} from './kit'

/**
 * The hint is received and opened: the sealed envelope flies in and lands,
 * straightens, the seal pops off, the flap swings open, the note rises out
 * with its message, and a glass heart pops up over it. Holds, then replays.
 *
 * Same 160 × 120 slot as HeroArt; the envelope sits low in it so the open
 * flap, note and heart fit above. Reduced motion gets envelope-opened.webp.
 */

const LOOP = 7.4
/** The envelope sits this far below the slot's centre (px). */
const LIFT = 18

const B = {
  arrive: [0, 0.6],
  land: 0.6,
  straighten: [0.9, 1.3],
  seal: [1.35, 1.48, 1.78],
  open: [1.8, 2.02, 2.24, 2.36],
  rise: [2.35, 2.95, 3.1],
  heart: [3.05, 3.25, 3.4],
  out: [6.6, 7.0],
}

export function OpenedEnvelope({ width = 124, className }: { width?: number; className?: string }) {
  const reduce = useReducedMotion()
  return (
    <div aria-hidden className={cn('relative mx-auto h-[120px] w-[160px]', className)}>
      {reduce ? (
        <div className="absolute inset-0 flex items-center justify-center">
          <img src={envelopeOpened} alt="" draggable={false} className="block max-w-none select-none" style={{ width: 101 }} />
        </div>
      ) : (
        <Loop k={width / TILTED_W} />
      )}
    </div>
  )
}

function Loop({ k }: { k: number }) {
  const c = useClock(LOOP)
  const W = ART.w * k
  const H = ART.h * k
  const note = noteBox(k)

  // Flies in from the top left, lands with a squash, straightens.
  const opacity = useTrack(c, [0, 0.25, ...B.out], [0, 1, 1, 0], easeOut)
  const x = useTrack(c, B.arrive, [-110, 0], easeOut)
  const y = useTrack(c, B.arrive, [-80, 0], easeOut)
  const scale = useTrack(c, [B.arrive[0], B.arrive[1], ...B.out], [0.55, 1, 1, 0.96], easeOut)
  const scaleY = useTrack(c, [B.land - 0.02, B.land + 0.04, B.land + 0.14, B.land + 0.24], [1, 0.94, 1.03, 1], [easeOut, easeOut, easeInOut])
  const rotate = useTrack(c, [B.arrive[0], B.arrive[1], ...B.straighten], [6, -9, -9, 0], [easeOut, easeOut, easeInOut])

  // The seal swells, then pops off.
  const [s0, s1, s2] = B.seal
  const sealScale = useTrack(c, [s0, s1, s2], [1, 1.12, 1.4], [easeOut, easeOut])
  const sealY = useTrack(c, [s1, s2], [0, -22], easeOut)
  const sealRotate = useTrack(c, [s1, s2], [0, 18], easeOut)
  const sealO = useTrack(c, [s1, s2], [1, 0], easeIn)

  // The flap swings open, a touch past upright, and settles.
  const rotateX = useTrack(c, B.open, [0, 90, 182, 172], [easeIn, easeOut, easeInOut])

  // The note rises out; it shows through the glass more once the flap is open.
  const noteY = useTrack(c, B.rise, [note.inTop - note.outTop, -3, 0], [easeOut, easeInOut])
  const noteRotate = useTrack(c, [B.rise[0], B.rise[2]], [0, -3], easeInOut)
  const ghost = useTrack(c, [B.open[1], B.open[3]], [0.12, 0.42], easeOut)

  // A glass heart pops up over the note, then bobs.
  const [h0, h1, h2] = B.heart
  const heartScale = useTrack(c, [h0, h1, h2], [0, 1.18, 1], [easeOut, easeInOut])
  const heartY = useTrack(c, [h0, h1, h2, 4.4, 5.4, 6.4], [10, -2, 0, -4, 0, -4], easeInOut)
  const heart = heartAt(k)

  const shadowO = useTrack(c, [0.3, B.land, ...B.out], [0, 1, 1, 0], easeOut)

  return (
    <>
      <ContactShadow opacity={shadowO} />

      <motion.div
        className="absolute left-1/2 top-1/2 will-change-transform"
        style={{ width: W, height: H, marginLeft: -W / 2, marginTop: -H / 2 + LIFT, x, y, rotate, scale, scaleY, opacity }}
      >
        <Streaks c={c} angle={38} behind={W * 0.44} start={0.02} end={B.arrive[1] - 0.05} />
        <Flap k={k} rotateX={rotateX} />
        <EnvelopeNote k={k} y={noteY} rotate={noteRotate} ghost={ghost} />
        <Body />
        <Seal k={k} style={{ scale: sealScale, y: sealY, rotate: sealRotate, opacity: sealO }} />
        <Crumbs c={c} k={k} start={s1} />
        <GlassHeart k={k} scale={heartScale} y={heartY} />
        <Sparkle c={c} times={[3.2, 3.45, 3.75, 4.1]} x={heart.x - heart.w * 0.95} y={heart.y - heart.h * 0.2} size={9} fill="#ffffff" className="z-[8] drop-shadow-[0_0_2px_rgba(90,57,227,0.6)]" />
        <Sparkle c={c} times={[3.35, 3.6, 3.9, 4.25]} x={heart.x + heart.w * 0.95} y={heart.y + heart.h * 0.15} size={8} fill="#ffffff" className="z-[8] drop-shadow-[0_0_2px_rgba(90,57,227,0.6)]" />
        <Sparkle c={c} times={[4.8, 5.05, 5.35, 5.7]} x={heart.x - heart.w * 0.95} y={heart.y - heart.h * 0.2} size={9} fill="#ffffff" className="z-[8] drop-shadow-[0_0_2px_rgba(90,57,227,0.6)]" />
        <Sparkle c={c} times={[5.0, 5.25, 5.55, 5.9]} x={heart.x + heart.w * 0.95} y={heart.y + heart.h * 0.15} size={8} fill="#ffffff" className="z-[8] drop-shadow-[0_0_2px_rgba(90,57,227,0.6)]" />
      </motion.div>
    </>
  )
}
