import type { ReactNode } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { HandHeart, Heart, HourglassMedium, LockSimple, Tag as TagIcon } from '@phosphor-icons/react'
import { PRODUCTS, type ProductId } from '@/data/products'
import { ProductPhoto, cn } from '@/ui'

/**
 * DS “Pick card” (834:79203): Default / Held / Taken / Changed.
 * White, radius 16, 1px #F1F1F1 inside stroke (Held: 1.5px violet),
 * shadow 0 6 8 /4%, padding 10 14 12 12 inside the stroke (so 11 15 13 13
 * here, the stroke being an overlay), gap 12. Top row: 88px photo
 * (#F2F2F4, 1px #ECECEE, radius 14) + 240px info column (name Semibold 16,
 * quote DM Serif Italic 14/20 #3E3E3E, tags). Actions row 34px.
 */

const SPRING = { type: 'spring', stiffness: 520, damping: 34 } as const

export interface PickAnno {
  card?: string
  quote?: string
  tags?: string
  chip?: string
  primary?: string
  held?: string
  taken?: string
}

export function PickTag({ children, icon = 'lock', tone = 'plain' }: { children: ReactNode; icon?: 'lock' | 'tag'; tone?: 'plain' | 'violet' }) {
  const color = tone === 'violet' ? '#5a39e3' : '#3e3e3e'
  return (
    <span
      className={cn(
        'inline-flex h-5 items-center gap-1 whitespace-nowrap rounded-full px-2 text-[12px] font-semibold leading-[normal]',
        tone === 'violet' ? 'bg-violet-tint text-violet' : 'bg-[#f4f4f6] text-ink-3',
      )}
    >
      {icon === 'lock' ? <LockSimple size={12} color={color} /> : <TagIcon size={12} color={color} />}
      {children}
    </span>
  )
}

function Photo({ id }: { id: ProductId }) {
  return (
    <div className="relative size-[88px] shrink-0 overflow-hidden rounded-[14px] bg-[#f2f2f4]">
      {/* Figma places the photo at (1, 1) inside the clipped 88px frame. */}
      <ProductPhoto id={id} className="absolute left-px top-px size-[88px]" rounded={14} />
      <span aria-hidden className="pointer-events-none absolute inset-0 rounded-[14px] border border-[#ececee]" />
    </div>
  )
}

