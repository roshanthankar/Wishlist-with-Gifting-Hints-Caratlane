import { lazy, Suspense, useEffect, useRef, useState, type ReactNode } from 'react'
import { AnimatePresence, motion, useAnimate, useReducedMotion } from 'motion/react'
import { ArrowsClockwise, CaretDown, CaretRight, GpsFix, Heart, SealPercent, Star } from '@phosphor-icons/react'
import { getProto, setProto, useProtoState } from '@/proto/store'
import { GlassCircle, ProductPhoto } from '@/ui'
import type { ProductId } from '@/data/products'
import type { Nudge } from './Ring3D'

/**
 * Figma’s AUTO line height for Proxima Nova is exactly 1em (a 14px label is a
 * 14px-tall box), but Typekit’s Proxima renders `line-height: normal` at
 * ~1.42em, which inflates every shared primitive that uses `leading-[normal]`
 * (chips, fields, tiles, toast). Scoped to these routes until it is fixed in
 * the primitives.
 */
export const FIGMA_LEADING = String.raw`[&_.leading-\[normal\]]:leading-none`

/* ───────────────────────── Media carousel ───────────────────────── */

/** Small Liquid Glass pill on the photo (“1K+ bought this”, rating): Figma white 40% + background blur. */
function PhotoBadge({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div
      className={`glass-chip absolute flex items-center gap-1 rounded-full py-[6px] pl-[6px] pr-2 ${className ?? ''}`}
    >
      {children}
    </div>
  )
}

/** 12px round icon with a 6px white star and a 1px tinted ring (Figma “Icon”). */
function StarDot({ bg, ring }: { bg: string; ring: string }) {
  return (
    <span className="flex size-3 shrink-0 items-center justify-center rounded-full" style={{ background: bg, boxShadow: `0 0 0 1px ${ring}` }}>
      <Star size={7} weight="fill" color="#fff" style={{ transform: 'translateY(-0.5px)' }} />
    </span>
  )
}

function Photo({ id, label }: { id: ProductId; label: string }) {
  return (
    <div className="relative h-[376px] w-full shrink-0 snap-start overflow-hidden rounded-[12px]" role="img" aria-label={label}>
      <ProductPhoto id={id} className="absolute inset-0" />
      <span aria-hidden className="pointer-events-none absolute inset-0 rounded-[12px] border border-[#f1f1f1]" />
    </div>
  )
}

/* ───────────────────────── 3D ring (first slide) ───────────────────────── */

const Ring3D = lazy(() => import('./Ring3D'))

function hasWebGL() {
  try {
    const c = document.createElement('canvas')
    return !!(c.getContext('webgl2') || c.getContext('webgl'))
  } catch {
    return false
  }
}

/** The ghost finger: appears, presses, drags across, lifts (s, and when the drag starts within it). */
const SWIPE = { duration: 1.3, times: [0, 0.2, 0.75, 1], press: 0.26 }
/** First view: a swipe right at 0.9 s, then one back left. */
const HINT = [
  { at: 900, dir: 1 },
  { at: 2400, dir: -1 },
] as const

/**
 * The hero slide is a real-time 3D Vanki ring you can turn to any angle. It
 * turns on its own like a showroom turntable. On the first view a ghost
 * finger swipes across it, right then left, and the ring follows each swipe,
 * so it’s clear it can be handled. The listing photo shows while the 3D code
 * loads, and stays if WebGL is off.
 */
