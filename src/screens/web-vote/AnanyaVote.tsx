import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { ChatCircleText, Check, EyeSlash, Ruler } from '@phosphor-icons/react'
import type { FrameId } from '@/proto/frames'
import type { FrameAnnotations } from '@/proto/annotations'
import { useNav } from '@/proto/nav'
import { useEnv } from '@/proto/env'
import { useProtoState } from '@/proto/store'
import { haptic } from '@/proto/haptics'
import { PRODUCTS, type ProductId } from '@/data/products'
import {
  AuraBlob, HeroArt, OccasionPill, PinkPageAura, PrivacyFootnote, SafariBar, Screen, ScrollView, WebHeader, cn, useSafariInset,
} from '@/ui'
import envelopeSent from '@/assets/illustrations/envelope-sent.webp'
import { VoteTile } from './VoteTile'

export const annotations: FrameAnnotations = {
  A9: [
    { id: 'web-header', title: 'A link, nothing to install', body: 'Ananya opens Rahul’s link in Safari. No app and no login; “Open in app” is offered, never required.' },
    { id: 'secret-pill', title: 'Secrecy, stated first', body: 'The eye-slash pill sets the one rule before anything else: this is about Priya, so it stays away from Priya.' },
    { id: 'vote-title', title: 'One question', body: 'A single serif headline in Rahul’s pink asks the only thing that matters. Everything below answers it in taps.' },
    { id: 'rahul-note', title: 'Rahul’s ask, in his words', body: 'Name, time and his own line make it personal, and the occasion pill gives the deadline without Ananya having to ask.' },
    { id: 'vote-tiles', title: 'One tap for the piece', body: 'Rahul’s three picks with prices hidden. Single-select, with a check, a violet edge and “Your vote” so the choice is unmistakable.' },
    { id: 'size-chips', title: 'One tap for her size', body: '12 comes preselected as the most chosen size, and “Not sure” is a valid answer, so nobody guesses under pressure.' },
    { id: 'size-hint', title: 'A practical tip', body: 'How to check her size without asking, plus a promise: Rahul sees only the number.' },
    { id: 'line-for-rahul', title: 'An optional line', body: 'A real text field, prefilled with a useful nudge. Optional, so writing never blocks the vote.' },
    { id: 'send-cta', title: 'Send, then closed', body: 'One primary action. On tap it morphs into a sent state with a haptic, and the link closes after one vote, as Rahul was told in A8.' },
    { id: 'safari-bar', title: 'Real Safari chrome', body: 'Drawn only in the mockup. On a phone the browser’s own bar shows and the CTA sits on the safe area instead.' },
    { id: 'vote-sent', title: 'Sent to Rahul (prototype-only)', body: 'Not in Figma. Confirms exactly what Rahul receives, closes the link and repeats that Priya never sees it.' },
  ],
}

const PICKS: ProductId[] = ['vanki', 'hearts-vine', 'twist']
/** Four equal chips sharing the row (Figma “Sizes”, 830:25704: each Fill, 8px apart). */
const SIZES = [
  { id: '11', label: '11' },
  { id: '12', label: '12' },
  { id: '13', label: '13' },
  { id: 'not-sure', label: 'Not sure' },
] as const
export type VoteSize = (typeof SIZES)[number]['id']

const DEFAULT_LINE = 'She never takes off gold. Go with the Vanki!'

type Phase = 'idle' | 'sending' | 'sent' | 'done'

