import { useLayoutEffect, useRef, useState, type CSSProperties } from 'react'
import { PhoneScreen } from './PhoneScreen'

/**
 * iPhone 17 (2025), drawn to scale in points (≈6.04 pt per mm):
 *   body 71.5 × 149.6 mm → 432 × 904 pt; display 6.3″, 402 × 874 pt @3x (1206 × 2622 px)
 *   ~15 pt borders (aluminium band + black glass edge), 62 pt display corners
 *   (same panel as iPhone 16 Pro), concentric 77 pt body corners
 *   Dynamic Island 125 × 37 pt, 11 pt from the top of the display
 *   Left: Action button, volume up, volume down. Right: side button, Camera Control.
 *   Finish: Lavender aluminium.
 */
const SCREEN_W = 402
const SCREEN_H = 874
const BORDER = 15
const BAND = 5 // visible aluminium band from the front
const SCREEN_R = 62
const BODY_W = SCREEN_W + BORDER * 2 // 432
const BODY_H = SCREEN_H + BORDER * 2 // 904
const BODY_R = SCREEN_R + BORDER // 77

/** Scales down to fit the stage; drag gestures are corrected for the scale. */
export function Device() {
  const box = useRef<HTMLDivElement>(null)
  const [scale, setScale] = useState(1)

  useLayoutEffect(() => {
    const el = box.current
    if (!el) return
    const ro = new ResizeObserver(([e]) => {
      const { width, height } = e.contentRect
      const s = Math.min(1, (height - 4) / BODY_H, (width - 24) / (BODY_W + 8))
      setScale(Math.max(0.45, Math.round(s * 1000) / 1000))
    })
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  return (
    <div ref={box} className="flex min-h-0 w-full flex-1 items-center justify-center">
      <div style={{ width: BODY_W * scale, height: BODY_H * scale }} className="relative shrink-0">
        <div className="absolute left-0 top-0 origin-top-left" style={{ width: BODY_W, height: BODY_H, transform: `scale(${scale})` }}>
          {/* Left: Action button, volume up, volume down */}
          <SideButton side="left" top={172} h={36} />
          <SideButton side="left" top={244} h={56} />
          <SideButton side="left" top={316} h={56} />
          {/* Right: side button, Camera Control (flush sapphire) */}
          <SideButton side="right" top={262} h={100} />
          <SideButton side="right" top={498} h={62} camera />

          {/* Lavender aluminium frame */}
          <div
            className="absolute inset-0"
            style={{
              borderRadius: BODY_R,
              background: 'linear-gradient(145deg, #ece5f7 0%, #d5c9ec 30%, #c7b9e3 55%, #d2c6ea 78%, #e8e1f5 100%)',
              boxShadow: [
                '0 50px 100px -30px rgba(40, 28, 80, 0.38)',
                '0 24px 48px -24px rgba(0, 0, 0, 0.35)',
                'inset 0 0 0 0.75px rgba(120, 100, 170, 0.55)',
                'inset 0 1.5px 1px rgba(255, 255, 255, 0.85)',
                'inset 0 -1.5px 1px rgba(150, 132, 196, 0.6)',
              ].join(', '),
            }}
          />
          {/* Antenna lines across the band */}
          <Antenna style={{ left: 0, top: 96 }} />
          <Antenna style={{ right: 0, top: 96 }} />
          <Antenna style={{ left: 0, bottom: 96 }} />
          <Antenna style={{ right: 0, bottom: 96 }} />

          {/* Black glass border */}
          <div
            className="absolute bg-[#060608]"
            style={{
              inset: BAND,
              borderRadius: BODY_R - BAND,
              boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.07), inset 0 0 6px rgba(255,255,255,0.04)',
            }}
          />
          {/* Display */}
          <div className="absolute overflow-hidden bg-black" style={{ left: BORDER, top: BORDER, width: SCREEN_W, height: SCREEN_H, borderRadius: SCREEN_R }}>
            <PhoneScreen scale={scale} />
          </div>
        </div>
      </div>
    </div>
  )
}

function SideButton({ side, top, h, camera }: { side: 'left' | 'right'; top: number; h: number; camera?: boolean }) {
  return (
    <div
      aria-hidden
      className="absolute rounded-[3px]"
      style={{
        top,
        height: h,
        width: camera ? 3 : 4,
        [side]: camera ? -1.5 : -3,
        background: camera
          ? 'linear-gradient(90deg, #a596c8, #c6badf 50%, #a596c8)'
          : 'linear-gradient(90deg, #b9abdb, #e6def5 50%, #b9abdb)',
        boxShadow: '0 0 0 0.5px rgba(96, 78, 146, 0.4)',
      }}
    />
  )
}

function Antenna({ style }: { style: CSSProperties }) {
  return <div aria-hidden className="absolute h-[2px] bg-[#b3a5d4]/70" style={{ width: BAND, ...style }} />
}
