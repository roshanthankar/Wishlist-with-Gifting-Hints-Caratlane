import { useLayoutEffect, useRef, useState, type ReactNode } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import {
  ArrowUUpLeft,
  ArrowsCounterClockwise,
  Bell,
  CaretDown,
  CaretRight,
  Certificate,
  ChatCircleText,
  CheckCircle,
  Coins,
  Hand,
  Phone,
  Ruler,
  Sliders,
  ShieldCheck,
  Star,
  Storefront,
  Truck,
  VideoCamera,
  WhatsappLogo,
} from '@phosphor-icons/react'
import { PRODUCTS, type ProductId } from '@/data/products'
import { useProtoState } from '@/proto/store'
import { ProductPhoto, ProductTile } from '@/ui'
import { cn } from '@/ui/cn'
import giftBox from '@/assets/illustrations/gift-box-frosted.webp'
import { PincodeRow } from './parts'

/**
 * The rest of the product page (A1, 656:5592), below the gifting banner, in
 * the order of CaratLane’s own product page for this ring: customise, delivery
 * and services, a video call, CaratLane Assurance, why you’ll love it,
 * details, what’s in the box, reviews and more to browse. Specs, sizes and
 * assurance items are CaratLane’s; review copy and counts are illustrative.
 */

/** Cards are flat with a 1px #F1F1F1 stroke; only the video-call card floats (Figma). */
const CARD = 'rounded-[12px] border border-[#f1f1f1] bg-white'

function SectionTitle({ children, link }: { children: ReactNode; link?: string }) {
  return (
    <div className="flex items-center justify-between">
      <h2 className="text-[18px] font-semibold leading-[normal] text-ink-2">{children}</h2>
      {link && (
        <span className="flex items-center gap-[2px] text-[13px] font-semibold leading-[normal] text-violet">
          {link}
          <CaretRight size={14} color="#5a39e3" />
        </span>
      )}
    </div>
  )
}

/** Pill chip from A9’s size row (830:25704): 36 tall; selected = violet tint + 1px violet. */
function Chip({ on, children, className, onClick }: { on: boolean; children: ReactNode; className?: string; onClick?: () => void }) {
  return (
    <motion.button
      type="button"
      role="radio"
      aria-checked={on}
      onClick={onClick}
      whileTap={onClick ? { scale: 0.94 } : undefined}
      transition={{ type: 'spring', stiffness: 600, damping: 30 }}
      className={cn(
        'flex h-9 shrink-0 items-center justify-center gap-[6px] whitespace-nowrap rounded-full border text-[14px] leading-none transition-colors duration-200',
        on ? 'border-violet bg-violet-tint font-semibold text-violet' : 'border-[#e4e4e7] bg-white font-medium text-ink-2',
        !onClick && 'pointer-events-none',
        className,
      )}
    >
      {children}
    </motion.button>
  )
}

/* ───────────────────────── Customise: metal and ring size ───────────────────────── */

/** CaratLane’s ring sizes for this design, with inner circumference. */
const SIZES: [string, string][] = [
  ['5', '44.8'], ['6', '45.9'], ['7', '47.1'], ['8', '48.1'], ['9', '49.0'], ['10', '50.0'], ['11', '50.9'], ['12', '51.8'], ['13', '52.8'], ['14', '54.0'],
  ['15', '55.0'], ['16', '55.9'], ['17', '56.9'], ['18', '57.8'], ['19', '59.1'], ['20', '60.0'], ['21', '60.9'], ['22', '61.9'], ['23', '62.8'], ['24', '63.8'],
]
const METALS = ['9 KT Yellow', '14 KT Yellow', '18 KT Yellow']

