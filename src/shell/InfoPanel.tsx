import { useEffect } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { FRAMES } from '@/proto/frames'
import { useNav } from '@/proto/nav'
import { useUi } from '@/proto/ui'
import { annotationsFor, revealAnnotation } from '@/proto/annotations'
import { STORY } from '@/data/story'
import { cn } from '@/ui/cn'
import { FrameCode, PersonaDot, TagPill, personaLine } from './bits'

/** Right rail: why this screen exists (Figma note) + numbered annotations. */
export function InfoPanel() {
  const { frame } = useNav()
  const { annotations, activeAnno, setActiveAnno } = useUi()
  const m = FRAMES[frame]
  const list = annotationsFor(frame)

  // Tapping a pin on the phone brings its note into view here.
  useEffect(() => {
    if (!activeAnno) return
    document.querySelector(`[data-anno-item="${CSS.escape(activeAnno)}"]`)?.scrollIntoView({ block: 'nearest', behavior: 'smooth' })
  }, [activeAnno])

  return (
    <div className="flex h-full flex-col">
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={frame}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.22, ease: [0.32, 0.72, 0, 1] }}
          className="no-scrollbar min-h-0 flex-1 overflow-y-auto px-5 pb-6 pt-5"
        >
          <div className="flex flex-wrap items-center gap-1.5">
            <FrameCode id={frame} active />
            <TagPill tag={m.tag} />
          </div>
          <h2 className="serif mt-3 text-[26px] leading-[1.12] text-black">{m.title}</h2>
          <div className="mt-2 flex items-center gap-2 text-[12.5px] font-medium text-[#6b6582]">
            <PersonaDot persona={m.persona} size={20} />
            <span>{personaLine(frame)}</span>
          </div>
          {m.when && <p className="mt-1 pl-7 text-[12px] text-[#8a84a0]">{m.when}</p>}

          <div className="mt-5 rounded-[14px] bg-[#f6f4fc] p-4">
            <p className="text-[10.5px] font-bold uppercase tracking-[0.08em] text-violet">Why this screen</p>
            <p className="mt-1.5 text-[14px] leading-[1.5] text-[#2b2540]">{m.note}</p>
          </div>

          <ol className="mt-5 space-y-1.5">
            {list.map((a, i) => {
              const on = annotations && activeAnno === a.id
              return (
                <li key={a.id}>
                  <button
                    type="button"
                    data-anno-item={a.id}
                    onClick={() => {
                      setActiveAnno(a.id)
                      revealAnnotation(document.querySelector('[data-phone-screen]'), a.id)
                    }}
                    className={cn(
                      'flex w-full gap-3 rounded-[12px] p-2.5 text-left transition-colors',
                      on && 'bg-[#f0ecff] shadow-[inset_0_0_0_1px_#d7cdff]',
                    )}
                  >
                    <span
                      className={cn(
                        'mt-[1px] flex size-[22px] shrink-0 items-center justify-center rounded-full text-[11px] font-bold transition-colors',
                        annotations ? 'bg-violet text-white' : 'bg-[#efedf6] text-[#6b6582]',
                      )}
                    >
                      {i + 1}
                    </span>
                    <span className="min-w-0">
                      <span className="block text-[13.5px] font-semibold leading-[1.3] text-[#1d1830]">{a.title}</span>
                      <span className="mt-0.5 block text-[12.5px] leading-[1.45] text-[#2b2540]">{a.body}</span>
                    </span>
                  </button>
                </li>
              )
            })}
            {list.length === 0 && <li className="text-[12.5px] text-[#8a84a0]">No annotations for this state yet.</li>}
          </ol>

          <div className="mt-7 border-t border-[#efecf6] pt-4">
            <p className="text-[10.5px] font-bold uppercase tracking-[0.08em] text-[#8a84a0]">How to read the colours</p>
            <ul className="mt-2.5 space-y-2">
              {STORY.colours.map((c) => (
                <li key={c.name} className="flex gap-2.5">
                  <span className="mt-[3px] size-3 shrink-0 rounded-full" style={{ background: c.swatch }} />
                  <span className="text-[12px] leading-[1.45] text-[#6b6582]">
                    <span className="font-semibold text-[#2b2540]">{c.name}.</span> {c.line}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  )
}
