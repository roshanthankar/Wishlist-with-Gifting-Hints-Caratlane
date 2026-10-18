import { useEffect } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { ArrowRight, X } from '@phosphor-icons/react'
import { FLOWS } from '@/proto/flows'
import { STORY } from '@/data/story'
import { useNav } from '@/proto/nav'
import { cn } from '@/ui/cn'

/** “About the case study” — the Figma cover, condensed. Opens on first visit. */
export function AboutModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { jump } = useNav()

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  const start = (frame: Parameters<typeof jump>[0], flow?: string) => {
    jump(frame, flow)
    onClose()
  }

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[200] flex items-end justify-center sm:items-center sm:p-6" role="dialog" aria-modal="true" aria-label="About the case study">
          <motion.div className="absolute inset-0 bg-[#1b1430]/45 backdrop-blur-[3px]" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} />
          <motion.div
            className="relative max-h-[92dvh] w-full max-w-[920px] overflow-hidden rounded-t-[28px] bg-white shadow-[0_40px_120px_-30px_rgba(30,15,90,0.5)] sm:rounded-[28px]"
            initial={{ y: 40, opacity: 0, scale: 0.98 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 30, opacity: 0, scale: 0.98, transition: { duration: 0.2 } }}
            transition={{ type: 'spring', stiffness: 340, damping: 34 }}
          >
            <button type="button" aria-label="Close" onClick={onClose} className="absolute right-4 top-4 z-10 flex size-9 items-center justify-center rounded-full bg-black/5 hover:bg-black/10">
              <X size={16} weight="bold" />
            </button>
            <div className="no-scrollbar max-h-[92dvh] overflow-y-auto">
              <div className="relative overflow-hidden px-6 pb-7 pt-8 sm:px-10 sm:pt-10">
                <div aria-hidden className="pointer-events-none absolute -left-20 -top-24 h-64 w-[520px] rounded-full bg-[#ffbad5] opacity-50 blur-[70px]" />
                <div aria-hidden className="pointer-events-none absolute -right-10 -top-20 h-56 w-[420px] rounded-full bg-[#cfacff] opacity-50 blur-[70px]" />
                <p className="relative inline-flex rounded-full bg-[#f0ecff] px-3 py-1 text-[12px] font-semibold text-violet">{STORY.kicker}</p>
                <h2 className="serif relative mt-4 text-[38px] leading-[1.05] text-black sm:text-[52px]">{STORY.title}</h2>
                <p className="serif relative mt-3 text-[20px] italic leading-[1.3] text-violet sm:text-[24px]">{STORY.promise}</p>
                <p className="relative mt-4 max-w-[720px] text-[15px] leading-[1.6] text-[#3e3e3e]">{STORY.problem}</p>
              </div>

              <div className="px-6 sm:px-10">
                <p className="text-[11px] font-bold uppercase tracking-[0.08em] text-[#8a84a0]">The cast</p>
                <div className="mt-3 grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                  {STORY.cast.map((c) => (
                    <div key={c.name} className="flex gap-3 rounded-[16px] bg-[#f8f7fc] p-3.5">
                      <span
                        className={cn('serif flex size-10 shrink-0 items-center justify-center rounded-full text-[20px]', c.tone === 'violet' ? 'bg-[#f0ecff] text-violet' : 'bg-[#ffe1ed] text-pink')}
                      >
                        {c.letter}
                      </span>
                      <div>
                        <p className="text-[15px] font-semibold text-black">
                          {c.name} <span className="ml-1 text-[12px] font-medium text-[#8a84a0]">{c.role}</span>
                        </p>
                        <p className="mt-0.5 text-[13px] leading-[1.45] text-[#5c5670]">{c.line}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <p className="mt-7 text-[11px] font-bold uppercase tracking-[0.08em] text-[#8a84a0]">One move each. Everything else is optional</p>
                <div className="mt-3 grid grid-cols-1 gap-2.5 sm:grid-cols-3">
                  {STORY.moves.map((m) => (
                    <button
                      key={m.title}
                      type="button"
                      onClick={() => start(m.start, m.flow)}
                      className="group flex flex-col rounded-[18px] border border-[#ebe8f3] p-4 text-left transition-all hover:-translate-y-0.5 hover:border-[#d7cdff] hover:shadow-[0_12px_30px_-16px_rgba(90,57,227,0.45)]"
                    >
                      <span className="text-[11px] font-semibold uppercase tracking-[0.06em] text-[#8a84a0]">{m.who}</span>
                      <span className="serif mt-1 text-[24px] leading-[1.1] text-violet">{m.title}</span>
                      <span className="mt-2 text-[13px] leading-[1.45] text-[#3e3e3e]">{m.line}</span>
                      <span className="mt-2 text-[12px] text-[#8a84a0]">{m.also}</span>
                      <span className="mt-3 inline-flex items-center gap-1 text-[13px] font-semibold text-violet">
                        Play it <ArrowRight size={14} weight="bold" className="transition-transform group-hover:translate-x-0.5" />
                      </span>
                    </button>
                  ))}
                </div>

                <p className="mt-7 text-[11px] font-bold uppercase tracking-[0.08em] text-[#8a84a0]">The story, 2 → 25 Nov</p>
                <ol className="mt-3 grid grid-cols-1 gap-x-4 gap-y-2 sm:grid-cols-2">
                  {STORY.timeline.map((t, i) => (
                    <li key={t.when}>
                      <button type="button" onClick={() => start(t.go)} className="flex w-full gap-3 rounded-[12px] p-2 text-left hover:bg-[#f8f7fc]">
                        <span className={cn('mt-1.5 size-2.5 shrink-0 rounded-full', i < 4 ? 'bg-pink' : 'bg-violet')} />
                        <span>
                          <span className="block text-[12px] font-semibold text-[#8a84a0]">
                            {t.when} · {t.frames}
                          </span>
                          <span className="block text-[13.5px] leading-[1.4] text-[#1d1830]">{t.what}</span>
                        </span>
                      </button>
                    </li>
                  ))}
                </ol>

                <p className="mt-7 text-[11px] font-bold uppercase tracking-[0.08em] text-[#8a84a0]">What we’re betting on, and how we’d know</p>
                <div className="mt-3 grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                  {STORY.bets.map((b, i) => (
                    <div key={b.title} className="rounded-[16px] bg-[#f8f7fc] p-4">
                      <p className="text-[11px] font-semibold text-[#8a84a0]">Bet {i + 1}</p>
                      <p className="mt-1 text-[15px] font-semibold leading-[1.3] text-black">{b.title}</p>
                      <p className="mt-1.5 text-[12.5px] leading-[1.45] text-[#5c5670]">{b.know}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="sticky bottom-0 mt-8 flex flex-col gap-2 border-t border-[#efecf6] bg-white/90 px-6 py-4 backdrop-blur sm:flex-row sm:items-center sm:px-10">
                <p className="flex-1 text-[12.5px] text-[#8a84a0]">Tap anything in the phone. The flows on the left follow the Figma rows and jump to any screen, and annotations show why each element exists.</p>
                <button type="button" onClick={() => start(FLOWS[0].frames[0], FLOWS[0].id)} className="inline-flex h-11 items-center justify-center gap-2 rounded-full bg-violet px-5 text-[15px] font-semibold text-white shadow-[0_10px_24px_-10px_rgba(90,57,227,0.8)] hover:bg-[#4f30d6]">
                  Start the prototype <ArrowRight size={16} weight="bold" />
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
