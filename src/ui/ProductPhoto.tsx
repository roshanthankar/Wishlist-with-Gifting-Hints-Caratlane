import type { CSSProperties } from 'react'
import { PRODUCTS, type ProductId } from '@/data/products'
import { cn } from './cn'

/**
 * Product photo with Figma’s CROP fill reproduced: the square listing photo
 * covers the box and is scaled by the product’s crop zoom around the centre.
 * Works for any box size or aspect (e.g. 56×60 thumbnails).
 */
export function ProductPhoto({
  id,
  className,
  style,
  zoom,
  rounded,
}: {
  id: ProductId
  className?: string
  style?: CSSProperties
  /** Override the default crop zoom. */
  zoom?: number
  rounded?: number
}) {
  const p = PRODUCTS[id]
  return (
    <div
      className={cn(!/\b(absolute|fixed|sticky)\b/.test(className ?? '') && 'relative', 'overflow-hidden bg-white', className)}
      style={{ borderRadius: rounded, ...style }}
    >
      <img
        src={p.img}
        alt={p.name}
        draggable={false}
        className="absolute inset-0 size-full select-none object-cover"
        style={{ transform: `scale(${zoom ?? p.zoom})` }}
      />
    </div>
  )
}
