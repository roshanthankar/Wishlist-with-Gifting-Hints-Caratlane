import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion, useDragControls, useMotionValue } from 'motion/react'
import { ArrowCounterClockwise, BookOpenText, CaretLeft, CaretRight, SquaresFour, X } from '@phosphor-icons/react'
import { FLOWS, peopleIn } from '@/proto/flows'
import { FRAMES } from '@/proto/frames'
import { useFlowStepper, useNav } from '@/proto/nav'
import { useUi } from '@/proto/ui'
import { annotationsFor } from '@/proto/annotations'
import { cn } from '@/ui/cn'
import { FrameCode, PersonaDot, Switch, TagPill, personaLine } from './bits'

/**
 * On real phones the prototype fills the screen, so the shell collapses into
 * a small draggable button (like iOS AssistiveTouch) that opens a menu with
 * flows, the current screen’s notes and the annotation toggle.
 */
export function MobileMenu({ onAbout }: { onAbout: () => void }) {
  const [open, setOpen] = useState(false)
  const [hint, setHint] = useState(() => localStorage.getItem('cl-proto.fab-hint') !== '1')
  const [side, setSide] = useState<'left' | 'right'>('right')
  const [y, setY] = useState(() => Math.round(window.innerHeight * 0.42))
  const dragged = useRef(false)
  const dx = useMotionValue(0)
  const dy = useMotionValue(0)

  useEffect(() => {
    if (!hint) return
    const t = setTimeout(() => {
      setHint(false)
      localStorage.setItem('cl-proto.fab-hint', '1')
    }, 5200)
    return () => clearTimeout(t)
  }, [hint])

  return (
    <>
      <motion.button
        type="button"
        aria-label="Prototype menu"
        className={cn(
          'fixed z-[150] flex size-10 touch-none items-center justify-center rounded-full bg-[#1d1640]/55 text-white opacity-80 shadow-[0_6px_18px_rgba(20,10,60,0.3)] ring-1 ring-white/25 backdrop-blur-md transition-opacity active:opacity-100',
        )}
        style={{ top: y, [side]: 6, x: dx, y: dy }}
        drag
        dragMomentum={false}
        onDragStart={() => (dragged.current = true)}
        onDragEnd={(_, info) => {
          setSide(info.point.x < window.innerWidth / 2 ? 'left' : 'right')
          setY(Math.min(Math.max(info.point.y - 22, 60), window.innerHeight - 120))
          dx.set(0)
          dy.set(0)
          setTimeout(() => (dragged.current = false), 0)
        }}
        onClick={() => {
          if (dragged.current) return
          setHint(false)
          localStorage.setItem('cl-proto.fab-hint', '1')
          setOpen(true)
        }}
        whileTap={{ scale: 0.9 }}
      >
        <SquaresFour size={18} weight="fill" />
      </motion.button>

      <AnimatePresence>
        {hint && !open && (
          <motion.div
            className="fixed z-[149] max-w-[220px] rounded-[14px] bg-[#1d1640]/92 px-3 py-2 text-[12.5px] leading-[1.35] text-white shadow-lg"
            style={{ top: y - 2, [side]: 58 }}
            initial={{ opacity: 0, x: side === 'right' ? 8 : -8 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0 }}
          >
            Prototype menu: flows, notes and annotations. Drag me anywhere.
          </motion.div>
        )}
      </AnimatePresence>

      <MenuSheet open={open} onClose={() => setOpen(false)} onAbout={onAbout} />
    </>
  )
}

