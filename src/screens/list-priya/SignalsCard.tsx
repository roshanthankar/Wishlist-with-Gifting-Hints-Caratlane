import { motion, useReducedMotion } from 'motion/react'

const EASE = [0.22, 1, 0.36, 1] as const

function Initial({ letter, bg, color, delay, className }: { letter: string; bg: string; color: string; delay: number; className?: string }) {
  const reduce = useReducedMotion()
  return (
    <motion.span
      className={`serif flex size-[34px] items-center justify-center rounded-full border-2 border-white text-[14px] leading-none ${className ?? ''}`}
      style={{ background: bg, color }}
      initial={reduce ? { opacity: 0 } : { scale: 0.3, opacity: 0 }}
      animate={reduce ? { opacity: 1 } : { scale: 1, opacity: 1 }}
      transition={reduce ? { duration: 0.2, delay } : { type: 'spring', stiffness: 640, damping: 18, delay }}
    >
      {letter}
    </motion.span>
  )
}

/**
 * A12 “Signals” card (830:27131): every signal (Priya’s Style match pick,
 * Ananya’s vote, Priya’s hint) lands on the same ring. White, 1px #F1F1F1,
 * radius 16, p 16, violet-tinted shadow. Fades up, then the avatars pop.
 */
export function SignalsCard() {
  const reduce = useReducedMotion()
  return (
    <motion.section
      data-anno="signals"
      className="flex flex-col gap-3 rounded-[16px] border border-[#f1f1f1] bg-white p-4 shadow-[0_4px_16px_rgba(89,56,227,0.08)]"
      initial={{ opacity: 0, y: reduce ? 0 : 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: reduce ? 0.2 : 0.55, ease: EASE, delay: 0.12 }}
    >
      <div className="flex flex-col gap-[10px]">
        <div data-anno="signals-avatars" className="flex" aria-label="Ananya and Priya">
          <Initial letter="A" bg="#ffe1ed" color="#dd1564" delay={0.42} />
          <Initial letter="P" bg="#f0ecff" color="#5a39e3" delay={0.52} className="-ml-2" />
        </div>
        <div className="flex flex-col gap-1">
          <h2 className="serif text-[24px] leading-[33px] text-pink">Every signal points to the Vanki</h2>
          <p className="text-[14px] leading-[18px] text-ink-3">Priya loved it in Style match, Ananya voted for it, and it’s in her hint</p>
        </div>
      </div>
      <div data-anno="signals-quote" className="flex flex-col gap-1 rounded-[12px] bg-[#fff4f8] px-3 py-[10px]">
        <p className="serif text-[16px] italic leading-[22px] text-black">“She never takes off gold. Go with the Vanki!”</p>
        <p className="text-[12px] leading-none text-muted">Ananya · size 12, checked on a ring she wears</p>
      </div>
    </motion.section>
  )
}
