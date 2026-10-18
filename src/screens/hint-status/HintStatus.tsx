import { useRef } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { WhatsappLogo } from '@phosphor-icons/react'
import type { FrameId } from '@/proto/frames'
import type { FrameAnnotations } from '@/proto/annotations'
import { useNav } from '@/proto/nav'
import { haptic } from '@/proto/haptics'
import { useProtoState } from '@/proto/store'
import { BottomBar, Button, LatticePageAura, ListGroup, NavBar, Screen, ScrollView, SectionLabel, Sheet, ToggleRow } from '@/ui'
import envelopeSent from '@/assets/illustrations/envelope-sent.webp'
import envelopeOpened from '@/assets/illustrations/envelope-opened.webp'
import envelopeWaiting from '@/assets/illustrations/envelope-waiting.webp'
import { FadeText, RowCaption } from '../wishlist-priya/parts'
import { HintStatusStep } from './HintStatusStep'
import { EditPicks } from './EditPicksSheet'

export const annotations: FrameAnnotations = {
  B4: [
    { id: 'hs-nav', title: 'Your hint', body: 'A status page Priya can come back to; back returns to the wishlist where the hint started.' },
    { id: 'hs-hero', title: 'Envelope, in flight', body: 'The sent envelope floats gently: the hint is out and nothing is needed from Priya right now.' },
    { id: 'hs-title', title: 'Your hint is out', body: 'Who it went to, on which app and when, in one line Priya can trust.' },
    { id: 'hs-sent', title: 'Sent', body: 'The tracker shows what Priya should know: sent, then opened.' },
    { id: 'hs-opened', title: 'Opened, next', body: 'An honest promise: we’ll tell Priya when Rahul opens it, nothing more.' },
    { id: 'hs-holds', title: 'Holds stay a surprise', body: 'Who bought what never reaches Priya, so the tracker can’t spoil the gift.' },
    { id: 'hs-light', title: 'Keep it light', body: 'Both alerts are opt-out switches, and Rahul is told that Priya can see when it’s opened.' },
    { id: 'hs-more', title: 'Send to more', body: 'Mom can get the same hint; holds then stop double gifts.' },
    { id: 'hs-done', title: 'Done', body: 'Back to the wishlist. The status stays one tap away.' },
  ],
  B4b: [
    { id: 'hs-hero', title: 'Opened envelope', body: 'The illustration swaps in place, so the change of state is felt before it’s read.' },
    { id: 'hs-title', title: 'Rahul opened your hint', body: 'The headline news, with when and where it was opened.' },
    { id: 'hs-sent', title: 'Sent to Rahul and Mom', body: 'Mom was added from “Send to more”; the step lists everyone who has the link.' },
    { id: 'hs-opened', title: 'Opened by Rahul', body: 'The step fills and its check pops the moment Rahul opens the link. Mom’s opens stay private.' },
    { id: 'hs-holds', title: 'Hidden until after 25 Nov', body: 'Who’s holding what stays hidden from Priya until after the 25th, so nothing spoils the surprise.' },
    { id: 'hs-link', title: 'Link closes Tue, 2 Dec', body: 'Every hint expires. Priya can extend or revoke it anytime.' },
    { id: 'hs-light', title: 'Tell me after 25 Nov', body: 'Only whether the hint worked, never what or who: the one thing worth knowing.' },
    { id: 'hs-edit', title: 'Edit picks', body: 'Picks can change after sending without a new message to Rahul.' },
  ],
  B5: [
    { id: 'b5-header', title: 'Edit your picks', body: 'Same link, updated quietly. Rahul sees the change the next time the link is opened.' },
    { id: 'b5-picks', title: 'Your picks', body: 'The same pick tiles as when composing, so editing feels like the first time.' },
    { id: 'b5-removed', title: 'A removed pick', body: 'Clearing a pick only takes it off the page. It never cancels or reveals a hold.' },
    { id: 'b5-holds', title: 'Never cancels a hold', body: 'If Rahul is already holding it, the hold stays, and Priya isn’t told whether there was one.' },
    { id: 'b5-limit', title: 'Up to 6 picks', body: 'The limit and the carried-over settings, said before Priya hits them.' },
    { id: 'b5-update', title: 'Update hint', body: 'One tap with a haptic, then straight back to the status. Same link, nothing new sent.' },
    { id: 'b5-footnote', title: 'Nothing new is sent', body: 'The footnote says exactly what happens: same link, no new message to Rahul.' },
  ],
  B6: [
    { id: 'hs-hero', title: 'Still waiting', body: 'The envelope with an hourglass says “not yet” without sounding like a problem.' },
    { id: 'hs-title', title: 'Not opened yet', body: 'Puts the wait in context: seven days to the anniversary, still time.' },
    { id: 'hs-opened', title: 'Still waiting · Tue 18 Nov', body: 'The opened step stays empty and dated, so Priya knows the tracker is live.' },
    { id: 'hs-holds', title: 'Holds stay a surprise', body: 'Even now, nothing about what’s bought reaches Priya.' },
    { id: 'hs-nudge', title: 'A gentle nudge', body: 'Priya sends it personally, from Priya’s own WhatsApp. CaratLane never chases Rahul.' },
    { id: 'hs-nudge-quote', title: 'Priya’s words', body: 'A short, light line in Priya’s voice, with the same link, so it reads like a friend not a reminder.' },
    { id: 'hs-nudge-cta', title: 'Nudge on WhatsApp', body: 'Opens WhatsApp with the message ready; Priya still presses send.' },
    { id: 'hs-edit', title: 'Edit picks', body: 'A quiet second option: refreshing the picks might be the better nudge.' },
  ],
}

