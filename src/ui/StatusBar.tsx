import { useEnv } from '@/proto/env'
import { STATUS_LEVEL_PATHS } from './statusPaths'

/**
 * iOS 27 status bar, iPhone 17 (“Status bar” instance in every Figma frame):
 * 402×62, time in a 130px box at x=9, levels in a 130px box at x=264, y=26.
 * Only drawn inside the iPhone mockup; real phones show their own.
 */
export function StatusBar({ tone = 'dark' }: { tone?: 'dark' | 'light' }) {
  const { mockup } = useEnv()
  if (!mockup) return null
  const color = tone === 'light' ? '#fff' : '#000'
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-x-0 top-0 z-[60] h-[62px]"
      style={{ color }}
      data-status-bar
    >
      <div className="sf absolute left-[9px] top-[26px] flex h-[13px] w-[130px] items-center justify-center">
        <span className="text-[17px] font-semibold leading-[22px] tracking-[-0.43px]">9:41</span>
      </div>
      <div className="absolute right-[8px] top-[26px] flex h-[13px] w-[130px] items-center justify-center">
        <svg width="85.33" height="13" viewBox="0 0 85.3291 13" fill="currentColor">
          <path d={STATUS_LEVEL_PATHS.cellular} />
          <path d={STATUS_LEVEL_PATHS.wifi} fillRule="evenodd" clipRule="evenodd" />
          <path d={STATUS_LEVEL_PATHS.battery} fillRule="evenodd" clipRule="evenodd" />
        </svg>
      </div>
    </div>
  )
}
