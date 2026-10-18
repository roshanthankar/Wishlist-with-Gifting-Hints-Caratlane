import { Check, LockSimple, Sparkle } from '@phosphor-icons/react'
import { Button } from '@/ui'

/**
 * End of the hint page (C1b, 834:45760): “New to hints?” card, “Your turn”
 * invite, and the trust row + privacy line.
 */

const STEPS = [
  { title: 'Priya picked what she’d love', body: 'Her size and a note on each, prices as ranges' },
  { title: 'You choose, quietly', body: 'Hold a pick for 24 hours. Others see it’s taken' },
  { title: 'She stays surprised', body: 'Her app never shows who’s getting what' },
]

/** “How hints work”: white, 1px #F0F0F0, radius 20, p 16, gap 16. */
export function HowHintsWork() {
  return (
    <section data-anno="how-hints" className="flex flex-col gap-4 rounded-[20px] border border-line bg-white p-4">
      <div className="flex items-center gap-2">
        <Sparkle size={18} color="#5a39e3" />
        <h2 className="text-[16px] font-semibold leading-[normal] text-black">New to hints? Here’s the deal</h2>
      </div>
      <ol className="flex flex-col gap-3">
        {STEPS.map((s, i) => (
          <li key={s.title} className="flex gap-3">
            <span className="serif flex size-7 shrink-0 items-center justify-center rounded-full bg-violet-tint text-[14px] leading-[19px] text-violet">
              {i + 1}
            </span>
            <div className="flex min-w-0 flex-1 flex-col gap-[2px]">
              <p className="text-[14px] font-semibold leading-[normal] text-black">{s.title}</p>
              <p className="text-[12px] leading-[1.4] text-muted">{s.body}</p>
            </div>
          </li>
        ))}
      </ol>
    </section>
  )
}

/** “Your turn”: #F7F5FF, 1px #D7CDFF, radius 20, p 20, gap 12. */
export function YourTurn() {
  return (
    <section data-anno="your-turn" className="flex flex-col gap-3 rounded-[20px] border border-violet-stroke bg-[#f7f5ff] p-5">
      <h2 className="serif text-[28px] leading-[38px] text-violet">Your turn</h2>
      <p className="text-[14px] leading-[1.45] text-ink-3">
        Start a list of what you’d love. Priya can hint back for your birthday, no guessing either way.
      </p>
      <div data-anno="your-turn-actions" className="flex gap-3">
        <Button variant="secondary" block="flex">
          Open in app
        </Button>
        <Button block="flex">
          Start my list
        </Button>
      </div>
    </section>
  )
}

/** Trust row (Check 14 violet + Medium 12 #3E3E3E, gap 14) + privacy line. */
export function TrustFooter() {
  return (
    <div className="flex flex-col items-center gap-3">
      <div data-anno="trust-row" className="flex flex-wrap items-center justify-center gap-x-[14px] gap-y-2">
        {['No app needed', 'Arrives by 23 Nov', 'Lifetime exchange'].map((t) => (
          <span key={t} className="flex items-center gap-1 whitespace-nowrap text-[12px] font-medium leading-[normal] text-ink-3">
            <Check size={14} color="#5a39e3" />
            {t}
          </span>
        ))}
      </div>
      <div data-anno="privacy-line" className="flex max-w-[338px] items-center gap-[6px]">
        <LockSimple size={12} color="#767676" className="shrink-0" />
        <p className="text-[12px] leading-4 text-muted">Priya sees that you opened it. Who gets what stays hidden from her until after 25 Nov.</p>
      </div>
    </div>
  )
}
