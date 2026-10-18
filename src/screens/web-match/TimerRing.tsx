import { motion, useTransform, type MotionValue } from 'motion/react'
import { cn } from '@/ui'

/**
 * DS “Timer ring” (834:79275), 56px: #FFE1ED track (ring, inner radius 84%),
 * pink “time left” arc from 12 o’clock clockwise, white face (46px) and a
 * Bold 14 pink countdown. The arc is driven by a motion value so it drains
 * smoothly at 60fps while the label only re-renders once a second.
 */
const SIZE = 56
const STROKE = SIZE / 2 * (1 - 0.84) // 4.48
const R = SIZE / 2 - STROKE / 2 // 25.76
const C = 2 * Math.PI * R

export function TimerRing({
  leftMs,
  totalMs,
  seconds,
  className,
  'data-anno': anno,
}: {
  leftMs: MotionValue<number>
  totalMs: number
  seconds: number
  className?: string
  'data-anno'?: string
}) {
  const offset = useTransform(leftMs, (v) => C * (1 - Math.min(1, Math.max(0, v / totalMs))))
  const label = `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`
  return (
    <div
      data-anno={anno}
      role="timer"
      aria-label={`${seconds} seconds left`}
      className={cn('relative size-14 shrink-0', className)}
    >
      <svg width={SIZE} height={SIZE} viewBox={`0 0 ${SIZE} ${SIZE}`} className="absolute inset-0" aria-hidden>
        <circle cx={SIZE / 2} cy={SIZE / 2} r={R} fill="none" stroke="#ffe1ed" strokeWidth={STROKE} />
        <motion.circle
          cx={SIZE / 2}
          cy={SIZE / 2}
          r={R}
          fill="none"
          stroke="#dd1564"
          strokeWidth={STROKE}
          strokeDasharray={C}
          style={{ strokeDashoffset: offset }}
          transform={`rotate(-90 ${SIZE / 2} ${SIZE / 2})`}
        />
        <circle cx={SIZE / 2} cy={SIZE / 2} r={23} fill="#fff" />
      </svg>
      <span className="tabular absolute inset-0 flex items-center justify-center text-[14px] font-bold leading-none text-pink">{label}</span>
    </div>
  )
}
