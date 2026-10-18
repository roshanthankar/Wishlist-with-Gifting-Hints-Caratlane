import { motion } from 'motion/react'
import { LockSimple } from '@phosphor-icons/react'
import type { FrameId } from '@/proto/frames'
import type { FrameAnnotations } from '@/proto/annotations'
import { Button } from '@/ui'
import envelopeClosed from '@/assets/illustrations/envelope-closed.webp'
import { HintBackdrop, WebPage } from '../hint-page/HintShell'

/**
 * E1 · Hint link expired or turned off (804:38245). Same page shell as the
 * hint, but nothing personal: a locked envelope, a plain explanation and two
 * ways forward. Content: pt 32, gap 14, centred.
 */

const EASE_OUT = [0.22, 1, 0.36, 1] as const
const rise = (i: number) => ({
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.42, ease: EASE_OUT, delay: 0.12 + i * 0.05 },
})

export default function HintClosed({ frame: _frame }: { frame: FrameId }) {
  return (
    <WebPage backdrop={<HintBackdrop variant="compact" />}>
      <div className="flex flex-col items-center gap-[14px] px-4 pt-8">
        {/* Hero art slot 160×120; envelope-closed FIT in 131×99 at (14.5, 10.5). */}
        <motion.div
          data-anno="closed-envelope"
          className="relative h-[120px] w-[160px]"
          initial={{ opacity: 0, scale: 0.9, rotate: -4 }}
          animate={{ opacity: 1, scale: 1, rotate: 0 }}
          transition={{ type: 'spring', visualDuration: 0.5, bounce: 0.25 }}
        >
          <img
            src={envelopeClosed}
            alt="A glass envelope with a padlock"
            draggable={false}
            className="absolute left-[14.5px] top-[10.5px] h-[99px] w-[131px] select-none object-contain"
          />
        </motion.div>

        <motion.h1 data-anno="closed-title" className="serif w-full text-center text-[28px] leading-[38px] text-violet" {...rise(0)}>
          This hint has closed
        </motion.h1>
        <motion.p data-anno="closed-copy" className="max-w-[320px] text-center text-[14px] leading-[normal] text-[#4a4a4a]" {...rise(1)}>
          The link expired or the sender turned it off. Nothing personal is shown here anymore.
        </motion.p>

        <div aria-hidden className="h-6" />

        <motion.div className="flex w-full flex-col gap-3" {...rise(2)}>
          <Button data-anno="explore" block>
            Explore anniversary gifts
          </Button>
          <Button data-anno="new-link" variant="secondary" block>
            Ask for a new link
          </Button>
        </motion.div>

        <motion.div data-anno="closed-footnote" className="flex items-center gap-[6px]" {...rise(3)}>
          <LockSimple size={12} color="#8a8a8a" className="shrink-0" />
          <p className="text-[12px] leading-[normal] text-muted">Sizes, notes and picks are removed when a link closes</p>
        </motion.div>
      </div>
    </WebPage>
  )
}

export const annotations: FrameAnnotations = {
  E1: [
    {
      id: 'web-header',
      title: 'Still CaratLane',
      body: 'The same header as the live hint, so Rahul knows the link worked and simply closed.',
    },
    {
      id: 'closed-envelope',
      title: 'The envelope, locked',
      body: 'The glass envelope from the hint, now with a padlock. The state is clear before a word is read.',
    },
    {
      id: 'closed-title',
      title: 'This hint has closed',
      body: 'Neutral wording that blames nobody: it doesn’t say whether the link expired or Priya turned it off.',
    },
    {
      id: 'closed-copy',
      title: 'Nothing personal left',
      body: 'Expired or turned off, the page drops sizes, notes and picks. A shared link never outlives its purpose.',
    },
    {
      id: 'explore',
      title: 'A graceful way forward',
      body: 'Anniversary gifts keep the occasion in view, so Rahul still leaves with something good to choose from.',
    },
    {
      id: 'new-link',
      title: 'Ask for a new link',
      body: 'One tap lets Priya know Rahul tried, without an awkward “your link is broken” text.',
    },
    {
      id: 'closed-footnote',
      title: 'Says what’s removed',
      body: 'A quiet line stating exactly what disappears when a link closes. Trust comes from specifics.',
    },
    {
      id: 'safari-bar',
      title: 'Plain mobile web',
      body: 'Same Safari chrome as the hint itself; back returns Rahul to WhatsApp.',
    },
  ],
}
