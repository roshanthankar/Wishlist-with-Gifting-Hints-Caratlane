import { useRef, type ComponentType } from 'react'
import {
  ArrowsClockwise, CalendarBlank, Check, CurrencyInr, Package, Ruler, Sparkle, Storefront, UserCircle, UsersThree,
  type IconProps,
} from '@phosphor-icons/react'
import { AuraBlob, Button, Chip, FieldRow, PrivacyFootnote, ProductPhoto, SectionLabel, SheetHeader } from '@/ui'

/* ───────────────────────── Data ───────────────────────── */

export const RELATIONSHIPS = ['Partner', 'Mom', 'Sister', 'Friend', 'Someone else'] as const
export type Relationship = (typeof RELATIONSHIPS)[number]

/** Choosing a relationship pre-fills the name (it stays editable). */
export const PREFILL: Record<Relationship, string> = {
  Partner: 'Priya',
  Mom: 'Mom',
  Sister: 'Ananya',
  Friend: 'Kavya',
  'Someone else': '',
}

export const OCCASIONS = ['Anniversary', 'Birthday', 'Diwali', 'Karva Chauth', 'Just because'] as const
export type Occasion = (typeof OCCASIONS)[number]

/** “’s” list label for the CTA, or a neutral one when the name is empty. */
export const listOf = (name: string) => (name.trim() ? `${name.trim()}’s list` : 'their list')

/* ───────────────────────── A3 · Who is this for? ───────────────────────── */

export function WhoPanel({
  relationship,
  occasion,
  name,
  onRelationship,
  onOccasion,
  onName,
  onSave,
  onClose,
}: {
  relationship: Relationship
  occasion: Occasion
  name: string
  onRelationship: (r: Relationship) => void
  onOccasion: (o: Occasion) => void
  onName: (n: string) => void
  onSave: () => void
  onClose: () => void
}) {
  const input = useRef<HTMLInputElement>(null)
  return (
    <div className="flex flex-col gap-[14px] px-5 pb-6 pt-[14px]">
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          <SheetHeader title="Who is this for?" onClose={onClose} data-anno="who-title" />
          <p className="text-[14px] leading-5 text-ink-3" data-anno="who-copy">
            We’ll remind you before the date and keep the size with the list. Not sure? Free resizing covers it.
          </p>
        </div>
        <div className="flex flex-col gap-[14px]" data-anno="relationship">
          <SectionLabel>Relationship</SectionLabel>
          <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="Relationship">
            {RELATIONSHIPS.map((r) => (
              <Chip
                key={r}
                selected={relationship === r}
                onClick={() => {
                  onRelationship(r)
                  if (r === 'Someone else') requestAnimationFrame(() => input.current?.focus())
                }}
              >
                {r === 'Someone else' ? '+ Someone else' : r}
              </Chip>
            ))}
          </div>
        </div>
        <div className="flex flex-col gap-[14px]" data-anno="occasion">
          <SectionLabel>Occasion</SectionLabel>
          <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="Occasion">
            {OCCASIONS.map((o) => (
              <Chip key={o} selected={occasion === o} onClick={() => onOccasion(o)}>
                {o}
              </Chip>
            ))}
          </div>
        </div>
      </div>
      <FieldRow
        className="leading-none"
        data-anno="date"
        icon={<CalendarBlank size={20} color="#767676" />}
        action="Change"
      >
        Tue, 25 Nov · in 14 days
      </FieldRow>
      <FieldRow
        className="leading-none"
        data-anno="size"
        icon={<Ruler size={20} color="#3e3e3e" />}
        action="Change"
      >
        Ring size · 12, a best guess
      </FieldRow>
      <label
        className="flex h-[50px] cursor-text items-center gap-[10px] rounded-[12px] border border-line-2 bg-white py-[10px] pl-3 pr-[14px] transition-colors"
        data-anno="name"
      >
        <UserCircle size={20} color="#767676" className="shrink-0" />
        <span className="flex min-w-0 flex-1 flex-col gap-[2px] leading-[normal]">
          <span className="text-[12px] font-medium text-muted">Their name (optional)</span>
          <input
            ref={input}
            value={name}
            onChange={(e) => onName(e.target.value.slice(0, 24))}
            onKeyDown={(e) => e.key === 'Enter' && onSave()}
            autoComplete="off"
            enterKeyHint="done"
            className="h-[14px] min-w-0 bg-transparent p-0 text-[14px] font-medium leading-[14px] text-black outline-none placeholder:text-[#b4b4b4]"
            placeholder="Add a name"
          />
        </span>
      </label>
      <Button size="md" block className="font-medium!" onClick={onSave} data-anno="save">
        Save to {listOf(name)}
      </Button>
      <PrivacyFootnote data-anno="privacy">Private · only people you invite can see this list</PrivacyFootnote>
    </div>
  )
}

