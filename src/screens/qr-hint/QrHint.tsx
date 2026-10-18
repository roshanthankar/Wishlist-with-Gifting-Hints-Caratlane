import type { ReactNode } from 'react'
import { motion, useTime, useTransform } from 'motion/react'
import { DownloadSimple, Export, LockSimple, Printer, X } from '@phosphor-icons/react'
import type { FrameId } from '@/proto/frames'
import type { FrameAnnotations } from '@/proto/annotations'
import { useNav } from '@/proto/nav'
import { useProtoState } from '@/proto/store'
import { AuraBlob, GlassCircle, Screen, ScrollView } from '@/ui'
import { QrCode } from './QrCode'
import { QrCard, useTilt } from './QrCard'

export const annotations: FrameAnnotations = {
  B3b: [
    { id: 'qr-close', title: 'Show mode', body: 'A full-screen cover with one way out, so Priya can hand the phone over or print without stray taps.' },
    { id: 'qr-title', title: 'For Rahul, from Priya', body: 'Names both people, so the card reads as a personal note even when it’s left on a desk.' },
    { id: 'qr-card', title: 'A card you can hold', body: 'The white card stays bright and easy to scan on the dark stage. When the screen opens it flips twice, to CaratLane and back, so it’s clearly something to play with, then it sways. It leans toward the cursor, or with the phone when tilted, light slides across it, and a tap flips it.' },
    { id: 'qr-code', title: 'Dot QR', body: 'Round modules and soft finder eyes in Priya’s violet-to-pink, with no centre logo, so it scans reliably and still feels like a gift. The gradient flows slowly round the code and swings with the card’s tilt.' },
    { id: 'qr-caption', title: 'Scan me, then act surprised', body: 'A playful line sets the tone, and the date with Priya’s initial makes it unmistakably Priya’s.' },
    { id: 'qr-swatches', title: 'Card colour', body: 'Violet, pink, gold or black recolour the code in place; every option keeps enough contrast to scan.' },
    { id: 'qr-spots', title: 'Where Rahul will find it', body: 'Ideas rather than instructions: a wallet, the fridge, a desk. Picking one is just for fun.' },
    { id: 'qr-actions', title: 'Save, print, share', body: 'Three ways to get the card off the phone, in the same glass style as the rest of iOS.' },
    { id: 'qr-footer', title: 'Same hint, new format', body: 'The QR opens the same link with the same settings as the WhatsApp hint, so nothing extra is shared.' },
  ],
}

type Swatch = 'violet' | 'pink' | 'gold' | 'ink'

/** Each swatch is a gradient that keeps scan contrast on white, plus a matching card glow. */
const SWATCHES: Record<Swatch, { label: string; dot: string; from: string; to: string; glow: string }> = {
  violet: { label: 'Violet', dot: '#5a39e3', from: '#5a39e3', to: '#dd1564', glow: 'rgba(89, 56, 227, 0.45)' },
  pink: { label: 'Pink', dot: '#dd1564', from: '#f0367f', to: '#a80c4c', glow: 'rgba(221, 21, 100, 0.42)' },
  gold: { label: 'Gold', dot: '#c9a24a', from: '#cfa752', to: '#86621b', glow: 'rgba(201, 162, 74, 0.42)' },
  ink: { label: 'Black', dot: '#000000', from: '#3d3d3d', to: '#000000', glow: 'rgba(0, 0, 0, 0.55)' },
}

const SPOTS = ['His wallet', 'The fridge', 'His desk'] as const

