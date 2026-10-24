import { useCallback, useEffect, useLayoutEffect, useRef, useState, type ReactNode } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { CalendarBlank, Sparkle, WarningCircle } from '@phosphor-icons/react'
import type { FrameId } from '@/proto/frames'
import type { FrameAnnotations } from '@/proto/annotations'
import { useNav } from '@/proto/nav'
import { getProto, setProto, useProtoState } from '@/proto/store'
import { haptic } from '@/proto/haptics'
import { OccasionPill, ProductPhoto } from '@/ui'
import type { ProductId } from '@/data/products'
import giftCard from '@/assets/illustrations/gift-card.webp'
import { HintBackdrop, WebPage } from './HintShell'
import { PickCard, PickTag, type PickAnno } from './PickCard'
import { HowHintsWork, TrustFooter, YourTurn } from './HowHintsWork'
import { EnvelopeHero, Reveal, reached, useOpening, type Phase } from './OpeningMotion'

/**
 * Route `hint-page` — Rahul opens Priya’s hint on mobile web.
 *   C1  the hint lands (opening motion on first open); how hints work at the end
 *   C2  return visit: compact header, Vanki held for Rahul
 *   E2  none of the picks are left
 *   E3  two things changed since Priya sent it
 * C1 → C2 → E2 / E3 change in place with a cross-fade.
 */

type View = 'landing' | 'held' | 'gone' | 'changed'
const viewFor = (f: FrameId): View => (f === 'C2' ? 'held' : f === 'E2' ? 'gone' : f === 'E3' ? 'changed' : 'landing')

const EASE_OUT = [0.22, 1, 0.36, 1] as const
const QUOTES: Partial<Record<ProductId, string>> = {
  vanki: '“This one—I’d wear it every day.”',
  'hearts-vine': '“If you’re feeling brave…”',
}
const RANGES: Partial<Record<ProductId, string>> = { vanki: '₹9–10k', 'hearts-vine': '₹12–13k' }