/* ───────────────────────── A4 · A great pick for … ───────────────────────── */

export type PickVariant = 'A4' | 'A4b' | 'A4c'

type Reason = { icon: ComponentType<IconProps>; title: string; body: string }

/** Copy verbatim from Figma (A4 687:8526, A4b 834:39993, A4c 834:42835). */
export const REASONS: Record<PickVariant, (name: string) => Reason[]> = {
  A4: (name) => [
    { icon: Ruler, title: 'Size 12 · a best guess is fine', body: 'Free resizing if it’s off or ask someone close, secretly' },
    { icon: UsersThree, title: 'Gifted by 600+ partners', body: 'Most-gifted ring under ₹10k this season' },
    { icon: ArrowsClockwise, title: 'Lifetime exchange · 15-day returns', body: `Nothing is lost if ${name} prefers another` },
  ],
  A4b: () => [
    { icon: Sparkle, title: 'Light enough to wear every day', body: '9KT gold, made for daily wear, not just occasions' },
    { icon: UsersThree, title: 'Gifted to mothers by 400+ people', body: 'Most people spend ₹8–15k on Mom. This sits right in it' },
    { icon: Storefront, title: 'Swap it at any CaratLane store', body: 'Free resizing and lifetime exchange, near her' },
  ],
  A4c: (name) => [
    { icon: CurrencyInr, title: 'A little above the usual', body: 'Most people spend ₹3–6k on a friend. See lighter picks' },
    { icon: UsersThree, title: 'Gifted by 300+ friends this season', body: 'Everyday style, not too personal' },
    { icon: Package, title: 'Lifetime exchange · 15-day returns', body: `Nothing is lost if ${name} prefers another` },
  ],
}

export function PickPanel({
  variant,
  name,
  onClose,
  onKeepBrowsing,
  onViewList,
}: {
  variant: PickVariant
  name: string
  onClose: () => void
  onKeepBrowsing: () => void
  /** Only “For Priya” exists in this prototype; other lists render the button inert. */
  onViewList?: () => void
}) {
  return (
    <div className="relative flex flex-col gap-4 px-5 pb-6 pt-4">
      {/* Extra rose glow behind the product row (Figma “Aura · rose” 20,135 346×33, blur 140) */}
      <AuraBlob x={20} y={121} w={346} h={33} color="#ff94bf" blur={140} style={{ width: 'calc(100% - 40px)' }} />
      <div className="relative flex flex-col gap-4 pb-5">
        <SheetHeader title={`A great pick for ${name}`} onClose={onClose} data-anno="pick-title" />
        <div
          className="flex items-center gap-3 rounded-[12px] border border-[#f1f1f1] bg-white p-[10px] shadow-[0_6px_8px_rgba(0,0,0,0.04)]"
          data-anno="pick-item"
        >
          <div className="relative size-[52px] shrink-0 overflow-hidden rounded-[10px]">
            <ProductPhoto id="vanki" className="absolute inset-0" />
            <span aria-hidden className="absolute inset-0 rounded-[10px] border border-[#f1f1f1]" />
          </div>
          <div className="flex min-w-0 flex-1 flex-col gap-2 leading-[normal]">
            <p className="truncate text-[14px] font-semibold text-black">Classic 9KT Gold Vanki Ring</p>
            <p className="text-[12px] font-medium text-ink-3">₹9,732 · Size 12</p>
          </div>
          <span className="flex h-5 shrink-0 items-center gap-[2px] rounded-full border border-white bg-[#eaf6e4] px-[7px]" data-anno="pick-saved">
            <Check size={12} color="#288600" />
            <span className="text-[12px] font-semibold leading-3 text-offer">Saved</span>
          </span>
        </div>
        <ul className="flex flex-col gap-[18px]" data-anno="pick-reasons">
          {REASONS[variant](name).map(({ icon: Icon, title, body }) => (
            <li key={title} className="flex items-center gap-3">
              <span className="flex size-[34px] shrink-0 items-center justify-center rounded-full bg-pink-tint">
                <Icon size={18} color="#dd1664" />
              </span>
              <span className="flex min-w-0 flex-1 flex-col gap-2 leading-[normal]">
                <span className="text-[14px] font-semibold text-black">{title}</span>
                <span className="text-[12px] text-muted">{body}</span>
              </span>
            </li>
          ))}
        </ul>
      </div>
      <div className="relative flex gap-3">
        <Button variant="secondary" size="md" block="flex" className="font-medium!" onClick={onKeepBrowsing} data-anno="pick-keep">
          Keep browsing
        </Button>
        <Button size="md" block="flex" className="font-medium!" onClick={onViewList} data-anno="pick-cta">
          View {listOf(name)}
        </Button>
      </div>
    </div>
  )
}