export default function AnanyaVote(_props: { frame: FrameId }) {
  const { back } = useNav()
  const { mockup } = useEnv()
  const safari = useSafariInset()
  const reduce = useReducedMotion()
  const scroller = useRef<HTMLDivElement>(null)

  const [pick, setPick] = useProtoState<ProductId>('vote.pick', 'vanki')
  const [size, setSize] = useProtoState<VoteSize>('vote.size', '12')
  const [line, setLine] = useProtoState('vote.line', DEFAULT_LINE)
  const [, setSent] = useProtoState('vote.sent', false)
  const [phase, setPhase] = useState<Phase>('idle')

  // sending (0.9s) → sent tick (0.7s) → confirmation
  useEffect(() => {
    if (phase === 'sending') {
      const t = setTimeout(() => setPhase('sent'), 900)
      return () => clearTimeout(t)
    }
    if (phase === 'sent') {
      const t = setTimeout(() => {
        setPhase('done')
        scroller.current?.scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' })
      }, 700)
      return () => clearTimeout(t)
    }
  }, [phase, reduce])

  const send = () => {
    if (phase !== 'idle') return
    haptic('success')
    setSent(true)
    setPhase('sending')
    ;(document.activeElement as HTMLElement | null)?.blur?.()
  }

  const done = phase === 'done'
  const ctaBottom = safari ? safari + 12 : 'var(--safe-bottom-pad)'

  return (
    <Screen bg="#fdfdfd">
      <ScrollView scrollRef={scroller} backdrop={<PageAura />} bottomInset={done ? safari + 24 : `calc(${safari ? `${safari + 12}px` : 'var(--safe-bottom-pad)'} + 52px + 40px)`}>
        <WebHeader data-anno="web-header" />
        <AnimatePresence mode="wait" initial={false}>
          {!done ? (
            <motion.div
              key="form"
              className={cn('flex flex-col gap-7 px-4 pt-2', phase !== 'idle' && 'pointer-events-none')}
              exit={{ opacity: 0, y: reduce ? 0 : -12, transition: { duration: 0.22 } }}
            >
              {/* Hero */}
              <div className="flex flex-col items-center gap-[10px]">
                <div
                  data-anno="secret-pill"
                  className="flex items-center gap-[6px] rounded-full border border-solid border-[#ffcadf] bg-white/85 py-[6px] pl-[10px] pr-3"
                >
                  <EyeSlash size={14} color="#dd1564" />
                  <span className="whitespace-nowrap text-[14px] font-semibold leading-none text-pink">Secret · please don’t share with Priya</span>
                </div>
                <h1 data-anno="vote-title" className="serif text-balance text-center text-[28px] font-normal leading-[34px] text-pink">
                  Which one would Priya wear?
                </h1>
              </div>

              {/* Rahul’s note */}
              <div
                data-anno="rahul-note"
                className="flex flex-col items-start gap-[10px] rounded-[12px] border border-solid border-[#f1f1f1] bg-white p-4 shadow-[0_6px_8px_rgba(0,0,0,0.04)]"
              >
                <div className="flex items-center gap-[10px]">
                  <span className="flex size-9 shrink-0 items-center justify-center rounded-full border border-solid border-violet-stroke bg-violet-tint">
                    <span className="serif text-[18px] leading-none text-violet">R</span>
                  </span>
                  <div className="flex flex-col gap-[6px] whitespace-nowrap">
                    <p className="text-[16px] font-semibold leading-none text-black">Rahul</p>
                    <p className="text-[12px] leading-none text-muted">Asked you, secretly · Tue 11 Nov, 1:20 pm</p>
                  </div>
                </div>
                <p className="serif w-full text-[16px] italic leading-6 text-black">
                  “Our anniversary is on the 25th. You know her best. Help me not mess this up.”
                </p>
                <OccasionPill className="[&>span]:leading-none">Anniversary · Tue 25 Nov · 14 days to go</OccasionPill>
              </div>

              {/* 1 · Vote */}
              <div className="flex flex-col gap-3">
                <p id="vote-label" className="text-[12px] font-bold leading-none text-ink-3">1 · Tap the one she’d love</p>
                <div data-anno="vote-tiles" role="radiogroup" aria-labelledby="vote-label" className="grid grid-cols-3 gap-5">
                  {PICKS.map((id) => (
                    <VoteTile key={id} id={id} selected={pick === id} onSelect={() => setPick(id)} />
                  ))}
                </div>
              </div>

              {/* 2 · Size */}
              <div className="flex flex-col gap-[10px]">
                <p id="size-label" className="text-[12px] font-bold leading-none text-ink-3">2 · Her ring size, if you know it</p>
                <div data-anno="size-chips" role="radiogroup" aria-labelledby="size-label" className="flex gap-2">
                  {SIZES.map((s) => {
                    const on = size === s.id
                    return (
                      <motion.button
                        key={s.id}
                        type="button"
                        role="radio"
                        aria-checked={on}
                        onClick={() => setSize(s.id)}
                        whileTap={{ scale: 0.94 }}
                        transition={{ type: 'spring', stiffness: 600, damping: 30 }}
                        className={cn(
                          'flex h-9 min-w-0 flex-1 basis-0 items-center justify-center whitespace-nowrap rounded-full border border-solid text-[14px] leading-none transition-colors duration-200',
                          on ? 'border-violet bg-violet-tint font-semibold text-violet' : 'border-[#e4e4e7] bg-white font-medium text-ink-2',
                        )}
                      >
                        {s.label}
                      </motion.button>
                    )
                  })}
                </div>
                <div data-anno="size-hint" className="flex items-start gap-[6px]">
                  <Ruler size={14} color="#6b6b6b" className="shrink-0" />
                  <p className="pt-px text-[12px] leading-none text-muted-2">Check a ring she wears often. Rahul sees only the number</p>
                </div>
              </div>

              {/* 3 · A line for Rahul */}
              <label
                data-anno="line-for-rahul"
                className="flex cursor-text items-center gap-[10px] rounded-[12px] border border-solid border-line-2 bg-white py-[10px] pl-3 pr-[14px]"
              >
                <ChatCircleText size={20} color="#767676" className="shrink-0" />
                <span className="flex min-w-0 flex-1 flex-col gap-[2px]">
                  <span className="text-[12px] font-medium leading-none text-muted">3 · A line for Rahul (optional)</span>
                  <input
                    type="text"
                    value={line}
                    onChange={(e) => setLine(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && e.currentTarget.blur()}
                    maxLength={120}
                    enterKeyHint="done"
                    autoComplete="off"
                    placeholder="Anything that would help him choose"
                    aria-label="A line for Rahul (optional)"
                    className="-my-[3px] h-5 w-full min-w-0 bg-transparent p-0 text-[14px] font-medium leading-none text-black outline-none placeholder:font-normal placeholder:text-[#a3a3a3] focus:outline-none focus-visible:outline-none"
                  />
                </span>
              </label>
            </motion.div>
          ) : (
            <SentState key="sent" pick={pick} size={size} line={line} />
          )}
        </AnimatePresence>
      </ScrollView>

      {/* Fade under the CTA + Safari bar, then the CTA */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-0 z-[49]"
        style={{
          height: mockup ? safari + 12 + 52 + 56 : 'calc(var(--safe-bottom-pad) + 52px + 56px)',
          background: 'linear-gradient(to bottom, rgba(253,253,253,0) 0%, rgba(253,253,253,0.9) 34%, #fdfdfd 52%)',
        }}
      />
      <AnimatePresence>
        {!done && (
          <motion.div
            key="cta"
            className="absolute inset-x-0 z-[50] flex justify-center px-4"
            style={{ bottom: ctaBottom }}
            exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
          >
            <SendButton phase={phase} onSend={send} />
          </motion.div>
        )}
      </AnimatePresence>
      <SafariBar onBack={back} />
    </Screen>
  )
}

/* ───────────────────────── Pieces ───────────────────────── */

/** A9 pink page aura: floral motif + rose / violet / peach blobs (A9 positions). */
function PageAura() {
  return (
    <>
      <PinkPageAura blobs={false} />
      <AuraBlob x={10} y={-42} w={369} h={79} color="#ffbad5" />
      <AuraBlob x={-33} y={7} w={162} h={31} color="#df93fe" />
      <AuraBlob right={-28} y={-4} w={162} h={39} color="#ffe6c9" />
    </>
  )
}

/**
 * “Button - Liquid Glass · Send my vote” (Glass Prominent, 52px). On send it
 * morphs: the label folds away while the pill shrinks to a 52px circle with a
 * spinner, then a check pops.
 */
function SendButton({ phase, onSend }: { phase: Phase; onSend: () => void }) {
  const busy = phase !== 'idle'
  return (
    <motion.button
      type="button"
      data-anno="send-cta"
      onClick={onSend}
      aria-disabled={busy}
      aria-live="polite"
      aria-label={phase === 'idle' ? undefined : phase === 'sending' ? 'Sending your vote' : 'Vote sent'}
      initial={false}
      animate={{ width: busy ? 52 : '100%' }}
      transition={{ type: 'spring', stiffness: 380, damping: 34 }}
      whileTap={busy ? undefined : { scale: 0.97 }}
      className="glass-tint pn-button-text relative flex h-[52px] items-center justify-center overflow-hidden whitespace-nowrap rounded-full bg-violet text-[17px] font-semibold leading-[18px] text-white transition-[filter] duration-200 hover:brightness-[1.04] active:brightness-95"
    >
      <AnimatePresence mode="popLayout" initial={false}>
        {phase === 'idle' && (
          <motion.span key="label" exit={{ opacity: 0, scale: 0.92, transition: { duration: 0.12 } }}>
            Send my vote to Rahul
          </motion.span>
        )}
        {phase === 'sending' && (
          <motion.span
            key="spin"
            className="block size-[22px] rounded-full border-[2.5px] border-solid border-white/35 border-t-white"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1, rotate: 360 }}
            exit={{ opacity: 0, transition: { duration: 0.1 } }}
            transition={{ opacity: { duration: 0.2, delay: 0.12 }, rotate: { duration: 0.8, ease: 'linear', repeat: Infinity } }}
          />
        )}
        {(phase === 'sent' || phase === 'done') && (
          <motion.span
            key="check"
            className="flex"
            initial={{ scale: 0.3, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 640, damping: 18 }}
          >
            <Check size={24} weight="bold" />
          </motion.span>
        )}
      </AnimatePresence>
    </motion.button>
  )
}