export default function HintPage({ frame }: { frame: FrameId }) {
  const { go, dir } = useNav()
  const view = viewFor(frame)
  const scrollRef = useRef<HTMLDivElement>(null)
  const frameRef = useRef(frame)
  frameRef.current = frame

  /* ── Opening motion: C1, once per link + device ── */
  const [introOnMount] = useState(() => frame === 'C1' && !getProto('hint.opened', false))
  const [c1Play, setC1Play] = useState(introOnMount)
  const runKey = 'c1'
  const play = c1Play && frame === 'C1'
  const k = 1
  const { phase, reduce, animating, skip } = useOpening({
    runKey,
    play,
    speed: k,
    preroll: dir === 'forward' ? 520 : 320,
    haptics: true,
  })

  useEffect(() => {
    if (introOnMount) setProto('hint.opened', true)
  }, [introOnMount])
  useEffect(() => {
    if (phase === 'done') setC1Play(false)
  }, [phase])

  /* ── Scroll: every frame starts at the top ── */
  const syncScroll = useCallback((smooth: boolean) => {
    const el = scrollRef.current
    if (!el) return
    if (smooth) el.scrollTo({ top: 0, behavior: 'smooth' })
    else el.scrollTop = 0
  }, [])
  const prevFrame = useRef(frame)
  useLayoutEffect(() => {
    const prev = prevFrame.current
    prevFrame.current = frame
    if (prev === frame) {
      syncScroll(false)
    } else if (viewFor(prev) === view) {
      syncScroll(!reduce)
    }
  }, [frame, view, reduce, syncScroll])

  /* ── Picks: saved, held ── */
  const [saved, setSaved] = useProtoState<Partial<Record<ProductId, boolean>>>('hint.saved', { vanki: true })
  const [heldStore, setHeld] = useProtoState<ProductId | null | undefined>('hint.held', undefined)
  const held: ProductId | null = heldStore === undefined ? (view === 'held' ? 'vanki' : null) : heldStore
  const [fresh, setFresh] = useState(false)
  const leaveTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)
  useEffect(() => () => clearTimeout(leaveTimer.current), [])
  useEffect(() => setFresh(false), [view])

  const toggleSave = (id: ProductId) => {
    const next = !saved[id]
    if (next) haptic()
    setSaved((s) => ({ ...s, [id]: next }))
  }
  const hold = (id: ProductId) => {
    if (held === id) return
    haptic()
    setHeld(id)
    setFresh(true)
    if (view === 'landing') {
      clearTimeout(leaveTimer.current)
      leaveTimer.current = setTimeout(() => go('C2'), 1400)
    }
  }
  const release = () => {
    clearTimeout(leaveTimer.current)
    setHeld(null)
    setFresh(false)
  }
  const heldLeft = view === 'landing' || fresh ? '24h left' : '23h left'

  const pick = (id: ProductId, opts: { tags?: ReactNode; primaryLabel?: string; onPrimary?: () => void; anno?: PickAnno } = {}) => {
    const isHeld = held === id
    return (
      <PickCard
        id={id}
        quote={QUOTES[id]}
        tags={
          opts.tags ?? (
            <>
              <PickTag>Her size: 12</PickTag>
              <PickTag icon="tag">{RANGES[id]}</PickTag>
            </>
          )
        }
        held={isHeld}
        heldLeft={heldLeft}
        saved={!!saved[id]}
        onToggleSave={() => toggleSave(id)}
        primaryLabel={isHeld ? 'I’ll get this' : opts.primaryLabel}
        // Held picks would go to checkout, which isn’t built: the button stays put but does nothing.
        onPrimary={isHeld ? undefined : opts.primaryLabel ? opts.onPrimary : () => hold(id)}
        onRelease={release}
        anno={opts.anno}
      />
    )
  }

  const taken = <PickCard id="twist" taken anno={{ card: 'taken-card' }} />

  /* Annotation ids follow the frame: the first open card explains the card anatomy. */
  const firstAnno = (id: ProductId): PickAnno =>
    held === id
      ? { card: 'held-card', held: 'release', primary: 'held-get' }
      : { card: 'pick-card', quote: 'pick-quote', tags: 'pick-tags', chip: 'saved-chip', primary: 'get-this' }

  let content: ReactNode
  if (view === 'landing') {
    content = (
      <Landing
        key={runKey}
        phase={phase}
        play={play}
        k={k}
        m1={false}
        reduceFade={play && reduce}
        cards={[
          pick('vanki', { anno: firstAnno('vanki') }),
          pick('hearts-vine', { anno: held !== 'hearts-vine' ? {} : { card: 'held-card', held: 'release' } }),
          taken,
        ]}
      />
    )
  } else if (view === 'held') {
    content = (
      <Compact>
        <div className="flex flex-col gap-[14px]">
          {pick('vanki', { anno: firstAnno('vanki') })}
          {pick('hearts-vine', { anno: held === 'hearts-vine' ? { card: 'held-card', held: 'release' } : { chip: 'save-chip' } })}
          {taken}
        </div>
      </Compact>
    )
  } else if (view === 'gone') {
    content = <NothingLeft />
  } else {
    content = (
      <Compact extra={<ChangedPill />}>
        <div className="flex flex-col gap-[14px]">
          {pick('vanki', {
            tags: (
              <>
                <PickTag>Her size: 12</PickTag>
                <span data-anno="price-drop" className="inline-flex">
                  <PickTag icon="tag" tone="violet">
                    Price dropped · ₹8–9k
                  </PickTag>
                </span>
              </>
            ),
            anno: held === 'vanki' ? { card: 'held-card', held: 'release' } : { chip: 'saved-chip' },
          })}
          {pick('hearts-vine', {
            tags: (
              <span data-anno="sold-out" className="inline-flex">
                <PickTag>Size 12 sold out</PickTag>
              </span>
            ),
            primaryLabel: 'Similar in size 12',
            anno: { primary: 'similar-size' },
          })}
          {taken}
        </div>
      </Compact>
    )
  }

  return (
    <WebPage
      scrollRef={scrollRef}
      backdrop={<HintBackdrop variant={view === 'landing' ? 'landing' : 'compact'} dim={play && !reached(phase, 'pop')} />}
      overlay={
        // While the hint opens, a tap anywhere skips to the open page.
        play && animating ? <div aria-hidden className="absolute inset-0 z-[60]" onPointerDown={skip} /> : undefined
      }
    >
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={view}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, transition: { duration: 0.14, ease: 'easeIn' } }}
          transition={{ duration: 0.32, ease: EASE_OUT }}
        >
          <OnMount run={() => syncScroll(false)} />
          {content}
        </motion.div>
      </AnimatePresence>
    </WebPage>
  )
}

