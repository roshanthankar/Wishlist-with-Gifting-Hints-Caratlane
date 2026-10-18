import { lazy, Suspense, useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import heart from '@/assets/illustrations/heart.webp'
import envelopeOpen from '@/assets/illustrations/envelope.webp'
import envelopeSealed from '@/assets/illustrations/envelope-sent.webp'
import { cn } from '@/ui/cn'

const Ring3D = lazy(() => import('./Ring3D'))

/**
 * Gifting Hints banner, version 3 (“the jewellery box”). The feature’s own
 * language, made precious: the aubergine velvet stage of the QR hint (B3b)
 * with its violet and pink auras, a quilted gold lattice, a gold hairline
 * frame that light travels around, DM Serif with “love it.” in gold foil, and
 * the glass envelope that tells the story, step by step:
 *
 *   I   Save it for them   a glass heart settles into the open envelope
 *   II  They drop a hint   the envelope seals and a light glints across it
 *   III Gift it right      it opens and the real Vanki rises out, turning, in gold dust
 *
 * Slow and calm on purpose: no confetti, nothing bounces. Pauses off screen and
 * while a sheet covers the page; reduced motion shows step III, still.
 */

const STEPS = [
  { n: 'I', label: 'Save it for them' },
  { n: 'II', label: 'They drop a hint' },
  { n: 'III', label: 'Gift it right' },
] as const
const DWELL = 3400
const EASE = [0.22, 1, 0.36, 1] as const

/** Gold dust in step III: x, start y, size, delay (s). */
const DUST: [number, number, number, number][] = [
  [30, 96, 5, 0],
  [118, 90, 4, 0.5],
  [52, 70, 3, 1.1],
  [104, 62, 5, 1.6],
  [76, 100, 4, 0.8],
  [22, 54, 3, 2.1],
  [128, 40, 3, 1.3],
]
const SPARK = 'M5 0 C5.4 3.6 6.4 4.6 10 5 C6.4 5.4 5.4 6.4 5 10 C4.6 6.4 3.6 5.4 0 5 C3.6 4.6 4.6 3.6 5 0Z'

/** Quilted lattice, like the lining of a jewellery box: gold hairline diamonds with a dot at each point. */
const QUILT = `url("data:image/svg+xml,${encodeURIComponent(
  '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20"><path d="M10 0L20 10L10 20L0 10Z" fill="none" stroke="#E9C987" stroke-width="0.6"/><circle cx="10" cy="0" r="0.9" fill="#E9C987"/><circle cx="0" cy="10" r="0.9" fill="#E9C987"/><circle cx="20" cy="10" r="0.9" fill="#E9C987"/><circle cx="10" cy="20" r="0.9" fill="#E9C987"/></svg>',
)}")`

function hasWebGL() {
  try {
    const c = document.createElement('canvas')
    return !!(c.getContext('webgl2') || c.getContext('webgl'))
  } catch {
    return false
  }
}

export function GiftingHintsLuxe({ active = true, onStart }: { active?: boolean; onStart?: () => void }) {
  const reduce = !!useReducedMotion()
  const root = useRef<HTMLButtonElement>(null)
  const [inView, setInView] = useState(false)
  const [entered, setEntered] = useState(false)
  const [webgl] = useState(hasWebGL)
  const [step, setStep] = useState(reduce ? 2 : 0)
  const [cycle, setCycle] = useState(0) // restarts one-shot effects each time a step comes round

  useEffect(() => {
    const el = root.current
    if (!el || typeof IntersectionObserver === 'undefined') return setInView(true)
    const io = new IntersectionObserver(([e]) => setInView(e.isIntersecting), { threshold: 0.3 })
    io.observe(el)
    return () => io.disconnect()
  }, [])
  useEffect(() => {
    if (inView) setEntered(true)
  }, [inView])

  const playing = active && inView && !reduce
  useEffect(() => {
    if (!playing) return
    const id = window.setTimeout(() => {
      setStep((s) => (s + 1) % 3)
      setCycle((c) => c + 1)
    }, DWELL)
    return () => window.clearTimeout(id)
  }, [playing, step])

  const open = step !== 1
  const ringUp = step === 2
  const show = entered || reduce
  const rise = (delay: number) =>
    reduce ? {} : { initial: { opacity: 0, y: 10, filter: 'blur(6px)' }, animate: show ? { opacity: 1, y: 0, filter: 'blur(0px)' } : undefined, transition: { duration: 0.9, delay, ease: EASE } }

  return (
    <div className="px-4">
      <motion.button
        ref={root}
        type="button"
        onClick={onStart}
        whileTap={{ scale: 0.985 }}
        transition={{ type: 'spring', stiffness: 520, damping: 34 }}
        data-anno="gifting-hints"
        aria-label="Wishlist with Gifting Hints: know they’ll love it. Save it for them, they drop a hint, gift it right. Save it for someone."
        className={cn('lux-card relative block h-[176px] w-full overflow-hidden rounded-[16px] text-left', !playing && 'lux-paused')}
        style={{ background: 'linear-gradient(160deg, #2b1342 0%, #1d0d36 48%, #120829 100%)' }}
      >
        {/* Auras (as on B3b), drifting slowly */}
        <span aria-hidden className="lux-drift absolute -left-16 -top-20 size-56 rounded-full bg-[#5a39e3] opacity-50 blur-[48px]" />
        <motion.span
          aria-hidden
          className="lux-drift-b absolute -bottom-24 right-[-30px] size-60 rounded-full blur-[50px]"
          animate={{ backgroundColor: step === 2 ? '#c98a3a' : step === 1 ? '#6a45ff' : '#dd1564', opacity: step === 2 ? 0.5 : 0.42 }}
          transition={{ duration: 1.4, ease: 'easeInOut' }}
        />
        <span aria-hidden className="absolute left-24 top-28 size-24 rounded-full bg-[#74ffff] opacity-[0.08] blur-[30px]" />
        {/* Quilted lining */}
        <span
          aria-hidden
          className="absolute inset-0 opacity-[0.13]"
          style={{ backgroundImage: QUILT, backgroundSize: '20px 20px', maskImage: 'radial-gradient(120% 120% at 85% 50%, #000 0%, rgba(0,0,0,0.35) 55%, transparent 90%)', WebkitMaskImage: 'radial-gradient(120% 120% at 85% 50%, #000 0%, rgba(0,0,0,0.35) 55%, transparent 90%)' }}
        />
        {/* Gold hairline frame with a light that travels around it */}
        <span aria-hidden className="absolute inset-[6px] rounded-[12px] border border-[#e9c987]/25" />
        <span aria-hidden className="lux-frame absolute inset-[6px] rounded-[12px]" />

        {/* Words */}
        <span className="absolute left-5 top-[18px] flex w-[188px] flex-col items-start">
          <motion.span
            className="flex items-center gap-[6px] text-[9px] font-semibold uppercase leading-none text-[#e9c987]"
            {...(reduce ? { style: { letterSpacing: '2.4px' } } : { initial: { opacity: 0, letterSpacing: '7px' }, animate: show ? { opacity: 1, letterSpacing: '2.4px' } : undefined, transition: { duration: 1.4, ease: EASE } })}
          >
            <svg aria-hidden viewBox="0 0 10 10" className="size-[8px]">
              <path d={SPARK} fill="#e9c987" />
            </svg>
            New · Gifting Hints
          </motion.span>
          <motion.span className="serif mt-[10px] text-[26px] leading-[28px] text-[#fbf4ea]" {...rise(0.25)}>
            Know they’ll
          </motion.span>
          <motion.span className="serif lux-foil text-[31px] italic leading-[34px]" {...rise(0.4)}>
            love it.
          </motion.span>

          {/* The step, numbered like a jeweller’s card */}
          <motion.span className="mt-[9px] flex h-[18px] items-center" {...rise(0.6)}>
            <AnimatePresence mode="wait" initial={false}>
              <motion.span
                key={step}
                className="flex items-baseline gap-2 whitespace-nowrap"
                initial={reduce ? { opacity: 0 } : { opacity: 0, y: 6, filter: 'blur(4px)' }}
                animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                exit={reduce ? { opacity: 0 } : { opacity: 0, y: -6, filter: 'blur(4px)' }}
                transition={{ duration: 0.5, ease: EASE }}
              >
                <span className="serif text-[15px] italic leading-none text-[#e9c987]">{STEPS[step].n}</span>
                <span className="text-[13px] font-medium leading-none text-[#fbf4ea]/85">{STEPS[step].label}</span>
              </motion.span>
            </AnimatePresence>
          </motion.span>

          <motion.span
            className="lux-cta pn-button-text relative mt-[13px] flex h-[28px] items-center gap-[6px] overflow-hidden rounded-full border border-[#e9c987]/60 px-[13px] text-[12.5px] font-semibold leading-none text-[#f3d79a]"
            data-anno="gifting-hints-cta"
            {...rise(0.75)}
          >
            Save it for someone
            <svg aria-hidden viewBox="0 0 16 16" className="size-3">
              <path d="M3 8h9M8.5 4.5 12 8l-3.5 3.5" fill="none" stroke="#f3d79a" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </motion.span>
        </span>

        {/* The glass envelope and the ring */}
        <motion.span
          aria-hidden
          className="absolute right-[10px] top-[8px] block h-[160px] w-[150px]"
          {...(reduce ? {} : { initial: { opacity: 0, y: 14 }, animate: show ? { opacity: 1, y: 0 } : undefined, transition: { duration: 1.1, delay: 0.3, ease: EASE } })}
        >
          {/* Halo */}
          <motion.span
            className="absolute left-1/2 top-[86px] block size-[150px] -translate-x-1/2 -translate-y-1/2 rounded-full"
            animate={{
              background: step === 2 ? 'radial-gradient(closest-side, rgba(255,214,140,0.55), rgba(255,214,140,0) 100%)' : 'radial-gradient(closest-side, rgba(190,160,255,0.42), rgba(190,160,255,0) 100%)',
              scale: step === 2 ? 1.08 : 1,
            }}
            transition={{ duration: 1.2, ease: 'easeInOut' }}
          />
          {/* Gold dust (step III) */}
          <motion.span className="absolute inset-0" animate={{ opacity: ringUp ? 1 : 0 }} transition={{ duration: 0.8 }}>
            {DUST.map(([x, y, s, d], i) => (
              <svg key={i} viewBox="0 0 10 10" className="lux-dust absolute" style={{ left: x, top: y, width: s * 2, height: s * 2, animationDelay: `${d}s` }}>
                <path d={SPARK} fill={i % 3 ? '#f6dfa0' : '#fff6dc'} />
              </svg>
            ))}
          </motion.span>

          <span className="lux-float absolute inset-0">
            {/* The ring rises out of the open envelope */}
            {webgl && (
              <span className="absolute inset-x-0 top-0 block h-[93px] overflow-hidden">
                <motion.span
                  className="pointer-events-none absolute left-[25px] top-[2px] block size-[100px]"
                  initial={false}
                  animate={ringUp ? { y: 0, opacity: 1, scale: 1 } : { y: 78, opacity: 0, scale: 0.8 }}
                  transition={ringUp ? { duration: 1.4, delay: 0.25, ease: EASE } : { duration: 0.7, ease: [0.4, 0, 0.8, 0.4] }}
                >
                  <Suspense fallback={null}>
                    <Ring3D active={playing && ringUp} speed={0.012} shadow={false} label="The Classic 9KT Gold Vanki Ring" />
                  </Suspense>
                </motion.span>
              </span>
            )}

            {/* Open envelope (steps I and III) */}
            <motion.img
              src={envelopeOpen}
              alt=""
              draggable={false}
              className="absolute left-[11px] top-[50px] size-[130px] max-w-none select-none"
              initial={false}
              animate={{ opacity: open ? 1 : 0, scale: open ? 1 : 0.96 }}
              transition={{ duration: open ? 0.6 : 0.35, delay: open ? 0.15 : 0, ease: 'easeInOut' }}
            />
            {/* Sealed envelope (step II), with a glint across the glass */}
            <motion.span
              className="absolute left-[27px] top-[79px] block h-[71px] w-[96px]"
              initial={false}
              animate={{ opacity: open ? 0 : 1, scale: open ? 0.96 : [1.05, 1] }}
              transition={{ duration: open ? 0.35 : 0.6, delay: open ? 0 : 0.15, ease: 'easeInOut' }}
            >
              <img src={envelopeSealed} alt="" draggable={false} className="size-full select-none" />
              {step === 1 && (
                <span
                  key={cycle}
                  className="lux-glint absolute inset-0"
                  style={{ maskImage: `url(${envelopeSealed})`, WebkitMaskImage: `url(${envelopeSealed})`, maskSize: '100% 100%', WebkitMaskSize: '100% 100%' }}
                />
              )}
            </motion.span>

            {/* The heart settles into the envelope (step I) */}
            {step === 0 && playing && (
              <img
                key={`h-${cycle}`}
                src={heart}
                alt=""
                draggable={false}
                className="lux-heart absolute left-[56px] top-[18px] size-[38px] select-none"
              />
            )}
          </span>
          {/* Reflection on the velvet */}
          <span className="absolute bottom-[4px] left-1/2 block h-[10px] w-[90px] -translate-x-1/2 rounded-[50%] bg-black/35 blur-[6px]" />
        </motion.span>
      </motion.button>
    </div>
  )
}
