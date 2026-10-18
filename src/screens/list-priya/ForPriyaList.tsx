import { useCallback, useLayoutEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import type { FrameId } from '@/proto/frames'
import type { FrameAnnotations } from '@/proto/annotations'
import { useNav } from '@/proto/nav'
import { useProtoState } from '@/proto/store'
import type { ProductId } from '@/data/products'
import { BOTTOM_BAR_INSET, BottomBar, Button, FindMoreCard, ProductTile, Screen, ScrollView, cn } from '@/ui'
import { ALL_IDS, DeadlineCard, ListAura, ListHeader, tagFor } from './parts'
import { ContextMenu, type MenuAction, type MenuExit } from './ContextMenu'
import { AskSheet } from './AskSheet'
import { StyleMatchSheet } from './StyleMatchSheet'
import { SignalsCard } from './SignalsCard'

export const annotations: FrameAnnotations = {
  A6: [
    { id: 'list-title', title: 'A list with a name', body: 'The list is a person, not a folder. The lock says it plainly: Priya can’t see it, so Rahul can plan in the open.' },
    { id: 'edit-list', title: 'Edit, out of the way', body: 'Renaming, reordering and the date live behind one glass button, so the page stays about the pieces.' },
    { id: 'occasion', title: 'The countdown', body: 'Occasion, date and days to go in one line. Every decision on this page is framed by the anniversary, not by a sale.' },
    { id: 'deadline', title: 'Order-by date', body: 'The real deadline is delivery, not the anniversary. Naming the order-by day (with free gift wrap) turns a vague worry into a plan.' },
    { id: 'tile-vanki', title: 'Saved pieces, with a reason', body: 'Each tile carries the one fact that matters now: an offer, a price drop, a bestseller. Long-press for quick actions without leaving the list.' },
    { id: 'tile-price-drop', title: 'Heart to let go', body: 'A price drop is news worth a tag. And if Hearts Vine no longer fits, one tap on the heart unsaves it and the grid closes the gap.' },
    { id: 'find-more', title: 'Find more for Priya', body: 'A dashed slot keeps discovery inside the list, seeded by what Rahul already saved rather than by a generic feed.' },
    { id: 'ask-friend', title: 'One clear next step: ask a friend', body: 'The second opinion Rahul is missing, and the only action on the page. It starts the secret vote in row 02, without the gift ever reaching Priya. Tapping any piece opens it to buy.' },
  ],
  A7: [
    { id: 'menu-backdrop', title: 'Focus, not a new screen', body: 'The list blurs and dims behind the menu, so Rahul keeps his place. Tapping anywhere outside closes it.' },
    { id: 'lifted-card', title: 'The piece lifts', body: 'The pressed tile rises with a spring into a larger preview, an iOS gesture Rahul already knows. It flies back on close.' },
    { id: 'menu-quick', title: 'Three quick actions', body: 'Share, ask a friend and find similar sit on top as icons: the actions that bring other people or options in.' },
    { id: 'menu-store', title: 'Try it in store', body: 'For a ring, touch matters. The nearest store with the piece is one tap from the shortlist.' },
    { id: 'menu-price', title: 'Track price drops', body: 'A quiet way to wait. With 14 days to go, a drop alert can decide between two close favourites.' },
    { id: 'menu-move', title: 'Move to list', body: 'Pieces can move between people, so a ring that is more Mom than Priya never gets lost.' },
    { id: 'menu-remove', title: 'Remove, kept apart', body: 'The only destructive action is red and separated, so it is never hit by accident. The tile drops out and the grid reflows.' },
  ],
  A8: [
    { id: 'ask-title', title: 'Secret by design', body: 'The copy sets the rules before anything else: a private link, never shared with Priya, closing after one vote.' },
    { id: 'ask-who', title: 'Who knows her taste?', body: 'Rahul picks someone close. Their first name flows into every label below, so the sheet reads like a message to one person.' },
    { id: 'ask-picks', title: 'Up to three pieces', body: 'Three is a real comparison without overwhelming a busy sister. The count updates as tiles are toggled.' },
    { id: 'ask-preview', title: 'What Ananya will see', body: 'The exact note is shown before sending, in the warm serif voice of a personal message. Nothing is a surprise to the recipient.' },
    { id: 'ask-size', title: 'Ask for her size', body: 'The question Rahul can’t ask Priya. Ananya can check one of her rings and answer in the same vote.' },
    { id: 'ask-prices', title: 'Hide prices', body: 'On by default: Ananya votes on the piece, not the price, and Rahul’s budget stays his.' },
    { id: 'ask-send', title: 'Send on WhatsApp', body: 'The channel Ananya already uses. No app, no login: the vote opens in the browser.' },
    { id: 'ask-footnote', title: 'Says what it keeps', body: 'The footnote promises only what the link can enforce: one vote, then it closes.' },
  ],
  A10: [
    { id: 'match-title', title: 'A game, not a survey', body: 'Style match is CaratLane’s 30-second couples game. Sent weeks before, it reads as fun, not as gift research.' },
    { id: 'match-picks', title: 'Mix in the shortlist', body: 'Rahul chooses which saved pieces go in. Priya’s reactions to them quietly rank his list.' },
    { id: 'match-preview', title: 'What Priya will see', body: 'A light, playful invite. Nothing in the message mentions gifts, the anniversary or a shortlist.' },
    { id: 'match-lookalikes', title: 'Look-alikes as cover', body: 'Five similar pieces surround Rahul’s picks, so none of them stands out as the one he is considering.' },
    { id: 'match-prices', title: 'Looks alone', body: 'Prices stay hidden so Priya reacts to the design, the signal Rahul actually needs.' },
    { id: 'match-send', title: 'Send to Priya', body: 'Goes out on WhatsApp like any game invite. She plays in the browser, no app needed.' },
    { id: 'match-footnote', title: 'The promise', body: 'She sees a game for two, never the shortlist. The surprise is protected by design, not by luck.' },
  ],
  A12: [
    { id: 'occasion', title: 'A day later', body: 'Thirteen days to go. The countdown moves with the story, so the confidence arrives with time to spare.' },
    { id: 'signals', title: 'Every signal lines up', body: 'Priya’s Style match pick, Ananya’s vote and Priya’s own hint all land on the same ring. That is the confidence Rahul was missing.' },
    { id: 'signals-avatars', title: 'Who said so', body: 'Ananya and Priya, side by side. Rahul sees the evidence comes from the two people who know best.' },
    { id: 'signals-quote', title: 'Ananya’s line', body: 'A human sentence beats a score. The size note answers the last open question: it will fit.' },
    { id: 'tile-hinted', title: 'Priya hinted this', body: 'The violet outline and tag use Priya’s colour, so Rahul knows this signal came from her and not from CaratLane.' },
    { id: 'see-hint', title: 'See her hint', body: 'Opens Priya’s hint page, for when Rahul wants to read her words again before deciding.' },
    { id: 'buy-vanki', title: 'Buy the Vanki', body: 'With every signal agreeing, the action names the ring itself. It opens the Vanki’s product page, so Rahul knows exactly where the tap goes.' },
  ],
}

const REFLOW = { type: 'spring', stiffness: 420, damping: 36 } as const

/**
 * Figma sizes Proxima Nova text boxes at 1× the font size; the Typekit font’s
 * `normal` line height is ~1.43×, which the shared tiles use. Pin it locally.
 */
const FIGMA_TEXT = '[&_div]:leading-none [&_p]:leading-none'
/** A6/A12 tile tags are 22px tall (py 4), not the DS 26px. */
const TAG_22 = '[&_span.rounded-full]:py-1'

/**
 * Rahul’s “For Priya” gift list (route `list-priya`).
 *   A6  list · A7 long-press menu · A8 “Ask someone close” sheet
 *   A10 “Style match” sheet · A12 every signal lines up
 */
export default function ForPriyaList({ frame }: { frame: FrameId }) {
  const { go, back } = useNav()
  const [menuItem, setMenuItem] = useProtoState<ProductId>('list.menuItem', 'vanki')
  const [menuFrom, setMenuFrom] = useProtoState<'A6' | 'A12'>('list.menuFrom', 'A6')
  // A12 is a later snapshot of the list (Wed 12 Nov), so it keeps its own copy.
  const base: 'A6' | 'A12' = frame === 'A12' || (frame === 'A7' && menuFrom === 'A12') ? 'A12' : 'A6'
  const [items, setItems] = useProtoState<ProductId[]>(base === 'A12' ? 'list.itemsSignals' : 'list.items', ALL_IDS)
  const [askItems] = useProtoState<ProductId[]>('list.items', ALL_IDS)

  const menuOpen = frame === 'A7'
  const [exit, setExit] = useState<MenuExit>('return')
  const [lifted, setLifted] = useState<ProductId | null>(null)
  const [unsaving, setUnsaving] = useState<ProductId[]>([])
  const lastLongPress = useRef(0)
  const gridRef = useRef<HTMLDivElement>(null)

  // Hide the pressed tile while its lifted copy is up (and until it lands back).
  useLayoutEffect(() => {
    if (menuOpen) {
      setLifted(menuItem)
      setExit('return')
    }
  }, [menuOpen, menuItem])

  const findTile = useCallback(
    (id: ProductId) => gridRef.current?.querySelector<HTMLElement>(`[data-tile="${id}"] > div > div`) ?? null,
    [],
  )

  const closeMenu = useCallback(() => go(base), [go, base])

  const onMenuAction = (a: MenuAction) => {
    switch (a) {
      case 'ask':
        return go('A8')
      case 'remove':
        setExit('remove')
        setItems((list) => list.filter((x) => x !== menuItem))
        return go(base)
    }
    closeMenu()
  }

  const openTile = () => {
    if (Date.now() - lastLongPress.current < 800) return // the click that ends a long-press
    go('A1')
  }

  const longPress = (id: ProductId) => {
    lastLongPress.current = Date.now()
    setMenuItem(id)
    setMenuFrom(base)
    go('A7')
  }

  const unsave = (id: ProductId) => {
    setUnsaving((u) => [...u, id])
    window.setTimeout(() => {
      setItems((list) => list.filter((x) => x !== id))
      setUnsaving((u) => u.filter((x) => x !== id))
    }, 300)
  }

  const signals = base === 'A12'

  return (
    <Screen bg="#fdfdfd">
      <ScrollView backdrop={<ListAura />} bottomInset={BOTTOM_BAR_INSET}>
        <div className="flex flex-col gap-[22px] px-4 pt-2">
          <ListHeader daysToGo={signals ? 13 : 14} onBack={back} />

          {signals ? <SignalsCard /> : <DeadlineCard />}

          <div ref={gridRef} className={cn('relative grid grid-cols-2 gap-x-[14px] gap-y-[18px]', FIGMA_TEXT, TAG_22)}>
            <AnimatePresence mode="popLayout" initial={false}>
              {items.map((id) => {
                const hinted = signals && id === 'vanki'
                return (
                  <motion.div
                    key={id}
                    layout
                    data-tile={id}
                    className={lifted === id ? '[&>div>div:first-child]:invisible' : undefined}
                    exit={{ opacity: 0, scale: 0.86, transition: { duration: 0.22 } }}
                    transition={REFLOW}
                  >
                    <ProductTile
                      id={id}
                      data-anno={hinted ? 'tile-hinted' : id === 'vanki' ? 'tile-vanki' : id === 'hearts-vine' ? 'tile-price-drop' : undefined}
                      tag={hinted ? <span className="text-violet">Priya hinted this</span> : tagFor(id)}
                      highlight={hinted}
                      saved={!unsaving.includes(id)}
                      onToggleSaved={() => unsave(id)}
                      onClick={openTile}
                      onLongPress={() => longPress(id)}
                    />
                  </motion.div>
                )
              })}
              <motion.div key="find-more" layout transition={REFLOW}>
                <FindMoreCard
                  data-anno="find-more"
                  className="text-ink-3"
                  title="Find more for Priya"
                />
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </ScrollView>

      <motion.div animate={{ opacity: menuOpen ? 0 : 1 }} transition={{ duration: 0.25 }}>
        <BottomBar fade="#fdfdfd">
          {signals ? (
            <>
              <Button variant="secondary" block="flex" data-anno="see-hint" onClick={() => go('C1')}>
                See her hint
              </Button>
              <Button block="flex" data-anno="buy-vanki" onClick={() => go('A1')}>
                Buy the Vanki
              </Button>
            </>
          ) : (
            <Button block data-anno="ask-friend" onClick={() => go('A8')}>
              Ask a friend
            </Button>
          )}
        </BottomBar>
      </motion.div>

      <ContextMenu
        open={menuOpen}
        item={menuItem}
        exit={exit}
        findTile={findTile}
        onClose={closeMenu}
        onAction={onMenuAction}
        onExitComplete={() => setLifted(null)}
      />

      <AskSheet open={frame === 'A8'} items={askItems} onClose={() => go('A6')} onSend={() => go('A9')} />
      <StyleMatchSheet open={frame === 'A10'} items={askItems} onClose={() => go('A6')} onSend={() => go('A11')} />
    </Screen>
  )
}
