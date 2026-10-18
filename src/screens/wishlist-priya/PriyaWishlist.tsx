import { useEffect, useRef } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { CaretRight } from '@phosphor-icons/react'
import type { FrameId } from '@/proto/frames'
import type { FrameAnnotations } from '@/proto/annotations'
import { useNav } from '@/proto/nav'
import { useProtoState } from '@/proto/store'
import { haptic } from '@/proto/haptics'
import type { ProductId } from '@/data/products'
import { Button, CreateListCard, GiftListCard, NavBar, Screen, ScrollView, Sheet } from '@/ui'
import nudgeLattice from '@/assets/hint/nudge-lattice.webp'
import { useSavedDates } from '../dates/savedDates'
import { ComposeStep } from './ComposeSheet'
import { SendStep } from './SendSheet'
import { SavedTile } from './SavedTile'
import { MorphHeight } from './parts'

export const annotations: FrameAnnotations = {
  B1: [
    { id: 'b1-nav', title: 'Priya’s wishlist', body: 'The hint lives where Priya already saves things, not in a separate gifting tool Priya has to discover.' },
    { id: 'b1-nudge', title: 'Hint nudge', body: 'A saved date triggers this card 14 days out, inside the wishlist, at the moment a hint feels natural rather than pushy.' },
    { id: 'b1-nudge-cta', title: 'Drop a hint', body: 'One violet action. Violet always means “from Priya”, so the colour already says who the hint is from.' },
    { id: 'b1-nudge-source', title: 'From your saved dates', body: 'Says why the nudge appeared and links back to the dates, so Priya can change or switch it off.' },
    { id: 'b1-giftlist', title: 'Gift list', body: 'Lists stay above everything saved; the same structure Rahul sees, so both sides learn one wishlist.' },
    { id: 'b1-mywishlist', title: 'Private by default', body: 'The lock and “Private · 6 saved” make clear nothing here is shared until Priya chooses to hint.' },
    { id: 'b1-create', title: 'Create gift list', body: 'Planning for someone else is one tap away, the mirror of Rahul’s flow.' },
    { id: 'b1-saved', title: 'All saved', body: 'The count tells Priya how much there is to hint from, before the sheet opens.' },
    { id: 'b1-tags', title: 'Live tags', body: '25% off, Price dropped, 1K+ loved, New: small reasons to come back, kept out of the photo’s way.' },
    { id: 'b1-heart', title: 'Saved heart', body: 'Tap to unsave, with a quick pop. It sits bottom-right, away from the tag, so it is never hit by mistake.' },
  ],
  B2: [
    { id: 'b2-header', title: 'Step 1 of 2', body: 'Sets expectations up front: Rahul sees the picks and this message, nothing else from the wishlist.' },
    { id: 'b2-picks', title: 'Pick what you’d love', body: 'Up to six picks from the wishlist, chosen in place. Clearing a pick takes its note with it.' },
    { id: 'b2-count', title: '3 of 6 · See all', body: 'A live count keeps the limit visible without an error state; “See all” opens the rest of the saved pieces.' },
    { id: 'b2-note', title: 'Note badge', body: 'A note per pick tells Rahul why it matters. “Add note” sits on picks without one, so writing stays optional.' },
    { id: 'b2-tone', title: 'Tone dial', body: 'Subtle, Clear or Very clear. Each one rewrites the message below, so Priya picks a feeling, not a template.' },
    { id: 'b2-message', title: 'What Rahul will see', body: 'The exact words, in the serif voice of a handwritten note, with Edit for Priya’s own wording.' },
    { id: 'b2-easy', title: 'Price ranges only', body: 'Rahul sees ₹9–10k until checkout, so the hint never feels like a price tag.' },
    { id: 'b2-hold', title: 'Let Rahul hold one', body: 'Holds stop double gifts when Mom gets the hint too; others just see that a pick is taken.' },
    { id: 'b2-size', title: 'Share my ring size', body: 'Size 12 travels with the hint, with an honest caption: anyone with the link can see it.' },
    { id: 'b2-cta', title: 'Choose how to share', body: 'The next step is about the channel, so the sheet morphs into it instead of closing and reopening.' },
    { id: 'b2-footnote', title: 'Revocable', body: 'The footnote promises only what a link can keep: Priya can revoke it anytime.' },
  ],
  B3: [
    { id: 'b3-header', title: 'Send your hint', body: '“Opens on any phone, no app or login needed” removes the biggest worry about sending a link to Rahul.' },
    { id: 'b3-preview', title: 'Link preview', body: 'The same three picks Rahul will see, so Priya knows exactly what is going out.' },
    { id: 'b3-link', title: 'Preview as Rahul', body: 'The short link with a Preview, to check the page before it lands.' },
    { id: 'b3-whatsapp', title: 'WhatsApp first', body: 'Where Priya and Rahul already talk. One tap sends it, with a haptic, and the hint tracker opens.' },
    { id: 'b3-targets', title: 'Backups', body: 'Copy link and Messages for everything else, in iOS-style glass buttons.' },
    { id: 'b3-qr', title: 'QR code', body: 'For a hint in the real world: a card Priya can print or leave on Rahul’s desk.' },
    { id: 'b3-footer', title: 'What’s shared', body: 'The footer repeats exactly what the link shares and when it expires, updated by the toggles in step 1.' },
  ],
}

