import { useRef, type CSSProperties } from 'react'
import { MotionConfig } from 'motion/react'
import { Stage } from '@/proto/Stage'
import { AnnotationLayer } from '@/proto/annotations'
import { useEnv } from '@/proto/env'
import { useNav } from '@/proto/nav'
import { FRAMES } from '@/proto/frames'

/**
 * The app viewport. In the mockup it is the iPhone 17 screen (402×874) with
 * a Dynamic Island and home indicator; on a real phone it is the browser
 * viewport and safe areas come from the device.
 */
export function PhoneScreen({ scale = 1 }: { scale?: number }) {
  const { mockup, mode } = useEnv()
  const { frame } = useNav()
  const ref = useRef<HTMLDivElement>(null)
  const vars = (mockup
    ? { '--safe-top': '62px', '--safe-bottom-pad': '36px' }
    : {
        '--safe-top': 'env(safe-area-inset-top, 0px)',
        '--safe-bottom-pad': 'max(16px, calc(env(safe-area-inset-bottom, 0px) + 8px))',
      }) as CSSProperties

  return (
    <MotionConfig reducedMotion="user" transformPagePoint={scale === 1 ? undefined : (p) => ({ x: p.x / scale, y: p.y / scale })}>
      <div ref={ref} className="relative h-full w-full overflow-hidden bg-black" style={vars} data-phone-screen>
        <Stage />
        <AnnotationLayer rootRef={ref} scale={scale} />
        {mode === 'mockup' && (
          <>
            {/* Dynamic Island (iOS 27 status bar: 125×37 at y 14) */}
            <div aria-hidden className="pointer-events-none absolute left-1/2 top-[11px] z-[100] h-[37px] w-[125px] -translate-x-1/2 rounded-full bg-black" />
            <div
              aria-hidden
              className="pointer-events-none absolute bottom-2 left-1/2 z-[100] h-[5px] w-[140px] -translate-x-1/2 rounded-full transition-colors duration-500"
              style={{ background: FRAMES[frame].dark ? 'rgba(255,255,255,0.9)' : 'rgba(0,0,0,0.92)' }}
            />
          </>
        )}
      </div>
    </MotionConfig>
  )
}
