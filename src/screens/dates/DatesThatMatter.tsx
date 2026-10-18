import { motion } from 'motion/react'
import { Bell, PlusCircle } from '@phosphor-icons/react'
import type { FrameId } from '@/proto/frames'
import type { FrameAnnotations } from '@/proto/annotations'
import { useNav } from '@/proto/nav'
import { BottomBar, Button, LatticePageAura, ListGroup, NavBar, Screen, ScrollView, ToggleRow } from '@/ui'
import { RowCaption } from '../wishlist-priya/parts'
import { useSavedDates, type DateKey } from './savedDates'

export const annotations: FrameAnnotations = {
  B0: [
    { id: 'dates-nav', title: 'Lives in settings', body: 'Dates sit under Priya’s settings, not in the gifting flow, so saving a birthday never feels like asking for a present.' },
    { id: 'dates-title', title: 'Why the dates matter', body: 'One line explains the deal: save a date once and the wishlist nudges Priya fourteen days before it, when a hint feels natural.' },
    { id: 'dates-list', title: 'Saved dates', body: 'Each row says the date, who it is with and when the nudge lands, so the timing is never a surprise to Priya.' },
    { id: 'dates-toggle', title: 'Nudges per date', body: 'Switching a date off keeps it saved and just reads “Nudges off”. Turning the anniversary off also removes the nudge from the wishlist.' },
    { id: 'dates-mom', title: 'Not only for hints', body: 'Mom’s birthday reminds Priya to shop for someone else, so the same feature works in both directions of gifting.' },
    { id: 'dates-add', title: 'Add a date', body: 'A light dashed row keeps adding secondary to reviewing what is already there.' },
    { id: 'dates-private', title: 'Only Priya sees these', body: 'The privacy promise is spelled out: nothing reaches Rahul or anyone else unless Priya chooses to send it.' },
    { id: 'dates-done', title: 'Done', body: 'Returns to the wishlist, where the anniversary nudge is waiting.' },
  ],
}

const ROWS: { key: DateKey; title: string; caption: string; anno?: string }[] = [
  { key: 'anniversary', title: 'Our anniversary', caption: 'Tue 25 Nov · with Rahul · nudge on 11 Nov', anno: 'dates-toggle' },
  { key: 'birthday', title: 'My birthday', caption: 'Sat 14 Mar · nudge on 28 Feb' },
  { key: 'mom', title: 'Mom’s birthday', caption: 'Thu 9 Jul · remind me to shop for her', anno: 'dates-mom' },
]

export default function DatesThatMatter({ frame: _frame }: { frame: FrameId }) {
  const { go, back } = useNav()
  const [dates, setDates] = useSavedDates()

  return (
    <Screen bg="#fdfdfd">
      <ScrollView backdrop={<LatticePageAura />} bottomInset="calc(52px + var(--safe-bottom-pad) + 40px)">
        <NavBar title="Your settings" onBack={back} bg="transparent" sticky={false} data-anno="dates-nav" />

        <div className="flex flex-col gap-4 px-4 pt-3">
          <div data-anno="dates-title" className="flex flex-col gap-2">
            <h1 className="serif text-[32px] leading-[44px] text-violet">Dates that matter</h1>
            <p className="pr-1 text-[16px] leading-[23px] text-ink-3">
              Save them once. Fourteen days before each one, your wishlist nudges you to drop a hint, when it feels natural.
            </p>
          </div>

          <p className="text-[14px] font-semibold leading-[normal] text-ink-3">Saved dates</p>

          <ListGroup data-anno="dates-list">
            {ROWS.map((r) => (
              <ToggleRow
                key={r.key}
                data-anno={r.anno}
                title={r.title}
                caption={<RowCaption text={dates[r.key] ? r.caption : 'Nudges off'} />}
                checked={dates[r.key]}
                onChange={(v) => setDates((d) => ({ ...d, [r.key]: v }))}
              />
            ))}
          </ListGroup>

          <motion.button
            type="button"
            data-anno="dates-add"
            className="pointer-events-none relative flex h-[50px] items-center gap-[10px] rounded-[16px] px-4 text-left"
          >
            {/* Figma: 1px #D7CDFF inside stroke, dash 6 / gap 4 (CSS `dashed` can’t set the rhythm) */}
            <svg aria-hidden className="pointer-events-none absolute inset-0 size-full">
              <rect width="100%" height="100%" rx="16" fill="none" stroke="#d7cdff" strokeWidth="2" strokeDasharray="6 4" />
            </svg>
            <PlusCircle size={20} color="#5a39e3" />
            <span className="text-[16px] font-semibold leading-[normal] text-violet">Add a date</span>
          </motion.button>

          <div data-anno="dates-private" className="flex items-start gap-3 rounded-[16px] bg-[#f7f5ff] p-4">
            <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-violet-tint">
              <Bell size={18} color="#5a39e3" />
            </span>
            <div className="flex min-w-0 flex-1 flex-col gap-1">
              <p className="text-[16px] font-semibold leading-[normal] text-black">Only you see these</p>
              <p className="text-[14px] leading-5 text-muted">
                Nudges show up in your wishlist. Nothing is sent to Rahul or anyone else unless you send it.
              </p>
            </div>
          </div>
        </div>
      </ScrollView>

      <BottomBar fade="#fdfdfd">
        <Button weight="medium" size="md" block onClick={() => go('B1')} data-anno="dates-done">
          Done
        </Button>
      </BottomBar>
    </Screen>
  )
}
