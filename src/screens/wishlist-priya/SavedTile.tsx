import type { ReactNode } from 'react'
import { motion } from 'motion/react'
import { PRODUCTS, type ProductId } from '@/data/products'
import { ProductPhoto, SavedHeart, TileTag } from '@/ui'

/**
 * B1 “Saved · …” tile. Same anatomy as the shared ProductTile (square photo
 * radius 22, tag and heart 10px from the corners, text pt 10 px 6 gap 4), but
 * the price can be overridden: Priya’s Petite Cluster is the set of three
 * (₹28,990), not the single ring in the product data.
 */
export function SavedTile({
  id,
  tag,
  price,
  mrp,
  meta = 'Yellow gold · Size 12',
  saved,
  onToggleSaved,
  onClick,
  'data-anno': anno,
  heartAnno,
}: {
  id: ProductId
  tag: ReactNode
  price?: string
  mrp?: string | null
  meta?: string
  saved: boolean
  onToggleSaved: (v: boolean) => void
  onClick?: () => void
  'data-anno'?: string
  heartAnno?: string
}) {
  const p = PRODUCTS[id]
  const shownMrp = mrp === null ? undefined : (mrp ?? p.mrp)
  return (
    <motion.div
      data-anno={anno}
      className="flex min-w-0 flex-col"
      whileTap={{ scale: 0.98 }}
      transition={{ type: 'spring', stiffness: 500, damping: 34 }}
      onClick={onClick}
    >
      <div className="relative aspect-square w-full overflow-hidden rounded-[22px] bg-[#f2f2f4]">
        <ProductPhoto id={id} className="absolute inset-0" rounded={22} />
        {/* Figma strokes are “inside”: draw the border over the photo */}
        <span aria-hidden className="pointer-events-none absolute inset-0 rounded-[22px] border border-[#ececee]" />
        <div className="absolute left-[10px] top-[10px] flex">
          <TileTag>{tag}</TileTag>
        </div>
        <SavedHeart data-anno={heartAnno} saved={saved} onToggle={onToggleSaved} className="absolute bottom-[10px] right-[10px]" />
      </div>
      <div className="flex flex-col gap-1 px-[6px] pt-[10px] leading-[normal]">
        <p className="truncate text-[14px] font-semibold text-black">{p.name}</p>
        <div className="flex items-center gap-1">
          <p className="text-[14px] font-semibold text-black">{price ?? p.price}</p>
          {shownMrp && <p className="text-[12px] text-muted line-through">{shownMrp}</p>}
        </div>
        <p className="text-[12px] text-muted">{meta}</p>
      </div>
    </motion.div>
  )
}