export function PickCard({
  id,
  quote,
  tags,
  taken,
  held = false,
  heldLeft = '24h left',
  saved = false,
  onToggleSave,
  primaryLabel = 'I’ll get this',
  onPrimary,
  onRelease,
  anno = {},
  className,
}: {
  id: ProductId
  quote?: string
  tags?: ReactNode
  /** “Taken by Mom”: no actions, a quiet line instead. */
  taken?: boolean
  held?: boolean
  heldLeft?: string
  saved?: boolean
  onToggleSave?: () => void
  primaryLabel?: string
  onPrimary?: () => void
  onRelease?: () => void
  anno?: PickAnno
  className?: string
}) {
  const p = PRODUCTS[id]
  return (
    <motion.div
      data-anno={anno.card}
      className={cn(
        'relative flex flex-col gap-3 rounded-[16px] bg-white pb-[13px] pl-[13px] pr-[15px] pt-[11px] shadow-[0_6px_8px_rgba(0,0,0,0.04)]',
        className,
      )}
    >
      {/* Stroke as an overlay so the Held ring can animate without reflow. */}
      <motion.span
        aria-hidden
        className="pointer-events-none absolute inset-0 rounded-[16px] border-solid"
        initial={false}
        animate={{ borderColor: held ? '#5a39e3' : '#f1f1f1', borderWidth: held ? 1.5 : 1 }}
        transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
      />
      {/* One soft violet ripple the moment a pick is held. */}
      <AnimatePresence initial={false}>
        {held && (
          <motion.span
            key="pulse"
            aria-hidden
            className="pointer-events-none absolute inset-0 rounded-[16px]"
            initial={{ boxShadow: '0 0 0 0px rgba(90,57,227,0.32)' }}
            animate={{ boxShadow: '0 0 0 12px rgba(90,57,227,0)' }}
            exit={{ opacity: 0, transition: { duration: 0.1 } }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          />
        )}
      </AnimatePresence>

      <div className="flex gap-3">
        <Photo id={id} />
        <div className="flex min-w-0 max-w-[240px] flex-1 flex-col gap-2">
          {taken ? (
            <>
              <div className="flex flex-col gap-[6px]">
                <p className="text-[16px] font-semibold leading-[normal] text-black">{p.name}</p>
                <div data-anno={anno.taken} className="flex items-center gap-[6px] pt-[2px]">
                  <HandHeart size={16} color="#5a39e3" />
                  <span className="text-[14px] font-semibold leading-[normal] text-violet">Taken by Mom</span>
                </div>
              </div>
              <p className="text-[12px] leading-4 text-muted">Priya’s app hides this. Keep it between you two.</p>
            </>
          ) : (
            <>
              <p className="text-[16px] font-semibold leading-[normal] text-black">{p.name}</p>
              {quote && (
                <p data-anno={anno.quote} className="serif text-[14px] italic leading-5 text-ink-3">
                  {quote}
                </p>
              )}
              <div data-anno={anno.tags} className="flex flex-wrap gap-[6px] pt-[2px]">
                {tags}
              </div>
            </>
          )}
        </div>
      </div>

      {!taken && (
        <div className="flex h-[34px] items-center gap-2">
          <div className="relative flex min-w-0 flex-1 items-center">
            <AnimatePresence initial={false} mode="popLayout">
              {held ? (
                <motion.div
                  key="held"
                  data-anno={anno.held}
                  className="flex items-center gap-[6px]"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 8, transition: { duration: 0.16 } }}
                  transition={SPRING}
                >
                  <motion.span
                    className="flex"
                    initial={{ rotate: -180, scale: 0.6 }}
                    animate={{ rotate: 0, scale: 1 }}
                    transition={{ type: 'spring', stiffness: 260, damping: 18, delay: 0.04 }}
                  >
                    <HourglassMedium size={16} color="#5a39e3" />
                  </motion.span>
                  <div className="flex flex-col gap-[2px]">
                    <span className="whitespace-nowrap text-[14px] font-semibold leading-[normal] text-violet">Held for you · {heldLeft}</span>
                    <motion.button
                      type="button"
                      onClick={onRelease}
                      whileTap={{ opacity: 0.5 }}
                      className="self-start whitespace-nowrap text-left text-[12px] leading-[normal] text-muted-2"
                    >
                      Release it anytime
                    </motion.button>
                  </div>
                </motion.div>
              ) : (
                <motion.button
                  key={saved ? 'saved' : 'save'}
                  type="button"
                  data-anno={anno.chip}
                  aria-pressed={saved}
                  onClick={onToggleSave}
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8, transition: { duration: 0.14 } }}
                  whileTap={{ scale: 0.94 }}
                  transition={SPRING}
                  className={cn(
                    'inline-flex h-[34px] items-center gap-[6px] rounded-full border pl-3 pr-[14px] text-[14px] leading-[normal]',
                    saved ? 'border-violet bg-violet-tint font-semibold text-violet' : 'border-line-2 bg-white font-medium text-black',
                  )}
                >
                  <motion.span
                    className="flex"
                    initial={saved ? { scale: 0.4 } : false}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', stiffness: 700, damping: 16 }}
                  >
                    <Heart size={16} weight={saved ? 'fill' : 'regular'} color={saved ? '#5a39e3' : '#3e3e3e'} />
                  </motion.span>
                  {saved ? 'Saved' : 'Save'}
                </motion.button>
              )}
            </AnimatePresence>
          </div>
          <motion.button
            type="button"
            data-anno={anno.primary}
            onClick={onPrimary}
            whileTap={onPrimary ? { scale: 0.95 } : undefined}
            transition={SPRING}
            className={`inline-flex h-[34px] shrink-0 items-center justify-center whitespace-nowrap rounded-full bg-violet px-4 text-[14px] font-semibold leading-[normal] text-white transition-[filter] ${onPrimary ? 'hover:brightness-[1.06] active:brightness-95' : 'pointer-events-none'}`}
          >
            {primaryLabel}
          </motion.button>
        </div>
      )}
    </motion.div>
  )
}