function Ring3DSlide({ active: shown }: { active: boolean }) {
  const [webgl] = useState(hasWebGL)
  // The page is long: the ring only renders while it is on screen.
  const slide = useRef<HTMLDivElement>(null)
  const [inView, setInView] = useState(true)
  useEffect(() => {
    const el = slide.current
    if (!el || typeof IntersectionObserver === 'undefined') return
    const io = new IntersectionObserver(([e]) => setInView(e.isIntersecting), { threshold: 0.05 })
    io.observe(el)
    return () => io.disconnect()
  }, [])
  const active = shown && inView
  const reduce = useReducedMotion()
  const [touched, setTouched] = useState(false)
  const [ready, setReady] = useState(false)
  const [hinted] = useState(() => getProto('pdp.ringHint', false))
  const [swipe, setSwipe] = useState<{ n: number; dir: number } | null>(null)
  const [nudge, setNudge] = useState<Nudge>()
  const photo = <ProductPhoto id="vanki" className="absolute inset-0" />

  useEffect(() => {
    if (!ready || !active || touched || hinted || reduce) return
    setProto('pdp.ringHint', true)
    const ids: number[] = []
    HINT.forEach(({ at, dir }, n) => {
      ids.push(window.setTimeout(() => setSwipe({ n, dir }), at))
      // The ring is pushed as the finger starts to drag.
      ids.push(window.setTimeout(() => setNudge({ id: n + 1, dir }), at + SWIPE.press * 1000))
    })
    ids.push(window.setTimeout(() => setSwipe(null), HINT[HINT.length - 1].at + SWIPE.duration * 1000))
    return () => ids.forEach(window.clearTimeout)
  }, [ready, active, touched, hinted, reduce])

  return (
    <div
      ref={slide}
      className="relative h-[376px] w-full shrink-0 snap-start overflow-hidden rounded-[12px]"
      style={{ background: 'radial-gradient(120% 90% at 50% 38%, #ffffff 0%, #f7f7f8 55%, #ececef 100%)' }}
      data-anno="ring-3d"
    >
      {webgl ? (
        <Suspense fallback={photo}>
          <div className="absolute inset-0">
            <Ring3D active={active} nudge={nudge} onReady={() => setReady(true)} onFirstInteract={() => setTouched(true)} />
          </div>
        </Suspense>
      ) : (
        photo
      )}
      <span aria-hidden className="pointer-events-none absolute inset-0 rounded-[12px] border border-[#f1f1f1]" />
      {webgl && (
        <AnimatePresence>
          {swipe && !touched && (
            <motion.div
              key={swipe.n}
              aria-hidden
              className="pointer-events-none absolute left-1/2 top-[66%]"
              initial={{ x: -64 * swipe.dir, opacity: 0, scale: 1.3 }}
              animate={{ x: [-64 * swipe.dir, -64 * swipe.dir, 64 * swipe.dir, 64 * swipe.dir], opacity: [0, 1, 1, 0], scale: [1.3, 1, 1, 1.25] }}
              exit={{ opacity: 0, transition: { duration: 0.15 } }}
              transition={{ duration: SWIPE.duration, times: SWIPE.times, ease: 'easeInOut' }}
            >
              {/* A fingertip on glass: a soft lens with a press ripple. */}
              <span className="glass-chip absolute size-10 -translate-x-1/2 -translate-y-1/2 rounded-full [--glass-tint:rgba(60,60,67,0.2)] [--glass-float:0_4px_14px_rgba(0,0,0,0.16)]" />
              <motion.span
                className="absolute size-10 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-[#5a39e3]/40"
                initial={{ scale: 1, opacity: 0 }}
                animate={{ scale: [1, 1, 1.8], opacity: [0, 0.8, 0] }}
                transition={{ duration: 0.6, times: [0, 0.4, 1], delay: SWIPE.press * SWIPE.duration * 0.5 }}
              />
            </motion.div>
          )}
          {!touched && (
            <motion.div
              className="glass-chip pointer-events-none absolute right-[10px] top-[10px] flex items-center gap-1 rounded-full py-[6px] pl-[6px] pr-2 [--glass-tint:rgba(255,255,255,0.6)]"
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, transition: { duration: 0.2 } }}
              transition={{ delay: 0.8, duration: 0.3 }}
            >
              <motion.span
                className="flex"
                animate={reduce ? undefined : { rotate: 360 }}
                transition={{ duration: 4, ease: 'linear', repeat: Infinity }}
              >
                <ArrowsClockwise size={12} weight="bold" color="#3e3e3e" />
              </motion.span>
              <span className="text-[12px] font-semibold leading-3 text-ink-3">
                <span className="font-bold text-violet">3D</span> · Drag to rotate
              </span>
            </motion.div>
          )}
        </AnimatePresence>
      )}
    </div>
  )
}

