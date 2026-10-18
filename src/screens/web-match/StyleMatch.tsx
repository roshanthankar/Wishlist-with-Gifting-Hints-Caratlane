import { useEffect, useLayoutEffect, useRef, useState, type ReactNode } from 'react'
import { MotionConfig, motion, useIsPresent, useMotionValue, useSpring, useTransform, type MotionValue } from 'motion/react'
import { ArrowCounterClockwise, Heart, Sparkle, X } from '@phosphor-icons/react'
import type { FrameId } from '@/proto/frames'
import type { FrameAnnotations } from '@/proto/annotations'
import { useNav } from '@/proto/nav'
import { useUi } from '@/proto/ui'
import { useEnv } from '@/proto/env'
import { useProtoState } from '@/proto/store'
import { AuraBlob, Button, PinkPageAura, SafariBar, Screen, ScrollView, WebHeader, cn, useSafariInset } from '@/ui'
import { DECK, FIGMA_LEFT_MS, ROUND_MS, SEED, tally, type Swipe } from './deck'
import { SwipeDeck, type DeckHandle } from './SwipeDeck'
import { TimerRing } from './TimerRing'
import { LovedFan, MatchOverlay, ModalCard } from './MatchModal'

export const annotations: FrameAnnotations = {
  A11: [
    { id: 'web-header', title: 'A link, not an app', body: 'Priya opens Rahul’s game link in Safari. No login and no install; “Open in app” is offered, never required.' },
    { id: 'game-pill', title: 'Framed as a game', body: '“Style match with Rahul” reads as a couples game, not a gift survey, so Rahul’s shortlist stays a surprise.' },
    { id: 'timer-ring', title: 'A 30-second timer', body: 'The draining ring keeps it quick and playful. It is for fun, not a lock: when it runs out, Priya can keep going (A11b).' },
    { id: 'game-title', title: 'One question', body: '“Would you wear it?” asks about taste, never budget. No prices appear anywhere in the game.' },
    { id: 'game-progress', title: 'Nearly there', body: 'Eight short segments and “4 of 8” show the end is close, which keeps the swipes coming.' },
    { id: 'swipe-deck', title: 'Swipe deck', body: 'Rahul’s three picks hide among look-alikes. The card follows the finger and tilts, its edge tints pink or grey with the direction, and a fling sends it off.' },
    { id: 'leave-btn', title: 'Leave it', body: 'The same as swiping left, for anyone who prefers to tap. A 64px target that leans in as the card is dragged left.' },
    { id: 'undo-btn', title: 'Undo', body: 'Deliberately smaller: a safety net, not a choice. The last card springs back from the side it left.' },
    { id: 'love-btn', title: 'Love it', body: 'The hero action in pink. Loves quietly rank Rahul’s shortlist; Priya only ever sees a match score.' },
    { id: 'safari-bar', title: 'Real Safari chrome', body: 'Drawn only in the mockup. On a phone the browser’s own bar shows and the layout reflows around it.' },
    { id: 'match-result', title: 'Match score (prototype-only)', body: 'Not in Figma. The game ends on “You matched on 5 of 8” and the pieces both loved, in the same card language as A11b.' },
  ],
  A11b: [
    { id: 'timer-ring', title: 'Out of time', body: 'The ring has drained to 0:00, but nothing is locked: the game is still right there behind the card.' },
    { id: 'swipe-deck', title: 'Game kept in view', body: 'The deck stays visible under the wash, mid-swipe, so the pause feels like a breather rather than a dead end.' },
    { id: 'timesup-scrim', title: 'Soft wash, not a wall', body: 'White at 55% with a background blur fades the game back instead of a dark scrim, keeping the moment light.' },
    { id: 'timesup-card', title: 'Time up, softly', body: 'A friendly serif headline and the live tally. “No rush” sets the tone: the timer was only ever for fun.' },
    { id: 'see-match', title: 'See our match', body: 'Secondary: jump straight to the score for anyone who has had enough.' },
    { id: 'keep-going', title: 'Keep going', body: 'The pink primary. It starts a fresh 30-second round from the same card, so no swipe is lost.' },
    { id: 'safari-bar', title: 'Browser stays usable', body: 'Only the page is dimmed; the browser chrome stays crisp and in reach.' },
  ],
}

const GAME_TOP = 4 + 56 + 14 + 44 + 14 + 12 + 14 // game bar → deck
const BELOW_DECK = 14 + 84 // gap + actions
const FIGMA_TIMESUP_COPY = 'You loved 3 of 6 so far.'

