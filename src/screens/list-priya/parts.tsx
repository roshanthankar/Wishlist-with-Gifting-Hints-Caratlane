import type { ReactNode } from 'react'
import { CalendarBlank, Clock, LockSimple, PencilSimple, WhatsappLogo } from '@phosphor-icons/react'
import { AuraBlob, BackButton, Button, GlassCircle, PinkPageAura, PrivacyFootnote, SelectTile, Toggle, cn } from '@/ui'
import type { ProductId } from '@/data/products'
import { haptic } from '@/proto/haptics'

/* ───────────────────────── List data ───────────────────────── */

/** Saved pieces on Rahul’s “For Priya” list, with the tile tag each shows. */
export const LIST_ITEMS: { id: ProductId; tag: string }[] = [
  { id: 'vanki', tag: '25% off' },
  { id: 'hearts-vine', tag: 'Price dropped' },
  { id: 'twist', tag: 'Bestseller' },
]
export const ALL_IDS = LIST_ITEMS.map((i) => i.id)
export const tagFor = (id: ProductId) => LIST_ITEMS.find((i) => i.id === id)?.tag

/* ───────────────────────── Page aura ───────────────────────── */

/**
 * “Pink aura (from sheet)” behind A6–A12. Same floral wash as PinkPageAura,
 * but the three ellipses sit where these frames put them
 * (rose x10, violet x-33, peach x268 → 28px past the right edge).
 */
export function ListAura() {
  return (
    <>
      <PinkPageAura blobs={false} />
      <AuraBlob x={10} y={-42} w={369} h={79} color="#ffbad5" />
      <AuraBlob x={-33} y={7} w={162} h={31} color="#df93fe" />
      <AuraBlob right={-28} y={-4} w={162} h={39} color="#ffe6c9" />
    </>
  )
}

/* ───────────────────────── List header ───────────────────────── */

/** “List header” (814:1972): back, serif title + lock, glass edit, occasion line. */
export function ListHeader({ daysToGo, onBack, onEdit }: { daysToGo: number; onBack: () => void; onEdit?: () => void }) {
  return (
    <div className="flex flex-col gap-[10px]">
      <div className="flex h-11 items-center gap-3">
        <BackButton onClick={onBack} />
        <div data-anno="list-title" className="flex min-w-0 flex-1 items-center gap-2">
          <h1 className="serif whitespace-nowrap text-[32px] leading-[44px] text-pink">For Priya</h1>
          <LockSimple size={18} color="#dd1564" aria-label="Private list" />
        </div>
        {/* Figma’s “Glass · Edit list” reads a touch greyer than the shared light glass. */}
        <GlassCircle size={44} label="Edit list" onClick={onEdit} data-anno="edit-list" className="bg-[rgba(242,241,241,0.72)]!">
          <PencilSimple size={20} color="#000" />
        </GlassCircle>
      </div>
      <div data-anno="occasion" className="flex h-[18px] items-center gap-2 text-ink-3">
        <CalendarBlank size={18} color="#3e3e3e" />
        <p className="whitespace-nowrap text-[14px] font-medium leading-none">Anniversary · Tue, 25 Nov · {daysToGo} days to go</p>
      </div>
    </div>
  )
}

/* ───────────────────────── Deadline card ───────────────────────── */

/** “Deadline” (804:35428): pink-tint card with the order-by date. */
export function DeadlineCard() {
  return (
    <div
      data-anno="deadline"
      className="flex h-[60px] items-center gap-3 rounded-[12px] border border-pink-tint bg-[#fff6fa] px-[14px]"
    >
      <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-pink-tint">
        <Clock size={18} color="#dd1664" />
      </span>
      <div className="flex min-w-0 flex-col gap-1 leading-none">
        <p className="text-[14px] font-semibold text-ink-2">Order by Fri, 21 Nov</p>
        <p className="truncate text-[12px] text-muted-2">Arrives before your anniversary · free gift wrap</p>
      </div>
    </div>
  )
}

/* ───────────────────────── Sheet parts (A8, A10) ───────────────────────── */

/** Section label (“1 · Who knows her taste?”): Bold 12 #3E3E3E + optional Medium 12 count. */
export function Label({ children, right }: { children: ReactNode; right?: ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-3 leading-none">
      <p className="text-[12px] font-bold text-ink-3">{children}</p>
      {right && <p className="tabular text-[12px] font-medium text-muted">{right}</p>}
    </div>
  )
}

