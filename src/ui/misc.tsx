import type { CSSProperties, ReactNode } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { CalendarBlank } from '@phosphor-icons/react'
import { PRODUCTS, type ProductId } from '@/data/products'
import { ProductPhoto } from './ProductPhoto'
import { cn } from './cn'

/**
 * Occasion pill (834:79334): pl 10 pr 12 py 6, radius 100, CalendarBlank 16,
 * Semibold 14. Violet on Priya’s side, pink on Rahul’s.
 */
export function OccasionPill({
  side = 'priya',
  children = 'Anniversary · Tue 25 Nov · 13 days to go',
  className,
  'data-anno': anno,
}: {
  side?: 'priya' | 'rahul'
  children?: ReactNode
  className?: string
  'data-anno'?: string
}) {
  const rahul = side === 'rahul'
  return (
    <div
      data-anno={anno}
      className={cn(
        'inline-flex items-center gap-[6px] rounded-full py-[6px] pl-[10px] pr-3',
        rahul ? 'bg-pink-tint text-pink' : 'bg-violet-tint text-violet',
        className,
      )}
    >
      <CalendarBlank size={16} />
      <span className="whitespace-nowrap text-[14px] font-semibold leading-[normal]">{children}</span>
    </div>
  )
}

/** Lucide “lock” (Figma uses lu/lock in footnotes). */
export function LuLock({ size = 14, color = '#6b6b6b' }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  )
}

/**
 * Privacy footnote (834:79341): lock 14 + Medium 12 #767676, gap 6, centred.
 * Says exactly what is shared; never promises what a link can’t keep.
 */
export function PrivacyFootnote({ children, className, 'data-anno': anno }: { children: ReactNode; className?: string; 'data-anno'?: string }) {
  return (
    <div data-anno={anno} className={cn('flex items-center justify-center gap-[6px]', className)}>
      <span className="shrink-0">
        <LuLock />
      </span>
      <p className="text-center text-[12px] font-medium leading-[normal] text-muted">{children}</p>
    </div>
  )
}

/**
 * Hero art slot (834:79347): 160×120, glass illustrations sized by visual
 * area so titles line up across screens.
 */
export function HeroArt({ src, alt, imgStyle, className, children }: { src: string; alt: string; imgStyle?: CSSProperties; className?: string; children?: ReactNode }) {
  return (
    <div className={cn('relative mx-auto h-[120px] w-[160px]', className)}>
      <img src={src} alt={alt} draggable={false} className="absolute left-1/2 top-1/2 max-w-none -translate-x-1/2 -translate-y-1/2 select-none" style={imgStyle} />
      {children}
    </div>
  )
}

/** Initial avatar (R, P, M, A). Serif letter on tint for people, sans on solid. */
export function Avatar({
  letter,
  size = 32,
  bg = '#f0ecff',
  color = '#5a39e3',
  serif,
  ring,
  className,
}: {
  letter: string
  size?: number
  bg?: string
  color?: string
  serif?: boolean
  /** White ring (for overlapping stacks). */
  ring?: boolean
  className?: string
}) {
  return (
    <span
      className={cn('inline-flex shrink-0 items-center justify-center rounded-full font-semibold', serif && 'serif font-normal', className)}
      style={{
        width: size,
        height: size,
        background: bg,
        color,
        fontSize: Math.round(size * (serif ? 0.5 : 0.44)),
        boxShadow: ring ? '0 0 0 2px #fff' : undefined,
      }}
    >
      {letter}
    </span>
  )
}

/** Generic white card used across screens (radius 12–16, 1px #F0F0F0). */
export function Card({ children, className, style, 'data-anno': anno }: { children: ReactNode; className?: string; style?: CSSProperties; 'data-anno'?: string }) {
  return (
    <div data-anno={anno} className={cn('rounded-[16px] border border-line bg-white', className)} style={style}>
      {children}
    </div>
  )
}

/**
 * Animated toast container (slides up with a spring). Position with `bottom`.
 */
export function Toast({ open, children, bottom = 112, className }: { open: boolean; children: ReactNode; bottom?: number | string; className?: string }) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className={cn('absolute inset-x-4 z-[65]', className)}
          style={{ bottom }}
          initial={{ y: 24, opacity: 0, scale: 0.96 }}
          animate={{ y: 0, opacity: 1, scale: 1 }}
          exit={{ y: 16, opacity: 0, scale: 0.98, transition: { duration: 0.2 } }}
          transition={{ type: 'spring', stiffness: 420, damping: 30 }}
          role="status"
          aria-live="polite"
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  )
}

/**
 * “Toast · Saved” (834:79320): white 96% + blur 12, 1px #ECECEF, radius 18,
 * p 10, gap 12, shadow 0 10 28 -4 rgba(31,20,64,.14); 44px thumbnail,
 * title Semibold 16 #1A1A1A, product Regular 12 #6B6B6B, violet pill CTA.
 */
export function SavedToast({
  productId = 'vanki',
  title = 'Saved to My wishlist',
  action = 'Add to gift list',
  onAction,
  'data-anno': anno,
}: {
  productId?: ProductId
  title?: string
  action?: string
  onAction?: () => void
  'data-anno'?: string
}) {
  return (
    <div
      data-anno={anno}
      className="glass-panel flex items-center gap-3 overflow-hidden rounded-[18px] p-[10px] [--glass-float:0_10px_28px_-4px_rgba(31,20,64,0.16)] [--glass-tint:rgba(255,255,255,0.86)]"
    >
      <div className="size-11 shrink-0 overflow-hidden rounded-[10px] border border-line-3 bg-[#f6f6f8]">
        <ProductPhoto id={productId} className="size-full" />
      </div>
      <div className="flex min-w-0 flex-1 flex-col gap-1 leading-[normal]">
        <p className="truncate text-[16px] font-semibold text-ink-2">{title}</p>
        <p className="truncate text-[12px] text-muted-2">{PRODUCTS[productId].name}</p>
      </div>
      <motion.button
        type="button"
        onClick={onAction}
        whileTap={onAction ? { scale: 0.95 } : undefined}
        className="shrink-0 rounded-full bg-violet px-[14px] py-2 text-[14px] font-semibold leading-[normal] text-white"
      >
        {action}
      </motion.button>
    </div>
  )
}
