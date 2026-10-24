import { useEffect, useRef } from 'react'
import { easeIn, easeInOut, easeOut, motion, useTime, useTransform } from 'motion/react'
import { ART, Body, Crumbs, EnvelopeNote, Flap, GlassHeart, Seal, Sparkle, TILTED_W, heartAt, noteBox, useTrack } from './kit'

/**
 * The hint opens, once: the sealed envelope (drawn in its usual tilt)
 * straightens, the seal swells and pops off, the flap swings open, the note
 * rises out and a glass heart pops up over it. Starts when `open` turns true;
 * `instant` shows the opened envelope with no motion. Fills a 112 × 84 slot,
 * sitting low so the open flap, note and heart fit above it; while sealed it is
 * lifted to the slot's centre.
 */

/** When each beat starts, in seconds after `open`. */
export const OPEN_BEATS = {
  swell: 0,
  pop: 0.12,
  flap: [0.3, 0.46, 0.62, 0.72],
  rise: [0.62, 1.05, 1.18],
  heart: [1.0, 1.18, 1.32],
  /** Everything has landed. */
  end: 1.35,
}

const SLOT = { w: 112, h: 84 }

export function OpeningEnvelope({ open, instant = false, speed = 1, width = 79 }: {
  open: boolean
  instant?: boolean
  /** Stretches every duration (1 = as designed). */
  speed?: number
  /** Width of the equivalent tilted art (envelope-sent.webp), as elsewhere. */
  width?: number
}) {
  const k = width / TILTED_W
  const W = ART.w * k
  const H = ART.h * k
  const note = noteBox(k)
  const heart = heartAt(k)
  const B = OPEN_BEATS

  // Seconds since `open`, scaled by speed; far past the end when `instant`.
  const time = useTime()
  const start = useRef<number | null>(null)
  const done = useRef(instant)
  done.current = instant
  useEffect(() => {
    start.current = open ? time.get() : null
  }, [open, time])
  const c = useTransform(time, (ms) => (done.current ? 99 : start.current === null ? 0 : (ms - start.current) / 1000 / speed))

  // Sealed it sits at the slot's centre in its usual tilt; opening, it straightens and settles low.
  const lift = SLOT.h / 2 - (SLOT.h - H / 2)
  const y = useTrack(c, [0.1, 0.8], [lift, 0], easeInOut)
  const rotate = useTrack(c, [0, 0.5], [-9, 0], easeOut)

  const sealScale = useTrack(c, [B.swell, B.pop, B.pop + 0.28], [1, 1.12, 1.4], [easeOut, easeOut])
  const sealY = useTrack(c, [B.pop, B.pop + 0.28], [0, -22 * (k / 0.1452)], easeOut)
  const sealRotate = useTrack(c, [B.pop, B.pop + 0.28], [0, 18], easeOut)
  const sealO = useTrack(c, [B.pop, B.pop + 0.28], [1, 0], easeIn)

  const rotateX = useTrack(c, B.flap, [0, 90, 182, 172], [easeIn, easeOut, easeInOut])
  const noteY = useTrack(c, B.rise, [note.inTop - note.outTop, -2, 0], [easeOut, easeInOut])
  const noteRotate = useTrack(c, [B.rise[0], B.rise[2]], [0, -3], easeInOut)
  // Unseen while sealed (it reads as the plain art at full size), then clear once the flap is up.
  const ghost = useTrack(c, [B.flap[1], B.flap[3]], [0, 0.42], easeOut)
  const heartScale = useTrack(c, B.heart, [0, 1.18, 1], [easeOut, easeInOut])
  const heartY = useTrack(c, [B.heart[0], B.heart[1], B.heart[2]], [8, -2, 0], easeInOut)

  return (
    <motion.div
      className="absolute will-change-transform"
      style={{ width: W, height: H, left: (SLOT.w - W) / 2, top: SLOT.h - H, y, rotate }}
    >
      <Flap k={k} rotateX={rotateX} />
      <EnvelopeNote k={k} y={noteY} rotate={noteRotate} ghost={ghost} />
      <Body />
      <Seal k={k} style={{ scale: sealScale, y: sealY, rotate: sealRotate, opacity: sealO }} />
      <Crumbs c={c} k={k} start={B.pop} />
      <GlassHeart k={k} scale={heartScale} y={heartY} />
      <Sparkle c={c} times={[1.15, 1.4, 1.75, 2.15]} x={heart.x - heart.w * 0.95} y={heart.y - heart.h * 0.2} size={7} fill="#ffffff" className="z-[8] drop-shadow-[0_0_2px_rgba(90,57,227,0.6)]" />
      <Sparkle c={c} times={[1.25, 1.5, 1.85, 2.25]} x={heart.x + heart.w * 0.95} y={heart.y + heart.h * 0.15} size={6} fill="#ffffff" className="z-[8] drop-shadow-[0_0_2px_rgba(90,57,227,0.6)]" />
    </motion.div>
  )
}
