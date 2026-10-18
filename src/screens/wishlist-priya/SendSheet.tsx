import type { ReactNode } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { ChatCircleText, DotsThree, LinkSimple, QrCode, WhatsappLogo } from '@phosphor-icons/react'
import { AuraBlob, Button, GlassCircle, PrivacyFootnote, ProductPhoto, SheetHeader } from '@/ui'
import { shareSummary, useHintPicks, useHintSettings } from './hintState'

export const HINT_URL = 'caratlane.com/h/7Kx2mQ9'

/**
 * B3 · “Send your hint” (step 2 of 2): link preview, WhatsApp first, then
 * link, QR and Messages as backups. Figma: header y 28, gap 14, card 144,
 * WhatsApp 50, four 56px glass targets, footer repeating what is shared.
 */
export function SendStep({ onClose, onSend, onQr }: { onClose: () => void; onSend: () => void; onQr: () => void }) {
  const [picks] = useHintPicks()
  const [settings] = useHintSettings()

  return (
    <div className="relative flex flex-col gap-[14px]">
      {/* Mint glow behind the preview card (“Aura · cyan”, #ACFFE3, blur 140) */}
      <AuraBlob x={0} y={108} w={346} h={122} color="#acffe3" blur={140} style={{ width: '100%' }} />

      <div className="relative flex flex-col gap-2" data-anno="b3-header">
        <SheetHeader title="Send your hint" tone="violet" onClose={onClose} />
        <p className="text-[14px] leading-5 text-ink-3">Opens on any phone, no app or login needed.</p>
      </div>

      <div className="relative flex flex-col gap-5 pb-5">
        <div
          data-anno="b3-preview"
          className="flex flex-col gap-[14px] rounded-[16px] border border-[#f1f1f1] bg-white p-4 shadow-[0_6px_8px_rgba(0,0,0,0.04)]"
        >
          <div className="flex gap-2">
            <AnimatePresence initial={false}>
              {picks.map((id) => (
                <motion.div
                  key={id}
                  layout
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  className="relative size-[62px] shrink-0 overflow-hidden rounded-[10px]"
                >
                  <ProductPhoto id={id} className="absolute inset-0" rounded={10} />
                  <span className="pointer-events-none absolute inset-0 rounded-[10px] border-2 border-[#f1f1f1]" />
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
          <div data-anno="b3-link" className="flex h-[34px] items-center justify-between gap-3 rounded-full border border-[#f1f1f1] bg-field px-3">
            <p className="truncate text-[12px] leading-[normal] text-ink-3">{HINT_URL}</p>
            <button
              type="button"
              className="pointer-events-none shrink-0 text-[12px] font-semibold leading-[normal] text-violet"
            >
              Preview
            </button>
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <Button weight="medium" variant="whatsapp" size="md" block icon={<WhatsappLogo size={20} weight="fill" />} onClick={onSend} data-anno="b3-whatsapp">
            Send on WhatsApp
          </Button>
          <div className="flex justify-between px-[7px]" data-anno="b3-targets">
            <Target label="Copy link" icon={<LinkSimple size={24} color="#000" />} />
            <Target label="QR code" onClick={onQr} icon={<QrCode size={24} color="#000" />} anno="b3-qr" />
            <Target label="Messages" icon={<ChatCircleText size={24} color="#000" />} />
            <Target label="More" icon={<DotsThree size={24} color="#000" />} />
          </div>
        </div>
      </div>

      <PrivacyFootnote data-anno="b3-footer" className="relative">
        {shareSummary(settings)}
      </PrivacyFootnote>
    </div>
  )
}

function Target({ label, icon, onClick, anno }: { label: string; icon: ReactNode; onClick?: () => void; anno?: string }) {
  return (
    <div className="flex w-14 flex-col items-center gap-[6px]" data-anno={anno}>
      <GlassCircle size={56} label={label} onClick={onClick}>
        {icon}
      </GlassCircle>
      <span className="whitespace-nowrap text-[12px] font-medium leading-[normal] text-ink-3">{label}</span>
    </div>
  )
}
