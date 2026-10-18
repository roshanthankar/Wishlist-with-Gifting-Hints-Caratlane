import type { ReactNode } from 'react'
import { ArrowLeft } from '@phosphor-icons/react'
import { motion } from 'motion/react'
import { cn } from './cn'

/**
 * “Nav bar” from Figma: 56px tall, padding 16, gap 14, ArrowLeft 24,
 * title Proxima Nova Semibold 16 black, trailing icons 24 with gap 16.
 * Sticky under the status bar by default, like a native navigation bar.
 */
export function NavBar({
  title,
  onBack,
  right,
  bg = '#ffffff',
  sticky = true,
  className,
  titleClassName,
  backLabel = 'Back',
  'data-anno': anno,
}: {
  title?: ReactNode
  /** `null` keeps the arrow but makes it inert (no history to go back to). */
  onBack?: (() => void) | null
  right?: ReactNode
  /** Background; pass 'transparent' over auras. */
  bg?: string
  sticky?: boolean
  className?: string
  titleClassName?: string
  backLabel?: string
  'data-anno'?: string
}) {
  return (
    <div
      data-anno={anno}
      className={cn('z-20 flex h-14 items-center gap-[14px] p-4', sticky && 'sticky', className)}
      style={{ background: bg, top: sticky ? 'var(--safe-top)' : undefined }}
    >
      {onBack !== undefined && <BackButton onClick={onBack ?? undefined} label={backLabel} />}
      {title !== undefined && (
        <p className={cn('min-w-0 flex-1 truncate text-[16px] font-semibold leading-[normal] text-black', titleClassName)}>{title}</p>
      )}
      {right && <div className="ml-auto flex shrink-0 items-center gap-4">{right}</div>}
    </div>
  )
}

/** 24px ArrowLeft with a 44px hit area. */
export function BackButton({ onClick, label = 'Back', color = '#000' }: { onClick?: () => void; label?: string; color?: string }) {
  return (
    <motion.button
      type="button"
      aria-label={label}
      onClick={onClick}
      whileTap={onClick ? { scale: 0.88, x: -2 } : undefined}
      className={cn('relative -m-[10px] flex size-[44px] shrink-0 items-center justify-center rounded-full', !onClick && 'pointer-events-none')}
    >
      <ArrowLeft size={24} color={color} />
    </motion.button>
  )
}

/** 24px trailing nav icon with a 44px hit area. */
export function NavIcon({ label, onClick, children }: { label: string; onClick?: () => void; children: ReactNode }) {
  return (
    <motion.button
      type="button"
      aria-label={label}
      onClick={onClick}
      whileTap={onClick ? { scale: 0.88 } : undefined}
      className={cn('relative -m-[10px] flex size-[44px] items-center justify-center rounded-full', !onClick && 'pointer-events-none')}
    >
      {children}
    </motion.button>
  )
}
