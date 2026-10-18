import { useEffect, useRef, type CSSProperties, type MouseEvent as ReactMouseEvent, type PointerEvent as ReactPointerEvent, type ReactNode } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { Check, Heart, LockSimple, Plus, PlusCircle } from '@phosphor-icons/react'
import { PRODUCTS, type ProductId } from '@/data/products'
import { haptic } from '@/proto/haptics'
import { ProductPhoto } from './ProductPhoto'
import { cn } from './cn'

/* ───────────────────────── Saved heart ───────────────────────── */

/**
 * “Saved heart” on tiles: 44px circle, white 92%, drop shadow 0 2 4 /12%,
 * HeartFill 20 in #5A39E3. Sits 10px from the tile corner.
 * Tapping toggles with an iOS-style pop.
 */
export function SavedHeart({
  saved = true,
  onToggle,
  size = 44,
  className,
  'data-anno': anno,
}: {
  saved?: boolean
  onToggle?: (next: boolean) => void
  size?: number
  className?: string
  'data-anno'?: string
}) {
  return (
    <motion.button
      type="button"
      data-anno={anno}
      aria-label={saved ? 'Remove from wishlist' : 'Save to wishlist'}
      aria-pressed={saved}
      onClick={(e) => {
        e.stopPropagation()
        haptic()
        onToggle?.(!saved)
      }}
      whileTap={{ scale: 0.86 }}
      className={cn(
        'glass-chip flex items-center justify-center rounded-full [--glass-float:0_2px_6px_rgba(0,0,0,0.12)] [--glass-tint:rgba(255,255,255,0.8)]',
        className,
      )}
      style={{ width: size, height: size }}
    >
      <AnimatePresence initial={false} mode="popLayout">
        <motion.span
          key={saved ? 'on' : 'off'}
          initial={{ scale: 0.4, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.6, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 700, damping: 18 }}
          className="flex"
        >
          <Heart size={20} weight={saved ? 'fill' : 'regular'} color={saved ? '#5a39e3' : '#000'} />
        </motion.span>
      </AnimatePresence>
    </motion.button>
  )
}

/* ───────────────────────── Tag pill ───────────────────────── */

/**
 * Tile tag (“25% off”, “For Priya”, “Priya hinted this”): px 10, Semibold 12.
 * Figma trims the text box to cap height, so a bordered tag is 22px tall and a
 * borderless (pink) tag 20px; caps are optically centred.
 */
export function TileTag({ children, tone = 'plain', className }: { children: ReactNode; tone?: 'plain' | 'pink' | 'violet'; className?: string }) {
  return (
    <span
      className={cn(
        'flex w-max items-center whitespace-nowrap rounded-full px-[10px] text-[12px] font-semibold leading-none',
        tone === 'plain' && 'h-[22px] border border-[#e4e4e7] bg-white text-ink-2',
        tone === 'pink' && 'h-5 bg-pink-tint text-pink',
        tone === 'violet' && 'h-[22px] border border-[#e4e4e7] bg-white text-violet',
        className,
      )}
    >
      <span className="[text-box:trim-both_cap_alphabetic]">{children}</span>
    </span>
  )
}

/* ───────────────────────── Product tile ───────────────────────── */

/**
 * Saved product tile (A5, A6, A12, B1): square image radius 22, #F2F2F4,
 * 1px #ECECEE; tag top-left and heart bottom-right 10px from the edge;
 * text block pt 10 px 6 gap 4 (name Semibold 14, price Semibold 14 +
 * MRP Regular 12 struck, meta Regular 12 #767676).
 */
