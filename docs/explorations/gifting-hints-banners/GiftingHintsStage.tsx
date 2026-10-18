import { useEffect, useRef, useState, type CSSProperties } from 'react'
import { motion, useAnimate, useReducedMotion } from 'motion/react'
import giftBox from '@/assets/illustrations/gift-box.webp'
import heart from '@/assets/illustrations/heart.webp'
import envelope from '@/assets/illustrations/envelope-opened.webp'

/**
 * Gifting Hints banner, version 2 (“the hint drop”), animated in code so it
 * stays sharp at any pixel density. Built from Mobbin references for loud
 * promo banners: Shopee’s arch stage and podium, SHEIN’s tilted ribbon
 * bands, Keeta’s slapped-on sticker headline and reward-reveal gift boxes.
 *
 *   Intro (once in view): the sticker slaps on, the headline rises, the arch
 *   springs up on its podium and the two ribbons slide in from both sides.
 *   Loop (4.2 s): the gift box shakes, pops, a glass heart springs out in a
 *   burst of sparkles, turns into the hint envelope and flies off. The ribbons
 *   keep scrolling the three steps; a shine sweeps across “love it.”.
 */

const STEPS = 'SAVE IT FOR THEM ✦ THEY DROP A HINT ✦ GIFT IT RIGHT ✦ '
const SPARK = 'M5 0 C5.4 3.6 6.4 4.6 10 5 C6.4 5.4 5.4 6.4 5 10 C4.6 6.4 3.6 5.4 0 5 C3.6 4.6 4.6 3.6 5 0Z'
const BURST: [number, number, string][] = [
  [-150, 34, '#FFE08A'],
  [-110, 40, '#FFFFFF'],
  [-70, 38, '#FFC2DA'],
  [-30, 34, '#FFE08A'],
  [-170, 22, '#C9B8FF'],
  [-10, 24, '#FFFFFF'],
]

