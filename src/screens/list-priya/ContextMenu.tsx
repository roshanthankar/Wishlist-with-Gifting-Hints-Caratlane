import { useEffect, useLayoutEffect, useRef, useState, type ReactNode } from 'react'
import { AnimatePresence, motion, useReducedMotion, type Variants } from 'motion/react'
import { Bell, CaretRight, Export, FolderSimplePlus, MagnifyingGlass, Storefront, Trash, UsersThree } from '@phosphor-icons/react'
import { ProductPhoto, SavedHeart } from '@/ui'
import type { ProductId } from '@/data/products'
import { tagFor } from './parts'

export type MenuAction = 'ask' | 'remove'
/** How the lifted card leaves: fly back into its tile, or drop away (removed). */
export type MenuExit = 'return' | 'remove'

/** Figma A7: lifted card 200px at y=158 (tile 178px → ×1.1236), menu 12.5px below. */
const LIFT = 200 / 178
const LIFT_TOP_BELOW_SAFE = 158 - 62
const MENU_GAP = 12.5
const MENU_W = 250
const LIFT_SPRING = { type: 'spring', stiffness: 360, damping: 28, mass: 0.9 } as const

interface Geo {
  /** Card box in screen px. */
  left: number
  top: number
  size: number
  /** Offset + scale that puts the card back on its tile. */
  dx: number
  dy: number
  k: number
  alignRight: boolean
  /** Distance from the right edge (right-aligned menu). */
  right: number
}

/**
 * A7 · iOS context menu over the list (707:2275): the page blurs and dims
 * (#C7C7CC at 50% + background blur), the pressed tile lifts to the Figma
 * position with a spring and the Liquid Glass menu (glass-panel) unfolds from its corner.
 */
export function ContextMenu({
  open,
  item,
  exit,
  findTile,
  onClose,
  onAction,
  onExitComplete,
}: {
  open: boolean
  item: ProductId
  exit: MenuExit
  /** Returns the tile’s image box in the grid (to lift from / return to). */
  findTile: (id: ProductId) => HTMLElement | null
  onClose: () => void
  onAction: (a: MenuAction) => void
  onExitComplete?: () => void
}) {
  return (
    <AnimatePresence custom={exit} onExitComplete={onExitComplete}>
      {open && <MenuLayer key="menu" item={item} findTile={findTile} onClose={onClose} onAction={onAction} />}
    </AnimatePresence>
  )
}