type Base = 'sent' | 'opened' | 'waiting'

const HERO: Record<Base, { src: string; w: number; h: number; alt: string }> = {
  sent: { src: envelopeSent, w: 133, h: 98, alt: 'A glass envelope, sealed and sent' },
  opened: { src: envelopeOpened, w: 101, h: 115, alt: 'An opened glass envelope with a heart' },
  waiting: { src: envelopeWaiting, w: 137, h: 95, alt: 'A sealed envelope beside an hourglass' },
}

const COPY: Record<Base, { title: string; sub: string }> = {
  sent: { title: 'Your hint is out', sub: 'Sent to Rahul on WhatsApp · Tue 11 Nov, 9:41 pm' },
  opened: { title: 'Rahul opened your hint', sub: 'Opened Wed 12 Nov, 8:10 am · via WhatsApp' },
  waiting: { title: 'Not opened yet', sub: 'Sent Tue 11 Nov · 7 days to your anniversary' },
}

type Step = { key: string; done: boolean; title: string; caption: string; anno: string }

const STEPS: Record<Base, Step[]> = {
  sent: [
    { key: 'sent', done: true, title: 'Sent', caption: 'Tue 11 Nov, 9:41 pm', anno: 'hs-sent' },
    { key: 'opened', done: false, title: 'Opened', caption: 'We’ll tell you when Rahul opens it', anno: 'hs-opened' },
    { key: 'holds', done: false, title: 'Holds stay a surprise', caption: 'You won’t see what’s bought, or by whom', anno: 'hs-holds' },
  ],
  opened: [
    { key: 'sent', done: true, title: 'Sent to Rahul and Mom', caption: 'Tue 11 Nov, 9:41 pm', anno: 'hs-sent' },
    { key: 'opened', done: true, title: 'Opened by Rahul', caption: 'Wed 12 Nov, 8:10 am · via WhatsApp', anno: 'hs-opened' },
    { key: 'holds', done: false, title: 'Holds stay a surprise', caption: 'Hidden from you until after 25 Nov', anno: 'hs-holds' },
    { key: 'link', done: false, title: 'Link closes Tue, 2 Dec', caption: 'Extend or revoke it anytime', anno: 'hs-link' },
  ],
  waiting: [
    { key: 'sent', done: true, title: 'Sent', caption: 'Tue 11 Nov, 9:41 pm', anno: 'hs-sent' },
    { key: 'opened', done: false, title: 'Opened', caption: 'Still waiting · Tue 18 Nov', anno: 'hs-opened' },
    { key: 'holds', done: false, title: 'Holds stay a surprise', caption: 'You won’t see what’s bought, or by whom', anno: 'hs-holds' },
  ],
}

