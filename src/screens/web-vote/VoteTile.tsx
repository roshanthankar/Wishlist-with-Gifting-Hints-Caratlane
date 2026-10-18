import { AnimatePresence, motion } from 'motion/react'
import { Check } from '@phosphor-icons/react'
import { PRODUCTS, type ProductId } from '@/data/products'
import { ProductPhoto, cn } from '@/ui'

/**
 * DS “Vote tile” (834:79251), 110 wide (fluid: one third of the row):
 * square photo, radius 12, 2px border (#5A39E3 selected, #E4E4E7 not);
 * 22px badge 10px from the top-right (violet + Check 14 bold, or white 90%
 * with a 1.5px #BDBDC4 ring); caption pt 4 gap 2: name Semibold 14,
 * then “Your vote” Semibold 12 violet or the metal Regular 12 #767676.
 */
export function VoteTile({
  id,
  selected,
  onSelect,
  className,
}: {
  id: ProductId
  selected: boolean
  onSelect: () => void
  className?: string
}) {
  const p = PRODUCTS[id]
  return (
    <motion.button
      type="button"
      role="radio"
      aria-checked={selected}
      aria-label={`${p.short}, ${p.metal}`}
      onClick={onSelect}
      whileTap={{ scale: 0.96 }}
      transition={{ type: 'spring', stiffness: 520, damping: 30 }}
      className={cn('flex min-w-0 flex-col items-center gap-1 text-center', className)}
    >
      <span className="relative block aspect-square w-full overflow-hidden rounded-[12px]">
        <ProductPhoto id={id} className="absolute inset-0" rounded={12} />
        <span
          className={cn(
            'pointer-events-none absolute inset-0 rounded-[12px] border-2 border-solid transition-colors duration-200',
            selected ? 'border-violet' : 'border-[#e4e4e7]',
          )}
        />
        <span className="absolute right-[10px] top-[10px] size-[22px]">
          <span className="absolute inset-0 rounded-full border-[1.5px] border-solid border-[#bdbdc4] bg-white/90" />
          <AnimatePresence initial={false}>
            {selected && (
              <motion.span
                key="on"
                className="absolute inset-0 flex items-center justify-center rounded-full bg-violet"
                initial={{ scale: 0.3, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.3, opacity: 0 }}
                transition={{ type: 'spring', stiffness: 700, damping: 22 }}
              >
                <Check size={14} weight="bold" color="#fff" />
              </motion.span>
            )}
          </AnimatePresence>
        </span>
      </span>
      <span className="flex max-w-full flex-col items-center gap-[2px] pt-1">
        <span className="max-w-full truncate text-[14px] font-semibold leading-none text-black">{p.short}</span>
        <span className="relative h-3 w-full">
          <AnimatePresence initial={false} mode="popLayout">
            <motion.span
              key={selected ? 'vote' : 'metal'}
              className={cn(
                'absolute inset-x-0 top-0 whitespace-nowrap text-[12px] leading-none',
                selected ? 'font-semibold text-violet' : 'font-normal text-muted',
              )}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.18 }}
            >
              {selected ? 'Your vote' : p.metal}
            </motion.span>
          </AnimatePresence>
        </span>
      </span>
    </motion.button>
  )
}