export function GiftingHintsStage({ active = true, onStart }: { active?: boolean; onStart?: () => void }) {
  const reduce = !!useReducedMotion()
  const root = useRef<HTMLButtonElement>(null)
  const [inView, setInView] = useState(false)
  const [entered, setEntered] = useState(reduce)
  const [scope, animate] = useAnimate()

  useEffect(() => {
    const el = root.current
    if (!el || typeof IntersectionObserver === 'undefined') return setInView(true)
    const io = new IntersectionObserver(([e]) => setInView(e.isIntersecting), { threshold: 0.3 })
    io.observe(el)
    return () => io.disconnect()
  }, [])

  useEffect(() => {
    if (inView && !entered) setEntered(true)
  }, [inView, entered])

  const playing = active && inView && entered && !reduce

  // The hero loop: shake → pop → heart springs out → becomes the hint → flies off.
  useEffect(() => {
    if (!playing || !scope.current) return
    let alive = true
    const run = async () => {
      await new Promise((r) => setTimeout(r, 900))
      while (alive) {
        await animate('[data-box]', { rotate: [0, -9, 8, -6, 5, 0], scaleY: [1, 0.92, 1.04, 0.97, 1], scaleX: [1, 1.05, 0.98, 1.02, 1] }, { duration: 0.55, ease: 'easeInOut' })
        if (!alive) break
        animate('[data-rays]', { opacity: [0.35, 0.9, 0.4], scale: [1, 1.25, 1.05] }, { duration: 0.9, ease: 'easeOut' })
        animate('[data-box]', { y: [0, -6, 0], scale: [1, 1.08, 1] }, { duration: 0.45, ease: 'easeOut' })
        animate('[data-spark]', { opacity: [0, 1, 0], scale: [0.3, 1.1, 0.6] }, { duration: 0.8, ease: 'easeOut' })
        BURST.forEach(([deg, dist], i) => {
          const r = (deg * Math.PI) / 180
          animate(`[data-spark="${i}"]`, { x: [0, Math.cos(r) * dist], y: [0, Math.sin(r) * dist] }, { duration: 0.8, ease: [0.22, 1, 0.36, 1] })
        })
        await animate('[data-heart]', { opacity: [0, 1], y: [0, -44], scale: [0.3, 1], rotate: [-25, 0] }, { type: 'spring', stiffness: 260, damping: 13, opacity: { duration: 0.15 } })
        if (!alive) break
        await animate('[data-heart]', { y: [-44, -48, -44] }, { duration: 0.9, ease: 'easeInOut' })
        if (!alive) break
        // The saved heart becomes the hint
        await animate('[data-heart]', { rotateY: [0, 90], scale: [1, 0.85] }, { duration: 0.18, ease: 'easeIn' })
        animate('[data-heart]', { opacity: 0, rotateY: 0 }, { duration: 0 })
        await animate('[data-env]', { opacity: [0, 1], y: [-44, -44], rotateY: [-90, 0], scale: [0.85, 1] }, { duration: 0.22, ease: 'easeOut' })
        await new Promise((r) => setTimeout(r, 350))
        if (!alive) break
        animate('[data-trail]', { opacity: [0, 0.9, 0], scaleX: [0.2, 1, 1.2] }, { duration: 0.6, ease: 'easeOut' })
        await animate('[data-env]', { x: [0, 64], y: [-44, -76], rotate: [0, 18], scale: [1, 0.6], opacity: [1, 0] }, { duration: 0.6, ease: [0.5, 0, 0.75, 0] })
        animate('[data-env]', { x: 0, y: 0, rotate: 0, scale: 1 }, { duration: 0 })
        await new Promise((r) => setTimeout(r, 900))
      }
    }
    run()
    return () => {
      alive = false
    }
  }, [playing, animate, scope])

  /** Entrance from an offset (x / y / scale only, so each element keeps its own tilt). */
  const intro = (delay: number, from: { x?: number; y?: number; scale?: number }) =>
    reduce
      ? {}
      : {
          initial: { opacity: 0, x: 0, y: 0, scale: 1, ...from },
          animate: entered ? { opacity: 1, x: 0, y: 0, scale: 1 } : undefined,
          transition: { type: 'spring' as const, stiffness: 320, damping: 20, delay },
        }

  return (
    <div className="px-4">
      <motion.button
        ref={root}
        type="button"
        onClick={onStart}
        whileTap={{ scale: 0.98 }}
        transition={{ type: 'spring', stiffness: 520, damping: 32 }}
        data-anno="gifting-hints"
        aria-label="Wishlist with Gifting Hints: know they’ll love it. Save it for them, they drop a hint, gift it right. Save it for someone."
        className="block w-full overflow-hidden rounded-[12px] text-left"
      >
        <span
          ref={scope}
          className={`gh-stage relative block aspect-[370/150] w-full overflow-hidden ${playing ? '' : 'gh-paused'}`}
          style={{ background: 'radial-gradient(120% 140% at 82% 40%, #ff5fa2 0%, #dd1564 38%, #8a1fb8 78%, #5a39e3 100%)' }}
        >
          {/* Soft light pools */}
          <span aria-hidden className="absolute -left-10 -top-14 size-48 rounded-full bg-[#ff9ac6] opacity-40 blur-[36px]" />
          <span aria-hidden className="absolute -bottom-20 left-24 size-52 rounded-full bg-[#7b4dff] opacity-50 blur-[44px]" />

          {/* Ribbons (behind the stage) */}
          <motion.span aria-hidden className="absolute left-[-30px] top-[107px] block w-[440px]" style={{ rotate: 4 }} {...intro(0.35, { x: 260 })}>
            <span className="gh-band flex h-[22px] items-center overflow-hidden bg-[#3f22b5] shadow-[0_6px_14px_rgba(40,10,90,0.35)]">
              <span className="gh-marquee gh-marquee-r flex shrink-0 whitespace-nowrap text-[10.5px] font-bold uppercase leading-none tracking-[1.2px] text-[#ffd66b]">
                {STEPS.repeat(4)}
              </span>
            </span>
          </motion.span>
          <motion.span aria-hidden className="absolute left-[-30px] top-[123px] block w-[440px]" style={{ rotate: -4 }} {...intro(0.45, { x: -260 })}>
            <span className="flex h-[24px] items-center overflow-hidden bg-white shadow-[0_6px_16px_rgba(90,10,50,0.3)]">
              <span className="gh-marquee flex shrink-0 whitespace-nowrap text-[11px] font-bold uppercase leading-none tracking-[1.2px] text-[#dd1564]">
                {STEPS.repeat(4)}
              </span>
            </span>
          </motion.span>

          {/* Headline */}
          <span className="absolute left-4 top-3 flex flex-col items-start">
            <motion.span
              className="pn-button-text rounded-full bg-[#ffd66b] px-[10px] py-[5px] text-[10px] font-bold uppercase leading-none tracking-[1px] text-[#8a0a3e] shadow-[0_3px_0_#b8730f,0_6px_14px_rgba(80,10,40,0.35)]"
              style={{ rotate: -4 }}
              {...(reduce ? {} : { initial: { opacity: 0, scale: 2.2, rotate: -18 }, animate: entered ? { opacity: 1, scale: 1, rotate: -4 } : undefined, transition: { type: 'spring', stiffness: 420, damping: 14, delay: 0.05 } })}
            >
              New · Gifting Hints
            </motion.span>
            <motion.span className="serif mt-[7px] text-[27px] leading-[29px] text-white [text-shadow:0_2px_0_rgba(110,8,52,0.55)]" {...intro(0.15, { y: 16 })}>
              Know they’ll
            </motion.span>
            <motion.span className="serif gh-shine text-[29px] leading-[31px] [filter:drop-shadow(0_2px_0_rgba(110,8,52,0.55))]" {...intro(0.25, { y: 16 })}>
              love it.
            </motion.span>
          </span>

          {/* Arch stage on a podium */}
          <motion.span className="absolute right-[20px] top-[12px] block h-[106px] w-[104px]" {...intro(0.2, { y: 60 })}>
            <span className="absolute inset-0 rounded-t-[52px] rounded-b-[10px] p-[3px]" style={{ background: 'linear-gradient(180deg, #fff1b8, #f2b544 55%, #c98a2a)' }}>
              <span className="relative block size-full overflow-hidden rounded-t-[49px] rounded-b-[8px]" style={{ background: 'linear-gradient(180deg, #ff8cbc 0%, #ffd1e4 100%)' }}>
                <span data-rays aria-hidden className="absolute left-1/2 top-[62%] block size-[220px] -translate-x-1/2 -translate-y-1/2 opacity-40">
                  <span
                    className="gh-rays block size-full"
                    style={{ background: 'repeating-conic-gradient(from 0deg, rgba(255,255,255,0.9) 0deg 7deg, rgba(255,255,255,0) 7deg 22deg)', maskImage: 'radial-gradient(closest-side, #000 30%, transparent 100%)', WebkitMaskImage: 'radial-gradient(closest-side, #000 30%, transparent 100%)' } as CSSProperties}
                  />
                </span>
              </span>
            </span>
          </motion.span>
          {/* Podium */}
          <motion.span className="absolute bottom-[8px] right-[8px] block h-[26px] w-[128px]" {...intro(0.3, { scale: 0.6 })}>
            <span className="absolute inset-x-0 bottom-0 h-[18px] rounded-[50%]" style={{ background: 'linear-gradient(180deg, #e0a03a, #a8691c)' }} />
            <span className="absolute inset-x-0 top-0 h-[18px] rounded-[50%]" style={{ background: 'radial-gradient(60% 80% at 50% 35%, #fff4cc, #f6c65a 70%, #e6a73e)' }} />
          </motion.span>

          {/* Hero: gift box, the heart that springs out, the hint that flies off */}
          <span className="absolute bottom-[24px] right-[34px] block size-[76px] [perspective:400px]">
            <span data-trail aria-hidden className="absolute left-[44px] top-[-24px] block h-[3px] w-[56px] origin-left -rotate-[34deg] rounded-full bg-gradient-to-r from-white/0 to-white opacity-0" />
            {BURST.map(([, , color], i) => (
              <svg key={i} data-spark={i} aria-hidden viewBox="0 0 10 10" className="absolute left-[34px] top-[6px] size-[9px] opacity-0">
                <path d={SPARK} fill={color} />
              </svg>
            ))}
            <img data-heart src={heart} alt="" draggable={false} className="absolute left-[18px] top-[12px] size-[40px] opacity-0" />
            <img data-env src={envelope} alt="" draggable={false} className="absolute left-[19px] top-[10px] h-[42px] w-[38px] object-contain opacity-0" />
            <img data-box src={giftBox} alt="" draggable={false} className="absolute inset-[-22px] size-[120px] max-w-none origin-bottom select-none" />
          </span>
          {/* Twinkles */}
          {[
            [222, 16, 9, 0],
            [356, 60, 7, 0.8],
            [238, 78, 6, 1.6],
            [204, 46, 5, 2.2],
          ].map(([x, y, s, d], i) => (
            <svg key={i} aria-hidden viewBox="0 0 10 10" className="gh-twinkle absolute" style={{ left: x, top: y, width: s, height: s, animationDelay: `${d}s` }}>
              <path d={SPARK} fill="#fff" />
            </svg>
          ))}
        </span>
        <span className="flex h-[38px] items-center gap-[10px] bg-pink-tint px-3" data-anno="gifting-hints-cta">
          <Rule cap="left" />
          <span className="pn-button-text whitespace-nowrap text-[13px] font-semibold leading-none text-[#dd1664]">Save it for someone ›</span>
          <Rule cap="right" />
        </span>
      </motion.button>
    </div>
  )
}

function Rule({ cap }: { cap: 'left' | 'right' }) {
  return (
    <span aria-hidden className="relative h-px min-w-0 flex-1 bg-[#ffc9df]">
      <span className="absolute top-1/2 size-1 -translate-y-1/2 rotate-45 bg-[#ffc9df]" style={cap === 'left' ? { left: -2 } : { right: -2 }} />
    </span>
  )
}
