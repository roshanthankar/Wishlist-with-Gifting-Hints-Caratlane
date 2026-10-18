import type { CSSProperties } from 'react'
import pinkAuraPage from '@/assets/patterns/pink-aura-page.webp'
import floralSheet from '@/assets/patterns/floral-sheet.webp'
import floralBanner from '@/assets/patterns/floral-banner.webp'
import latticePage from '@/assets/patterns/lattice-page.webp'
import latticeSheet from '@/assets/patterns/lattice-sheet.webp'
import { cn } from './cn'

/**
 * Decorative layers exported from Figma at 2x. Each image is the pattern
 * already composited over the frame fill (#FDFDFD / white), so it must be the
 * BOTTOM layer; the blurred aura ellipses (<AuraBlob>) go on top, as in Figma.
 */
export const PATTERNS = { pinkAuraPage, floralSheet, floralBanner, latticePage, latticeSheet }

/**
 * Blurred ellipse (“Aura · rose / violet / peach / blue / cyan …” in Figma).
 * Pass Figma’s LAYER_BLUR radius as `blur`; CSS blur is half of it.
 */
export function AuraBlob({
  x,
  y,
  w,
  h,
  color,
  blur = 100,
  opacity = 1,
  right,
  style,
}: {
  x?: number | string
  y: number | string
  w: number
  h: number
  color: string
  blur?: number
  opacity?: number
  /** Anchor from the right edge instead of `x` (keeps layouts fluid). */
  right?: number | string
  style?: CSSProperties
}) {
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute rounded-[50%]"
      style={{
        left: right === undefined ? x : undefined,
        right,
        top: y,
        width: w,
        height: h,
        background: color,
        opacity,
        filter: `blur(${blur / 2}px)`,
        transform: 'translateZ(0)',
        ...style,
      }}
    />
  )
}

function PatternImg({ src, className, style }: { src: string; className?: string; style?: CSSProperties }) {
  return <img src={src} alt="" draggable={false} className={cn('pointer-events-none absolute left-0 top-0 block w-full select-none', className)} style={style} />
}

/** A6/A7/A9/A11/A12 page header: floral motif + pink wash (Figma “Pink aura (from sheet)”). */
export function PinkPageAura({ blobs = true }: { blobs?: boolean }) {
  return (
    <>
      <PatternImg src={pinkAuraPage} />
      {blobs && (
        <>
          <AuraBlob x={10} y={-42} w={369} h={79} color="#ffbad5" />
          <AuraBlob x={-33} y={7} w={162} h={31} color="#df93fe" />
          <AuraBlob right={-28} y={-4} w={162} h={39} color="#ffe6c9" />
        </>
      )}
    </>
  )
}

/** Pink sheet header (A3, A4*, A8, A10): floral motif over white + rose/violet/peach auras. */
export function PinkSheetAura() {
  return (
    <>
      <PatternImg src={floralSheet} />
      <AuraBlob x={2} y={-42} w={369} h={79} color="#ffbad5" />
      <AuraBlob x={-41} y={7} w={162} h={31} color="#df93fe" />
      <AuraBlob right={-36} y={-4} w={162} h={39} color="#ffe6c9" />
    </>
  )
}

/** Violet sheet header (B2, B3, B5): lattice over white + blue/cyan/violet auras. */
export function VioletSheetAura() {
  return (
    <>
      <PatternImg src={latticeSheet} />
      <AuraBlob x={2} y={-42} w={369} h={79} color="#b0bbff" />
      <AuraBlob x={-41} y={7} w={162} h={31} color="#74ffff" />
      <AuraBlob right={-36} y={-4} w={162} h={39} color="#cfacff" />
    </>
  )
}

/**
 * B0/B4–B6/C1/C2/E* page header: lattice over #FDFDFD + blue/cyan/periwinkle
 * auras (positions from B0; screens may pass their own blobs instead).
 */
export function LatticePageAura({ blobs = true }: { blobs?: boolean }) {
  return (
    <>
      <PatternImg src={latticePage} />
      {blobs && (
        <>
          <AuraBlob x={18} y={-2} w={369} h={277} color="#afb9ff" blur={300} />
          <AuraBlob x={-40} y={17} w={162} h={31} color="#74ffff" />
          <AuraBlob right={-41} y={16} w={162} h={102} color="#b078ff" blur={150} />
        </>
      )}
    </>
  )
}
