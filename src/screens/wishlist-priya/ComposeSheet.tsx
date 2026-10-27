import { motion } from 'motion/react'
import { PencilSimple } from '@phosphor-icons/react'
import type { ProductId } from '@/data/products'
import { Button, Chip, ListGroup, PrivacyFootnote, SectionLabel, SheetHeader, ToggleRow } from '@/ui'
import { PickTile, RowCaption } from './parts'
import {
  HINT_PICKS,
  SAVED_COUNT,
  TONE_MESSAGE,
  useHintNotes,
  useHintPicks,
  useHintSettings,
  useHintTone,
  type Tone,
} from './hintState'

const TONES: { id: Tone; label: string }[] = [
  { id: 'subtle', label: 'Subtle' },
  { id: 'clear', label: 'Clear' },
  { id: 'very-clear', label: 'Very clear' },
]

/**
 * B2 · “Drop a hint” (step 1 of 2), content of the violet sheet:
 * picks with notes, a tone dial that rewrites the message, and what Rahul
 * gets to see. Figma: header y 30, sections gap 20, CTA 50, footnote.
 */
export function ComposeStep({ onClose, onNext }: { onClose: () => void; onNext: () => void }) {
  const [picks, setPicks] = useHintPicks()
  const [notes, setNotes] = useHintNotes()
  const [tone, setTone] = useHintTone()
  const [s, setS] = useHintSettings()

  const toggle = (id: ProductId) =>
    setPicks((p) => (p.includes(id) ? p.filter((x) => x !== id) : HINT_PICKS.filter((x) => x === id || p.includes(x))))

  return (
    <div className="flex flex-col gap-4 pt-[2px]">
      <div className="flex flex-col gap-2" data-anno="b2-header">
        <SheetHeader title="Drop a hint" tone="violet" onClose={onClose} />
        <p className="text-[14px] leading-5 text-ink-3">Step 1 of 2 · Rahul sees your picks and this message.</p>
      </div>

      <div className="flex flex-col gap-5">
        {/* 1 · Picks */}
        <div className="flex flex-col gap-[14px]">
          <SectionLabel
           
            right={
              <span data-anno="b2-count" className="flex items-center">
                <span className="font-medium tabular">{picks.length} of {SAVED_COUNT}</span>
              </span>
            }
          >
            1 · Pick what you’d love
          </SectionLabel>
          <div className="grid grid-cols-3 gap-2" data-anno="b2-picks">
            {HINT_PICKS.map((id) => (
              <PickTile
                key={id}
                id={id}
                data-anno={id === 'twist' ? 'b2-note' : undefined}
                selected={picks.includes(id)}
                onToggle={() => toggle(id)}
                badge={notes[id] ? 'note' : 'add'}
                onBadge={notes[id] ? undefined : () => setNotes((n) => ({ ...n, [id]: true }))}
              />
            ))}
          </div>
        </div>

        {/* 2 · Tone */}
        <div className="flex flex-col gap-[14px]">
          <SectionLabel>2 · How loud should it be?</SectionLabel>
          <div className="flex gap-2" role="radiogroup" aria-label="How loud should it be?" data-anno="b2-tone">
            {TONES.map((t) => (
              <Chip key={t.id} selected={tone === t.id} onClick={() => setTone(t.id)}>
                {t.label}
              </Chip>
            ))}
          </div>
          <div data-anno="b2-message" className="flex flex-col gap-2 rounded-[12px] border border-line bg-field p-[14px]">
            <div className="flex items-center justify-between">
              <p className="text-[12px] font-bold leading-[normal] text-ink-3">What Rahul will see</p>
              <button
                type="button"
                className="pointer-events-none flex items-center gap-1 text-[12px] font-semibold leading-[normal] text-violet"
              >
                <PencilSimple size={14} color="#5a39e3" />
                Edit
              </button>
            </div>
            {/* All three versions share one grid cell, so the card keeps its height while they cross-fade. */}
            <div className="grid" aria-live="polite">
              {TONES.map((t) => (
                <motion.p
                  key={t.id}
                  aria-hidden={tone !== t.id}
                  className="serif col-start-1 row-start-1 text-[16px] italic leading-6 text-black"
                  initial={false}
                  animate={{ opacity: tone === t.id ? 1 : 0, filter: tone === t.id ? 'blur(0px)' : 'blur(2px)' }}
                  transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
                >
                  {TONE_MESSAGE[t.id]}
                </motion.p>
              ))}
            </div>
          </div>
        </div>

        {/* 3 · What Rahul gets */}
        <div className="flex flex-col gap-[14px]">
          <SectionLabel>3 · Make it easy for Rahul</SectionLabel>
          <ListGroup data-anno="b2-easy">
            <ToggleRow
              title="Show price ranges only"
              caption={<RowCaption text={s.ranges ? 'Rahul sees ₹9–10k until checkout' : 'Rahul sees exact prices'} />}
              checked={s.ranges}
              onChange={(v) => setS((p) => ({ ...p, ranges: v }))}
            />
            <ToggleRow
              data-anno="b2-hold"
              title="Let Rahul hold one"
              caption={<RowCaption text={s.hold ? 'No double gifts: others see it’s taken' : 'Others won’t know what’s taken'} />}
              checked={s.hold}
              onChange={(v) => setS((p) => ({ ...p, hold: v }))}
            />
            <ToggleRow
              data-anno="b2-size"
              title="Share my ring size"
              caption={<RowCaption text={s.size ? 'Size 12 · anyone with the link can see it' : 'Rahul won’t see your size'} />}
              checked={s.size}
              onChange={(v) => setS((p) => ({ ...p, size: v }))}
            />
          </ListGroup>
        </div>
      </div>

      <div className="flex flex-col gap-4">
        <Button weight="medium" size="md" block disabled={picks.length === 0} onClick={onNext} data-anno="b2-cta">
          Choose how to share
        </Button>
        <PrivacyFootnote data-anno="b2-footnote">You can revoke the link anytime</PrivacyFootnote>
      </div>
    </div>
  )
}
