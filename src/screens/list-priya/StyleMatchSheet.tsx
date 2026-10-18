import { Sheet, SheetHeader } from '@/ui'
import type { ProductId } from '@/data/products'
import { useProtoState } from '@/proto/store'
import { MessagePreview, PickRow, SheetCopy, SheetFootnote, ToggleItem, ToggleList, WhatsAppSend, toggleId } from './parts'

/**
 * A10 · “Play Style match with Priya” (834:38120): Rahul’s shortlist hides
 * among look-alikes in a 30-second game for two, sent on WhatsApp.
 */
export function StyleMatchSheet({
  open,
  items,
  onClose,
  onSend,
}: {
  open: boolean
  items: ProductId[]
  onClose: () => void
  onSend: () => void
}) {
  const [picks, setPicks] = useProtoState<ProductId[]>('list.match.picks', items)
  const [lookalikes, setLookalikes] = useProtoState('list.match.lookalikes', true)
  const [hidePrices, setHidePrices] = useProtoState('list.match.hidePrices', true)
  const selected = picks.filter((id) => items.includes(id))

  return (
    <Sheet open={open} onClose={onClose} tone="pink" label="Play Style match with Priya">
      <div className="flex flex-col gap-4">
        <div data-anno="match-title" className="flex flex-col gap-2">
          <SheetHeader title="Play Style match with Priya" onClose={onClose} />
          <SheetCopy>CaratLane’s 30-second game for two. You both swipe; she sees how well your styles match. You also see what she loved.</SheetCopy>
        </div>

        <PickRow
          data-anno="match-picks"
          label="1 · Mix in your shortlist"
          ids={items}
          selected={selected}
          onToggle={(id) => setPicks(toggleId(selected, id, items))}
        />

        <MessagePreview data-anno="match-preview" who="Priya">
          “Style match? 30 seconds. Let’s see if we match.”
        </MessagePreview>

        <ToggleList label="2 · How it plays">
          <ToggleItem
            data-anno="match-lookalikes"
            title="Mix in look-alikes"
            caption="5 similar pieces, so your picks don’t stand out"
            checked={lookalikes}
            onChange={setLookalikes}
          />
          <ToggleItem data-anno="match-prices" title="Hide prices" caption="She picks on looks alone" checked={hidePrices} onChange={setHidePrices} />
        </ToggleList>
      </div>

      <WhatsAppSend data-anno="match-send" disabled={selected.length === 0} onClick={onSend}>
        Send to Priya on WhatsApp
      </WhatsAppSend>
      <SheetFootnote data-anno="match-footnote">She sees a game for two, never your shortlist</SheetFootnote>
    </Sheet>
  )
}
