import type { ReactNode } from 'react'
import { useCallback, useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { List, Notebook, X } from '@phosphor-icons/react'
import { EnvProvider, useViewMode } from '@/proto/env'
import { NavProvider, useFlowStepper, useNav } from '@/proto/nav'
import { UiProvider, useUi } from '@/proto/ui'
import { cn } from '@/ui/cn'
import { Device } from './Device'
import { PhoneScreen } from './PhoneScreen'
import { Sidebar } from './Sidebar'
import { InfoPanel } from './InfoPanel'
import { AboutModal } from './AboutModal'
import { MobileMenu } from './MobileMenu'
import { DsGallery } from './DsGallery'

const SEEN = 'cl-proto.seen-about'

export default function App() {
  const mode = useViewMode()
  if (new URLSearchParams(window.location.search).get('view') === 'ds') return <EnvProvider mode="figma"><DsGallery /></EnvProvider>
  return (
    <EnvProvider mode={mode}>
      <NavProvider>
        <UiProvider>{mode === 'device' ? <DeviceLayout /> : mode === 'figma' ? <FigmaLayout /> : <DesktopLayout />}</UiProvider>
      </NavProvider>
    </EnvProvider>
  )
}

function useAbout() {
  const [open, setOpen] = useState(() => {
    const deepLink = /#\/[A-Z]/.test(window.location.hash)
    return !deepLink && localStorage.getItem(SEEN) !== '1'
  })
  const close = useCallback(() => {
    setOpen(false)
    localStorage.setItem(SEEN, '1')
  }, [])
  return { open, setOpen, close }
}

/** ?view=figma — one bare 402×896 frame, same size as the Figma exports, for visual diffing. */
function FigmaLayout() {
  return (
    <div className="h-[896px] w-[402px] overflow-hidden">
      <PhoneScreen />
    </div>
  )
}

/* ───────────────────────── Phones: the prototype is the page ───────────────────────── */

function DeviceLayout() {
  const about = useAbout()
  const { epoch } = useNav()
  return (
    <div className="fixed inset-0 h-dvh w-full overflow-hidden bg-white">
      <PhoneScreen key={epoch} />
      <MobileMenu onAbout={() => about.setOpen(true)} />
      <AboutModal open={about.open} onClose={about.close} />
      <RotateNotice />
    </div>
  )
}

/** Phones in landscape: the app is portrait-only, like the real one. */
function RotateNotice() {
  return (
    <div className="pointer-events-none fixed inset-0 z-[300] hidden items-center justify-center bg-[#f2f2f4] p-8 text-center [@media(orientation:landscape)_and_(max-height:500px)]:flex">
      <div>
        <p className="text-[16px] font-semibold">Turn your phone upright</p>
        <p className="mt-1 text-[13px] text-[#6b6582]">This prototype is a portrait iPhone app.</p>
      </div>
    </div>
  )
}

/* ───────────────────────── Desktop & tablets: iPhone 17 mockup + rails ───────────────────────── */

function DesktopLayout() {
  const about = useAbout()
  const { annotations } = useUi()
  const [rail, setRail] = useState<null | 'flows' | 'notes'>(null)
  useShortcuts(about.open || rail !== null)
  // The notes panel only exists while annotations are on.
  useEffect(() => {
    if (!annotations && rail === 'notes') setRail(null)
  }, [annotations, rail])

  return (
    <div className="flex h-dvh w-full overflow-hidden bg-[#f2f2f4] text-[#1d1830]">
      {/* Left rail: always on ≥1024px */}
      <aside className="hidden w-[300px] shrink-0 border-r border-[#e9e6f2] bg-white lg:block">
        <Sidebar onAbout={() => about.setOpen(true)} />
      </aside>

      <main className="relative flex min-w-0 flex-1 flex-col">
        <div className="relative z-10 flex items-center justify-between px-4 pt-3 lg:hidden">
          <RailButton label="Flows" onClick={() => setRail('flows')}>
            <List size={18} weight="bold" />
          </RailButton>
          {annotations && (
            <RailButton label="Notes" onClick={() => setRail('notes')}>
              <Notebook size={18} weight="bold" />
            </RailButton>
          )}
        </div>
        <div className="relative z-10 flex min-h-0 flex-1 flex-col px-4 py-4 lg:py-6">
          <Device />
        </div>
      </main>

      {/* Right rail (≥1024px): the notes panel slides in when annotations are turned on */}
      <AnimatePresence initial={false}>
        {annotations && (
          <motion.aside
            key="notes"
            className="hidden shrink-0 overflow-hidden border-l border-[#e9e6f2] bg-white lg:block"
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 340, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            transition={{ duration: 0.36, ease: [0.32, 0.72, 0, 1] }}
          >
            <div className="h-full w-[340px]">
              <InfoPanel />
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Drawers for smaller screens */}
      <Drawer side="left" open={rail === 'flows'} onClose={() => setRail(null)}>
        <Sidebar onAbout={() => { setRail(null); about.setOpen(true) }} onNavigate={() => setRail(null)} />
      </Drawer>
      <Drawer side="right" open={rail === 'notes'} onClose={() => setRail(null)}>
        <InfoPanel />
      </Drawer>

      <AboutModal open={about.open} onClose={about.close} />
    </div>
  )
}

function RailButton({ label, onClick, children }: { label: string; onClick: () => void; children: ReactNode }) {
  return (
    <button type="button" onClick={onClick} className="flex items-center gap-2 rounded-full bg-white px-3.5 py-2 text-[13px] font-semibold shadow-[0_0_0_1px_rgba(30,20,70,0.08)]">
      {children}
      {label}
    </button>
  )
}

function Drawer({ side, open, onClose, children }: { side: 'left' | 'right'; open: boolean; onClose: () => void; children: ReactNode }) {
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])
  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[120]">
          <motion.div className="absolute inset-0 bg-[#1b1430]/30" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} />
          <motion.aside
            className={cn('absolute bottom-0 top-0 w-[min(340px,88vw)] bg-white shadow-2xl', side === 'left' ? 'left-0' : 'right-0')}
            initial={{ x: side === 'left' ? '-100%' : '100%' }}
            animate={{ x: 0 }}
            exit={{ x: side === 'left' ? '-100%' : '100%' }}
            transition={{ type: 'spring', stiffness: 380, damping: 40 }}
          >
            <button type="button" aria-label="Close" onClick={onClose} className="absolute right-3 top-3 z-10 flex size-8 items-center justify-center rounded-full bg-black/5">
              <X size={14} weight="bold" />
            </button>
            {children}
          </motion.aside>
        </div>
      )}
    </AnimatePresence>
  )
}

/** ← → step through the flow · N annotations · R restart. */
function useShortcuts(disabled: boolean) {
  const { prev, next, toStart } = useFlowStepper()
  const { setAnnotations } = useUi()
  useEffect(() => {
    if (disabled) return
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement
      if (t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.isContentEditable)) return
      if (e.metaKey || e.ctrlKey || e.altKey) return
      if (e.key === 'ArrowRight') next?.()
      else if (e.key === 'ArrowLeft') prev?.()
      else if (e.key === 'n' || e.key === 'N') setAnnotations((v) => !v)
      else if (e.key === 'r' || e.key === 'R') toStart()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [disabled, prev, next, toStart, setAnnotations])
}