export default function QrHint({ frame: _frame }: { frame: FrameId }) {
  const { back } = useNav()
  const [swatch, setSwatch] = useProtoState<Swatch>('qrHint.swatch', 'violet')
  const [spot, setSpot] = useProtoState<string | null>('qrHint.spot', null)
  const c = SWATCHES[swatch]
  const tilt = useTilt()
  // The stage’s colour drifts against the card’s lean. The code’s gradient flows on its own,
  // one slow turn every 15 s, and swings further as the card tilts.
  const auraX = useTransform(tilt.y, (v) => v * -1.4)
  const auraY = useTransform(tilt.x, (v) => v * 1.4)
  const time = useTime()
  const spin = useTransform([time, tilt.x, tilt.y], ([t, x, y]: number[]) => (tilt.attract ? (t / 1000) * 24 : 0) + y * 3.2 - x * 2.4)

  return (
    <Screen bg="linear-gradient(180deg, #1b0f45 0%, #0e0826 100%)" tone="light" themeColor="#1b0f45">
      <ScrollView
        edgeColor="#1b0f45"
        bottomInset="calc(var(--safe-bottom-pad) + 16px)"
        backdrop={
          <motion.div className="absolute inset-0" style={{ x: auraX, y: auraY }}>
            <AuraBlob x={-120} y={120} w={420} h={360} color="#5a39e3" opacity={0.55} blur={140} />
            <AuraBlob right={-118} y={300} w={320} h={300} color="#dd1564" opacity={0.35} blur={140} />
            <AuraBlob x={40} y={560} w={300} h={220} color="#74ffff" opacity={0.12} blur={140} />
          </motion.div>
        }
      >
        <div className="flex h-14 items-center justify-between px-4 py-[6px]">
          <GlassCircle size={44} tone="dark" label="Close" onClick={back} data-anno="qr-close">
            <X size={20} color="#fff" />
          </GlassCircle>
          <p className="text-[18px] font-semibold leading-[normal] text-white">Your QR hint</p>
          <span aria-hidden className="size-11" />
        </div>

        <div className="flex flex-col items-center px-4">
          <h1 data-anno="qr-title" className="serif mt-9 text-center text-[28px] leading-[38px] text-white">
            For Rahul, from Priya
          </h1>

          <QrCard
            data-anno="qr-card"
            tilt={tilt}
            glow={c.glow}
            front={
              <div className="flex flex-col items-center gap-4 p-7">
                <div data-anno="qr-code">
                  <QrCode from={c.from} to={c.to} spin={spin} />
                </div>
                <div data-anno="qr-caption" className="flex flex-col items-center gap-1 text-center">
                  <p className="text-[18px] font-semibold leading-[normal] text-black">Scan me, then act surprised</p>
                  <p className="serif text-[14px] italic leading-[19px] text-muted">Something for 25 Nov · — P.</p>
                </div>
              </div>
            }
          />

          <div data-anno="qr-swatches" role="radiogroup" aria-label="Card colour" className="mt-5 flex gap-3 p-1">
            {(Object.keys(SWATCHES) as Swatch[]).map((k) => (
              <motion.button
                key={k}
                type="button"
                role="radio"
                aria-checked={swatch === k}
                aria-label={SWATCHES[k].label}
                onClick={() => setSwatch(k)}
                whileTap={{ scale: 0.88 }}
                transition={{ type: 'spring', stiffness: 600, damping: 30 }}
                className="relative size-6 rounded-full"
                style={{ background: SWATCHES[k].dot }}
              >
                {swatch === k && (
                  <motion.span
                    layoutId="qr-swatch-ring"
                    className="absolute -inset-[3px] rounded-full border-[3px] border-white"
                    transition={{ type: 'spring', stiffness: 600, damping: 34 }}
                  />
                )}
              </motion.button>
            ))}
          </div>

          <div data-anno="qr-spots" className="mt-5 flex flex-col items-center gap-[10px]">
            <p className="text-[14px] font-semibold leading-[normal] text-white/70">Leave it where he’ll find it</p>
            <div className="flex gap-2">
              {SPOTS.map((s) => {
                const on = spot === s
                return (
                  <motion.button
                    key={s}
                    type="button"
                    aria-pressed={on}
                    onClick={() => setSpot(on ? null : s)}
                    whileTap={{ scale: 0.95 }}
                    transition={{ type: 'spring', stiffness: 600, damping: 30 }}
                    className={
                      'flex h-8 items-center whitespace-nowrap rounded-full border px-[14px] text-[14px] font-semibold leading-[normal] transition-colors duration-200 ' +
                      (on ? 'border-white bg-white text-[#1b0f45]' : 'border-white/18 bg-white/10 text-white')
                    }
                  >
                    {s}
                  </motion.button>
                )
              })}
            </div>
          </div>

          <div data-anno="qr-actions" className="mt-7 flex gap-7">
            <Action label="Save" icon={<DownloadSimple size={22} color="#fff" />} />
            <Action label="Print" icon={<Printer size={22} color="#fff" />} />
            <Action label="Share" icon={<Export size={22} color="#fff" />} />
          </div>

          <div data-anno="qr-footer" className="mt-5 flex items-center gap-[6px]">
            <LockSimple size={14} color="#fff" style={{ opacity: 0.72 }} />
            <p className="text-[12px] leading-[normal] text-white/72">Same link and settings as your WhatsApp hint</p>
          </div>
        </div>
      </ScrollView>
    </Screen>
  )
}


function Action({ label, icon, onClick }: { label: string; icon: ReactNode; onClick?: () => void }) {
  return (
    <div className="flex w-14 flex-col items-center gap-2">
      <GlassCircle size={56} tone="dark" label={label} onClick={onClick}>
        {icon}
      </GlassCircle>
      <span className="text-[12px] font-semibold leading-[normal] text-white/70">{label}</span>
    </div>
  )
}
