import { AnimatePresence, motion } from 'motion/react'
import { CaretRight } from '@phosphor-icons/react'
import { CreateListCard, GiftListCard, NavBar, ProductTile, Screen, ScrollView } from '@/ui'
import type { FrameId } from '@/proto/frames'
import type { FrameAnnotations } from '@/proto/annotations'
import type { ProductId } from '@/data/products'
import { useNav } from '@/proto/nav'
import { useProtoState } from '@/proto/store'
import { FIGMA_LEADING } from '../pdp/parts'

/**
 * Figma trims tag text to its cap height (an 8px line), and the pink tag has
 * no stroke: 20px tall pink, 22px with the 1px border on “New”. The shared
 * TileTag renders 26px (and sits 4px low on an inline line box), so the
 * tags in this grid are corrected locally.
 */
const TAG_FIX = String.raw`[&_.py-\[6px\].px-\[10px\]]:leading-[8px] [&_.border-pink-tint.py-\[6px\]]:border-0 [&_.left-\[9px\].top-\[9px\]]:flex`

/** “All saved” grid, in Figma order (A5 · 701:13774). */
const SAVED: { id: ProductId; tag: string; tone: 'pink' | 'plain'; meta: string }[] = [
  { id: 'vanki', tag: 'For Priya', tone: 'pink', meta: 'Yellow gold · Size 12' },
  { id: 'hearts-vine', tag: 'For Priya', tone: 'pink', meta: 'Yellow gold · Size 12' },
  { id: 'twist', tag: 'For Priya', tone: 'pink', meta: 'Yellow gold · Size 12' },
  { id: 'petite-cluster', tag: 'New', tone: 'plain', meta: 'Yellow gold · Set of 3' },
]

export const annotations: FrameAnnotations = {
  A5: [
    {
      id: 'nav',
      title: 'Wishlist',
      body: 'The same Wishlist Rahul already knows. Gifting doesn’t add a new destination to learn; it reorganises this one.',
    },
    {
      id: 'gift-list-header',
      title: 'Gift lists first',
      body: 'Gift lists sit above everything saved, so planning for someone is the first thing Rahul sees. The chevron opens all lists once there is more than one.',
    },
    {
      id: 'list-priya',
      title: 'For Priya',
      body: 'A list is a person, not a folder: two tilted photos of what is in it, a lock and a count. “Private” is stated up front because the list is a surprise.',
    },
    {
      id: 'create-list',
      title: 'Create gift list',
      body: 'Always the second card, so a new person or occasion is one tap away. The peeking rings hint at what a list looks like before it exists.',
    },
    {
      id: 'all-saved',
      title: 'All saved',
      body: 'Every heart, gifting or not, with a live count. Nothing saved for someone disappears from Rahul’s own wishlist.',
    },
    {
      id: 'tile-vanki',
      title: '“For Priya” tags',
      body: 'Pink tags show which saves already belong to a list, so the two views never disagree. Tapping a tile opens the product page.',
    },
    {
      id: 'tile-heart',
      title: 'Un-save in place',
      body: 'Tapping a filled heart removes the ring with a haptic, and the grid closes the gap with a layout animation instead of a jump.',
    },
    {
      id: 'tile-new',
      title: 'Neutral tags',
      body: 'Store tags like “New” stay white and grey, so they never compete with the pink gifting tags.',
    },
  ],
}

/** Route `wishlist-rahul` (A5): Rahul’s wishlist with gift lists on top. */
export default function RahulWishlist({ frame: _frame }: { frame: FrameId }) {
  const { go, back } = useNav()
  const [removed, setRemoved] = useProtoState<ProductId[]>('wishlist.rahul.removed', [])
  const items = SAVED.filter((s) => !removed.includes(s.id))

  return (
    <Screen bg="#fdfdfd" className={FIGMA_LEADING}>
      <ScrollView bottomInset="calc(var(--safe-bottom-pad) + 12px)">
        <NavBar title="Wishlist" onBack={back} bg="#fdfdfd" data-anno="nav" />

        <div className="flex items-center gap-2 px-4 pb-3 pt-[6px]" data-anno="gift-list-header">
          <h2 className="text-[20px] font-semibold leading-6 text-black">Gift list</h2>
          <motion.button
            type="button"
            aria-label="All gift lists"
            onClick={() => go('A6')}
            whileTap={{ scale: 0.9 }}
            className="flex size-6 items-center justify-center rounded-full bg-[#efeff1]"
          >
            <CaretRight size={14} color="#000" />
          </motion.button>
        </div>

        <div className="flex gap-[14px] px-4">
          <GiftListCard title="For Priya" meta="Private · 3 saved" onClick={() => go('A6')} data-anno="list-priya" />
          <CreateListCard data-anno="create-list" />
        </div>

        <div className="flex items-center gap-[6px] whitespace-nowrap px-4 pb-3 pt-7 leading-[normal]" data-anno="all-saved">
          <h2 className="text-[20px] font-semibold text-black">All saved</h2>
          <motion.span key={items.length} initial={{ opacity: 0.3, y: -4 }} animate={{ opacity: 1, y: 0 }} className="text-[16px] font-medium text-muted">
            {items.length}
          </motion.span>
        </div>

        <motion.div layout className={`grid grid-cols-2 gap-x-[14px] gap-y-[18px] px-4 ${TAG_FIX}`} data-anno="saved-grid">
          <AnimatePresence mode="popLayout" initial={false}>
            {items.map((s, i) => (
              <motion.div
                key={s.id}
                layout
                className="min-w-0"
                exit={{ opacity: 0, scale: 0.86, transition: { duration: 0.2 } }}
                transition={{ type: 'spring', stiffness: 420, damping: 36 }}
                data-anno={i === 1 ? 'tile-heart' : undefined}
              >
                <ProductTile
                  id={s.id}
                  tag={s.tag}
                  tagTone={s.tone}
                  meta={s.meta}
                  onClick={() => go('A1')}
                  onToggleSaved={(v) => {
                    if (!v) setRemoved((r) => (r.includes(s.id) ? r : [...r, s.id]))
                  }}
                  data-anno={s.id === 'vanki' ? 'tile-vanki' : s.id === 'petite-cluster' ? 'tile-new' : undefined}
                />
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>

        <AnimatePresence>
          {items.length === 0 && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center gap-3 px-8 pt-6 text-center"
            >
              <p className="text-[14px] leading-5 text-muted">Nothing saved yet. Tap the heart on any piece to keep it here.</p>
              <button type="button" onClick={() => setRemoved([])} className="text-[14px] font-semibold text-violet active:opacity-60">
                Undo
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </ScrollView>
    </Screen>
  )
}
