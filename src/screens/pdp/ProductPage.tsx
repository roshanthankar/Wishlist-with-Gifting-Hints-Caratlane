import { useCallback, useEffect, type ReactNode } from 'react'
import { motion, useMotionValue, animate, type PanInfo } from 'motion/react'
import { Bag, Heart, ShareNetwork } from '@phosphor-icons/react'
import { BOTTOM_BAR_INSET, BottomBar, Button, NavBar, NavIcon, SavedToast, Screen, ScrollView, Toast } from '@/ui'
import type { FrameId } from '@/proto/frames'
import { useNav } from '@/proto/nav'
import { useProtoState } from '@/proto/store'
import { haptic } from '@/proto/haptics'
import { FIGMA_LEADING, MediaCarousel, PriceBlock } from './parts'
import { GiftingHints } from './GiftingHints'
import { AlsoLike, Assurance, Customise, DeliveryServices, InTheBox, ProductDetails, RecentlyViewed, Reviews, SeeItLiveCard, WhyLoveIt } from './sections'
import { GiftSheet } from './GiftSheet'
import { PREFILL, PickPanel, WhoPanel, type Occasion, type PickVariant, type Relationship } from './panels'

export { annotations } from './notes'

/** Which relationships land on which “A great pick” variant, and its default name. */
const PICK_FOR: Record<Relationship, PickVariant> = {
  Partner: 'A4',
  Mom: 'A4b',
  Sister: 'A4c',
  Friend: 'A4c',
  'Someone else': 'A4c',
}
const DEFAULT_NAME: Record<PickVariant, string> = { A4: 'Priya', A4b: 'Mom', A4c: 'Kavya' }

const isPick = (f: FrameId): f is PickVariant => f === 'A4' || f === 'A4b' || f === 'A4c'

/**
 * Route `pdp`: the product page (A1) and its in-place states — the Saved toast
 * (A2), “Who is this for?” (A3) and “A great pick for …” (A4 / A4b / A4c).
 * The frame drives what is visible; A3 → A4* morphs one mounted sheet.
 */
export default function ProductPage({ frame }: { frame: FrameId }) {
  const { go, back, stack } = useNav()
  const [saved, setSaved] = useProtoState('pdp.saved', false)
  const [relationship, setRelationship] = useProtoState<Relationship>('pdp.relationship', 'Partner')
  const [occasion, setOccasion] = useProtoState<Occasion>('pdp.occasion', 'Anniversary')
  const [name, setName] = useProtoState('pdp.name', PREFILL.Partner)

  // Every state after A1 implies the ring is saved (also when deep-linked).
  useEffect(() => {
    if (frame !== 'A1' && !saved) setSaved(true)
  }, [frame, saved, setSaved])
  const isSaved = frame !== 'A1' || saved

  const onHeart = () => {
    if (isSaved) {
      setSaved(false)
      if (frame !== 'A1') go('A1')
    } else {
      haptic()
      setSaved(true)
      go('A2')
    }
  }

  const closeSheet = useCallback(() => go('A1'), [go])

  // The name shown on A4* follows what Rahul typed, if it fits that variant.
  const pickName = (v: PickVariant) => (PICK_FOR[relationship] === v && name.trim() ? name.trim() : DEFAULT_NAME[v])

  const sheetOpen = frame === 'A3' || isPick(frame)

  return (
    <Screen bg="#fdfdfd" className={FIGMA_LEADING}>
      <ScrollView bottomInset={BOTTOM_BAR_INSET}>
        <NavBar
          title="Classic 9KT Gold Vanki Ring"
          onBack={stack.length > 1 ? back : null}
          data-anno="nav"
          right={
            <>
              <NavIcon label="Share">
                <ShareNetwork size={24} />
              </NavIcon>
              <NavIcon label="Wishlist" onClick={() => go('A5', { leaveAs: 'A1' })}>
                <Heart size={24} />
              </NavIcon>
              <NavIcon label="Bag">
                <Bag size={24} />
              </NavIcon>
            </>
          }
        />
        {/* The whole product page (656:5592), in CaratLane’s order after the price and the gifting banner. */}
        <div className="flex flex-col gap-6 pt-[2px]">
          <MediaCarousel saved={isSaved} onHeart={onHeart} active={frame === 'A1' || frame === 'A2'} />
          <PriceBlock />
          <GiftingHints
            active={frame === 'A1' || frame === 'A2'}
            onStart={() => {
              haptic()
              setSaved(true)
              go('A3')
            }}
          />
          <Customise />
          <DeliveryServices />
          <SeeItLiveCard />
          <Assurance />
          <WhyLoveIt />
          <ProductDetails />
          <InTheBox />
          <Reviews />
          <AlsoLike />
          <RecentlyViewed />
        </div>
      </ScrollView>

      <BottomBar fade="#fdfdfd">
        <Button variant="secondary" block="flex" data-anno="see-live">
          See it Live
        </Button>
        <Button block="flex" data-anno="add-to-bag">
          Add to Bag
        </Button>
      </BottomBar>

      <Toast open={frame === 'A2'} bottom={96}>
        <DismissableToast onDismiss={() => go('A1')}>
          <SavedToast data-anno="toast" onAction={() => go('A3')} />
        </DismissableToast>
      </Toast>

      <GiftSheet
        open={sheetOpen}
        onClose={closeSheet}
        panelKey={frame === 'A3' ? 'who' : frame}
        label={frame === 'A3' ? 'Who is this for?' : 'A great pick'}
        data-anno="sheet"
      >
        {frame === 'A3' ? (
          <WhoPanel
            relationship={relationship}
            occasion={occasion}
            name={name}
            onRelationship={(r) => {
              setRelationship(r)
              setName(PREFILL[r])
            }}
            onOccasion={setOccasion}
            onName={setName}
            onClose={closeSheet}
            onSave={() => {
              haptic('success')
              go(PICK_FOR[relationship])
            }}
          />
        ) : isPick(frame) ? (
          <PickPanel
            variant={frame}
            name={pickName(frame)}
            onClose={closeSheet}
            onKeepBrowsing={closeSheet}
            onViewList={frame === 'A4' ? () => go('A6', { leaveAs: 'A1' }) : undefined}
          />
        ) : null}
      </GiftSheet>
    </Screen>
  )
}

/** Swipe the toast down to dismiss it, like an iOS banner. */
function DismissableToast({ children, onDismiss }: { children: ReactNode; onDismiss: () => void }) {
  const y = useMotionValue(0)
  const onDragEnd = (_: unknown, info: PanInfo) => {
    if (info.offset.y > 36 || info.velocity.y > 500) onDismiss()
    else animate(y, 0, { type: 'spring', stiffness: 500, damping: 34 })
  }
  return (
    <motion.div style={{ y }} drag="y" dragConstraints={{ top: 0, bottom: 0 }} dragElastic={{ top: 0.05, bottom: 0.6 }} onDragEnd={onDragEnd}>
      {children}
    </motion.div>
  )
}
