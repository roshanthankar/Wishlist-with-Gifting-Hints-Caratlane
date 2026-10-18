import type { ComponentProps, ReactNode } from 'react'
import { motion } from 'motion/react'
import { cn } from './cn'

/**
 * “Button - Liquid Glass - Text” from the iOS 27 kit as used in Figma.
 *   lg  52px (screen CTAs)   md 50px (sheet CTAs)   sm 36px   xs 32px
 * Labels: Proxima Nova Semibold 17/18 (lg, md) or 14 (sm, xs).
 */
export type ButtonVariant = 'primary' | 'secondary' | 'whatsapp' | 'pink' | 'white' | 'outline' | 'outline-pink'
export type ButtonSize = 'lg' | 'md' | 'sm' | 'xs'

const VARIANT: Record<ButtonVariant, string> = {
  primary: 'bg-violet text-white glass-tint',
  secondary: 'bg-glass glass-rim text-ink-2',
  whatsapp: 'bg-whatsapp text-white glass-tint',
  pink: 'bg-pink text-white glass-tint',
  white: 'glass text-ink',
  outline: 'bg-white text-violet border border-violet',
  'outline-pink': 'bg-white text-pink border border-pink',
}

const SIZE: Record<ButtonSize, string> = {
  lg: 'h-[52px] px-5 text-[17px] leading-[18px] gap-2',
  md: 'h-[50px] px-5 text-[17px] leading-[18px] gap-2',
  sm: 'h-[36px] px-[14px] text-[14px] leading-none gap-1.5',
  xs: 'h-[32px] px-[14px] text-[14px] leading-none gap-1.5',
}

type MotionButtonProps = ComponentProps<typeof motion.button>

export interface ButtonProps extends Omit<MotionButtonProps, 'children'> {
  variant?: ButtonVariant
  size?: ButtonSize
  /** Stretch: `true` = full width, `'flex'` = share the row equally. */
  block?: boolean | 'flex'
  icon?: ReactNode
  /** Label weight: Rahul’s app screens (A1) use Semibold; most sheets and all of Priya’s screens use Medium. */
  weight?: 'semibold' | 'medium'
  children?: ReactNode
}

export function Button({ variant = 'primary', size = 'lg', block, icon, weight = 'semibold', className, children, disabled, onClick, ...rest }: ButtonProps) {
  // No action → no tap, hover or pointer (dead ends are not tappable in this prototype)
  const inert = !onClick && rest.type !== 'submit'
  return (
    <motion.button
      type="button"
      onClick={onClick}
      whileTap={disabled || inert ? undefined : { scale: 0.97 }}
      transition={{ type: 'spring', stiffness: 520, damping: 32 }}
      disabled={disabled}
      className={cn(
        'pn-button-text relative inline-flex shrink-0 select-none items-center justify-center whitespace-nowrap rounded-full',
        weight === 'medium' ? 'font-medium' : 'font-semibold',
        'transition-[filter,opacity,background-color] duration-200',
        inert ? 'pointer-events-none' : 'hover:brightness-[1.04] active:brightness-95',
        'disabled:cursor-not-allowed disabled:opacity-40',
        VARIANT[variant],
        SIZE[size],
        block === true && 'w-full',
        block === 'flex' && 'min-w-0 flex-1',
        className,
      )}
      {...rest}
    >
      {icon}
      {children}
    </motion.button>
  )
}

/**
 * Round glass icon button (“Button Group” / “Glass · …” in Figma): 36, 44 or 48.
 * tone: light glass on light backgrounds, flat #F1F1F1 on white, dark on B3b.
 */
export function GlassCircle({
  size = 44,
  tone = 'light',
  label,
  className,
  children,
  style,
  onClick,
  ...rest
}: Omit<MotionButtonProps, 'children'> & {
  size?: number
  tone?: 'light' | 'flat' | 'dark' | 'white'
  label: string
  children: ReactNode
}) {
  return (
    <motion.button
      type="button"
      aria-label={label}
      onClick={onClick}
      // Glass lifts and swells into a clear lens while held (iOS 26), flat buttons press in.
      whileTap={onClick ? { scale: tone === 'light' || tone === 'dark' ? 1.14 : 0.92 } : undefined}
      transition={{ type: 'spring', stiffness: 520, damping: 22 }}
      className={cn(
        'relative inline-flex shrink-0 items-center justify-center rounded-full',
        !onClick && 'pointer-events-none',
        tone === 'light' && 'glass',
        tone === 'flat' && 'bg-glass glass-rim',
        tone === 'dark' && 'glass-dark text-white',
        tone === 'white' && 'glass-chip [--glass-float:0_2px_6px_rgba(0,0,0,0.12)] [--glass-tint:rgba(255,255,255,0.8)]',
        className,
      )}
      style={{ width: size, height: size, ...style }}
      {...rest}
    >
      {children}
    </motion.button>
  )
}

/** Any tappable surface (cards, rows) with a subtle iOS press. */
export function Tap({ className, children, scale = 0.98, onClick, ...rest }: MotionButtonProps & { scale?: number }) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      whileTap={onClick ? { scale } : undefined}
      transition={{ type: 'spring', stiffness: 520, damping: 34 }}
      className={cn('block text-left', !onClick && 'pointer-events-none', className)}
      {...rest}
    >
      {children}
    </motion.button>
  )
}
