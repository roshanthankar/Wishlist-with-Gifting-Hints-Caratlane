import type { ReactNode, Ref } from 'react'
import { motion } from 'motion/react'
import { AuraBlob, BottomFade, PATTERNS, SafariBar, Screen, ScrollView, WebHeader, useSafariInset } from '@/ui'
import { useEnv } from '@/proto/env'
import { useNav } from '@/proto/nav'

/**
 * Rahul’s mobile-web hint pages (C1, C1b, C2, E1–E3).
 *
 * Figma keeps the lattice, the auras and the web header outside “Content”,
 * and C1b (the same page scrolled to the end) still shows them at the top.
 * So they are pinned here and only the content scrolls, fading out under
 * the header instead of colliding with the logo.
 */

/** Space kept under the content: C1b ends at y 727 of 896, i.e. Safari bar (84) + 85. */
const END_GAP_MOCKUP = 169

const CONTENT_MASK = 'linear-gradient(to bottom, transparent calc(var(--safe-top) + 36px), #000 calc(var(--safe-top) + 56px))'

export function WebPage({
  backdrop,
  children,
  scrollRef,
  overlay,
}: {
  backdrop: ReactNode
  children: ReactNode
  scrollRef?: Ref<HTMLDivElement>
  /** Extra layers above the page (the tap-to-skip layer while the hint opens). */
  overlay?: ReactNode
}) {
  const { mockup } = useEnv()
  const safari = useSafariInset()
  const { back } = useNav()
  return (
    <Screen bg="#fdfdfd">
      <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
        {backdrop}
      </div>
      <div className="absolute inset-x-0 z-20" style={{ top: 'var(--safe-top)' }}>
        <WebHeader data-anno="web-header" />
      </div>
      <ScrollView
        scrollRef={scrollRef}
        edgeColor={null}
        bottomInset={safari ? END_GAP_MOCKUP : 'calc(var(--safe-bottom-pad) + 40px)'}
        style={{ maskImage: CONTENT_MASK, WebkitMaskImage: CONTENT_MASK }}
      >
        <div aria-hidden className="h-[52px]" />
        {children}
      </ScrollView>
      {mockup && <BottomFade />}
      <SafariBar onBack={back} />
      {overlay}
    </Screen>
  )
}

/**
 * Lattice + auras. `landing` is C1/C1b (blue→violet wash with blue, cyan and
 * pink streaks); `compact` is C2/E1–E3 (blue, cyan, periwinkle). Both sets are
 * mounted so moving between them cross-fades. `dim` is used while the
 * envelope is still sealed: the aura blooms when the seal pops.
 */
export function HintBackdrop({ variant, dim = false }: { variant: 'landing' | 'compact'; dim?: boolean }) {
  const landing = variant === 'landing'
  return (
    <>
      <img src={PATTERNS.latticePage} alt="" draggable={false} className="absolute left-0 top-0 block w-full select-none" />
      <motion.div
        className="absolute inset-0"
        initial={false}
        animate={{ opacity: landing ? (dim ? 0.45 : 1) : 0 }}
        // The colour blooms slowly when the seal pops.
        transition={{ duration: dim ? 0.2 : 1.4, ease: [0.22, 1, 0.36, 1] }}
      >
        <AuraBlob
          y={0}
          w={369}
          h={275}
          blur={300}
          color="linear-gradient(150deg, #74b0ff 18%, #7954ff 89%)"
          style={{ left: 'calc(50% - 183px)' }}
        />
        <AuraBlob x={-40} y={17} w={181} h={55} color="#7cb9ff" blur={120} />
        <AuraBlob
          y={243.4}
          w={192.6}
          h={62}
          color="#7cffe7"
          blur={140}
          style={{ left: 'calc(100% - 154px)', transformOrigin: '0 0', transform: 'rotate(-47.25deg) translateZ(0)' }}
        />
        <AuraBlob
          y={250.6}
          w={354.5}
          h={54.1}
          color="#ffadf1"
          blur={150}
          style={{ left: 'calc(50% - 133px)', transformOrigin: '0 0', transform: 'rotate(-45deg) translateZ(0)' }}
        />
      </motion.div>
      <motion.div
        className="absolute inset-0"
        initial={false}
        animate={{ opacity: landing ? 0 : 1 }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
      >
        <AuraBlob y={-2} w={369} h={277} color="#a9b4ff" blur={300} style={{ left: 'calc(50% - 183px)' }} />
        <AuraBlob x={-39.6} y={17} w={162} h={31} color="#74ffff" blur={100} />
        <AuraBlob right={-41} y={16} w={162} h={102} color="#b078ff" blur={150} />
      </motion.div>
    </>
  )
}