/** Runs once when a view mounts (after the cross-fade): puts the scroll where the frame expects it. */
function OnMount({ run }: { run: () => void }) {
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useLayoutEffect(() => run(), [])
  return null
}

/* ───────────────────────── C1 ───────────────────────── */

function Landing({
  phase,
  play,
  k,
  m1,
  reduceFade,
  cards,
}: {
  phase: Phase
  play: boolean
  k: number
  m1: boolean
  /** Reduced motion: the whole page cross-fades in 200 ms instead. */
  reduceFade: boolean
  cards: ReactNode[]
}) {
  const r = { phase, play, k }
  return (
    <motion.div
      className="flex flex-col gap-4 px-4 pt-2"
      initial={reduceFade ? { opacity: 0 } : false}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.2 }}
    >
      <div className="flex flex-col items-center gap-1">
        <EnvelopeHero phase={phase} play={play} k={k} />
        <Reveal {...r} at="glide" kind="title" data-anno={m1 ? 'spec-reduced' : undefined}>
          <h1 className="serif text-center text-[28px] leading-[34px] text-violet">Priya dropped you a hint</h1>
        </Reveal>
      </div>

      <Reveal {...r} at="note" kind="rise" data-anno={m1 ? 'note-rises' : 'her-note'}>
        <NoteCard />
      </Reveal>

      <Reveal {...r} at="picks" kind="fan" i={0}>
        <div className="flex flex-col gap-[10px]">
          <h2 className="text-[18px] font-semibold leading-[normal] text-ink-2">Priya’s 3 picks</h2>
          <AlsoLooking />
        </div>
      </Reveal>

      <div data-anno={m1 ? 'picks-fan' : undefined} className="flex flex-col gap-[14px]">
        {cards.map((card, i) => (
          <Reveal key={i} {...r} at="picks" kind="fan" i={i + 1}>
            {card}
          </Reveal>
        ))}
      </div>

      <Reveal {...r} at="picks" kind="fan" i={4}>
        <HowHintsWork />
      </Reveal>
      <Reveal {...r} at="picks" kind="fan" i={4}>
        <YourTurn />
      </Reveal>
      <Reveal {...r} at="picks" kind="fan" i={4}>
        <TrustFooter />
      </Reveal>
    </motion.div>
  )
}

/** Priya’s note: white, 1px #F1F1F1, radius 12, p 16, gap 12, shadow 0 6 8 /4%. */
function NoteCard() {
  return (
    <div className="flex flex-col gap-3 rounded-[12px] border border-[#f1f1f1] bg-white p-4 shadow-[0_6px_8px_rgba(0,0,0,0.04)]">
      <div className="flex items-center gap-[10px]">
        <span className="serif flex size-9 shrink-0 items-center justify-center rounded-full border border-violet-stroke bg-violet-tint text-[18px] leading-[25px] text-violet">
          P
        </span>
        <div className="flex flex-col gap-[6px]">
          <p className="text-[16px] font-semibold leading-[normal] text-black">Priya</p>
          <p className="text-[12px] leading-[normal] text-muted">Tue 11 Nov, 9:41 pm</p>
        </div>
      </div>
      <p className="serif text-[16px] italic leading-6 text-black">
        “Psst… something’s coming up on 25 Nov. I found a few things I’d love, no pressure, just saying.”
      </p>
      <OccasionPill data-anno="occasion" className="self-start" />
    </div>
  )
}

