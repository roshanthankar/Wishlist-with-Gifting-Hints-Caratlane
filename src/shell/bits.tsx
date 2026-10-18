import type { ReactNode } from 'react'
import { motion } from 'motion/react'
import { FRAMES, type FrameId, type Persona } from '@/proto/frames'
import { cn } from '@/ui/cn'

/** Small shared pieces for the presentation shell (not part of the app UI). */

export const PERSONA_STYLE: Record<Persona, { bg: string; fg: string; letter: string }> = {
  Rahul: { bg: '#ffe1ed', fg: '#dd1564', letter: 'R' },
  Priya: { bg: '#f0ecff', fg: '#5a39e3', letter: 'P' },
  Ananya: { bg: '#ffe1ed', fg: '#dd1564', letter: 'A' },
  Mom: { bg: '#ffe1ed', fg: '#dd1564', letter: 'M' },
}

export function PersonaDot({ persona, size = 22 }: { persona: Persona; size?: number }) {
  const s = PERSONA_STYLE[persona]
  return (
    <span
      className="serif inline-flex shrink-0 items-center justify-center rounded-full"
      style={{ width: size, height: size, background: s.bg, color: s.fg, fontSize: size * 0.55 }}
    >
      {s.letter}
    </span>
  )
}

export function FrameCode({ id, active, className }: { id: FrameId; active?: boolean; className?: string }) {
  return (
    <span
      className={cn(
        'inline-flex h-[20px] min-w-[30px] items-center justify-center rounded-[6px] px-1.5 text-[11px] font-bold tabular-nums tracking-[0.02em]',
        active ? 'bg-violet text-white' : 'bg-[#efedf6] text-[#56506b]',
        className,
      )}
    >
      {id}
    </span>
  )
}

export function TagPill({ tag }: { tag?: string }) {
  if (!tag) return null
  const main = tag.startsWith('Main')
  return (
    <span
      className={cn(
        'inline-flex h-[20px] items-center rounded-full px-2 text-[10.5px] font-semibold uppercase tracking-[0.04em]',
        main ? 'bg-black text-white' : 'bg-[#efedf6] text-[#56506b]',
      )}
    >
      {tag}
    </span>
  )
}

export function Switch({ on, onChange, label }: { on: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      aria-label={label}
      onClick={() => onChange(!on)}
      className={cn('relative h-[26px] w-[44px] shrink-0 rounded-full p-[2px] transition-colors duration-300', on ? 'bg-violet' : 'bg-[#d9d6e4]')}
    >
      <motion.span
        className="block size-[22px] rounded-full bg-white shadow-[0_2px_6px_rgba(0,0,0,0.18)]"
        animate={{ x: on ? 18 : 0 }}
        transition={{ type: 'spring', stiffness: 600, damping: 34 }}
      />
    </button>
  )
}

export function Kbd({ children }: { children: ReactNode }) {
  return (
    <kbd className="inline-flex h-[20px] min-w-[20px] items-center justify-center rounded-[5px] border border-[#dcd8e8] bg-white px-1 font-sans text-[11px] font-semibold text-[#56506b] shadow-[0_1px_0_#dcd8e8]">
      {children}
    </kbd>
  )
}

export function personaLine(id: FrameId) {
  const m = FRAMES[id]
  const who = m.persona === 'Mom' ? 'Mom’s' : `${m.persona}’s`
  return `${who} phone · ${m.channel}`
}
