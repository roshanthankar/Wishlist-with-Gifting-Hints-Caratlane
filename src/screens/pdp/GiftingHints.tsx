import { useEffect, useRef, useState } from 'react'
import { motion, useReducedMotion } from 'motion/react'
import loop from '@/assets/pdp/gifting-hints.webp'
import still from '@/assets/pdp/gifting-hints-still.webp'

/**
 * “Gifting Hints banner” (Figma component in “A1 · Gifting Hints banner
 * (motion)”), where “Gifting-ready” used to sit. The pink stage is the Figma
 * Motion animation itself, exported from Figma at 4× and played as an animated
 * WebP at 3× (1110 × 450, 30 fps, 8 s loop), pixel for pixel on an iPhone:
 * the title punches in over a sunburst with confetti, then the three steps
 * play, one pink frosted-glass icon each: save it for them (heart), they drop
 * a hint (sealed envelope), gift it right (gift box). The
 * footer is the call to action; the whole banner is tappable.
 *
 * The settled still stands in for reduced motion, while a sheet covers the
 * page, and off screen (the WebP only decodes while it can be seen).
 */
export function GiftingHints({ active = true, onStart }: { active?: boolean; onStart?: () => void }) {
  const reduce = useReducedMotion()
  const root = useRef<HTMLButtonElement>(null)
  const [inView, setInView] = useState(false)

  useEffect(() => {
    const el = root.current
    if (!el || typeof IntersectionObserver === 'undefined') return setInView(true)
    const io = new IntersectionObserver(([e]) => setInView(e.isIntersecting), { threshold: 0.15 })
    io.observe(el)
    return () => io.disconnect()
  }, [])

  const playing = active && inView && !reduce

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
          className="relative block aspect-[370/150] w-full bg-cover bg-center"
          style={{ backgroundImage: `url(${still})`, backgroundColor: '#e43a7b' }}
        >
          <img
            src={playing ? loop : still}
            alt=""
            draggable={false}
            decoding="async"
            className="absolute inset-0 size-full select-none object-cover"
          />
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

/** Footer rule from the pink banner: 1px #FFC9DF line with a diamond cap at the outer end. */
function Rule({ cap }: { cap: 'left' | 'right' }) {
  return (
    <span aria-hidden className="relative h-px min-w-0 flex-1 bg-[#ffc9df]">
      <span className="absolute top-1/2 size-1 -translate-y-1/2 rotate-45 bg-[#ffc9df]" style={cap === 'left' ? { left: -2 } : { right: -2 }} />
    </span>
  )
}