type TagRow = { id: ProductId; tag: string; price?: string; mrp?: string | null; meta?: string }
const SAVED: TagRow[] = [
  { id: 'vanki', tag: '25% off' },
  { id: 'hearts-vine', tag: 'Price dropped' },
  { id: 'twist', tag: '1K+ loved' },
  { id: 'petite-cluster', tag: 'New', price: '₹28,990', mrp: '₹31,500', meta: 'Yellow gold · Set of 3' },
]

const SHEET_SPRING = { type: 'spring', stiffness: 360, damping: 38, mass: 0.9 } as const

export default function PriyaWishlist({ frame }: { frame: FrameId }) {
  const { go } = useNav()
  const [dates] = useSavedDates()
  const [saved, setSaved] = useProtoState<Record<string, boolean>>('wishlistPriya.saved', {})
  const step = frame === 'B2' ? 'compose' : frame === 'B3' ? 'send' : null
  const lastStep = useRef<'compose' | 'send'>('compose')
  const prevStep = useRef(step)
  // compose → send slides forward; send → compose slides back.
  const dir = step === 'compose' && prevStep.current === 'send' ? -1 : 1
  useEffect(() => {
    prevStep.current = step
  }, [step])
  if (step) lastStep.current = step
  const shown = step ?? lastStep.current

  const send = () => {
    haptic('success')
    go('B4', { leaveAs: 'B1' })
  }

  return (
    <Screen bg="#fdfdfd">
      <ScrollView edgeColor="#ffffff" bottomInset="calc(var(--safe-bottom-pad) + 8px)" backdrop={<div className="absolute inset-x-0 top-0 h-[118px] bg-white" />}>
        <NavBar title="Wishlist" onBack={null} data-anno="b1-nav" />

        <div className="pt-[6px]">
          <AnimatePresence initial={false}>{dates.anniversary && <HintNudge key="nudge" frame={frame} />}</AnimatePresence>

          <div className="flex items-center gap-2 px-4 pb-3 pt-[6px]" data-anno="b1-giftlist">
            <h2 className="text-[20px] font-semibold leading-[normal] text-black">Gift list</h2>
            <motion.button
              type="button"
              aria-label="All gift lists"
              className="pointer-events-none flex size-6 items-center justify-center rounded-full bg-[#efeff1]"
            >
              <CaretRight size={14} color="#000" />
            </motion.button>
          </div>

          <div className="flex gap-[14px] px-4">
            <GiftListCard
              data-anno="b1-mywishlist"
              title="My wishlist"
              meta="Private · 6 saved"
            />
            <CreateListCard icon="plus-circle" data-anno="b1-create" />
          </div>

          <div className="flex items-center gap-[6px] px-4 pb-3 pt-7" data-anno="b1-saved">
            <h2 className="text-[20px] font-semibold leading-[normal] text-black">All saved</h2>
            <span className="text-[16px] font-medium leading-[normal] text-muted">6</span>
          </div>

          <div className="grid grid-cols-2 gap-x-[14px] gap-y-[18px] px-4">
            {SAVED.map((t, i) => (
              <SavedTile
                key={t.id}
                id={t.id}
                tag={t.tag}
                price={t.price}
                mrp={t.mrp}
                meta={t.meta}
                data-anno={i === 0 ? 'b1-tags' : undefined}
                heartAnno={i === 1 ? 'b1-heart' : undefined}
                saved={saved[t.id] ?? true}
                onToggleSaved={(v) => setSaved((s) => ({ ...s, [t.id]: v }))}
              />
            ))}
          </div>
        </div>
      </ScrollView>

      <Sheet open={!!step} onClose={() => go('B1')} tone="violet" gap={0} label={shown === 'send' ? 'Send your hint' : 'Drop a hint'}>
        <MorphHeight className="-mx-5 px-5">
          <AnimatePresence mode="popLayout" initial={false} custom={dir}>
            <motion.div
              key={shown}
              custom={dir}
              variants={{
                enter: (d: number) => ({ opacity: 0, x: 36 * d }),
                center: { opacity: 1, x: 0, transition: { ...SHEET_SPRING, opacity: { duration: 0.24, delay: 0.06 } } },
                exit: (d: number) => ({ opacity: 0, x: -36 * d, transition: { ...SHEET_SPRING, opacity: { duration: 0.12 } } }),
              }}
              initial="enter"
              animate="center"
              exit="exit"
            >
              {shown === 'compose' ? (
                <ComposeStep onClose={() => go('B1')} onNext={() => go('B3')} />
              ) : (
                <SendStep onClose={() => go('B2')} onSend={send} onQr={() => go('B3b')} />
              )}
            </motion.div>
          </AnimatePresence>
        </MorphHeight>
      </Sheet>
    </Screen>
  )
}