function MenuSheet({ open, onClose, onAbout }: { open: boolean; onClose: () => void; onAbout: () => void }) {
  const { frame, flow, jump, restart } = useNav()
  const { annotations, setAnnotations } = useUi()
  const { prev, next, index, total } = useFlowStepper()
  const drag = useDragControls()
  const m = FRAMES[frame]
  const notes = annotationsFor(frame)
  const [tab, setTab] = useState<'screen' | 'flows'>('flows')

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[160]" role="dialog" aria-modal="true" aria-label="Prototype menu">
          <motion.div className="absolute inset-0 bg-black/40" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} />
          <motion.div
            className="absolute inset-x-0 bottom-0 flex max-h-[86dvh] flex-col rounded-t-[26px] bg-white pb-[max(12px,env(safe-area-inset-bottom))]"
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', stiffness: 380, damping: 38 }}
            drag="y"
            dragListener={false}
            dragControls={drag}
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={{ top: 0, bottom: 0.6 }}
            onDragEnd={(_, i) => (i.offset.y > 90 || i.velocity.y > 600) && onClose()}
          >
            <div className="touch-none px-5 pb-2 pt-2" onPointerDown={(e) => drag.start(e)}>
              <div className="mx-auto h-[5px] w-9 rounded-full bg-black/15" />
              <div className="mt-3 flex items-center gap-2">
                <FrameCode id={frame} active />
                <p className="min-w-0 flex-1 truncate text-[15px] font-semibold">{m.title}</p>
                <button type="button" aria-label="Close" onClick={onClose} className="flex size-8 items-center justify-center rounded-full bg-black/5">
                  <X size={14} weight="bold" />
                </button>
              </div>
              <div className="mt-3 grid grid-cols-2 rounded-[12px] bg-[#f3f1f8] p-1 text-[13px] font-semibold">
                {(['flows', 'screen'] as const).map((t) => (
                  <button key={t} type="button" onClick={() => setTab(t)} className={cn('rounded-[9px] py-1.5 transition-colors', tab === t ? 'bg-white shadow-sm' : 'text-[#6b6582]')}>
                    {t === 'screen' ? 'This screen' : 'All flows'}
                  </button>
                ))}
              </div>
            </div>

            <div className="no-scrollbar min-h-0 flex-1 overflow-y-auto px-5 pb-3">
              {tab === 'screen' ? (
                <>
                  <div className="flex items-center gap-2 text-[12.5px] text-[#6b6582]">
                    <PersonaDot persona={m.persona} size={20} /> {personaLine(frame)}
                    <TagPill tag={m.tag} />
                  </div>
                  <p className="mt-3 rounded-[14px] bg-[#f6f4fc] p-3.5 text-[14px] leading-[1.5] text-[#2b2540]">{m.note}</p>
                  <div className="mt-4 flex items-center gap-3">
                    <div className="flex-1">
                      <p className="text-[14px] font-semibold">Annotations</p>
                      <p className="text-[12px] text-[#8a84a0]">Numbered pins on the screen; tap one to read it</p>
                    </div>
                    <Switch on={annotations} onChange={setAnnotations} label="Annotations" />
                  </div>
                  <ol className="mt-3 space-y-2">
                    {notes.map((a, i) => (
                      <li key={a.id} className="flex gap-2.5">
                        <span className={cn('mt-[1px] flex size-5 shrink-0 items-center justify-center rounded-full text-[10.5px] font-bold', annotations ? 'bg-violet text-white' : 'bg-[#efedf6] text-[#6b6582]')}>{i + 1}</span>
                        <span className="text-[13px] leading-[1.4]">
                          <span className="font-semibold">{a.title}.</span> <span className="text-[#2b2540]">{a.body}</span>
                        </span>
                      </li>
                    ))}
                  </ol>
                </>
              ) : (
                <div className="space-y-3">
                  {FLOWS.map((f) => (
                    <div key={f.id}>
                      <div className="flex items-start gap-2">
                        <div className="min-w-0 flex-1">
                          <p className="text-[10.5px] font-bold uppercase tracking-[0.07em] text-violet">{f.kicker}</p>
                          <p className="text-[14px] font-semibold">{f.title}</p>
                        </div>
                        <span className="mt-0.5 flex shrink-0 gap-1">
                          {peopleIn(f).map((p) => (
                            <PersonaDot key={p} persona={p} size={18} />
                          ))}
                        </span>
                      </div>
                      <div className="mt-1.5 flex flex-wrap gap-1.5">
                        {f.frames.map((id) => (
                          <button
                            key={id}
                            type="button"
                            onClick={() => {
                              jump(id, f.id)
                              onClose()
                            }}
                            className={cn(
                              'rounded-full px-2.5 py-1 text-[12px] font-semibold',
                              id === frame && f.id === flow.id ? 'bg-violet text-white' : 'bg-[#f3f1f8] text-[#3e3a52]',
                            )}
                          >
                            {id} · {FRAMES[id].title}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex items-center gap-2 border-t border-[#efecf6] px-5 pt-3">
              <button type="button" onClick={() => { prev?.(); onClose() }} disabled={!prev} className="flex size-11 items-center justify-center rounded-full bg-[#f3f1f8] disabled:opacity-35" aria-label="Previous step">
                <CaretLeft size={16} weight="bold" />
              </button>
              <div className="min-w-0 flex-1 text-center">
                <p className="truncate text-[12.5px] font-semibold">{flow.title}</p>
                <p className="text-[11.5px] text-[#8a84a0]">Step {Math.max(index + 1, 1)} of {total}</p>
              </div>
              <button type="button" onClick={() => { next?.(); onClose() }} disabled={!next} className="flex size-11 items-center justify-center rounded-full bg-violet text-white disabled:opacity-35" aria-label="Next step">
                <CaretRight size={16} weight="bold" />
              </button>
            </div>
            <div className="flex gap-2 px-5 pt-2">
              <button type="button" onClick={() => { restart(); onClose() }} className="flex h-10 flex-1 items-center justify-center gap-1.5 rounded-full bg-[#f3f1f8] text-[13px] font-semibold">
                <ArrowCounterClockwise size={14} weight="bold" /> Restart
              </button>
              <button type="button" onClick={() => { onClose(); onAbout() }} className="flex h-10 flex-1 items-center justify-center gap-1.5 rounded-full bg-[#f3f1f8] text-[13px] font-semibold">
                <BookOpenText size={15} /> The case study
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