const BASE_OF: Partial<Record<FrameId, Base>> = { B4: 'sent', B4b: 'opened', B6: 'waiting' }
const FRAME_OF: Record<Base, FrameId> = { sent: 'B4', opened: 'B4b', waiting: 'B6' }

const SPRING = { type: 'spring', stiffness: 360, damping: 38, mass: 0.9 } as const

export default function HintStatus({ frame }: { frame: FrameId }) {
  const { go } = useNav()
  // B5 is a sheet over whichever status Priya came from (Figma draws it over B4b).
  const baseRef = useRef<Base>('opened')
  if (BASE_OF[frame]) baseRef.current = BASE_OF[frame]!
  const base = baseRef.current
  const editing = frame === 'B5'
  const origin = FRAME_OF[base]

  const [alerts, setAlerts] = useProtoState('hintStatus.alerts', { opened: true, remind: true, after: true })
  const steps = STEPS[base]

  const update = () => {
    haptic('success')
    go(origin)
  }

  return (
    <Screen bg="#fdfdfd">
      <ScrollView backdrop={<LatticePageAura />} bottomInset="calc(52px + var(--safe-bottom-pad) + 40px)">
        <NavBar title="Your hint" onBack={() => go('B1')} bg="transparent" sticky={false} data-anno="hs-nav" />

        <div className="flex flex-col gap-5 px-4 pt-3">
          <div className="flex flex-col items-center gap-3">
            <HeroSlot base={base} />
            <div data-anno="hs-title" className="flex w-full flex-col items-center gap-3 text-center">
              <FadeText text={COPY[base].title} className="serif text-[28px] leading-[38px] text-violet" />
              <FadeText text={COPY[base].sub} className="text-[14px] font-medium leading-[normal] text-ink-3" />
            </div>
          </div>

          <motion.div
            layout
            transition={SPRING}
            className="overflow-hidden rounded-[12px] border border-[#f1f1f1] bg-white px-4 pb-2 pt-4 shadow-[0_6px_8px_rgba(0,0,0,0.04)]"
          >
            <AnimatePresence initial={false}>
              {steps.map((s, i) => (
                <motion.div
                  key={s.key}
                  layout="position"
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6, transition: { duration: 0.18 } }}
                  transition={SPRING}
                >
                  <HintStatusStep
                    data-anno={s.anno}
                    done={s.done}
                    title={s.title}
                    caption={s.caption}
                    last={i === steps.length - 1}
                    lineDone={steps[i + 1]?.done}
                  />
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>

          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={base === 'waiting' ? 'nudge' : base}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0, transition: { ...SPRING, opacity: { duration: 0.24 } } }}
              exit={{ opacity: 0, y: -4, transition: { duration: 0.14 } }}
            >
              {base === 'waiting' ? (
                <NudgeCard />
              ) : (
                <div className="flex flex-col gap-3" data-anno="hs-light">
                  <SectionLabel>Keep it light</SectionLabel>
                  <ListGroup>
                    {base === 'sent' ? (
                      <>
                        <ToggleRow
                          title="Tell me when it’s opened"
                          caption={<RowCaption text="Rahul is told you can see this" />}
                          checked={alerts.opened}
                          onChange={(v) => setAlerts((a) => ({ ...a, opened: v }))}
                        />
                        <ToggleRow
                          title="Remind me to nudge in 7 days"
                          caption={<RowCaption text="If it’s still unopened, we’ll ping you to send one" />}
                          checked={alerts.remind}
                          onChange={(v) => setAlerts((a) => ({ ...a, remind: v }))}
                        />
                      </>
                    ) : (
                      <ToggleRow
                        title="Tell me after 25 Nov"
                        caption={<RowCaption text="Only whether the hint worked, never what or who" />}
                        checked={alerts.after}
                        onChange={(v) => setAlerts((a) => ({ ...a, after: v }))}
                      />
                    )}
                  </ListGroup>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </ScrollView>

      <BottomBar fade="#fdfdfd">
        {/* The whole action row swaps (wait mode) so buttons never overlap mid-change. */}
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={base}
            className="flex w-full gap-3"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0, transition: { duration: 0.22, ease: [0.22, 1, 0.36, 1] } }}
            exit={{ opacity: 0, y: 4, transition: { duration: 0.12 } }}
          >
            {base === 'sent' ? (
              <Button weight="medium" variant="secondary" size="md" block="flex" onClick={() => go('B3')} data-anno="hs-more">
                Send to more
              </Button>
            ) : (
              <Button weight="medium" variant="secondary" size="md" block="flex" onClick={() => go('B5')} data-anno="hs-edit">
                Edit picks
              </Button>
            )}
            {base !== 'waiting' && (
              <Button weight="medium" size="md" block="flex" onClick={() => go('B1')} data-anno="hs-done">
                Done
              </Button>
            )}
          </motion.div>
        </AnimatePresence>
      </BottomBar>

      <Sheet open={editing} onClose={() => go(origin)} tone="violet" gap={16} label="Edit your picks">
        <EditPicks onClose={() => go(origin)} onUpdate={update} />
      </Sheet>
    </Screen>
  )
}

