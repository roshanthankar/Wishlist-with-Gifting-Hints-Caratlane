import type { ProductId } from '@/data/products'
import { Button, ListGroup, PrivacyFootnote, SectionLabel, SheetHeader } from '@/ui'
import { InfoRow, PickTile } from '../wishlist-priya/parts'
import { HINT_PICKS, SAVED_COUNT, useSentPicks } from '../wishlist-priya/hintState'

/**
 * B5 · “Edit your picks”: same link, updated quietly. Figma: header y 30,
 * gap 16, picks + “Good to know” (gap 20), CTA 50, footnote.
 */
export function EditPicks({ onClose, onUpdate }: { onClose: () => void; onUpdate: () => void }) {
  const [picks, setPicks] = useSentPicks()
  const toggle = (id: ProductId) =>
    setPicks((p) => (p.includes(id) ? p.filter((x) => x !== id) : HINT_PICKS.filter((x) => x === id || p.includes(x))))

  return (
    <>
      <div className="mt-[2px] flex flex-col gap-2" data-anno="b5-header">
        <SheetHeader title="Edit your picks" tone="violet" onClose={onClose} />
        <p className="text-[14px] leading-5 text-ink-3">Same link. Rahul sees the update next time.</p>
      </div>

      <div className="flex flex-col gap-5">
        <div className="flex flex-col gap-[14px]">
          <SectionLabel
           
            right={
              <span className="flex items-center">
                <span className="font-medium tabular">
                  {picks.length} of {SAVED_COUNT} ·&nbsp;
                </span>
                <button type="button" className="pointer-events-none font-semibold text-violet">
                  See all
                </button>
              </span>
            }
          >
            Your picks
          </SectionLabel>
          <div className="grid grid-cols-3 gap-2" data-anno="b5-picks">
            {HINT_PICKS.map((id) => (
              <PickTile key={id} id={id} selected={picks.includes(id)} onToggle={() => toggle(id)} data-anno={id === 'hearts-vine' ? 'b5-removed' : undefined} />
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-[14px]">
          <SectionLabel>Good to know</SectionLabel>
          <ListGroup>
            <InfoRow data-anno="b5-holds" title="Removing a pick never cancels a hold" caption="And we won’t say whether it had one" />
            <InfoRow data-anno="b5-limit" title="Add up to 6 picks" caption="Same settings: price ranges, holds, size" />
          </ListGroup>
        </div>
      </div>

      <Button weight="medium" size="md" block disabled={picks.length === 0} onClick={onUpdate} data-anno="b5-update">
        Update hint
      </Button>
      <PrivacyFootnote data-anno="b5-footnote">
        Same link · nothing new is sent to Rahul
      </PrivacyFootnote>
    </>
  )
}
