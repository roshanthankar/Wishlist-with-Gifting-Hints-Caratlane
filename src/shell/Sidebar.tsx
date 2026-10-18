import { AnimatePresence, motion } from 'motion/react'
import { ArrowCounterClockwise, BookOpenText, CaretDown } from '@phosphor-icons/react'
import { FLOWS, peopleIn } from '@/proto/flows'
import { FRAMES } from '@/proto/frames'
import { useNav } from '@/proto/nav'
import { useUi } from '@/proto/ui'
import { cn } from '@/ui/cn'
import { FrameCode, Kbd, PersonaDot, Switch, TagPill } from './bits'

/** Left rail: case-study title, annotation toggle and the Figma rows, each with its screens. */
export function Sidebar({ onAbout, onNavigate }: { onAbout: () => void; onNavigate?: () => void }) {
  const { flow, frame, jump, restart } = useNav()
  const { annotations, setAnnotations } = useUi()

  return (
    <div className="flex h-full flex-col">
      <div className="px-5 pb-4 pt-5">
        <div className="flex items-center gap-3">
          <div className="min-w-0">
            <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[#8a84a0]">CaratLane · Prototype</p>
            <h1 className="serif text-[19px] leading-[1.15] text-black">Wishlist with Gifting Hints</h1>
          </div>
        </div>
        <button
          type="button"
          onClick={onAbout}
          className="mt-4 flex w-full items-center gap-2 rounded-[12px] border border-[#ebe8f3] bg-[#faf9fd] px-3 py-2.5 text-left text-[13px] font-semibold text-[#2b2540] transition-colors hover:bg-[#f3f0fb]"
        >
          <BookOpenText size={18} className="text-violet" />
          About the case study
          <span className="ml-auto text-[12px] font-medium text-[#8a84a0]">2 min</span>
        </button>
        <div className="mt-3 flex items-center gap-3 rounded-[12px] border border-[#ebe8f3] px-3 py-2.5">
          <div className="min-w-0 flex-1">
            <p className="text-[13px] font-semibold text-[#2b2540]">Annotations</p>
            <p className="text-[11.5px] text-[#8a84a0]">Pins on every element · press <Kbd>N</Kbd></p>
          </div>
          <Switch on={annotations} onChange={setAnnotations} label="Annotations" />
        </div>
      </div>

      <div className="flex items-center justify-between px-5 pb-2 pt-1">
        <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[#8a84a0]">Flows</p>
        <button type="button" onClick={restart} className="flex items-center gap-1 rounded-full px-2 py-1 text-[12px] font-semibold text-[#6b6582] hover:bg-[#f3f0fb]">
          <ArrowCounterClockwise size={13} weight="bold" /> Restart
        </button>
      </div>

      <nav className="no-scrollbar min-h-0 flex-1 overflow-y-auto px-3 pb-6" aria-label="Prototype flows">
        {FLOWS.map((f) => {
          const open = f.id === flow.id
          return (
            <div key={f.id} className={cn('mb-1.5 rounded-[14px] transition-colors', open ? 'bg-[#f6f4fc]' : 'hover:bg-[#faf9fd]')}>
              <button
                type="button"
                onClick={() => {
                  jump(open && f.frames.includes(frame) ? frame : f.frames[0], f.id)
                  onNavigate?.()
                }}
                className="flex w-full items-start gap-2 px-3 py-2.5 text-left"
                aria-expanded={open}
              >
                <div className="min-w-0 flex-1">
                  <p className="text-[10.5px] font-bold uppercase tracking-[0.07em] text-violet">{f.kicker}</p>
                  <p className="mt-0.5 text-[14px] font-semibold leading-[1.25] text-[#1d1830]">{f.title}</p>
                </div>
                <span className="mt-0.5 flex shrink-0 gap-1" aria-label={peopleIn(f).join(', ')}>
                  {peopleIn(f).map((p) => (
                    <PersonaDot key={p} persona={p} size={18} />
                  ))}
                </span>
                <CaretDown size={14} className={cn('mt-1.5 shrink-0 text-[#8a84a0] transition-transform', open && 'rotate-180')} />
              </button>
              <AnimatePresence initial={false}>
                {open && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.28, ease: [0.32, 0.72, 0, 1] }}
                    className="overflow-hidden"
                  >
                    <p className="px-3 pb-2 text-[12px] leading-[1.45] text-[#6b6582]">{f.summary}</p>
                    <ol className="relative px-2 pb-2">
                      {f.frames.map((id, i) => {
                        const m = FRAMES[id]
                        const active = id === frame
                        return (
                          <li key={id} className="relative">
                            {i < f.frames.length - 1 && <span aria-hidden className="absolute left-[25px] top-[30px] h-[calc(100%-16px)] w-px bg-[#e2def0]" />}
                            <button
                              type="button"
                              onClick={() => {
                                jump(id, f.id)
                                onNavigate?.()
                              }}
                              aria-current={active ? 'step' : undefined}
                              className={cn(
                                'relative flex w-full items-center gap-2.5 rounded-[10px] px-2 py-[7px] text-left transition-colors',
                                active ? 'bg-white shadow-[0_1px_2px_rgba(30,20,70,0.08),0_0_0_1px_#e6e1f5]' : 'hover:bg-white/70',
                              )}
                            >
                              <FrameCode id={id} active={active} />
                              <span className={cn('min-w-0 flex-1 truncate text-[13px]', active ? 'font-semibold text-[#1d1830]' : 'font-medium text-[#4a4560]')}>{m.title}</span>
                              <PersonaDot persona={m.persona} size={18} />
                            </button>
                            {active && m.tag && (
                              <div className="pb-1 pl-[46px] pt-0.5">
                                <TagPill tag={m.tag} />
                              </div>
                            )}
                          </li>
                        )
                      })}
                    </ol>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )
        })}
      </nav>

      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 border-t border-[#efecf6] px-5 py-3 text-[11.5px] text-[#8a84a0]">
        <span className="inline-flex items-center gap-1">
          <Kbd>←</Kbd>
          <Kbd>→</Kbd> step
        </span>
        <span className="inline-flex items-center gap-1">
          <Kbd>N</Kbd> notes
        </span>
        <span className="inline-flex items-center gap-1">
          <Kbd>R</Kbd> restart
        </span>
        <span>Edge-swipe to go back</span>
      </div>
    </div>
  )
}