/**
 * “Media carousel”: 370×376 photos, radius 12, 8px apart, scroll-snapping
 * horizontally with the next item peeking. Badges and the heart stay pinned
 * to the first slot, like the native gallery.
 */
export function MediaCarousel({ saved, onHeart, active = true }: { saved: boolean; onHeart: () => void; /** false while a sheet covers the page: the 3D ring stops animating. */ active?: boolean }) {
  const [heart, animateHeart] = useAnimate<HTMLDivElement>()
  const reduce = useReducedMotion()
  const [burst, setBurst] = useState(0)
  const tapHeart = () => {
    if (!reduce) animateHeart(heart.current, { scale: [1, 0.84, 1.12, 1] }, { duration: 0.42, ease: [0.22, 1, 0.36, 1] })
    if (!saved) setBurst((b) => b + 1)
    onHeart()
  }
  return (
    <div className="relative" data-anno="media">
      <div className="no-scrollbar flex snap-x snap-mandatory scroll-px-4 gap-2 overflow-x-auto overscroll-x-contain px-4">
        <Ring3DSlide active={active} />
        <Photo id="vanki" label="Next photo" />
        <span aria-hidden className="w-2 shrink-0" />
      </div>
      <div className="pointer-events-none absolute inset-y-0 left-4 right-4">
        <PhotoBadge className="left-[10px] top-[10px]">
          <StarDot bg="#e36600" ring="#ffd5b2" />
          <span className="text-[12px] font-semibold leading-3 text-orange">1K+ bought this</span>
        </PhotoBadge>
        <PhotoBadge className="bottom-[15px] left-[10px]">
          <span className="flex items-center gap-1">
            <StarDot bg="#288600" ring="#deffd0" />
            <span className="text-[12px] font-medium leading-3 text-ink-3">4.8</span>
          </span>
          <span aria-hidden className="h-3 w-px bg-black/12" />
          <span className="text-[12px] font-medium leading-3 text-ink-3">156</span>
        </PhotoBadge>
        <div ref={heart} className="pointer-events-auto absolute bottom-[10px] right-[10px] flex" data-anno="heart">
          {/* Save burst: a violet ring that blooms once behind the glass */}
          <AnimatePresence>
            {burst > 0 && !reduce && (
              <motion.span
                key={burst}
                aria-hidden
                className="pointer-events-none absolute inset-0 rounded-full border-2 border-violet"
                initial={{ scale: 1, opacity: 0.6 }}
                animate={{ scale: 1.7, opacity: 0 }}
                transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
                onAnimationComplete={() => setBurst(0)}
              />
            )}
          </AnimatePresence>
          <GlassCircle
            size={44}
            label={saved ? 'Remove from wishlist' : 'Save to wishlist'}
            aria-pressed={saved}
            // Figma’s iOS 27 glass composites to ~#F5F5F5 over the white photo
            // (white 25% · black 25% · #444 60% plus-lighter), lighter at the bottom.
            // As a class, not inline, so the pressed clear-lens state can still take over.
            className="[background:radial-gradient(120%_120%_at_50%_90%,#fafafa_0%,#f1f1f1_62%)]"
            style={{ width: 44, height: 44 }}
            onClick={tapHeart}
          >
            <AnimatePresence initial={false} mode="popLayout">
              <motion.span
                key={saved ? 'on' : 'off'}
                className="flex"
                initial={{ scale: 0.3, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.5, opacity: 0 }}
                transition={{ type: 'spring', stiffness: 700, damping: 16 }}
              >
                <Heart size={20} weight={saved ? 'fill' : 'regular'} color={saved ? '#5a39e3' : '#000'} />
              </motion.span>
            </AnimatePresence>
          </GlassCircle>
        </div>
      </div>
    </div>
  )
}

