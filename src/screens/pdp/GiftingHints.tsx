import { useEffect, useLayoutEffect, useRef, useState, type KeyboardEvent } from 'react'
import { motion, useReducedMotion } from 'motion/react'
import still from '@/assets/pdp/gifting-hints-still.webp'
import loopWebm from '@/assets/pdp/gifting-hints.webm'
import loopMp4 from '@/assets/pdp/gifting-hints.mp4'
import loopWebmMobile from '@/assets/pdp/gifting-hints-mobile.webm'
import loopMp4Mobile from '@/assets/pdp/gifting-hints-mobile.mp4'

/**
 * “Gifting Hints banner” (Figma component in “A1 · Gifting Hints banner
 * (motion)”). The pink stage is the Figma Motion animation itself, exported
 * from Figma at 4× and encoded as H.264 / VP9 video (1110 × 450 desktop,
 * 720 × 292 mobile, 30 fps, 8 s loop) so mobile browsers get hardware
 * decoding — animated WebP was CPU-decoded and janked on phones.
 * The still is the poster for reduced motion, slow networks, and off-screen.
 */
export function GiftingHints({ active = true, onStart }: { active?: boolean; onStart?: () => void }) {
  const reduce = useReducedMotion()
  // Interactive wrapper is a div, not a button — <video> inside <button> is
  // invalid HTML, and iOS Safari paints its own tap-to-play overlay when it
  // sees the nested interactive content.
  const root = useRef<HTMLDivElement>(null)
  const video = useRef<HTMLVideoElement>(null)
  // Optimistic: assume in view so autoplay fires immediately on mount;
  // the observer only matters when the user scrolls away (battery save).
  const [inView, setInView] = useState(true)

  useEffect(() => {
    const el = root.current
    if (!el || typeof IntersectionObserver === 'undefined') return
    const io = new IntersectionObserver(([e]) => setInView(e.isIntersecting), {
      threshold: 0,
      rootMargin: '200px 0px',
    })
    io.observe(el)
    return () => io.disconnect()
  }, [])

  const playing = active && inView && !reduce
  // Track whether the <video> is actually playing right now. When it isn't,
  // we hide the whole video element — this also hides Safari's native
  // tap-to-play overlay (which lives inside the <video>'s shadow DOM and
  // paints above sibling elements, so an on-top still image doesn't help).
  const [isPlayingNow, setIsPlayingNow] = useState(false)

  // Safari's autoplay heuristic checks the HTML `muted` attribute, not the
  // JS property — React's `muted` prop sets the property but doesn't always
  // emit the attribute at parse time. Force the attributes directly.
  useLayoutEffect(() => {
    const v = video.current
    if (!v) return
    v.muted = true
    v.defaultMuted = true
    v.setAttribute('muted', '')
    v.setAttribute('playsinline', '')
    v.setAttribute('webkit-playsinline', '')
  }, [])

  useEffect(() => {
    const v = video.current
    if (!v) return
    if (playing) void v.play().catch(() => {})
    else v.pause()
  }, [playing])

  const handleActivate = () => {
    // Kick the video on any user interaction — handles the case where Safari
    // blocked initial autoplay and only a user gesture can start it.
    const v = video.current
    if (v && v.paused) void v.play().catch(() => {})
    onStart?.()
  }

  const activate = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      handleActivate()
    }
  }

  return (
    <div className="px-4">
      <motion.div
        ref={root}
        role="button"
        tabIndex={0}
        onClick={handleActivate}
        onKeyDown={activate}
        whileTap={{ scale: 0.98 }}
        transition={{ type: 'spring', stiffness: 520, damping: 32 }}
        data-anno="gifting-hints"
        aria-label="Wishlist with Gifting Hints: know they’ll love it. Save it for them, they drop a hint, gift it right. Save it for someone."
        className="block w-full cursor-pointer overflow-hidden rounded-[12px] text-left"
      >
        <span
          className="relative block aspect-[370/150] w-full bg-cover bg-center"
          style={{ backgroundImage: `url(${still})`, backgroundColor: '#e43a7b' }}
        >
          <video
            ref={video}
            poster={still}
            autoPlay
            muted
            loop
            playsInline
            preload="auto"
            controls={false}
            disablePictureInPicture
            aria-hidden
            // opacity 0 when paused/blocked hides Safari's tap-to-play overlay;
            // the parent's background still image is what the user sees.
            className={`pointer-events-none absolute inset-0 size-full select-none object-cover transition-opacity duration-300 ${isPlayingNow ? 'opacity-100' : 'opacity-0'}`}
            onPlaying={() => setIsPlayingNow(true)}
            onPause={() => setIsPlayingNow(false)}
            onEnded={() => setIsPlayingNow(false)}
            onLoadedMetadata={(e) => void e.currentTarget.play().catch(() => {})}
            onCanPlay={(e) => void e.currentTarget.play().catch(() => {})}
          >
            {/* H.264 first — hardware-decoded on every iOS device; VP9 is only
                hw-decoded on A12+ and sometimes falls back to CPU. */}
            <source media="(max-width: 640px)" src={loopMp4Mobile} type="video/mp4" />
            <source media="(max-width: 640px)" src={loopWebmMobile} type="video/webm" />
            <source src={loopMp4} type="video/mp4" />
            <source src={loopWebm} type="video/webm" />
          </video>
        </span>
        <span className="flex h-[38px] items-center gap-[10px] bg-pink-tint px-3" data-anno="gifting-hints-cta">
          <Rule cap="left" />
          <span className="pn-button-text whitespace-nowrap text-[13px] font-semibold leading-none text-[#dd1664]">Save it for someone ›</span>
          <Rule cap="right" />
        </span>
      </motion.div>
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