/** R + M stack (30px, -8 overlap, 2px white ring) + “Mom has this hint too”. */
function AlsoLooking() {
  return (
    <div data-anno="mom-too" className="flex items-center gap-[10px]">
      <div className="flex items-center">
        <span className="flex size-[30px] items-center justify-center rounded-full bg-violet text-[14px] font-semibold leading-[normal] text-white shadow-[0_0_0_2px_#fff]">
          R
        </span>
        <span className="-ml-2 flex size-[30px] items-center justify-center rounded-full bg-pink-tint text-[14px] font-semibold leading-[normal] text-[#dd1664] shadow-[0_0_0_2px_#fff]">
          M
        </span>
      </div>
      <p className="text-[14px] font-medium leading-[normal] text-black">Mom has this hint too, so no double gifts</p>
    </div>
  )
}

/* ───────────────────────── C2 · E2 · E3 ───────────────────────── */

/** Return-visit header: “Priya’s picks” 32/40, occasion line, R + M row. */
function Compact({ extra, children }: { extra?: ReactNode; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-5 px-4 pt-2">
      <div data-anno="page-header" className="flex flex-col gap-3">
        <h1 className="serif text-[32px] leading-10 text-violet">Priya’s picks</h1>
        <div data-anno="occasion" className="flex items-center gap-2">
          <CalendarBlank size={18} color="#767676" />
          <p className="text-[14px] font-medium leading-[normal] text-ink-3">Anniversary · Tue, 25 Nov · 13 days to go</p>
        </div>
        <AlsoLooking />
        {extra}
      </div>
      {children}
    </div>
  )
}

function ChangedPill() {
  return (
    <div
      data-anno="changed-pill"
      className="inline-flex items-center gap-2 self-start rounded-full border border-violet-stroke bg-white/80 px-3 py-2"
    >
      <WarningCircle size={16} color="#5a39e3" />
      <span className="text-[14px] font-semibold leading-[normal] text-violet">2 things changed since Priya sent this</span>
    </div>
  )
}

const CARD = 'flex flex-col gap-3 rounded-[16px] bg-white p-4 shadow-[0_2px_12px_rgba(0,0,0,0.06)]'

function NothingLeft() {
  return (
    <Compact>
      <section data-anno="none-left" className="flex flex-col gap-3 rounded-[16px] border border-violet-stroke bg-violet-tint p-4">
        <div className="flex items-center gap-[10px]">
          <WarningCircle size={22} color="#5a39e3" />
          <h2 className="text-[16px] font-semibold leading-[normal] text-ink-2">None of Priya’s picks are left</h2>
        </div>
        <p className="text-[12px] leading-[normal] text-[#4a4a4a]">Mom is getting one, and the other two sold out in size 12.</p>
        <div data-anno="gone-thumbs" className="flex gap-2">
          {(['vanki', 'hearts-vine', 'twist'] as const).map((id) => (
            <ProductPhoto key={id} id={id} className="size-14 shrink-0" rounded={10} />
          ))}
        </div>
      </section>

      <section data-anno="similar" className={CARD}>
        <div className="flex items-center gap-3">
          <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-violet-tint">
            <Sparkle size={20} color="#5a39e3" />
          </span>
          <div className="flex min-w-0 flex-col gap-1">
            <p className="text-[16px] font-semibold leading-[normal] text-ink-2">Pieces like Priya’s picks</p>
            <p className="text-[12px] leading-[normal] text-muted-2">24 in size 12 · ₹9–13k · arrive by 23 Nov</p>
          </div>
        </div>
        <CardButton anno="see-similar">
          See similar
        </CardButton>
      </section>

      <section data-anno="gift-card" className={CARD}>
        <div className="flex items-center gap-3">
          {/* Gift card art: CROP 0.782 at (0.122, 0.011) in 48×52. */}
          <div className="relative h-[52px] w-12 shrink-0 overflow-hidden">
            <img
              src={giftCard}
              alt="A CaratLane gift card with a pink bow"
              draggable={false}
              className="absolute max-w-none select-none"
              style={{ width: 61.38, height: 66.5, left: -7.49, top: -0.73 }}
            />
          </div>
          <div className="flex min-w-0 flex-col gap-1">
            <p className="text-[16px] font-semibold leading-[normal] text-ink-2">Send a CaratLane gift card</p>
            <p className="text-[12px] leading-[normal] text-muted-2">Priya picks the piece · you choose the amount</p>
          </div>
        </div>
        <CardButton anno="choose-amount" outline>
          Choose an amount
        </CardButton>
      </section>
    </Compact>
  )
}

