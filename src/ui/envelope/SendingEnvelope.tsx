import { easeIn, easeInOut, easeOut, motion, useReducedMotion } from 'motion/react'
import envelopeSent from '@/assets/illustrations/envelope-sent.webp'
import { cn } from '../cn'
import {
  ART, Body, ContactShadow, EnvelopeNote, FADE, Flap, Ripple, Seal, Sparkle, Streaks, TILTED_W, linear, noteBox, sealCentre, useClock, useTrack,
} from './kit'

/**
 * A note is written, slips into the glass envelope, the flap folds shut, the
 * wax seal stamps down, and the envelope tilts into its usual pose and flies
 * off to the top right; a ping and sparkles mark the delivery. Loops.
 *
 * Same 160 × 120 slot as HeroArt; the open flap, the note and the flight leave
 * it, so give it room above and to the right. Reduced motion gets the sealed
 * envelope at rest.
 */

const LOOP = 5.8
/** Where the envelope flies to, from the slot's centre (px). */
const FLY = { x: 140, y: -86 }

/** The beats of the loop, in seconds. */
const B = {
  in: 0.4,
  write: [0.5, 0.78, 1.1, 1.34],
  insert: [1.55, 2.35],
  fold: [2.45, 2.67, 2.87, 2.97],
  stamp: [3.05, 3.23, 3.35],
  pose: [3.45, 3.85],
  windUp: [3.95, 4.2],
  away: 4.75,
}

export function SendingEnvelope({ width = 150, delay = 0, className }: { width?: number; delay?: number; className?: string }) {
  const reduce = useReducedMotion()
  return (
    <div aria-hidden className={cn('relative mx-auto h-[120px] w-[160px]', className)}>
      {reduce ? (
        <div className="absolute inset-0 flex items-center justify-center">
          <img src={envelopeSent} alt="" draggable={false} className="block max-w-none select-none" style={{ width }} />
        </div>
      ) : (
        <Loop k={width / TILTED_W} delay={delay} />
      )}
    </div>
  )
}

function Loop({ k, delay }: { k: number; delay: number }) {
  const c = useClock(LOOP, delay)
  const W = ART.w * k
  const H = ART.h * k
  const note = noteBox(k)
  const seal = sealCentre(k)

  // Whole envelope: appear, squash on the stamp, tilt into pose, wind up, fly.
  const opacity = useTrack(c, [0, B.in, B.windUp[1], B.away], [0, 1, 1, 0], [easeOut, linear, FADE])
  const scale = useTrack(c, [0, B.in, ...B.windUp, B.away], [0.86, 1, 1, 0.94, 0.5], [easeOut, linear, easeOut, easeIn])
  const hit = B.stamp[1]
  const scaleY = useTrack(c, [hit - 0.02, hit + 0.05, hit + 0.14, hit + 0.24], [1, 0.94, 1.03, 1], [easeOut, easeOut, easeInOut])
  const x = useTrack(c, [...B.windUp, B.away], [0, -8, FLY.x], [easeOut, easeIn])
  const y = useTrack(c, [0, B.in, ...B.pose, ...B.windUp, B.away], [12, 0, 0, -4, -4, 4, FLY.y], [easeOut, linear, easeInOut, linear, easeOut, easeIn])
  const rotate = useTrack(c, [...B.pose, ...B.windUp, B.away], [0, -9, -9, -16, -2], [easeInOut, linear, easeOut, easeIn])

  // The note is written, then slides in.
  const [w0, w1, w2, w3] = B.write
  const lines = [
    useTrack(c, [w0, w1], [0, 1], easeOut),
    useTrack(c, [w1, w2], [0, 1], easeOut),
    useTrack(c, [w2, w3], [0, 1], easeOut),
  ]
  const heart = useTrack(c, [w3, w3 + 0.1, w3 + 0.18], [0, 1.25, 1], [easeOut, easeInOut])
  const noteY = useTrack(c, B.insert, [0, note.inTop - note.outTop], easeInOut)
  const noteRotate = useTrack(c, [0, ...B.insert], [-5, -5, 0], [linear, easeInOut])
  // Clear while it goes in, then a faint shape once the flap is shut.
  const ghost = useTrack(c, [B.fold[0], B.fold[3] + 0.3], [0.42, 0.12], easeOut)

  // Flap folds over the top; seal drops in large and lands.
  const rotateX = useTrack(c, B.fold, [172, 90, -8, 0], [easeIn, easeOut, easeInOut])
  const sealScale = useTrack(c, B.stamp, [2.2, 0.9, 1], [easeIn, easeOut])
  const sealO = useTrack(c, [B.stamp[0], B.stamp[0] + 0.08], [0, 1])
  const sealY = useTrack(c, B.stamp.slice(0, 2), [-14, 0], easeIn)

  const shadowO = useTrack(c, [0, B.in, B.windUp[1], 4.6], [0, 1, 1, 0], [easeOut, linear, easeOut])
  const shadowX = useTrack(c, [...B.windUp, 4.6], [1, 1.08, 0.3], [easeOut, easeIn])

  const to = { x: 80 + FLY.x, y: 60 + FLY.y }

  return (
    <>
      <ContactShadow opacity={shadowO} scaleX={shadowX} />

      <motion.div
        className="absolute left-1/2 top-1/2 will-change-transform"
        style={{ width: W, height: H, marginLeft: -W / 2, marginTop: -H / 2, x, y, rotate, scale, scaleY, opacity }}
      >
        <Streaks c={c} angle={-22} behind={W * 0.44} start={B.windUp[1]} end={B.away} />
        <Flap k={k} rotateX={rotateX} />
        <EnvelopeNote k={k} y={noteY} rotate={noteRotate} lines={lines} heart={heart} ghost={ghost} />
        <Body />
        <Seal k={k} style={{ scale: sealScale, y: sealY, opacity: sealO }} />
        <Ripple c={c} start={hit} end={hit + 0.42} x={seal.x} y={seal.y} r={seal.r} className="z-[7]" />
      </motion.div>

      {/* Delivered: a ping and a few sparkles where the envelope vanished. */}
      <Ripple c={c} start={4.68} end={5.15} x={to.x} y={to.y} r={18} from={0.2} to={1.6} peak={0.9} />
      <Sparkle c={c} times={[4.7, 4.92, 5.18, 5.5]} x={to.x + 10} y={to.y - 10} size={24} fill="#6a48ea" />
      <Sparkle c={c} times={[4.78, 5, 5.26, 5.58]} x={to.x - 22} y={to.y + 10} size={14} />
      <Sparkle c={c} times={[4.86, 5.08, 5.34, 5.66]} x={to.x + 26} y={to.y + 18} size={11} />
    </>
  )
}
