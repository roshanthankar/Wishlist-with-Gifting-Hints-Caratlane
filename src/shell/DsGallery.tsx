import { useState } from 'react'
import { CalendarBlank, Ruler, ShareNetwork, Bag, X } from '@phosphor-icons/react'
import {
  Screen, ScrollView, NavBar, NavIcon, Button, GlassCircle, Chip, Toggle, ToggleRow, ListGroup, FieldRow, SectionLabel,
  ProductTile, GiftListCard, CreateListCard, FindMoreCard, SelectTile, SavedToast, OccasionPill, PrivacyFootnote,
  Sheet, SheetHeader, WebHeader, SafariBar, BottomBar,
} from '@/ui'

/** ?view=ds — every shared primitive on one scrollable screen (dev check). */
export function DsGallery() {
  const [on, setOn] = useState(true)
  const [chip, setChip] = useState('Partner')
  const [pick, setPick] = useState(true)
  const [sheet, setSheet] = useState<false | 'pink' | 'violet'>(false)
  return (
    <div className="h-[896px] w-[402px] overflow-hidden" style={{ ['--safe-top' as string]: '62px', ['--safe-bottom-pad' as string]: '36px' }}>
      <Screen>
        <ScrollView bottomInset={140}>
          <NavBar title="Classic 9KT Gold Vanki Ring" onBack={() => {}} right={<><NavIcon label="Share"><ShareNetwork size={24} /></NavIcon><NavIcon label="Bag"><Bag size={24} /></NavIcon></>} />
          <WebHeader />
          <div className="flex flex-col gap-4 p-4">
            <div className="flex gap-3">
              <Button variant="secondary" block="flex">See it Live</Button>
              <Button block="flex">Add to Bag</Button>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button variant="whatsapp" size="md">WhatsApp</Button>
              <Button variant="pink" size="sm">Keep going</Button>
              <Button variant="outline" size="xs">Saved</Button>
              <GlassCircle label="Close" size={36}><X size={16} /></GlassCircle>
              <GlassCircle label="Close" tone="flat"><X size={16} /></GlassCircle>
            </div>
            <SectionLabel right="3 of 3">Relationship</SectionLabel>
            <div className="flex flex-wrap gap-2">
              {['Partner', 'Mom', 'Sister', 'Friend'].map((c) => <Chip key={c} selected={chip === c} onClick={() => setChip(c)}>{c}</Chip>)}
            </div>
            <FieldRow icon={<CalendarBlank size={20} color="#767676" />} action="Change">Tue, 25 Nov · in 14 days</FieldRow>
            <FieldRow icon={<Ruler size={20} color="#3e3e3e" />} action="Change">Ring size · 12, a best guess</FieldRow>
            <ListGroup>
              <ToggleRow title="Show price ranges only" caption="Rahul sees ₹9–10k until checkout" checked={on} onChange={setOn} />
              <ToggleRow title="Let Rahul hold one" caption="No double gifts" checked={!on} onChange={(v) => setOn(!v)} />
            </ListGroup>
            <Toggle checked={on} onChange={setOn} label="x" />
            <div className="grid grid-cols-3 gap-2">
              <SelectTile id="vanki" selected={pick} onToggle={() => setPick(!pick)} />
              <SelectTile id="hearts-vine" selected={!pick} onToggle={() => setPick(!pick)} />
              <SelectTile id="twist" selected />
            </div>
            <OccasionPill />
            <OccasionPill side="rahul" />
            <PrivacyFootnote>Private · only people you invite can see this list</PrivacyFootnote>
            <SavedToast />
            <div className="flex gap-[14px]"><GiftListCard title="For Priya" meta="Private · 3 saved" /><CreateListCard /></div>
            <div className="grid grid-cols-2 gap-[14px]">
              <ProductTile id="vanki" tag="25% off" />
              <ProductTile id="hearts-vine" tag="For Priya" tagTone="pink" />
              <ProductTile id="twist" tag="Priya hinted this" tagTone="violet" highlight />
              <FindMoreCard title="Find more for Priya" />
            </div>
            <div className="flex gap-2">
              <Button size="sm" onClick={() => setSheet('pink')}>Pink sheet</Button>
              <Button size="sm" onClick={() => setSheet('violet')}>Violet sheet</Button>
            </div>
          </div>
        </ScrollView>
        <BottomBar fade="#fdfdfd"><Button block>Bottom bar CTA</Button></BottomBar>
        <SafariBar />
        <Sheet open={!!sheet} tone={sheet || 'plain'} onClose={() => setSheet(false)}>
          <SheetHeader title="Who is this for?" tone={sheet === 'violet' ? 'violet' : 'pink'} onClose={() => setSheet(false)} />
          <p className="text-[14px] leading-5 text-ink-3">We’ll remind you before the date and keep the size with the list. Not sure? Free resizing covers it.</p>
          <Button size="md" block>Save to Priya’s list</Button>
        </Sheet>
      </Screen>
    </div>
  )
}