function CardButton({ children, onClick, outline, anno }: { children: ReactNode; onClick?: () => void; outline?: boolean; anno?: string }) {
  return (
    <motion.button
      type="button"
      data-anno={anno}
      onClick={onClick}
      whileTap={onClick ? { scale: 0.97 } : undefined}
      transition={{ type: 'spring', stiffness: 520, damping: 32 }}
      style={onClick ? undefined : { pointerEvents: 'none' }}
      className={
        outline
          ? 'flex h-9 w-full items-center justify-center rounded-full border border-[#e4e4e7] bg-white text-[14px] font-semibold leading-[normal] text-ink-2 active:bg-[#f6f6f8]'
          : 'flex h-[34px] w-full items-center justify-center rounded-full bg-violet text-[14px] font-semibold leading-[normal] text-white transition-[filter] active:brightness-95'
      }
    >
      {children}
    </motion.button>
  )
}

/* ───────────────────────── Annotations ───────────────────────── */

const webHeader = {
  id: 'web-header',
  title: 'Web header',
  body: 'CaratLane’s mark and a quiet “Open in app”. Rahul gets everything in the browser; the app is an option, never a gate.',
}
const safariBar = {
  id: 'safari-bar',
  title: 'Plain mobile web',
  body: 'No install and no login. The link opens in whatever browser Rahul uses, and back returns to WhatsApp.',
}
const momToo = {
  id: 'mom-too',
  title: 'Mom is on it too',
  body: 'Two avatars and one line explain why a pick can be taken. A possible clash becomes a reason to decide.',
}
const takenCard = {
  id: 'taken-card',
  title: 'Taken, kept quiet',
  body: 'Mom already claimed the Twist. Rahul sees it so nobody doubles up; Priya’s app hides this, so the surprise holds.',
}

