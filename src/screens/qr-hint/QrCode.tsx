import { useId, useRef } from 'react'
import { motion, useMotionValue, useMotionValueEvent, type MotionValue } from 'motion/react'

/**
 * “QR · dots” from Figma (B3b), rebuilt as inline SVG so the gradient can be
 * recoloured: a 29×29 module grid on an 8px pitch (232px), round dots
 * (r 3.36), rounded finder eyes (48px ring r16 + 24px core r8, 8px stroke),
 * and a rounded alignment eye. No centre image, as in Figma.
 * The module map below is read from the Figma vector (324 dots).
 */
const MODULES = [
  '00000000001110011011100000000',
  '00000000110111011001000000000',
  '00000000000100000011000000000',
  '00000000010000001000100000000',
  '00000000101001100111000000000',
  '00000000000011010100100000000',
  '00000000101010101010100000000',
  '00000000100110010100100000000',
  '01101110100010100110110011000',
  '11010100000110110110101001000',
  '10100110101111101101011100101',
  '01001000111100101000001100111',
  '01111111010010110001101110101',
  '01110000110000010001110111010',
  '01000111001111110101100000111',
  '00101101011001111110111111010',
  '00100011000111101101011100111',
  '00100101011010110110101010100',
  '01100111110011111100010111001',
  '00111000100101010011100111100',
  '11011110001001111111000000010',
  '00000000010110101100000001001',
  '00000000001101011011000001001',
  '00000000111010101010000000001',
  '00000000110010110101000000010',
  '00000000110101111110100001011',
  '00000000110011011110110110011',
  '00000000110010110001011000010',
  '00000000000001110100110000001',
]

const DOTS: [number, number][] = []
MODULES.forEach((row, j) => [...row].forEach((bit, i) => bit === '1' && DOTS.push([i * 8 + 4, j * 8 + 4])))

/** One path for all dots (two arcs each) keeps the DOM light. */
const R = 3.36
const DOT_PATH = DOTS.map(([x, y]) => `M${x - R} ${y}a${R} ${R} 0 1 0 ${R * 2} 0a${R} ${R} 0 1 0 ${-R * 2} 0`).join('')

const EYES: [number, number][] = [
  [10, 10],
  [174, 10],
  [10, 174],
]

export function QrCode({
  from,
  to,
  size = 232,
  className,
  spin,
}: {
  from: string
  to: string
  size?: number
  className?: string
  /** Turns the gradient (degrees) around the code’s centre, e.g. with the card’s tilt. */
  spin?: MotionValue<number>
}) {
  const id = `qr-${useId().replace(/[^a-zA-Z0-9-]/g, '')}`
  const grad = useRef<SVGLinearGradientElement>(null)
  const still = useMotionValue(0)
  useMotionValueEvent(spin ?? still, 'change', (v) => grad.current?.setAttribute('gradientTransform', `rotate(${v.toFixed(2)} 116 116)`))
  const fill = `url(#${id})`
  const t = { duration: 0.6, ease: [0.22, 1, 0.36, 1] as const }
  return (
    <svg width={size} height={size} viewBox="0 0 232 232" className={className} role="img" aria-label="QR code for your hint">
      <defs>
        <linearGradient ref={grad} id={id} gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="232" y2="232">
          <motion.stop offset="0" initial={false} animate={{ stopColor: from }} transition={t} />
          <motion.stop offset="1" initial={false} animate={{ stopColor: to }} transition={t} />
        </linearGradient>
      </defs>
      <path d={DOT_PATH} fill={fill} />
      {EYES.map(([x, y]) => (
        <g key={`${x}-${y}`}>
          <rect x={x} y={y} width="48" height="48" rx="16" fill="none" stroke={fill} strokeWidth="8" />
          <rect x={x + 12} y={y + 12} width="24" height="24" rx="8" fill={fill} />
        </g>
      ))}
      <rect x="164" y="164" width="32" height="32" rx="11.2" fill="none" stroke={fill} strokeWidth="8" />
      <circle cx="180" cy="180" r="4.8" fill={fill} />
    </svg>
  )
}