/**
 * Hint nudge (B1): lattice-tint card, 14 days before a saved date. Animates in
 * softly the first time Priya sees it, and collapses if the date’s nudges are
 * switched off in B0.
 */
function HintNudge({ frame }: { frame: FrameId }) {
  const { go } = useNav()
  const reduce = useReducedMotion()
  const [seen, setSeen] = useProtoState('wishlistPriya.nudgeSeen', false)
  const intro = useRef(!seen && frame === 'B1' && !reduce)
  useEffect(() => {
    if (!seen) setSeen(true)
  }, [seen, setSeen])

  return (
    <motion.div
      className="overflow-hidden"
      initial={false}
      animate={{ height: 'auto', opacity: 1 }}
      exit={{ height: 0, opacity: 0 }}
      transition={{ type: 'spring', stiffness: 360, damping: 38 }}
    >
      <div className="px-4 pb-[14px] pt-[2px]">
        <motion.div
          data-anno="b1-nudge"
          className="relative flex items-center gap-[10px] overflow-hidden rounded-[10px] border border-[#f1f1f1] bg-white p-[10px] shadow-[0_8px_12px_rgba(83,50,219,0.06)]"
          initial={intro.current ? { opacity: 0, y: 10, scale: 0.98 } : false}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ type: 'spring', stiffness: 260, damping: 30, delay: 0.35 }}
        >
          <img
            src={nudgeLattice}
            alt=""
            aria-hidden
            draggable={false}
            className="pointer-events-none absolute left-[-1px] top-[-1px] max-w-none select-none"
            style={{ width: 'max(371px, calc(100% + 1px))' }}
          />
          <div className="relative flex min-w-0 flex-1 flex-col gap-[6px]">
            <p className="serif text-[18px] leading-[25px] text-violet">Anniversary in 14 days</p>
            <p className="text-[14px] leading-[18px] text-ink-3">Show Rahul what you’d love, so nothing’s left to guess.</p>
            <button
              type="button"
              data-anno="b1-nudge-source"
              onClick={() => go('B0')}
              className="self-start text-left text-[12px] leading-[normal] text-muted active:opacity-60"
            >
              From your saved dates
            </button>
          </div>
          <Button weight="medium" size="sm" className="relative" style={{ paddingInline: 20 }} onClick={() => go('B2')} data-anno="b1-nudge-cta">
            Drop a hint
          </Button>
        </motion.div>
      </div>
    </motion.div>
  )
}