export const annotations: FrameAnnotations = {
  C1: [
    webHeader,
    {
      id: 'hero-art',
      title: 'The envelope opens',
      body: 'The glass envelope Priya sealed in the app opens here. On first open it floats in and breathes, then the seal pops off, the flap swings open, her note rises out under a glass heart, and it glides into place before her note and picks follow, about five seconds in all, so the page feels like a gift, not a landing page. A tap skips it.',
    },
    {
      id: 'her-note',
      title: 'Priya’s note first',
      body: 'Name, send time and the note in serif italic lead the page. Rahul reads why before seeing what.',
    },
    {
      id: 'occasion',
      title: 'Date and countdown',
      body: 'Anniversary, Tue 25 Nov, 13 days to go. The deadline comes from the occasion, not from a sale timer.',
    },
    momToo,
    {
      id: 'pick-quote',
      title: 'A reason on every pick',
      body: 'A short quote per piece in Priya’s voice, so Rahul chooses with intent rather than from a photo alone.',
    },
    {
      id: 'pick-tags',
      title: 'Size and a price range',
      body: 'The size travels with the hint, so Rahul never has to ask. Prices show as ranges, which keeps the hint about taste rather than a price tag.',
    },
    {
      id: 'saved-chip',
      title: 'Save, no sign-in',
      body: 'One tap shortlists a pick on this device. Rahul can think it over without committing or creating an account.',
    },
    {
      id: 'get-this',
      title: 'I’ll get this',
      body: 'Holds the pick for 24 hours with one haptic tap, so Mom sees it’s taken. The hold comes before checkout, not after.',
    },
    takenCard,
    safariBar,
  ],
  C2: [
    webHeader,
    {
      id: 'page-header',
      title: 'Compact on return',
      body: 'Rahul has read the note already, so the return visit leads with the picks: title, date and who else is giving.',
    },
    {
      id: 'occasion',
      title: 'Still counting down',
      body: 'The date stays in view as a plain line. Calm context, not a banner competing with the picks.',
    },
    momToo,
    {
      id: 'held-card',
      title: 'Held for Rahul',
      body: 'Violet outline, hourglass and time left. Leaving checkout doesn’t lose the pick; the hold runs for 24 hours.',
    },
    {
      id: 'release',
      title: 'Release it anytime',
      body: 'One tap hands the pick back, so a hold never feels like a commitment. Mom sees it free again.',
    },
    {
      id: 'held-get',
      title: 'Pick up where Rahul left',
      body: 'The same “I’ll get this” leads back into checkout with the hold intact.',
    },
    {
      id: 'save-chip',
      title: 'Still browsable',
      body: 'Holding one pick doesn’t lock the others. Rahul can still save or switch before the hold ends.',
    },
    takenCard,
    safariBar,
  ],
  E2: [
    webHeader,
    {
      id: 'page-header',
      title: 'Same page, new news',
      body: 'The header doesn’t change, so Rahul knows this is still Priya’s hint, not an error page.',
    },
    {
      id: 'none-left',
      title: 'Said plainly',
      body: 'Mom is getting one and two sold out in size 12. One honest sentence instead of three greyed-out cards.',
    },
    {
      id: 'gone-thumbs',
      title: 'What was on the list',
      body: 'The three picks stay visible as small thumbs, so Rahul can still see Priya’s taste.',
    },
    {
      id: 'similar',
      title: 'Pieces like Priya’s picks',
      body: '24 pieces in size 12 inside Priya’s price ranges, arriving before the date. The closest thing to the original picks.',
    },
    {
      id: 'see-similar',
      title: 'See similar',
      body: 'The primary action keeps Rahul on a piece of jewellery, the gift Priya actually asked for.',
    },
    {
      id: 'gift-card',
      title: 'Or a gift card',
      body: 'When nothing fits, Priya picks the piece and Rahul chooses the amount. Still a gift, still a surprise.',
    },
    {
      id: 'choose-amount',
      title: 'Secondary on purpose',
      body: 'An outline button: a fallback worth offering, never the first suggestion.',
    },
    safariBar,
  ],
  E3: [
    webHeader,
    {
      id: 'page-header',
      title: 'Same hint, updated',
      body: 'The link quietly reflects what changed since Priya sent it; nothing for Rahul to refresh or re-request.',
    },
    {
      id: 'changed-pill',
      title: '2 things changed',
      body: 'Flagged once at the top, before the picks, so nothing surprises Rahul halfway down.',
    },
    {
      id: 'price-drop',
      title: 'Price dropped',
      body: 'Good news, in violet, on the pick itself: now ₹8–9k. Still a range, never an exact price.',
    },
    {
      id: 'saved-chip',
      title: 'Saved stays saved',
      body: 'Rahul’s shortlist survives the change, so the better price is one tap away.',
    },
    {
      id: 'sold-out',
      title: 'Size 12 sold out',
      body: 'Said on the tag where the size used to be, so the reason sits right next to the piece.',
    },
    {
      id: 'similar-size',
      title: 'Similar in size 12',
      body: 'Replaces “I’ll get this”, so a sold-out pick offers a next step instead of a dead end.',
    },
    takenCard,
    safariBar,
  ],
}