export function ProductTile({
  id,
  tag,
  tagTone,
  meta = 'Yellow gold · Size 12',
  saved = true,
  onToggleSaved,
  highlight,
  onClick,
  onLongPress,
  className,
  'data-anno': anno,
}: {
  id: ProductId
  tag?: ReactNode
  tagTone?: 'plain' | 'pink' | 'violet'
  meta?: ReactNode
  saved?: boolean
  onToggleSaved?: (v: boolean) => void
  /** Violet outline (A12 “Priya hinted this”). */
  highlight?: boolean
  onClick?: () => void
  onLongPress?: () => void
  className?: string
  'data-anno'?: string
}) {
  const p = PRODUCTS[id]
  const press = useLongPress(onLongPress)
  return (
    <motion.div
      data-anno={anno}
      className={cn('flex min-w-0 flex-col', className)}
      whileTap={onClick || onLongPress ? { scale: 0.98 } : undefined}
      transition={{ type: 'spring', stiffness: 500, damping: 34 }}
      onClick={onClick}
      {...press}
    >
      <div className="relative aspect-square w-full overflow-hidden rounded-[22px] bg-[#f2f2f4]">
        <ProductPhoto id={id} className="absolute inset-0" rounded={22} />
        {/* Figma strokes are “inside”: draw the border over the photo */}
        <span
          aria-hidden
          className={cn('pointer-events-none absolute inset-0 rounded-[22px] border', highlight ? 'border-2 border-violet' : 'border-[#ececee]')}
        />
        {tag && (
          <div className="absolute left-[10px] top-[10px] flex">
            <TileTag tone={tagTone}>{tag}</TileTag>
          </div>
        )}
        <SavedHeart saved={saved} onToggle={onToggleSaved} className="absolute bottom-[10px] right-[10px]" />
      </div>
      <div className="flex flex-col gap-1 px-[6px] pt-[10px] leading-[normal]">
        <p className="truncate text-[14px] font-semibold text-black">{p.name}</p>
        <div className="flex items-center gap-1">
          <p className="text-[14px] font-semibold text-black">{p.price}</p>
          {p.mrp && <p className="text-[12px] text-muted line-through">{p.mrp}</p>}
        </div>
        <p className="text-[12px] text-muted">{meta}</p>
      </div>
    </motion.div>
  )
}

/**
 * Long-press (≈480ms) for touch and mouse, plus right-click. Cancels on move,
 * and swallows the click that ends a long-press so it doesn’t also “tap”.
 * Always call it (pass `undefined` when there is no long-press action).
 */
export function useLongPress(cb?: () => void, ms = 480) {
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)
  const start = useRef<{ x: number; y: number } | null>(null)
  const fired = useRef(false)
  const cbRef = useRef(cb)
  cbRef.current = cb
  useEffect(() => () => clearTimeout(timer.current), [])
  if (!cb) return {}
  const clear = () => {
    clearTimeout(timer.current)
    timer.current = undefined
  }
  return {
    onPointerDown: (e: ReactPointerEvent) => {
      fired.current = false
      start.current = { x: e.clientX, y: e.clientY }
      clear()
      timer.current = setTimeout(() => {
        fired.current = true
        haptic()
        cbRef.current?.()
      }, ms)
    },
    onPointerMove: (e: ReactPointerEvent) => {
      if (start.current && Math.hypot(e.clientX - start.current.x, e.clientY - start.current.y) > 8) clear()
    },
    onPointerUp: clear,
    onPointerLeave: clear,
    onPointerCancel: clear,
    onClickCapture: (e: ReactMouseEvent) => {
      if (fired.current) {
        e.stopPropagation()
        e.preventDefault()
        fired.current = false
      }
    },
    onContextMenu: (e: ReactMouseEvent) => {
      e.preventDefault()
      clear()
      fired.current = true
      cbRef.current?.()
    },
  }
}

/* ───────────────────────── Thumb stack helpers ───────────────────────── */

function Thumb({ id, w = 56, h = 60, rotate, className, border = 2, radius = 10, shadow = '0 4px 10px rgba(0,0,0,0.1)', style }: {
  id: ProductId; w?: number; h?: number; rotate: number; className?: string; border?: number; radius?: number; shadow?: string; style?: CSSProperties
}) {
  return (
    <div
      className={cn('absolute overflow-hidden border-solid border-white bg-white', className)}
      style={{ width: w, height: h, transform: `rotate(${rotate}deg)`, borderWidth: border, borderRadius: radius, boxShadow: shadow, ...style }}
    >
      <ProductPhoto id={id} className="absolute inset-0" />
    </div>
  )
}