/**
 * Hero art slot (DS 834:79347): 160×120, each illustration at its Figma size
 * (FIT) so titles line up. Swaps with a cross-fade and scale; floats gently.
 */
function HeroSlot({ base }: { base: Base }) {
  const reduce = useReducedMotion()
  const art = HERO[base]
  return (
    <motion.div
      data-anno="hs-hero"
      className="relative h-[120px] w-[160px]"
      animate={reduce ? undefined : { y: [0, -5, 0] }}
      transition={{ duration: 4.2, ease: 'easeInOut', repeat: Infinity }}
    >
      <AnimatePresence initial={false}>
        <motion.img
          key={base}
          src={art.src}
          alt={art.alt}
          draggable={false}
          className="absolute left-1/2 top-1/2 max-w-none select-none"
          style={{ width: art.w, height: art.h, marginLeft: -art.w / 2, marginTop: -art.h / 2 }}
          initial={{ opacity: 0, scale: 0.82 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 1.12 }}
          transition={{ type: 'spring', stiffness: 260, damping: 24, opacity: { duration: 0.3 } }}
        />
      </AnimatePresence>
    </motion.div>
  )
}

/** B6 · “Send Rahul a gentle nudge?” (white card, radius 16, shadow 0 2 12 /6%). */
function NudgeCard() {
  return (
    <div data-anno="hs-nudge" className="flex flex-col gap-3 rounded-[16px] bg-white p-4 shadow-[0_2px_12px_rgba(0,0,0,0.06)]">
      <p className="text-[16px] font-semibold leading-[normal] text-ink-2">Send Rahul a gentle nudge?</p>
      <div data-anno="hs-nudge-quote" className="flex flex-col gap-[6px] rounded-[12px] border border-[#ededf0] bg-[#f7f7f8] p-[14px]">
        <p className="serif text-[16px] italic leading-[22px] text-ink-2">“Did you see my hint? 25 Nov is close.”</p>
        <p className="text-[12px] leading-[normal] text-muted-2">Same link · you send it, from your WhatsApp</p>
      </div>
      <Button
        weight="medium"
        variant="whatsapp"
        size="md"
        block
        icon={<WhatsappLogo size={20} weight="fill" />}
        data-anno="hs-nudge-cta"
      >
        Nudge on WhatsApp
      </Button>
    </div>
  )
}