/** Confirmation after sending (prototype-only: not in Figma). */
function SentState({ pick, size, line }: { pick: ProductId; size: VoteSize; line: string }) {
  const reduce = useReducedMotion()
  const parts = [`the ${PRODUCTS[pick].short}`]
  if (size !== 'not-sure') parts.push(`size ${size}`)
  if (line.trim()) parts.push('your line')
  const sees = parts.length > 1 ? `${parts.slice(0, -1).join(', ')} and ${parts.at(-1)}` : parts[0]
  const rise = (delay: number) => ({
    initial: { opacity: 0, y: reduce ? 0 : 12 },
    animate: { opacity: 1, y: 0 },
    transition: { type: 'spring' as const, stiffness: 300, damping: 30, delay },
  })
  return (
    <motion.div
      data-anno="vote-sent"
      className="flex flex-col items-center px-6 pb-6 pt-14 text-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.2 }}
    >
      <motion.div
        initial={reduce ? { opacity: 0 } : { opacity: 0, y: -24, rotate: -10, scale: 0.8 }}
        animate={{ opacity: 1, y: 0, rotate: 0, scale: 1 }}
        transition={{ type: 'spring', stiffness: 260, damping: 18 }}
      >
        <HeroArt src={envelopeSent} alt="" imgStyle={{ width: 150 }} />
      </motion.div>
      <motion.h1 {...rise(0.12)} className="serif mt-5 text-[28px] font-normal leading-[34px] text-pink">
        Sent to Rahul
      </motion.h1>
      <motion.p {...rise(0.18)} className="mt-2 max-w-[330px] text-[16px] leading-[1.45] text-ink-3">
        He sees {sees}. This link is now closed.
      </motion.p>
      <motion.div {...rise(0.26)} className="mt-6">
        <PrivacyFootnote>Priya never sees your vote or this page</PrivacyFootnote>
      </motion.div>
    </motion.div>
  )
}