/** Three tilted thumbnails peeking from the bottom (Create / Find more cards). Tops in px from the card top. */
function PeekingThumbs({ tops }: { tops: [number, number, number] }) {
  return (
    <div className="absolute inset-x-0 top-0">
      <div className="relative mx-auto h-0 w-[178px]">
        <Thumb id="hearts-vine" rotate={6} className="left-[10.98px]" style={{ top: tops[0] }} />
        <Thumb id="vanki" rotate={-3} className="left-[61.8px]" style={{ top: tops[1] }} />
        <Thumb id="twist" rotate={-8} className="left-[118.17px]" style={{ top: tops[2] }} />
      </div>
    </div>
  )
}

/* ───────────────────────── Gift list cards ───────────────────────── */

/**
 * Gift list collection card (A5 “For Priya”, B1 “My wishlist”): 178×214,
 * #F4F4F6, 1px #ECECEE, radius 20; two tilted photos; lock + count + title.
 */
export function GiftListCard({
  title,
  meta,
  back = 'hearts-vine',
  front = 'vanki',
  onClick,
  className,
  'data-anno': anno,
}: {
  title: string
  meta: string
  back?: ProductId
  front?: ProductId
  onClick?: () => void
  className?: string
  'data-anno'?: string
}) {
  return (
    <motion.button
      type="button"
      data-anno={anno}
      onClick={onClick}
      whileTap={onClick ? { scale: 0.97 } : undefined}
      transition={{ type: 'spring', stiffness: 500, damping: 32 }}
      className={cn('relative h-[214px] min-w-0 flex-1 overflow-hidden rounded-[20px] border border-[#ececee] bg-[#f4f4f6] text-left', !onClick && 'pointer-events-none', className)}
    >
      <Thumb id={back} w={84} h={84} rotate={9} border={3} radius={14} shadow="0 8px 16px rgba(0,0,0,0.12)" className="left-[63.9px] top-[25px]" />
      <div
        className="absolute left-[28.75px] top-[34.75px] size-[96px] overflow-hidden rounded-[14px] border border-[#eee] bg-white"
        style={{ transform: 'rotate(-6deg)', boxShadow: '0 10px 20px rgba(0,0,0,0.14)' }}
      >
        <ProductPhoto id={front} className="absolute inset-0" />
      </div>
      <div className="absolute left-[13px] top-[162px] flex w-[150px] flex-col gap-1 leading-[normal]">
        <div className="flex items-center gap-1 text-muted">
          <LockSimple size={14} />
          <span className="text-[14px] font-medium">{meta}</span>
        </div>
        <p className="text-[20px] font-semibold text-black">{title}</p>
      </div>
    </motion.button>
  )
}

/** “Create gift list” card (A5, B1). */
export function CreateListCard({ onClick, className, icon = 'plus', 'data-anno': anno }: { onClick?: () => void; className?: string; /** A5 uses Plus, B1 uses PlusCircle (#3E3E3E). */ icon?: 'plus' | 'plus-circle'; 'data-anno'?: string }) {
  return (
    <motion.button
      type="button"
      data-anno={anno}
      onClick={onClick}
      whileTap={onClick ? { scale: 0.97 } : undefined}
      transition={{ type: 'spring', stiffness: 500, damping: 32 }}
      className={cn('relative h-[214px] min-w-0 flex-1 overflow-hidden rounded-[20px] border border-[#ececee] bg-[#f4f4f6]', !onClick && 'pointer-events-none', className)}
    >
      {icon === 'plus' ? (
        <Plus size={28} className="absolute left-1/2 top-[69px] -translate-x-1/2" />
      ) : (
        <PlusCircle size={28} color="#3e3e3e" className="absolute left-1/2 top-[70px] -translate-x-1/2" />
      )}
      <p className="absolute inset-x-0 top-[105px] text-center text-[16px] font-semibold leading-[normal] text-black">Create gift list</p>
      <p className="absolute inset-x-0 top-[127px] text-center text-[12px] leading-[normal] text-muted">For a person or an occasion</p>
      <PeekingThumbs tops={[182.76, 176.75, 174.08]} />
    </motion.button>
  )
}

