import { Chip, Sheet, SheetHeader } from '@/ui'
import type { ProductId } from '@/data/products'
import { useProtoState } from '@/proto/store'
import { Label, MessagePreview, PickRow, SheetCopy, SheetFootnote, ToggleItem, ToggleList, WhatsAppSend, toggleId } from './parts'

/** People Rahul can ask. The first name flows into the labels and the CTA. */
const PEOPLE = [
  { id: 'ananya', name: 'Ananya', label: 'Ananya · her sister' },
  { id: 'meera', name: 'Meera', label: 'Meera · her friend' },
  { id: 'mom', name: 'Mom', label: 'Mom' },
] as const
type PersonId = (typeof PEOPLE)[number]['id']

/**
 * A8 · “Ask someone close” (830:22669): pink sheet over the list. Rahul picks
 * who knows Priya’s taste, which pieces to compare and what to ask, then
 * sends a one-vote link on WhatsApp.
 */
export function AskSheet({
  open,
  items,
  onClose,
  onSend,
}: {
  open: boolean
  /** Pieces still on the list (the compare tiles). */
  items: ProductId[]
  onClose: () => void
  onSend: () => void
}) {
  const [person, setPerson] = useProtoState<PersonId>('list.ask.person', 'ananya')
  const [picks, setPicks] = useProtoState<ProductId[]>('list.ask.picks', items)
  const [size, setSize] = useProtoState('list.ask.size', true)
  const [hidePrices, setHidePrices] = useProtoState('list.ask.hidePrices', true)
  const name = PEOPLE.find((p) => p.id === person)?.name ?? 'Ananya'
  const selected = picks.filter((id) => items.includes(id))

  return (
    <Sheet open={open} onClose={onClose} tone="pink" label="Ask someone close">
      <div className="flex flex-col gap-5">
        <div data-anno="ask-title" className="flex flex-col gap-2">
          <SheetHeader title="Ask someone close" onClose={onClose} />
          <SheetCopy>They vote in secret from a link. Don’t share it with Priya; it closes after one vote.</SheetCopy>
        </div>

        <div data-anno="ask-who" className="flex flex-col gap-[14px]">
          <Label>1 · Who knows her taste?</Label>
          <div className="flex flex-wrap gap-2 [&>button]:leading-none">
            {PEOPLE.map((p) => (
              <Chip key={p.id} selected={person === p.id} onClick={() => setPerson(p.id)}>
                {p.label}
              </Chip>
            ))}
            <Chip>+ Contacts</Chip>
          </div>
        </div>

        <PickRow
          data-anno="ask-picks"
          label={`2 · What should ${name} compare?`}
          ids={items}
          selected={selected}
          onToggle={(id) => setPicks(toggleId(selected, id, items))}
        />

        <MessagePreview data-anno="ask-preview" who={name}>
          “Planning something for our anniversary. Which one would Priya actually wear? Don’t tell her!”
        </MessagePreview>

        <ToggleList label="3 · Ask about">
          <ToggleItem data-anno="ask-size" title="Her ring size" caption={`${name} can check one of her rings`} checked={size} onChange={setSize} />
          <ToggleItem data-anno="ask-prices" title="Hide prices" caption="She votes on the piece, not the price" checked={hidePrices} onChange={setHidePrices} />
        </ToggleList>
      </div>

      <WhatsAppSend data-anno="ask-send" disabled={selected.length === 0} onClick={onSend}>
        Send to {name} on WhatsApp
      </WhatsAppSend>
      <SheetFootnote data-anno="ask-footnote">Don’t forward this to Priya · the link closes after one vote</SheetFootnote>
    </Sheet>
  )
}