/* ───────────────────────── Price block ───────────────────────── */

export function PriceBlock() {
  const [, setDetails] = useProtoState<'details' | 'size' | 'care' | 'price' | null>('pdp.details', 'details')
  const openBreakup = () => {
    setDetails('price')
    requestAnimationFrame(() => {
      document.getElementById('pdp-price-breakup')?.scrollIntoView({ behavior: 'smooth', block: 'center' })
    })
  }
  return (
    <div className="flex flex-col gap-[10px] px-4" data-anno="price">
      <div className="flex items-center justify-between">
        <div className="flex min-w-0 flex-1 flex-col gap-3">
          <button type="button" onClick={openBreakup} className="flex items-center gap-[2px] self-start">
            <span className="text-[12px] font-semibold leading-3 text-ink-3">View Price Breakup</span>
            <CaretDown size={12} color="#000" />
          </button>
          <div className="flex flex-col gap-2">
            <div className="flex h-6 items-center gap-[10px] whitespace-nowrap leading-[normal]">
              <p className="flex items-center gap-[2px] text-[24px] text-black">
                <span>₹</span>
                <span className="font-bold">9,732</span>
              </p>
              <p className="text-[16px] font-medium text-muted line-through">₹10,607</p>
            </div>
            <p className="text-[12px] leading-3 text-ink-3">(MRP inclusive of all taxes)</p>
          </div>
        </div>
        <EmiPlans />
      </div>
      <div
        className="flex items-center gap-1 self-start rounded-l-[10px] py-1 pl-[6px] pr-2"
        style={{ background: 'linear-gradient(to right, #deffd0, rgba(222,255,208,0))' }}
        data-anno="offer"
      >
        <SealPercent size={12} weight="fill" color="#288600" />
        <span className="text-[12px] font-semibold leading-3 text-offer">Flat 25% off on Making Charges</span>
      </div>
    </div>
  )
}

/** “9=10 PLANS ›” pill with the violet “1 MONTH FREE” badge riding its top edge. */
function EmiPlans() {
  return (
    <div className="relative flex h-[46px] w-[116px] shrink-0 flex-col items-start pt-[14px]" data-anno="emi">
      <span className="flex shrink-0 items-end gap-[2px] whitespace-nowrap rounded-[12px] border border-violet-stroke bg-violet-tint px-4 py-2">
        <span className="text-[12px] font-bold leading-[14px] text-violet">9=10 PLANS</span>
        <CaretRight size={14} color="#5a39e3" />
      </span>
      <span className="absolute left-[14px] top-[1.5px] flex items-center justify-center rounded-full bg-violet px-[10px] py-1">
        <span className="whitespace-nowrap text-[10px] leading-[10px] text-white">1 MONTH FREE</span>
      </span>
    </div>
  )
}

/* ───────────────────────── Pincode row ───────────────────────── */

export function PincodeRow({ className = 'px-4' }: { className?: string }) {
  const [pin, setPin] = useState('')
  return (
    <form
      className={`flex items-center gap-2 ${className}`}
      data-anno="pincode"
      onSubmit={(e) => e.preventDefault()}
    >
      <label className="flex h-[42px] min-w-0 flex-1 cursor-text items-center gap-2 rounded-[12px] border border-line-2 bg-white p-3">
        <GpsFix size={20} color="#767676" className="shrink-0" />
        <input
          value={pin}
          onChange={(e) => setPin(e.target.value.replace(/\D/g, '').slice(0, 6))}
          inputMode="numeric"
          autoComplete="postal-code"
          aria-label="Pincode"
          placeholder="Pincode for delivery date & nearby store"
          className="min-w-0 flex-1 bg-transparent text-[12px] font-medium leading-[normal] text-black outline-none placeholder:text-muted"
        />
      </label>
      <span className="flex h-[42px] shrink-0 items-center rounded-[12px] border border-line bg-field px-[14px] text-[14px] font-semibold leading-[normal] text-muted">
        Update
      </span>
    </form>
  )
}