/** “Find more for Priya” dashed card (A6, A12). Square, #F7F7F9, 1.2px dashed #C8C8CE. */
export function FindMoreCard({ title, subtitle = 'Similar to what you’ve saved', onClick, className, 'data-anno': anno }: {
  title: string; subtitle?: string; onClick?: () => void; className?: string; 'data-anno'?: string
}) {
  return (
    <motion.button
      type="button"
      data-anno={anno}
      onClick={onClick}
      whileTap={onClick ? { scale: 0.97 } : undefined}
      className={cn('relative aspect-square w-full overflow-hidden rounded-[22px] border-[1.2px] border-dashed border-[#c8c8ce] bg-[#f7f7f9]', !onClick && 'pointer-events-none', className)}
    >
      <PlusCircle size={28} color="#3e3e3e" className="absolute left-1/2 top-[44.8px] -translate-x-1/2" />
      <p className="absolute inset-x-0 top-[80.8px] text-center text-[16px] font-semibold leading-[normal] text-black">{title}</p>
      <p className="absolute inset-x-0 top-[102.8px] text-center text-[12px] leading-[normal] text-muted">{subtitle}</p>
      <PeekingThumbs tops={[138.76, 133.29, 130.61]} />
    </motion.button>
  )
}

/* ───────────────────────── Select tile ───────────────────────── */

/**
 * Selectable product tile (A8, A10, B2, B5 “Pick · …”): 110px square,
 * radius 12; selected = 2px #5A39E3 border + 22px violet check badge
 * (10px from the top-right); unselected = 1px #E0E0E0 + empty ring.
 */
export function SelectTile({
  id,
  selected,
  onToggle,
  size,
  children,
  className,
  'data-anno': anno,
}: {
  id: ProductId
  selected: boolean
  onToggle?: () => void
  /** Fixed size in px; omit to fill the grid cell (aspect-square). */
  size?: number
  /** Extra overlay content (e.g. note badge in B2). */
  children?: ReactNode
  className?: string
  'data-anno'?: string
}) {
  return (
    <motion.button
      type="button"
      data-anno={anno}
      aria-pressed={selected}
      aria-label={PRODUCTS[id].name}
      onClick={() => {
        haptic()
        onToggle?.()
      }}
      whileTap={{ scale: 0.95 }}
      transition={{ type: 'spring', stiffness: 520, damping: 30 }}
      className={cn('relative block aspect-square min-w-0 overflow-hidden rounded-[12px]', !size && 'w-full', className)}
      style={size ? { width: size, height: size } : undefined}
    >
      <ProductPhoto id={id} className="absolute inset-0" rounded={12} />
      <span
        className={cn(
          'pointer-events-none absolute inset-0 rounded-[12px] border-solid transition-[border-color,border-width] duration-200',
          selected ? 'border-2 border-violet' : 'border border-line-2',
        )}
      />
      <span className="absolute right-[10px] top-[10px] flex size-[22px] items-center justify-center">
        <AnimatePresence initial={false}>
          {selected ? (
            <motion.span
              key="on"
              className="absolute inset-0 flex items-center justify-center rounded-full bg-violet"
              initial={{ scale: 0.3, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.3, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 700, damping: 22 }}
            >
              <Check size={14} weight="bold" color="#fff" />
            </motion.span>
          ) : (
            <motion.span
              key="off"
              className="absolute inset-0 rounded-full border-[1.5px] border-white bg-white/40 shadow-[0_0_0_0.5px_rgba(0,0,0,0.25)]"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            />
          )}
        </AnimatePresence>
      </span>
      {children}
    </motion.button>
  )
}
