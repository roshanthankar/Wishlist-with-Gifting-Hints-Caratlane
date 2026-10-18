import { motion } from 'motion/react'
import { CaretLeft, DotsThree, LockSimple } from '@phosphor-icons/react'
import { useEnv } from '@/proto/env'
import { cn } from './cn'
import { hexToAlpha, hexToTransparent } from './Screen'
import caratlaneLogo from '@/assets/brand/caratlane-logo.png'

/**
 * “Logo · CaratLane” component (834:79108): CaratLane’s own logo, mark and
 * wordmark with “A TATA PRODUCT” (from caratlane.com), 128×32. One component,
 * so every screen uses the same logo. `light` turns it white for dark stages.
 */
export function Logo({ className, light }: { className?: string; light?: boolean }) {
  return (
    <img
      src={caratlaneLogo}
      alt="CaratLane, a Tata product"
      width={128}
      height={32}
      draggable={false}
      className={cn('h-8 w-32 shrink-0 select-none', light && 'brightness-0 invert', className)}
    />
  )
}

/**
 * Mobile-web header (“Web header”, 52px, px 16): logo + 118×36 glass
 * “Open in app” pill (Semibold 14).
 */
export function WebHeader({ onOpenApp, className, 'data-anno': anno }: { onOpenApp?: () => void; className?: string; 'data-anno'?: string }) {
  return (
    <div data-anno={anno} className={cn('relative z-10 flex h-[52px] items-center justify-between px-4', className)}>
      <Logo />
      <motion.button
        type="button"
        onClick={onOpenApp}
        whileTap={onOpenApp ? { scale: 0.95 } : undefined}
        className={cn('glass pn-button-text flex h-9 w-[118px] items-center justify-center rounded-full text-[14px] font-semibold text-black', !onOpenApp && 'pointer-events-none')}
      >
        Open in app
      </motion.button>
    </div>
  )
}

/** Height reserved for the Safari bottom bar (0 on real phones, where Safari draws its own). */
export function useSafariInset() {
  const { mockup } = useEnv()
  return mockup ? 84 : 0
}

/**
 * Safari bottom bar, iOS 27 (“Safari · bottom bar (iOS 27)”): 48px glass
 * back, flexible glass address pill (lock 14 + “caratlane.com” SF Pro Regular
 * 16) and 48px glass “more”; px 16, gap 8, pb 36. Only inside the mockup.
 */
export function SafariBar({ onBack, url = 'caratlane.com', className }: { onBack?: () => void; url?: string; className?: string }) {
  const { mockup } = useEnv()
  if (!mockup) return null
  return (
    <div className={cn('absolute inset-x-0 bottom-0 z-[80] flex items-center gap-2 px-4 pb-9', className)} data-anno="safari-bar">
      <motion.button type="button" aria-label="Back" onClick={onBack} whileTap={onBack ? { scale: 1.12 } : undefined} transition={{ type: 'spring', stiffness: 520, damping: 22 }} className={cn('glass flex size-12 shrink-0 items-center justify-center rounded-full', !onBack && 'pointer-events-none')}>
        <CaretLeft size={22} color="#000" />
      </motion.button>
      <div className="glass flex h-12 min-w-0 flex-1 items-center justify-center gap-[6px] rounded-full px-1">
        <LockSimple size={14} color="#000" />
        <span className="sf truncate text-[16px] font-normal text-black">{url}</span>
      </div>
      <motion.button type="button" aria-label="More" className="glass pointer-events-none flex size-12 shrink-0 items-center justify-center rounded-full">
        <DotsThree size={22} color="#000" weight="bold" />
      </motion.button>
    </div>
  )
}

/** White fade under the Safari bar / bottom actions (“Fade under Safari bar”, 104px). */
export function BottomFade({ height = 140, color = '#fdfdfd', className }: { height?: number; color?: string; className?: string }) {
  return (
    <div
      aria-hidden
      className={cn('pointer-events-none absolute inset-x-0 bottom-0 z-[49]', className)}
      style={{ height, background: `linear-gradient(to bottom, ${hexToTransparent(color)} 0%, ${hexToAlpha(color, 0.92)} 45%, ${color} 100%)` }}
    />
  )
}
