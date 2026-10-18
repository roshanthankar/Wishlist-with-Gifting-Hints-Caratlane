import { useEffect, useRef, type CSSProperties, type ReactNode, type Ref, type UIEvent } from 'react'
import { motion, useScroll, useTransform } from 'motion/react'
import { useEnv } from '@/proto/env'
import { StatusBar } from './StatusBar'
import { cn } from './cn'

/**
 * Root of every app screen (one Figma frame = one Screen in some state).
 *   <Screen>
 *     <ScrollView backdrop={<PinkPageAura/>}> nav + content </ScrollView>
 *     <BottomBar> CTAs </BottomBar>
 *     <Sheet/> <Toast/>            ← overlays sit directly inside Screen
 *   </Screen>
 * Figma frames are 402×896; the iPhone 17 viewport is 402×874, so content
 * scrolls and bottom bars stay pinned, as in a real app.
 */
export function Screen({
  children,
  bg = '#fdfdfd',
  tone = 'dark',
  themeColor,
  className,
  style,
}: {
  children: ReactNode
  /** Frame fill from Figma (most screens use #FDFDFD). */
  bg?: string
  /** Status bar text colour. */
  tone?: 'dark' | 'light'
  /** Browser UI tint on real phones (meta theme-color). */
  themeColor?: string
  className?: string
  style?: CSSProperties
}) {
  const { mockup } = useEnv()
  useEffect(() => {
    if (mockup) return
    const meta = document.querySelector('meta[name="theme-color"]')
    const prev = meta?.getAttribute('content')
    meta?.setAttribute('content', themeColor ?? bg)
    return () => {
      if (prev) meta?.setAttribute('content', prev)
    }
  }, [mockup, themeColor, bg])

  return (
    <div
      data-screen
      className={cn('app-surface relative h-full w-full overflow-hidden', className)}
      style={{ background: bg, ...style }}
    >
      {children}
      <StatusBar tone={tone} />
    </div>
  )
}

/**
 * Full-height scroller. Content starts under the status bar (padding =
 * --safe-top), so a `backdrop` (aura / pattern) can run behind the status bar
 * exactly like Figma. When scrolled, an iOS-style edge fade appears under the
 * status bar.
 */
export function ScrollView({
  children,
  backdrop,
  bottomInset = 0,
  className,
  contentClassName,
  edgeColor = '#fdfdfd',
  scrollRef,
  onScroll,
  style,
}: {
  children: ReactNode
  backdrop?: ReactNode
  /** Space to keep clear for a BottomBar / Safari bar (px or CSS length). */
  bottomInset?: number | string
  className?: string
  contentClassName?: string
  /** Colour of the fade under the status bar when content scrolls beneath it. */
  edgeColor?: string | null
  scrollRef?: Ref<HTMLDivElement>
  onScroll?: (e: UIEvent<HTMLDivElement>) => void
  style?: CSSProperties
}) {
  const local = useRef<HTMLDivElement>(null)
  const { scrollY } = useScroll({ container: local })
  const edgeOpacity = useTransform(scrollY, [0, 24], [0, 1])

  const setRef = (el: HTMLDivElement | null) => {
    local.current = el
    if (typeof scrollRef === 'function') scrollRef(el)
    else if (scrollRef) (scrollRef as { current: HTMLDivElement | null }).current = el
  }

  return (
    <>
      <div
        ref={setRef}
        data-scroll
        onScroll={onScroll}
        className={cn('no-scrollbar absolute inset-0 overflow-y-auto overflow-x-hidden overscroll-contain', className)}
        style={{ WebkitOverflowScrolling: 'touch', ...style }}
      >
        <div
          className={cn('relative min-h-full', contentClassName)}
          style={{
            paddingTop: 'var(--safe-top)',
            paddingBottom: typeof bottomInset === 'number' ? `${bottomInset}px` : bottomInset,
          }}
        >
          {backdrop && (
            <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 z-0 overflow-hidden" style={{ height: '100%' }}>
              {backdrop}
            </div>
          )}
          <div className="relative z-[1]">{children}</div>
        </div>
      </div>
      {edgeColor && (
        <motion.div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 z-[55]"
          style={{
            height: 'calc(var(--safe-top) + 14px)',
            opacity: edgeOpacity,
            // Solid down to the nav bar’s top edge (nothing peeks between the status bar and the nav), then a short fade.
            background: `linear-gradient(to bottom, ${edgeColor} 0%, ${edgeColor} calc(100% - 14px), ${hexToTransparent(edgeColor)} 100%)`,
          }}
        />
      )}
    </>
  )
}

/** Pinned bottom area (CTAs). Pads for the home indicator / real safe area. */
export function BottomBar({
  children,
  className,
  fade,
  fadeHeight,
  style,
}: {
  children: ReactNode
  className?: string
  /** Draw a fade (Figma “Fade under actions”) behind the bar in this colour. */
  fade?: string | false
  /** Defaults to the bar plus 40px: a light veil just above the buttons, solid only behind them. */
  fadeHeight?: number | string
  style?: CSSProperties
}) {
  return (
    <div className="pointer-events-none absolute inset-x-0 bottom-0 z-[50]">
      {fade && (
        <div
          aria-hidden
          className="absolute inset-x-0 bottom-0"
          style={{
            height: fadeHeight ?? 'calc(52px + var(--safe-bottom-pad) + 40px)',
            background: `linear-gradient(to bottom, ${hexToTransparent(fade)} 0%, ${hexToAlpha(fade, 0.7)} 40%, ${fade} 70%)`,
          }}
        />
      )}
      <div
        className={cn('pointer-events-auto relative flex items-center gap-3 px-4', className)}
        style={{ paddingBottom: 'var(--safe-bottom-pad)', ...style }}
      >
        {children}
      </div>
    </div>
  )
}

/** Height a BottomBar with one 52px button row needs, plus breathing room above it (ScrollView bottomInset). */
export const BOTTOM_BAR_INSET = 'calc(52px + var(--safe-bottom-pad) + 40px)'

/** #rrggbb at a given alpha. */
export function hexToAlpha(color: string, a: number) {
  const m = color.match(/^#([0-9a-f]{6})$/i)
  if (!m) return color
  const n = parseInt(m[1], 16)
  return `rgba(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}, ${a})`
}

/** Turn #rrggbb into the same colour at 0 alpha (for smooth gradients in Safari). */
export function hexToTransparent(color: string) {
  const m = color.match(/^#([0-9a-f]{6})$/i)
  if (!m) return 'transparent'
  const n = parseInt(m[1], 16)
  return `rgba(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}, 0)`
}