export function Customise() {
  const [size, setSize] = useProtoState('pdp.size', '12')
  const rail = useRef<HTMLDivElement>(null)
  const mm = SIZES.find(([s]) => s === size)?.[1]

  // Start the row at size 9, as in Figma; the smaller sizes are a scroll away.
  useLayoutEffect(() => {
    const r = rail.current
    const chip = r?.querySelector('[data-size="9"]')?.closest('button')
    if (!r || !chip) return
    const k = r.offsetWidth / (r.getBoundingClientRect().width || 1) // undo the mockup’s scale
    r.scrollLeft += (chip.getBoundingClientRect().left - r.getBoundingClientRect().left) * k - 16
  }, [])

  return (
    <div className="flex flex-col gap-[18px] px-4" data-anno="customise">
      <div className="flex flex-col gap-[10px]">
        <p className="text-[14px] font-semibold leading-[normal] text-ink-2">Metal</p>
        <div role="radiogroup" aria-label="Metal" className="flex gap-2">
          {METALS.map((m, i) => (
            <Chip key={m} on={i === 0} className="min-w-0 flex-1 basis-0 px-2">
              {m}
            </Chip>
          ))}
        </div>
      </div>
      <div className="flex flex-col gap-[10px]">
        <div className="flex items-center justify-between">
          <p className="flex items-center gap-[6px] text-[14px] leading-[normal]">
            <span className="font-semibold text-ink-2">Ring size</span>
            <span className="text-muted tabular">
              {size} · {mm} mm
            </span>
          </p>
          <span className="flex items-center gap-1 text-[13px] font-semibold leading-[normal] text-violet">
            <Ruler size={16} color="#5a39e3" />
            Find my size
          </span>
        </div>
        {/* A scroller clips both axes, so 2px of vertical slack (cancelled by
            the negative margin) keeps the chips' 1px borders whole when the
            mockup scales to a fractional size; Safari shaved them otherwise. */}
        <div ref={rail} role="radiogroup" aria-label="Ring size" className="no-scrollbar -mx-4 -my-[2px] flex gap-2 overflow-x-auto px-4 py-[2px]" data-anno="ring-size">
          {SIZES.map(([s]) => (
            <Chip key={s} on={s === size} onClick={() => setSize(s)} className="w-12">
              <span data-size={s}>{s}</span>
            </Chip>
          ))}
        </div>
      </div>
      <button type="button" className={cn(CARD, 'flex items-center gap-3 px-[14px] py-3 text-left')} data-anno="customise-settings">
        <span className="flex shrink-0 rounded-full bg-violet-tint p-[8px]">
          <Sliders size={18} color="#5a39e3" />
        </span>
        <span className="flex min-w-0 flex-1 flex-col gap-[3px] leading-[normal]">
          <span className="text-[14px] font-semibold text-ink-2">Customise settings</span>
          <span className="text-[12px] leading-4 text-muted">Engraving, stone choice and finish</span>
        </span>
        <CaretRight size={16} color="#9a9a9a" className="shrink-0" />
      </button>
    </div>
  )
}

/* ───────────────────────── Contact us for assistance ───────────────────────── */

