import type { ReactNode } from 'react'
import { motion } from 'motion/react'
import { haptic } from '@/proto/haptics'
import { cn } from './cn'

/**
 * Chip (A3, A8, B2…): px 14, py 10, radius 100, text 14.
 *   off: white, 1px #E0E0E0, Medium, black
 *   on:  #F0ECFF, 1px #5A39E3, Semibold, #5A39E3
 */
export function Chip({
  selected,
  onClick,
  children,
  className,
  'data-anno': anno,
}: {
  selected?: boolean
  onClick?: () => void
  children: ReactNode
  className?: string
  'data-anno'?: string
}) {
  return (
    <motion.button
      type="button"
      data-anno={anno}
      aria-pressed={!!selected}
      onClick={onClick}
      whileTap={onClick ? { scale: 0.95 } : undefined}
      transition={{ type: 'spring', stiffness: 600, damping: 30 }}
      className={cn(
        'inline-flex shrink-0 items-center whitespace-nowrap rounded-full border px-[14px] py-[10px] text-[14px] leading-[normal] transition-colors duration-200',
        !onClick && 'pointer-events-none',
        selected ? 'border-violet bg-violet-tint font-semibold text-violet' : 'border-line-2 bg-white font-medium text-black',
        className,
      )}
    >
      {children}
    </motion.button>
  )
}

/**
 * iOS 27 switch as drawn in Figma (“Toggle - Switch”): 64×28 pill,
 * 38×24 white knob, on = #5A39E3.
 */
export function Toggle({
  checked,
  onChange,
  label,
  className,
}: {
  checked: boolean
  onChange: (v: boolean) => void
  label: string
  className?: string
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => {
        haptic()
        onChange(!checked)
      }}
      className={cn(
        'relative h-7 w-16 shrink-0 rounded-full p-[2px] transition-colors duration-300',
        checked ? 'bg-violet' : 'bg-[#e9e9ea]',
        className,
      )}
    >
      <motion.span
        className="block h-6 w-[38px] rounded-full bg-white shadow-[0_2px_6px_rgba(0,0,0,0.12),0_0_0_0.5px_rgba(0,0,0,0.04)]"
        animate={{ x: checked ? 22 : 0 }}
        whileTap={{ scaleX: 1.12 }}
        transition={{ type: 'spring', stiffness: 520, damping: 34 }}
      />
    </button>
  )
}

/** Grouped list container used for toggles and settings rows (white, #F0F0F0 dividers). */
export function ListGroup({ children, className, 'data-anno': anno }: { children: ReactNode; className?: string; 'data-anno'?: string }) {
  return (
    <div data-anno={anno} className={cn('overflow-hidden rounded-[12px] border border-line-2 bg-white divide-y divide-line', className)}>
      {children}
    </div>
  )
}

/** Row with title, caption and a trailing Toggle. */
export function ToggleRow({
  title,
  caption,
  checked,
  onChange,
  className,
  'data-anno': anno,
}: {
  title: ReactNode
  caption?: ReactNode
  checked: boolean
  onChange: (v: boolean) => void
  className?: string
  'data-anno'?: string
}) {
  return (
    <div data-anno={anno} className={cn('flex items-center gap-3 px-[14px] py-3', className)}>
      <div className="min-w-0 flex-1">
        <p className="text-[14px] font-semibold leading-[normal] text-black">{title}</p>
        {caption && <p className="mt-1 text-[12px] leading-[normal] text-muted">{caption}</p>}
      </div>
      <Toggle checked={checked} onChange={onChange} label={typeof title === 'string' ? title : typeof caption === 'string' ? caption : 'Setting'} />
    </div>
  )
}

/** Field row (A3 date / size): #FAFAFA, 1px #F0F0F0, radius 12, p 12/14/12/12, gap 10. */
export function FieldRow({
  icon,
  children,
  action,
  onAction,
  className,
  'data-anno': anno,
}: {
  icon?: ReactNode
  children: ReactNode
  action?: string
  onAction?: () => void
  className?: string
  'data-anno'?: string
}) {
  return (
    <div
      data-anno={anno}
      className={cn('flex min-h-[46px] items-center gap-[10px] rounded-[12px] border border-line bg-field py-3 pl-3 pr-[14px]', className)}
    >
      {icon && <span className="flex size-5 shrink-0 items-center justify-center">{icon}</span>}
      <div className="min-w-0 flex-1 text-[14px] font-medium leading-[normal] text-black">{children}</div>
      {action && (
        <button type="button" onClick={onAction} className={cn('shrink-0 text-[14px] font-semibold leading-[normal] text-violet', onAction ? 'active:opacity-60' : 'pointer-events-none')}>
          {action}
        </button>
      )}
    </div>
  )
}

/** Small bold section label (“Relationship”, “1 · Who knows her taste?”): Bold 12, #3E3E3E. */
export function SectionLabel({ children, right, className }: { children: ReactNode; right?: ReactNode; className?: string }) {
  return (
    <div className={cn('flex items-center justify-between gap-3', className)}>
      <p className="text-[12px] font-bold leading-[normal] text-ink-3">{children}</p>
      {right && <div className="text-[12px] leading-[normal] text-muted">{right}</div>}
    </div>
  )
}
