import { useLayoutEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { ChatCircleText, PencilSimple } from '@phosphor-icons/react'
import { SelectTile, cn } from '@/ui'
import type { ProductId } from '@/data/products'

/**
 * Pieces shared by Priya’s hint screens (B0, B2, B4–B6). They live here, next
 * to the compose sheet, and the dates / hint-status routes import them.
 */

/* ───────────────────────── Text + rows ───────────────────────── */

/**
 * Swap a short line of text with a soft cross-fade (captions, step labels).
 * Flex column so a child’s margins never collapse into the parent’s.
 */
export function FadeText({ text, className, style }: { text: string; className?: string; style?: CSSProperties }) {
  return (
    <span className="relative flex flex-col">
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.span
          key={text}
          className={cn('block', className)}
          style={style}
          initial={{ opacity: 0, y: 3 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -3 }}
          transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
        >
          {text}
        </motion.span>
      </AnimatePresence>
    </span>
  )
}

/**
 * Row caption for the shared ToggleRow: a 12px box like Figma on one line,
 * 15px line spacing if a narrow phone wraps it, and a cross-fade when it
 * changes (“Nudges off”).
 */
export function RowCaption({ text }: { text: string }) {
  return <FadeText text={text} className="-my-[1.5px] text-[12px] leading-[15px] text-muted" />
}

/** Grouped-list row without a switch (B5 “Good to know”): same anatomy as ToggleRow. */
export function InfoRow({ title, caption, 'data-anno': anno }: { title: string; caption: string; 'data-anno'?: string }) {
  return (
    <div data-anno={anno} className="flex items-center gap-3 px-[14px] py-3">
      <div className="min-w-0 flex-1">
        <p className="text-[14px] font-semibold leading-[normal] text-black">{title}</p>
        <p className="mt-1 text-[12px] leading-[normal] text-muted">{caption}</p>
      </div>
    </div>
  )
}

/* ───────────────────────── Note badge (DS 834:79266) ───────────────────────── */

/**
 * Note badge: pl 6 pr 8 py 4, gap 4, white 94%, radius 100, shadow 0 1 4 /12%.
 * “Note” = violet ChatCircleText 12 + black label; “Add note” = grey
 * PencilSimple 12 + #3E3E3E label.
 */
export function NoteBadge({ type, onClick, className }: { type: 'note' | 'add'; onClick?: () => void; className?: string }) {
  const note = type === 'note'
  return (
    <motion.button
      type="button"
      onClick={onClick}
      whileTap={{ scale: 0.92 }}
      transition={{ type: 'spring', stiffness: 600, damping: 30 }}
      aria-label={note ? 'Read your note' : 'Add a note'}
      className={cn(
        'glass-chip flex h-5 items-center gap-1 overflow-hidden rounded-full pl-[6px] pr-2 [--glass-float:0_1px_4px_rgba(0,0,0,0.12)] [--glass-tint:rgba(255,255,255,0.82)]',
        className,
      )}
    >
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.span
          key={type}
          className="flex items-center gap-1"
          initial={{ opacity: 0, scale: 0.7 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.7 }}
          transition={{ type: 'spring', stiffness: 700, damping: 26 }}
        >
          {note ? <ChatCircleText size={12} color="#5a39e3" /> : <PencilSimple size={12} color="#767676" />}
          <span className={cn('whitespace-nowrap text-[12px] font-semibold leading-[normal]', note ? 'text-black' : 'text-ink-3')}>
            {note ? 'Note' : 'Add note'}
          </span>
        </motion.span>
      </AnimatePresence>
    </motion.button>
  )
}

/* ───────────────────────── Pick tile ───────────────────────── */

/**
 * “Pick · …” (B2, B5): the shared SelectTile, with Figma’s unselected look
 * (2px #E4E4E7 border, white 90% ring with a #BDBDC4 stroke) and an optional
 * note badge 10px from the bottom-left. A note belongs to a pick, so the
 * badge leaves when the pick is cleared.
 */
export function PickTile({
  id,
  selected,
  onToggle,
  badge,
  onBadge,
  'data-anno': anno,
}: {
  id: ProductId
  selected: boolean
  onToggle: () => void
  badge?: 'note' | 'add'
  onBadge?: () => void
  'data-anno'?: string
}) {
  return (
    <div className="relative min-w-0" data-anno={anno}>
      <SelectTile id={id} selected={selected} onToggle={onToggle} className="block">
        <AnimatePresence initial={false}>
          {!selected && (
            <motion.span
              key="off"
              aria-hidden
              className="pointer-events-none absolute inset-0"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.18 }}
            >
              <span className="absolute inset-0 rounded-[12px] border-2 border-[#e4e4e7]" />
              <span className="absolute right-[10px] top-[10px] size-[22px] rounded-full border-[1.5px] border-[#bdbdc4] bg-white/90" />
            </motion.span>
          )}
        </AnimatePresence>
      </SelectTile>
      <AnimatePresence initial={false}>
        {badge && selected && (
          <motion.div
            key="badge"
            className="absolute bottom-[10px] left-[10px] z-[1]"
            initial={{ opacity: 0, y: 4, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 4, scale: 0.9 }}
            transition={{ type: 'spring', stiffness: 520, damping: 30 }}
          >
            <NoteBadge type={badge} onClick={onBadge} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

/* ───────────────────────── Height morph ───────────────────────── */

/**
 * Animates its own height to fit its content, so one sheet can morph between
 * steps (B2 → B3) instead of closing and reopening.
 */
export function MorphHeight({ children, className }: { children: ReactNode; className?: string }) {
  const inner = useRef<HTMLDivElement>(null)
  const [h, setH] = useState<number | 'auto'>('auto')
  useLayoutEffect(() => {
    const el = inner.current
    if (!el) return
    const ro = new ResizeObserver(() => setH(el.offsetHeight))
    ro.observe(el)
    setH(el.offsetHeight)
    return () => ro.disconnect()
  }, [])
  return (
    <motion.div
      className={cn('relative', className)}
      initial={false}
      animate={{ height: h }}
      transition={{ type: 'spring', stiffness: 360, damping: 38, mass: 0.9 }}
    >
      <div ref={inner} className="relative">
        {children}
      </div>
    </motion.div>
  )
}