export function ContactUs() {
  const actions: [ReactNode, string, string][] = [
    [<ChatCircleText size={22} color="#5a39e3" weight="fill" />, 'Chat', 'Reply in minutes'],
    [<WhatsappLogo size={22} color="#00b845" weight="fill" />, 'WhatsApp', 'Message us'],
    [<Phone size={22} color="#dd1564" weight="fill" />, 'Call', '1800-102-0103'],
  ]
  return (
    <div className="flex flex-col gap-3 px-4" data-anno="contact-us">
      <SectionTitle>Contact us for assistance</SectionTitle>
      <div className={cn(CARD, 'flex')}>
        {actions.map(([icon, label, sub], i) => (
          <div key={label} className="flex min-w-0 flex-1">
            {i > 0 && <div className="w-px bg-[#f1f1f1]" />}
            <button type="button" className="flex min-w-0 flex-1 flex-col items-center gap-[6px] px-2 py-[14px] text-center leading-[normal]">
              {icon}
              <span className="text-[13px] font-semibold text-ink-2">{label}</span>
              <span className="text-[11px] text-muted">{sub}</span>
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}

/* ───────────────────────── Delivery & services ───────────────────────── */

function ServiceRow({ icon, title, sub }: { icon: ReactNode; title: string; sub: string }) {
  return (
    <div className="flex items-center gap-3 px-[14px] py-3">
      <span className="flex shrink-0">{icon}</span>
      <span className="flex min-w-0 flex-1 flex-col gap-[3px] leading-[normal]">
        <span className="text-[14px] font-semibold text-ink-2">{title}</span>
        <span className="text-[12px] leading-4 text-muted">{sub}</span>
      </span>
      <CaretRight size={16} color="#9a9a9a" className="shrink-0" />
    </div>
  )
}

export function DeliveryServices() {
  const rows: [ReactNode, string, string][] = [
    [<Truck size={22} color="#3e3e3e" />, 'Express delivery', 'Same or next day in select cities'],
    [<Storefront size={22} color="#3e3e3e" />, 'Pick up at a store near you', 'See it in person before you take it home'],
    [<Hand size={22} color="#3e3e3e" />, 'Try it at home', 'An expert brings it over, free in select cities'],
  ]
  return (
    <div className="flex flex-col gap-3 px-4" data-anno="delivery">
      <SectionTitle>Delivery &amp; services</SectionTitle>
      <PincodeRow className="" />
      <div className={cn(CARD, 'flex flex-col')}>
        {rows.map(([icon, title, sub], i) => (
          <div key={title}>
            {i > 0 && <div className="h-px bg-[#f1f1f1]" />}
            <ServiceRow icon={icon} title={title} sub={sub} />
          </div>
        ))}
      </div>
    </div>
  )
}

/* ───────────────────────── See it live (video call) ───────────────────────── */

export function SeeItLiveCard() {
  return (
    <div className="px-4">
      <div className={cn(CARD, 'flex items-center gap-3 p-[14px] shadow-[0_6px_8px_rgba(0,0,0,0.04)]')} data-anno="video-call">
        <span className="flex shrink-0 rounded-full bg-violet-tint p-[10px]">
          <VideoCamera size={20} color="#5a39e3" />
        </span>
        <span className="flex min-w-0 flex-1 flex-col gap-1 leading-[normal]">
          <span className="text-[14px] font-semibold text-ink-2">See it live on a video call</span>
          <span className="flex items-center gap-[6px] text-[12px] font-medium text-offer">
            <span aria-hidden className="size-[6px] rounded-full bg-offer" />
            Expert available now
          </span>
        </span>
        <span className="flex h-8 shrink-0 items-center rounded-full bg-violet-tint px-[14px] text-[13px] font-semibold leading-none text-violet">Join call</span>
      </div>
    </div>
  )
}

/* ───────────────────────── CaratLane Assurance ───────────────────────── */

export function Assurance() {
  const items: [ReactNode, string, string][] = [
    [<ArrowUUpLeft size={22} color="#5a39e3" />, '15-day return', 'Online orders'],
    [<ShieldCheck size={22} color="#5a39e3" />, '1-year', 'Warranty'],
    [<ArrowsCounterClockwise size={22} color="#5a39e3" />, 'Lifetime', 'Exchange'],
    [<Certificate size={22} color="#5a39e3" />, 'BIS Hallmark', 'Certified'],
  ]
  return (
    <div className="px-4">
      <div className="flex gap-1 rounded-[12px] border border-[#ece7ff] bg-[#faf9ff] px-2 py-[14px]" data-anno="assurance">
        {items.map(([icon, a, b]) => (
          <div key={a} className="flex min-w-0 flex-1 flex-col items-center gap-[6px] text-center leading-[normal]">
            {icon}
            <span className="text-[12px] font-semibold text-ink-2">{a}</span>
            <span className="text-[11px] text-muted">{b}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

/* ───────────────────────── xClusive points row ───────────────────────── */

export function XClusivePoints() {
  return (
    <div className="px-4" data-anno="xclusive">
      <div className={cn(CARD, 'flex items-center gap-[8px] px-3 py-[10px]')}>
        <Coins size={16} weight="fill" color="#b85200" />
        <span className="text-[12px] leading-[14px] text-ink-3">
          Earn <span className="font-semibold text-orange">74 xClusive points</span> on prepaid orders online
        </span>
      </div>
    </div>
  )
}

/* ───────────────────────── Notify when price drops ───────────────────────── */

export function NotifyPriceDrop() {
  return (
    <div className="px-4" data-anno="price-drop">
      <button
        type="button"
        className={cn(CARD, 'flex w-full items-center gap-3 px-[14px] py-3 text-left')}
      >
        <span className="flex shrink-0 rounded-full bg-violet-tint p-[8px]">
          <Bell size={18} color="#5a39e3" weight="fill" />
        </span>
        <span className="flex min-w-0 flex-1 flex-col gap-[3px] leading-[normal]">
          <span className="text-[14px] font-semibold text-ink-2">Notify me when price drops</span>
          <span className="text-[12px] leading-4 text-muted">We’ll ping you the moment this ring gets cheaper</span>
        </span>
        <span className="flex h-8 shrink-0 items-center rounded-full bg-violet-tint px-[14px] text-[13px] font-semibold leading-none text-violet">Notify me</span>
      </button>
    </div>
  )
}

/* ───────────────────────── Why you’ll love this ───────────────────────── */

export function WhyLoveIt() {
  return (
    <div className="flex flex-col gap-[10px] px-4" data-anno="why">
      <SectionTitle>Why you’ll love this</SectionTitle>
      <p className="text-[14px] leading-5 text-ink-3">
        Timeless, versatile and effortlessly elegant. The Vanki’s chevron comes from the traditional South Indian armlet, made light in 9KT gold so it can
        be worn every day.
      </p>
      <div className="flex flex-wrap gap-2">
        {['Everyday wear', 'Unstudded', 'Fast delivery'].map((t) => (
          <span key={t} className="rounded-full bg-[#f5f5f7] px-[10px] py-[6px] text-[12px] font-medium leading-none text-ink-3">
            {t}
          </span>
        ))}
      </div>
    </div>
  )
}

/* ───────────────────────── Product details (accordion) ───────────────────────── */

function Expand({ open, children }: { open: boolean; children: ReactNode }) {
  const reduce = useReducedMotion()
  return (
    <AnimatePresence initial={false}>
      {open && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={reduce ? { duration: 0 } : { duration: 0.3, ease: [0.32, 0.72, 0, 1] }}
          className="overflow-hidden"
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  )
}

function Caret({ open }: { open: boolean }) {
  return (
    <motion.span className="flex shrink-0" animate={{ rotate: open ? 180 : 0 }} transition={{ type: 'spring', stiffness: 500, damping: 34 }}>
      <CaretDown size={16} color={open ? '#3e3e3e' : '#9a9a9a'} />
    </motion.span>
  )
}

const SPECS: [string, string][] = [
  ['Product code', 'UR02452-8Y0000'],
  ['Metal', '9 KT Yellow Gold'],
  ['Type', 'Unstudded ring'],
  ['Ring size', '12 · 51.8 mm inner circumference'],
  ['Certification', 'BIS Hallmark'],
]

type DetailKey = 'details' | 'size' | 'care' | 'price' | null

export function ProductDetails() {
  const [open, setOpen] = useProtoState<DetailKey>('pdp.details', 'details')
  const toggle = (k: Exclude<DetailKey, null>) => setOpen((o) => (o === k ? null : k))
  return (
    <div className="px-4">
      <div className={cn(CARD, 'flex flex-col')} data-anno="details">
        <button type="button" aria-expanded={open === 'details'} onClick={() => toggle('details')} className="flex items-center justify-between px-[14px] pb-[10px] pt-[14px] text-left">
          <span className="text-[16px] font-semibold leading-[normal] text-ink-2">Product details</span>
          <Caret open={open === 'details'} />
        </button>
        <Expand open={open === 'details'}>
          <dl className="flex flex-col gap-[10px] px-[14px] pb-[14px]">
            {SPECS.map(([k, v]) => (
              <div key={k} className="flex gap-3 text-[13px] leading-4">
                <dt className="w-[104px] shrink-0 text-muted">{k}</dt>
                <dd className="min-w-0 flex-1 font-medium text-ink-2">{v}</dd>
              </div>
            ))}
          </dl>
        </Expand>

        <AccordionRow id="pdp-price-breakup" title="Price breakup" sub="Gold, making charges and GST" open={open === 'price'} onToggle={() => toggle('price')}>
          <dl className="flex flex-col gap-[10px] px-[14px] pb-[14px] text-[13px] leading-4">
            <BreakupRow label="9KT Yellow Gold" sub="1.886 g · ₹3,992/g" value="₹7,528" />
            <BreakupRow label="Making Charges" sub="25% off applied" value="₹1,920" />
            <BreakupRow label="GST" sub="3% on jewellery" value="₹284" />
            <div className="h-px bg-[#ececef]" />
            <BreakupRow label="Grand Total" value="₹9,732" bold />
          </dl>
        </AccordionRow>
        <AccordionRow title="Size guide" sub="All sizes from 5 to 24 · 44.8–63.8 mm" open={open === 'size'} onToggle={() => toggle('size')}>
          <div className="grid grid-cols-4 gap-x-2 gap-y-[6px] px-[14px] pb-[14px] text-[12px] leading-4">
            {SIZES.map(([s, c]) => (
              <span key={s} className={cn('flex justify-between rounded-[8px] px-2 py-1', s === '12' ? 'bg-violet-tint text-violet' : 'bg-[#f7f7f9] text-ink-3')}>
                <span className="font-semibold">{s}</span>
                <span className="tabular">{c}</span>
              </span>
            ))}
          </div>
        </AccordionRow>
        <AccordionRow title="Care and cleaning" sub="Keep it shining for years" open={open === 'care'} onToggle={() => toggle('care')}>
          <p className="px-[14px] pb-[14px] text-[13px] leading-[18px] text-ink-3">
            Keep it in its box when you’re not wearing it, wipe it with a soft dry cloth, and put it on after perfume and lotion. Take it off for swimming.
          </p>
        </AccordionRow>
      </div>
    </div>
  )
}

/** A collapsed row; without `onToggle` it has no tap (nothing to open in the prototype). */
function AccordionRow({ id, title, sub, open = false, onToggle, children }: { id?: string; title: string; sub: string; open?: boolean; onToggle?: () => void; children?: ReactNode }) {
  return (
    <>
      <div className="h-px bg-[#f1f1f1]" />
      <button
        type="button"
        id={id}
        aria-expanded={onToggle ? open : undefined}
        onClick={onToggle}
        className={cn('flex items-center gap-3 px-[14px] py-3 text-left', !onToggle && 'pointer-events-none')}
      >
        <span className="flex min-w-0 flex-1 flex-col gap-[3px] leading-[normal]">
          <span className="text-[14px] font-semibold text-ink-2">{title}</span>
          <span className="text-[12px] text-muted">{sub}</span>
        </span>
        <Caret open={open} />
      </button>
      {children && <Expand open={open}>{children}</Expand>}
    </>
  )
}

function BreakupRow({ label, sub, value, bold }: { label: string; sub?: string; value: string; bold?: boolean }) {
  return (
    <div className="flex items-start gap-3">
      <div className="flex min-w-0 flex-1 flex-col gap-[2px] leading-4">
        <span className={bold ? 'text-[14px] font-semibold text-ink-2' : 'text-[13px] font-medium text-ink-2'}>{label}</span>
        {sub && <span className="text-[11px] text-muted">{sub}</span>}
      </div>
      <span className={cn('shrink-0 tabular', bold ? 'text-[14px] font-bold text-black' : 'text-[13px] font-semibold text-ink-2')}>{value}</span>
    </div>
  )
}

/* ───────────────────────── What’s in the box ───────────────────────── */

export function InTheBox() {
  return (
    <div className="flex flex-col gap-3 px-4" data-anno="in-the-box">
      <SectionTitle>What’s in the box</SectionTitle>
      <div className="flex items-center gap-[14px] rounded-[12px] border border-pink-tint bg-[#fff7fa] p-[14px]">
        <img src={giftBox} alt="" draggable={false} className="size-[74px] shrink-0 select-none object-contain" />
        <ul className="flex min-w-0 flex-1 flex-col gap-2">
          {['CaratLane signature box', 'Free gift wrap and a handwritten note', 'Price-free invoice, if it’s a gift', 'Certificate of authenticity'].map((t) => (
            <li key={t} className="flex items-center gap-2 text-[13px] font-medium leading-4 text-ink-2">
              <CheckCircle size={16} color="#dd1564" className="shrink-0" />
              {t}
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}

/* ───────────────────────── Ratings & reviews ───────────────────────── */

function Stars({ size }: { size: number }) {
  return (
    <span className="flex gap-[2px]" aria-label="5 out of 5 stars">
      {Array.from({ length: 5 }, (_, i) => (
        <Star key={i} size={size} weight="fill" color="#f2b01e" />
      ))}
    </span>
  )
}

const HISTOGRAM: [number, number][] = [
  [5, 136],
  [4, 14],
  [3, 4],
  [2, 1],
  [1, 1],
]
const REVIEWS = [
  { name: 'Arjun M.', meta: 'Bengaluru · 2 weeks ago', title: 'Got it for our anniversary', body: 'She hasn’t taken it off since. Lighter than it looks, and size 12 was spot on.', tag: 'Bought as a gift' },
  { name: 'Sneha R.', meta: 'Pune · 1 month ago', title: 'My everyday ring now', body: 'The finish is lovely and it doesn’t catch on anything. Wear it to work every day.' },
]

export function Reviews() {
  return (
    <div className="flex flex-col gap-3 px-4" data-anno="reviews">
      <SectionTitle link="See all 42">Ratings &amp; reviews</SectionTitle>
      <div className={cn(CARD, 'flex items-center gap-5 p-4')}>
        <div className="flex shrink-0 flex-col items-center gap-[6px] leading-[normal]">
          <span className="text-[36px] font-bold text-ink-2">4.8</span>
          <Stars size={14} />
          <span className="text-[12px] text-muted">156 ratings</span>
        </div>
        <div className="flex min-w-0 flex-1 flex-col gap-[6px]">
          {HISTOGRAM.map(([k, n]) => (
            <div key={k} className="flex items-center gap-2 text-[12px] leading-[14px]">
              <span className="w-2 font-medium text-ink-3">{k}</span>
              <span className="relative h-[6px] min-w-0 flex-1 rounded-full bg-[#f1f1f1]">
                <span className="absolute inset-y-0 left-0 rounded-full bg-violet" style={{ width: `${Math.max(3, (n / 136) * 100)}%` }} />
              </span>
              <span className="w-6 text-right text-muted tabular">{n}</span>
            </div>
          ))}
        </div>
      </div>
      {REVIEWS.map((r) => (
        <article key={r.name} className={cn(CARD, 'flex flex-col gap-2 p-[14px]')}>
          <div className="flex items-center justify-between">
            <Stars size={12} />
            {r.tag && <span className="rounded-full bg-pink-tint px-2 py-[3px] text-[11px] font-semibold leading-[normal] text-pink">{r.tag}</span>}
          </div>
          <h3 className="text-[14px] font-semibold leading-[normal] text-ink-2">{r.title}</h3>
          <p className="text-[13px] leading-[18px] text-ink-3">{r.body}</p>
          <p className="flex flex-wrap items-center gap-[6px] text-[12px] leading-[normal]">
            <span className="font-semibold text-ink-3">{r.name}</span>
            <span className="text-muted">Verified buyer · {r.meta}</span>
          </p>
        </article>
      ))}
    </div>
  )
}

/* ───────────────────────── More to browse ───────────────────────── */

export function AlsoLike() {
  const [liked, setLiked] = useState<Record<string, boolean>>({})
  const items: [ProductId, string | undefined][] = [
    ['hearts-vine', 'Bestseller'],
    ['twist', 'New'],
    ['petite-cluster', undefined],
  ]
  return (
    <div className="flex flex-col gap-3" data-anno="also-like">
      <div className="px-4">
        <SectionTitle link="See all">You may also like</SectionTitle>
      </div>
      <div className="no-scrollbar flex gap-[14px] overflow-x-auto px-4">
        {items.map(([id, tag]) => (
          <ProductTile
            key={id}
            id={id}
            tag={tag}
            tagTone="plain"
            saved={!!liked[id]}
            onToggleSaved={(v) => setLiked((l) => ({ ...l, [id]: v }))}
            className="w-[178px] shrink-0"
          />
        ))}
        <span aria-hidden className="w-px shrink-0" />
      </div>
    </div>
  )
}

export function RecentlyViewed() {
  const items: ProductId[] = ['twist', 'petite-cluster', 'hearts-vine']
  return (
    <div className="flex flex-col gap-3" data-anno="recent">
      <div className="px-4">
        <SectionTitle>Recently viewed</SectionTitle>
      </div>
      <div className="no-scrollbar flex gap-3 overflow-x-auto px-4">
        {items.map((id) => (
          <div key={id} className="flex w-28 shrink-0 flex-col gap-[6px] leading-[normal]">
            <div className="relative size-28 overflow-hidden rounded-[12px] bg-[#f2f2f4]">
              <ProductPhoto id={id} className="absolute inset-0" rounded={12} />
            </div>
            <span className="truncate text-[12px] font-medium text-ink-2">{PRODUCTS[id].name}</span>
            <span className="text-[12px] font-semibold text-ink-2">{PRODUCTS[id].price}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