function MenuLayer({
  item,
  findTile,
  onClose,
  onAction,
}: {
  item: ProductId
  findTile: (id: ProductId) => HTMLElement | null
  onClose: () => void
  onAction: (a: MenuAction) => void
}) {
  const ref = useRef<HTMLDivElement>(null)
  const [geo, setGeo] = useState<Geo | null>(null)
  const reduce = useReducedMotion()

  // Measure the tile before the first paint so the card starts exactly on it.
  useLayoutEffect(() => {
    const root = ref.current
    if (!root) return
    const box = root.getBoundingClientRect()
    const W = root.offsetWidth
    const scale = box.width / W || 1
    const safeTop = parseFloat(getComputedStyle(root).getPropertyValue('--safe-top')) || 62
    const el = findTile(item)
    let tile = { x: 16, y: safeTop + 96, w: Math.min(178, (W - 46) / 2) }
    let found = false
    if (el) {
      const r = el.getBoundingClientRect()
      const w = el.offsetWidth
      // Centre-based, so a press-scaled tile (whileTap) still maps 1:1.
      tile = { x: (r.left + r.width / 2 - box.left) / scale - w / 2, y: (r.top + r.height / 2 - box.top) / scale - w / 2, w }
      found = true
    }
    const size = Math.round(tile.w * LIFT)
    const alignRight = tile.x + tile.w / 2 > W / 2
    const left = alignRight ? tile.x + tile.w + 1 - size : tile.x - 1
    const top = safeTop + LIFT_TOP_BELOW_SAFE
    setGeo({
      left,
      top,
      size,
      dx: found ? tile.x - left : 0,
      dy: found ? tile.y - top : 0,
      k: found ? tile.w / size : 0.92,
      alignRight,
      right: W - (left + size),
    })
  }, [findTile, item])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  const rest = geo ? { x: geo.dx, y: geo.dy, scale: geo.k } : {}
  const cardVariants: Variants = {
    exit: (mode: MenuExit) =>
      mode === 'remove' && geo
        ? // Drop away around its centre (the origin is the top-left corner for the FLIP).
          { scale: 0.6, x: geo.size * 0.2, y: geo.size * 0.2, opacity: 0, transition: { duration: 0.24, ease: [0.4, 0, 1, 1] } }
        : { ...rest, boxShadow: '0 0px 0px rgba(0,0,0,0)', transition: reduce ? { duration: 0.15 } : LIFT_SPRING },
  }

  return (
    <div ref={ref} className="absolute inset-0 z-[70]" role="dialog" aria-modal="true" aria-label="Quick actions">
      <motion.div
        data-anno="menu-backdrop"
        className="absolute inset-0 bg-[#c7c7cc]/50 backdrop-blur-[5px]"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0, transition: { duration: 0.28, ease: [0.32, 0.72, 0, 1] } }}
        transition={{ duration: 0.3, ease: [0.32, 0.72, 0, 1] }}
        onClick={onClose}
      />
      {geo && (
        <>
          <motion.div
            data-anno="lifted-card"
            className="absolute overflow-hidden rounded-[24px] border-[1.12px] border-[#ececee] bg-[#f2f2f4]"
            style={{ left: geo.left, top: geo.top, width: geo.size, height: geo.size, transformOrigin: '0 0' }}
            initial={reduce ? { opacity: 0 } : { ...rest, boxShadow: '0 0px 0px rgba(0,0,0,0)' }}
            animate={{ x: 0, y: 0, scale: 1, opacity: 1, boxShadow: '0 24px 48px rgba(0,0,0,0.22)' }}
            exit="exit"
            variants={cardVariants}
            transition={reduce ? { duration: 0.2 } : LIFT_SPRING}
          >
            <ProductPhoto id={item} className="absolute inset-0" rounded={24} />
            {tagFor(item) && (
              <span className="absolute left-[10px] top-[10px] inline-flex items-center whitespace-nowrap rounded-full border border-[#e4e4e7] bg-white px-3 py-[6px] text-[14px] font-semibold leading-none text-ink-2">
                {tagFor(item)}
              </span>
            )}
            <SavedHeart saved onToggle={() => onAction('remove')} className="absolute bottom-[9px] right-[9px]" />
          </motion.div>

          <motion.div
            className="glass-panel absolute overflow-hidden rounded-[34px] py-[10px]"
            style={{
              top: geo.top + geo.size + MENU_GAP,
              left: geo.alignRight ? undefined : geo.left,
              right: geo.alignRight ? geo.right : undefined,
              width: MENU_W,
              transformOrigin: geo.alignRight ? '100% 0' : '0 0',
            }}
            initial={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.35, y: -8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: reduce ? 1 : 0.7, transition: { duration: 0.18, ease: [0.4, 0, 1, 1] } }}
            transition={reduce ? { duration: 0.2 } : { type: 'spring', stiffness: 420, damping: 32, delay: 0.04 }}
            role="menu"
          >
            <div data-anno="menu-quick" className="flex gap-[6px] px-[10px]">
              <QuickAction icon={<Export size={20} color="#1a1a1a" />} label="Share" />
              <QuickAction icon={<UsersThree size={20} color="#1a1a1a" />} label="Ask a friend" onClick={() => onAction('ask')} />
              <QuickAction icon={<MagnifyingGlass size={20} color="#1a1a1a" />} label="Similar" />
            </div>
            <div className="flex flex-col px-4">
              <Separator />
              <MenuItem anno="menu-store" icon={<Storefront size={20} color="#1a1a1a" />} label="Try it in store" />
              <MenuItem anno="menu-price" icon={<Bell size={20} color="#1a1a1a" />} label="Track price drops" />
              <MenuItem
                anno="menu-move"
                icon={<FolderSimplePlus size={20} color="#1a1a1a" />}
                label="Move to list"
                trailing={<CaretRight size={14} color="#1a1a1a" />}
              />
              <Separator />
              <MenuItem anno="menu-remove" icon={<Trash size={20} color="#ff383c" />} label="Remove from list" danger onClick={() => onAction('remove')} />
            </div>
          </motion.div>
        </>
      )}
    </div>
  )
}

/** Top “Control Group” action: icon over a Medium 12/18 label, pressed = #EDEDED. */
function QuickAction({ icon, label, onClick }: { icon: ReactNode; label: string; onClick?: () => void }) {
  return (
    <button
      type="button"
      role="menuitem"
      onClick={onClick}
      className={`flex h-14 min-w-0 flex-1 flex-col items-center gap-[6px] rounded-[20px] px-1 py-[6px] transition-colors duration-150 ${onClick ? 'active:bg-black/[0.07]' : 'pointer-events-none'}`}
    >
      <span className="flex h-[22px] w-16 items-center justify-center">{icon}</span>
      <span className="text-center text-[12px] font-medium leading-[18px] text-ink-2">{label}</span>
    </button>
  )
}

/** Menu row: 40px, icon slot 28×20, Regular 16/20 −0.43 tracking. */
function MenuItem({
  icon,
  label,
  trailing,
  danger,
  anno,
  onClick,
}: {
  icon: ReactNode
  label: string
  trailing?: ReactNode
  danger?: boolean
  anno: string
  onClick?: () => void
}) {
  return (
    <button
      type="button"
      role="menuitem"
      data-anno={anno}
      onClick={onClick}
      className={`-mx-2 flex h-10 items-center gap-[6px] rounded-[12px] pl-[14px] pr-4 text-left transition-colors duration-150 ${onClick ? 'active:bg-black/[0.07]' : 'pointer-events-none'}`}
    >
      <span className="flex min-w-0 flex-1 items-center gap-2">
        <span className="flex h-5 w-7 shrink-0 items-center justify-center">{icon}</span>
        <span className={`pn-no-liga truncate text-[16px] leading-5 tracking-[-0.43px] ${danger ? 'text-[#ff383c]' : 'text-ink-2'}`}>{label}</span>
      </span>
      {trailing && <span className="flex h-5 w-[14px] shrink-0 items-center justify-center">{trailing}</span>}
    </button>
  )
}

function Separator() {
  return (
    <div className="px-2 py-[10px]" role="separator">
      <div className="h-px bg-[#e6e6e6]" />
    </div>
  )
}