export default function StyleMatch({ frame }: { frame: FrameId }) {
  const { go, back } = useNav()
  const { activeAnno } = useUi()
  const { mockup } = useEnv()
  const present = useIsPresent()
  const safari = useSafariInset()

  /* ── Game state ─────────────────────────────────────────────── */
  const [decisions, setDecisions] = useProtoState<Swipe[]>('match.decisions', SEED)
  const [touched, setTouched] = useProtoState('match.touched', false)
  const [flying, setFlying] = useState<string[]>([])
  const [restoring, setRestoring] = useState<{ id: string; from: Swipe } | null>(null)
  const [result, setResult] = useState(false)
  const index = decisions.length
  const complete = index >= DECK.length
  const score = tally(decisions)
  const deck = useRef<DeckHandle>(null)
  const dragX = useMotionValue(0)

  const onSwipe = (id: string, dir: Swipe) => {
    const i = DECK.findIndex((c) => c.id === id)
    setTouched(true)
    setRestoring(null)
    setFlying((f) => (f.includes(id) ? f : [...f, id]))
    setDecisions((d) => {
      const next = d.slice(0, i)
      next[i] = dir
      return next
    })
  }
  const onGone = (id: string) => setFlying((f) => f.filter((v) => v !== id))
  const undo = () => {
    if (!decisions.length) return
    const i = decisions.length - 1
    const card = DECK[i]
    setTouched(true)
    setResult(false)
    setFlying((f) => f.filter((v) => v !== card.id))
    setRestoring({ id: card.id, from: decisions[i] })
    setDecisions((d) => d.slice(0, -1))
  }

  /* ── Timer: 0:18 left of a 30 s round, real time, drains at 60fps ── */
  const leftMs = useMotionValue(frame === 'A11b' ? 0 : FIGMA_LEFT_MS)
  const [secs, setSecs] = useState(() => Math.ceil(leftMs.get() / 1000))
  const restartClock = () => {
    leftMs.set(ROUND_MS)
    setSecs(ROUND_MS / 1000)
  }
  // Back on A11 with no time left (Keep going, or a jump from the shell): fresh round.
  useEffect(() => {
    if (frame === 'A11' && leftMs.get() <= 0) restartClock()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [frame])
  const running = present && frame === 'A11' && !result && !complete && !activeAnno
  useEffect(() => {
    if (!running) return
    let raf = 0
    let last = performance.now()
    const tick = (now: number) => {
      // Clamp so time spent in a background tab doesn’t count.
      const dt = Math.min(now - last, 100)
      last = now
      const next = Math.max(0, leftMs.get() - dt)
      leftMs.set(next)
      setSecs(Math.ceil(next / 1000))
      if (next <= 0) {
        go('A11b')
        return
      }
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [running, leftMs, go])

  // All eight swiped: show the score once the last card has flown.
  useEffect(() => {
    if (!complete || flying.length) return
    const t = setTimeout(() => setResult(true), 220)
    return () => clearTimeout(t)
  }, [complete, flying.length])

  const playAgain = () => {
    setTouched(true)
    setFlying([])
    setRestoring(null)
    setDecisions([])
    setResult(false)
    restartClock()
    if (frame !== 'A11') go('A11')
  }

  /* ── Fit the deck on short phones (the mockup always fits at 1:1) ── */
  const probe = useRef<HTMLDivElement>(null)
  const [fit, setFit] = useState(1)
  useLayoutEffect(() => {
    const el = probe.current
    const screen = el?.parentElement
    if (!el || !screen) return
    const measure = () => {
      const avail = screen.clientHeight - el.offsetHeight - 52 - GAME_TOP - BELOW_DECK - (safari ? safari + 8 : 0)
      setFit(Math.min(1, Math.max(0.68, avail / 392)))
    }
    measure()
    const ro = new ResizeObserver(measure)
    ro.observe(screen)
    return () => ro.disconnect()
  }, [safari])

  const overlay = frame === 'A11b' ? 'timesup' : result ? 'result' : null
  const locked = !!overlay || complete
  const preview: Swipe | null = frame === 'A11b' && !touched ? 'love' : null
  const timesUpCopy = touched ? `You loved ${score.loved} of ${score.seen} so far.` : FIGMA_TIMESUP_COPY

  const deckEl = (
    <SwipeDeck
      ref={deck}
      data-anno="swipe-deck"
      index={index}
      flying={flying}
      restoring={restoring}
      preview={preview}
      disabled={locked}
      dragX={dragX}
      onSwipe={onSwipe}
      onGone={onGone}
    />
  )

  return (
    <Screen bg="#fdfdfd">
      {/* Measures safe-top (+ the bottom pad on phones) for the deck fit below */}
      <div
        ref={probe}
        aria-hidden
        className="pointer-events-none invisible absolute inset-x-0 top-0"
        style={{ height: safari ? 'var(--safe-top)' : 'calc(var(--safe-top) + var(--safe-bottom-pad))' }}
      />
      <ScrollView backdrop={<PageAura />} bottomInset={safari ? safari + 8 : 'var(--safe-bottom-pad)'}>
        <WebHeader data-anno="web-header" />
        <div className="flex flex-col gap-[14px] px-4 pt-1">
          {/* Game bar: pill + timer */}
          <div className="flex h-14 items-center justify-between">
            <div
              data-anno="game-pill"
              className="flex items-center gap-[6px] rounded-full border border-solid border-[#ffcadf] bg-white px-3 py-[6px]"
            >
              <Sparkle size={14} color="#dd1564" />
              <span className="whitespace-nowrap text-[14px] font-semibold leading-none text-pink">Style match with Rahul</span>
            </div>
            <TimerRing data-anno="timer-ring" leftMs={leftMs} totalMs={ROUND_MS} seconds={secs} />
          </div>

          <h1 data-anno="game-title" className="serif text-center text-[32px] font-normal leading-[normal] text-pink">
            Would you wear it?
          </h1>

          <Progress done={index} />

          {/* Deck (scaled down only when a short phone can’t fit it) */}
          <div className="relative w-full" style={{ height: 392 * fit }}>
            {fit < 1 ? (
              <MotionConfig transformPagePoint={(p) => ({ x: p.x / fit, y: p.y / fit })}>
                <div className="absolute inset-x-0 top-0" style={{ height: 392, transform: `scale(${fit})`, transformOrigin: '50% 0' }}>
                  {deckEl}
                </div>
              </MotionConfig>
            ) : (
              deckEl
            )}
            {complete && !flying.length && <AllDone matched={score.matched} onPlayAgain={playAgain} />}
          </div>

          <Actions
            dragX={dragX}
            canSwipe={!complete}
            canUndo={index > 0}
            onLeave={() => deck.current?.swipe('leave')}
            onLove={() => deck.current?.swipe('love')}
            onUndo={undo}
          />
        </div>
      </ScrollView>

      {mockup && <SafariFade />}
      <SafariBar onBack={back} className={overlay ? 'z-[80]!' : undefined} />

      <MatchOverlay open={overlay} safariInset={safari}>
        {overlay === 'timesup' ? (
          <ModalCard
            data-anno="timesup-card"
            title={<h2 className="serif whitespace-nowrap text-[36px] font-normal leading-[normal] text-pink">Time up!</h2>}
            actions={
              <>
                <Button data-anno="see-match" variant="secondary" block="flex" onClick={() => { setResult(true); go('A11') }}>
                  See our match
                </Button>
                <Button data-anno="keep-going" variant="pink" block="flex" onClick={() => go('A11')}>
                  Keep going
                </Button>
              </>
            }
          >
            <p className="w-full text-center text-[16px] leading-[1.45] text-ink-3">{timesUpCopy} No rush: keep going, or see how well you match.</p>
          </ModalCard>
        ) : overlay === 'result' ? (
          <ModalCard
            data-anno="match-result"
            title={
              <h2 className="serif text-balance text-center text-[28px] font-normal leading-[34px] text-pink">
                You matched on {score.matched} of {score.seen}
              </h2>
            }
            actions={
              <>
                <Button variant="secondary" block="flex" onClick={complete ? playAgain : () => setResult(false)}>
                  {complete ? 'Play again' : 'Keep going'}
                </Button>
                <Button
                  variant="pink"
                  block="flex"
                  onClick={() => {
                    setResult(false)
                  }}
                >
                  Done
                </Button>
              </>
            }
          >
            {score.bothLoved.length > 0 && <LovedFan cards={score.bothLoved} />}
            <p className="w-full text-center text-[16px] leading-[1.45] text-ink-3">
              {complete ? '' : `${DECK.length - score.seen} to go. `}
              {score.bothLoved.length > 0
                ? `Rahul sees this score and the ${score.bothLoved.length === 1 ? 'piece' : `${score.bothLoved.length} pieces`} you both loved.`
                : 'Rahul sees this score, nothing else.'}
            </p>
          </ModalCard>
        ) : null}
      </MatchOverlay>
    </Screen>
  )
}

/* ───────────────────────── Pieces ───────────────────────── */

/** A9/A11 pink page aura: floral motif + rose / violet / peach blobs (A11 positions). */
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

/** “Fade under Safari bar” (104px, #FDFDFD 0 → 92% at 45% → 100%). */
function SafariFade() {
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-x-0 bottom-0 z-[49] h-[104px]"
      style={{ background: 'linear-gradient(to bottom, rgba(253,253,253,0) 0%, rgba(253,253,253,0.92) 45%, #fdfdfd 100%)' }}
    />
  )
}

/** Progress (370×12): 8 segments, 6px, radius 4, gap 6; done = pink, to go = #FFE1ED; “4 of 8” Semibold 12. */
function Progress({ done }: { done: number }) {
  const total = DECK.length
  return (
    <div
      data-anno="game-progress"
      className="flex h-3 items-center gap-[6px]"
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={total}
      aria-valuenow={done}
      aria-label="Cards swiped"
    >
      {DECK.map((c, i) => (
        <span key={c.id} className="relative h-[6px] min-w-0 flex-1 overflow-hidden rounded-[4px] bg-pink-tint">
          <motion.span
            className="absolute inset-0 origin-left rounded-[4px] bg-pink"
            initial={false}
            animate={{ scaleX: i < done ? 1 : 0 }}
            transition={{ type: 'spring', stiffness: 420, damping: 36 }}
          />
        </span>
      ))}
      <span className="tabular shrink-0 whitespace-nowrap text-[12px] font-semibold leading-none text-muted">
        {Math.min(done + 1, total)} of {total}
      </span>
    </div>
  )
}

/** Leave it (64, white), Undo (44), Love it (64, pink); gap 28, labels Semibold 12. */
function Actions({
  dragX,
  canSwipe,
  canUndo,
  onLeave,
  onLove,
  onUndo,
}: {
  dragX: MotionValue<number>
  canSwipe: boolean
  canUndo: boolean
  onLeave: () => void
  onLove: () => void
  onUndo: () => void
}) {
  // The button on the side the card is dragged towards leans in.
  const loveLean = useSpring(useTransform(dragX, [0, 120], [1, 1.12], { clamp: true }), { stiffness: 500, damping: 30 })
  const leaveLean = useSpring(useTransform(dragX, [-120, 0], [1.12, 1], { clamp: true }), { stiffness: 500, damping: 30 })
  return (
    <div className="flex items-end justify-center gap-7">
      <ActionButton anno="leave-btn" label="Leave it" size={64} lean={leaveLean} disabled={!canSwipe} onClick={onLeave}
        className="border border-solid border-line bg-white">
        <X size={26} color="#3e3e3e" />
      </ActionButton>
      <ActionButton anno="undo-btn" label="Undo" size={44} disabled={!canUndo} onClick={onUndo} className="border border-solid border-line bg-white">
        <ArrowCounterClockwise size={18} color="#9b9b9b" />
      </ActionButton>
      <ActionButton anno="love-btn" label="Love it" size={64} lean={loveLean} disabled={!canSwipe} onClick={onLove} className="bg-pink" labelClassName="text-pink">
        <Heart size={26} weight="fill" color="#fff" />
      </ActionButton>
    </div>
  )
}

function ActionButton({
  anno,
  label,
  size,
  lean,
  disabled,
  onClick,
  className,
  labelClassName,
  children,
}: {
  anno: string
  label: string
  size: number
  lean?: MotionValue<number>
  disabled?: boolean
  onClick: () => void
  className?: string
  labelClassName?: string
  children: ReactNode
}) {
  return (
    <div data-anno={anno} className="flex flex-col items-center gap-2">
      <motion.span className="flex" style={{ scale: lean }}>
        <motion.button
          type="button"
          aria-label={label}
          disabled={disabled}
          onClick={onClick}
          whileTap={disabled ? undefined : { scale: 0.88 }}
          transition={{ type: 'spring', stiffness: 600, damping: 26 }}
          className={cn(
            'flex items-center justify-center rounded-full shadow-[0_6px_16px_rgba(0,0,0,0.1)] transition-opacity duration-200 disabled:opacity-40',
            className,
          )}
          style={{ width: size, height: size }}
        >
          {children}
        </motion.button>
      </motion.span>
      <span className={cn('text-[12px] font-semibold leading-none text-muted', labelClassName)}>{label}</span>
    </div>
  )
}

/** Shown in the deck once all eight are swiped and the score card is closed (prototype-only). */
function AllDone({ matched, onPlayAgain }: { matched: number; onPlayAgain: () => void }) {
  return (
    <motion.div
      className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-center"
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: 'spring', stiffness: 300, damping: 28 }}
    >
      <span className="flex size-14 items-center justify-center rounded-full bg-pink-tint">
        <Sparkle size={26} weight="fill" color="#dd1564" />
      </span>
      <p className="serif text-[28px] leading-[34px] text-pink">That’s all 8</p>
      <p className="text-[14px] font-medium leading-none text-muted">You matched on {matched} of {DECK.length}</p>
      <Button variant="pink" size="sm" onClick={onPlayAgain} className="mt-1">
        Play again
      </Button>
    </motion.div>
  )
}