/** Sheet intro copy under the title: Regular 14/20 #3E3E3E. */
export function SheetCopy({ children }: { children: ReactNode }) {
  return <p className="text-[14px] leading-5 text-ink-3">{children}</p>
}

/** “Picks” block: label + “n of 3” and a row of three select tiles. */
export function PickRow({
  label,
  ids,
  selected,
  onToggle,
  'data-anno': anno,
}: {
  label: ReactNode
  ids: ProductId[]
  selected: ProductId[]
  onToggle: (id: ProductId) => void
  'data-anno'?: string
}) {
  return (
    <div data-anno={anno} className="flex flex-col gap-[14px]">
      <Label right={`${selected.length} of ${ids.length}`}>{label}</Label>
      <div className="grid grid-cols-3 gap-2">
        {ids.map((id) => (
          <SelectTile key={id} id={id} selected={selected.includes(id)} onToggle={() => onToggle(id)} />
        ))}
      </div>
    </div>
  )
}

/** “Message preview” (830:24086): what the recipient sees, serif italic quote + Edit. */
export function MessagePreview({ who, children, onEdit, 'data-anno': anno }: { who: string; children: ReactNode; onEdit?: () => void; 'data-anno'?: string }) {
  return (
    <div data-anno={anno} className="flex flex-col gap-2 rounded-[12px] border border-line bg-field p-[14px]">
      <div className="flex h-[14px] items-center justify-between">
        <p className="text-[12px] font-bold leading-none text-ink-3">What {who} will see</p>
        <button type="button" onClick={onEdit} className={`-m-2 flex items-center gap-1 p-2 text-violet ${onEdit ? 'active:opacity-60' : 'pointer-events-none'}`}>
          <PencilSimple size={14} color="#5a39e3" />
          <span className="text-[12px] font-semibold leading-none">Edit</span>
        </button>
      </div>
      <p className="serif text-[16px] italic leading-6 text-black">{children}</p>
    </div>
  )
}

/** Grouped toggle list (830:24097): white, 1px #E0E0E0, radius 12, #F0F0F0 divider. */
export function ToggleList({ children, label, 'data-anno': anno }: { children: ReactNode; label: ReactNode; 'data-anno'?: string }) {
  return (
    <div data-anno={anno} className="flex flex-col gap-[14px]">
      <Label>{label}</Label>
      <div className="overflow-hidden rounded-[12px] border border-line-2 bg-white [&>*:not(:last-child)]:border-b [&>*:not(:last-child)]:border-line">
        {children}
      </div>
    </div>
  )
}

export function ToggleItem({
  title,
  caption,
  checked,
  onChange,
  'data-anno': anno,
}: {
  title: string
  caption: ReactNode
  checked: boolean
  onChange: (v: boolean) => void
  'data-anno'?: string
}) {
  return (
    <div data-anno={anno} className="box-content flex h-[54px] items-center gap-3 px-[14px]">
      <div className="flex min-w-0 flex-1 flex-col gap-1 leading-none">
        <p className="text-[14px] font-semibold text-black">{title}</p>
        <p className="truncate text-[12px] text-muted">{caption}</p>
      </div>
      <Toggle checked={checked} onChange={onChange} label={title} />
    </div>
  )
}

/** WhatsApp send CTA (830:24122): 50px, logo 20, Medium 17/18. */
export function WhatsAppSend({ children, onClick, disabled, 'data-anno': anno }: { children: ReactNode; onClick: () => void; disabled?: boolean; 'data-anno'?: string }) {
  return (
    <Button
      variant="whatsapp"
      size="md"
      block
      disabled={disabled}
      data-anno={anno}
      className="font-medium!"
      icon={<WhatsappLogo size={20} weight="fill" color="#fff" />}
      onClick={() => {
        haptic('success')
        onClick()
      }}
    >
      {children}
    </Button>
  )
}

export function SheetFootnote({ children, 'data-anno': anno }: { children: ReactNode; 'data-anno'?: string }) {
  return <PrivacyFootnote data-anno={anno} className="[&_p]:leading-none">{children}</PrivacyFootnote>
}

/** Toggle a product in a selection array, keeping list order. */
export function toggleId(list: ProductId[], id: ProductId, order: ProductId[]) {
  return list.includes(id) ? list.filter((x) => x !== id) : order.filter((x) => x === id || list.includes(x))
}

export { cn }
