import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { CaretLeft } from '@phosphor-icons/react'
import type { FrameId } from '@/proto/frames'
import type { FrameAnnotations } from '@/proto/annotations'
import { useNav } from '@/proto/nav'
import { useProtoState } from '@/proto/store'
import { haptic } from '@/proto/haptics'
import { PreviewEnvelope, Screen } from '@/ui'
import { preloadOpening } from '../hint-page/OpeningMotion'

/**
 * C0 · WhatsApp (804:36178): what Rahul sees first. iOS WhatsApp, not
 * CaratLane: #EFE7DE chat, #F6F6F6 header and input bar, SF Pro type.
 * Priya’s message arrives with a short typing beat and a soft pop (once);
 * the rich preview or the link opens the hint (C1).
 */

const POP = { type: 'spring', stiffness: 420, damping: 26, mass: 0.9 } as const

export default function WhatsAppChat({ frame: _frame }: { frame: FrameId }) {
  const { go } = useNav()
  const [arrived, setArrived] = useProtoState('whatsapp.arrived', false)
  const [firstTime] = useState(() => !arrived)
  const [typing, setTyping] = useState(firstTime)

  useEffect(() => {
    // Warm the envelope images so the opening on C1 starts crisp.
    preloadOpening()
    if (!firstTime) return
    const t = setTimeout(() => {
      setTyping(false)
      setArrived(true)
    }, 1000)
    return () => clearTimeout(t)
  }, [firstTime, setArrived])

  const open = () => {
    haptic()
    go('C1')
  }

  return (
    <Screen bg="#efe7de">
      {/* Chat header (110): status bar + 4 + 36px row + 8, incl. a 1px #DADADA bottom. */}
      <header
        data-anno="wa-header"
        className="absolute inset-x-0 top-0 z-10 border-b border-[#dadada] bg-[#f6f6f6] pb-[7px]"
        style={{ paddingTop: 'calc(var(--safe-top) + 4px)' }}
      >
        <div className="flex h-9 items-center gap-[10px] pl-3">
          <motion.button
            type="button"
            aria-label="Back to chats"
            className="sf pointer-events-none flex items-center gap-[2px] text-[#007aff]"
          >
            <CaretLeft size={22} weight="bold" />
            <span className="text-[16px] leading-[19px]">12</span>
          </motion.button>
          <span className="sf flex size-9 items-center justify-center rounded-full bg-pink-tint text-[16px] font-semibold leading-[19px] text-[#dd1664]">
            P
          </span>
          <div className="sf flex flex-col">
            <p className="text-[16px] font-semibold leading-[19px] text-black">Priya</p>
            <p className="text-[12px] leading-[14px] text-muted">online</p>
          </div>
        </div>
      </header>

      {/* Chat */}
      <div
        className="no-scrollbar absolute inset-x-0 overflow-y-auto"
        style={{ top: 'calc(var(--safe-top) + 48px)', bottom: 'calc(var(--safe-bottom-pad) + 56px)' }}
      >
        <div className="flex flex-col gap-4 px-3 pb-4 pt-4">
          <div className="flex justify-center">
            <span data-anno="today" className="sf rounded-[8px] bg-white/85 px-[10px] py-1 text-[12px] font-semibold leading-[14px] text-[#5f6b76]">
              Today
            </span>
          </div>

          <div className="relative">
            <AnimatePresence mode="popLayout" initial={false}>
              {typing ? (
                <TypingBubble key="typing" />
              ) : (
                <motion.div
                  key="message"
                  data-anno="bubble"
                  className="sf flex w-[296px] max-w-[82%] flex-col gap-[6px] rounded-[14px] bg-white px-[6px] pb-2 pt-[6px] shadow-[0_1px_1px_rgba(0,0,0,0.08)]"
                  style={{ transformOrigin: '0% 100%' }}
                  initial={firstTime ? { opacity: 0, scale: 0.86, y: 10 } : false}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  transition={POP}
                >
                  {/* Rich link preview (Open Graph). */}
                  <motion.button
                    type="button"
                    data-anno="link-preview"
                    onClick={open}
                    whileTap={{ scale: 0.98 }}
                    transition={{ type: 'spring', stiffness: 520, damping: 32 }}
                    className="flex w-full flex-col overflow-hidden rounded-[10px] bg-[#f3f3f5] text-left active:brightness-[0.97]"
                  >
                    <div
                      className="relative h-[150px] w-full overflow-hidden"
                      style={{ background: 'linear-gradient(90deg, #e4dcff 0%, #d6e4ff 55%, #d2faff 100%)' }}
                    >
                      {/* The sealed envelope, animated: it knocks and hearts rise from behind it. */}
                      <PreviewEnvelope width={112} className="absolute left-1/2 top-[18px] -translate-x-1/2" />
                    </div>
                    <div className="flex flex-col gap-1 px-[10px] pb-[10px] pt-2">
                      <p className="text-[14px] font-semibold leading-[17px] text-black">Priya dropped you a hint</p>
                      <p className="text-[12px] leading-[14px] text-[#3c3c43]">3 picks for 25 Nov. Open to see them, no app needed.</p>
                      <p className="text-[12px] leading-[14px] text-muted">caratlane.com</p>
                    </div>
                  </motion.button>

                  <div className="flex flex-col gap-[2px] px-[6px]">
                    <p data-anno="message" className="text-[16px] leading-[19px] text-black">
                      Psst… something’s coming up on 25 Nov. I found a few things I’d love, no pressure, just saying.
                    </p>
                    <motion.button
                      type="button"
                      data-anno="hint-link"
                      onClick={open}
                      whileTap={{ opacity: 0.5 }}
                      className="self-start text-left text-[16px] leading-[19px] text-[#027eb5] active:underline"
                    >
                      caratlane.com/h/7Kx2mQ9
                    </motion.button>
                  </div>
                  <p data-anno="timestamp" className="text-[12px] leading-[14px] text-muted">
                    9:41 pm
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Input bar: 8 top, “+” SF 28 #007AFF, 36px field, home-indicator space. */}
      <div
        data-anno="input-bar"
        className="absolute inset-x-0 bottom-0 z-10 flex items-start gap-3 bg-[#f6f6f6] px-4 pt-2"
        style={{ paddingBottom: 'calc(var(--safe-bottom-pad) + 12px)' }}
      >
        <span aria-hidden className="sf h-[33px] text-[28px] leading-[33px] text-[#007aff]">
          +
        </span>
        <div className="h-9 min-w-0 flex-1 rounded-[18px] border border-[#dadada] bg-white" />
      </div>
    </Screen>
  )
}

/** Incoming “typing…” bubble: three dots breathing in sequence. */
function TypingBubble() {
  return (
    <motion.div
      className="flex h-9 w-[62px] items-center justify-center gap-1 rounded-[14px] bg-white shadow-[0_1px_1px_rgba(0,0,0,0.08)]"
      style={{ transformOrigin: '0% 100%' }}
      initial={{ opacity: 0, scale: 0.7 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.7, transition: { duration: 0.12 } }}
      transition={POP}
      aria-label="Priya is typing"
    >
      {[0, 1, 2].map((i) => (
        <motion.span
          key={i}
          className="size-[7px] rounded-full bg-[#9a9aa0]"
          animate={{ opacity: [0.35, 1, 0.35], y: [0, -2, 0] }}
          transition={{ duration: 0.9, repeat: Infinity, delay: i * 0.15, ease: 'easeInOut' }}
        />
      ))}
    </motion.div>
  )
}

export const annotations: FrameAnnotations = {
  C0: [
    {
      id: 'wa-header',
      title: 'Priya’s chat, as usual',
      body: 'The hint arrives where Rahul already talks to Priya. Nothing new to install, nothing branded around it.',
    },
    {
      id: 'today',
      title: 'Sent last night',
      body: 'Priya sent it at 9:41 pm; Rahul opens it the next morning. A hint can wait quietly until the moment suits.',
    },
    {
      id: 'bubble',
      title: 'A message, not a campaign',
      body: 'It comes from Priya’s own WhatsApp, in Priya’s words. CaratLane never messages Rahul directly.',
    },
    {
      id: 'link-preview',
      title: 'Rich link preview',
      body: 'Envelope art, “Priya dropped you a hint” and what’s inside, from the page’s Open Graph tags. The envelope stays sealed: it knocks and glass hearts rise from behind it, and the seal only pops when Rahul opens the hint. Tapping it opens the hint.',
    },
    {
      id: 'message',
      title: 'In Priya’s voice',
      body: 'A light, personal line written by Priya, not by CaratLane. It sets the tone: no pressure, just a nudge.',
    },
    {
      id: 'hint-link',
      title: 'Short private link',
      body: 'A short, unguessable link that opens straight into Priya’s picks. No app, no login, no store front first.',
    },
    {
      id: 'timestamp',
      title: 'Timing stays honest',
      body: 'The real send time, so Rahul knows how fresh the hint is: 13 days before the anniversary.',
    },
    {
      id: 'input-bar',
      title: 'Native WhatsApp',
      body: 'The chrome is plain iOS WhatsApp, so the moment feels like a friend’s message rather than an ad.',
    },
  ],
}
