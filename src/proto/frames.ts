/**
 * Every Figma frame in “Section 2” (node 703:712) is a FrameId.
 * Several frames are states of the same screen (a “route”): A1→A2→A3 are the
 * product page with a toast and then a sheet. Moving between frames of the same
 * route animates in place; moving to another route pushes a new screen.
 */

export type FrameId =
  | 'A1' | 'A2' | 'A3' | 'A4' | 'A4b' | 'A4c' | 'A5' | 'A6' | 'A7'
  | 'A8' | 'A9' | 'A10' | 'A11' | 'A11b' | 'A12'
  | 'B0' | 'B1' | 'B2' | 'B3' | 'B3b' | 'B4' | 'B4b' | 'B5' | 'B6'
  | 'C0' | 'C1' | 'C2' | 'E1' | 'E2' | 'E3'

export type RouteId =
  | 'pdp' // A1–A4c  Product page (+ toast, + sheets)
  | 'wishlist-rahul' // A5
  | 'list-priya' // A6, A7, A8, A10, A12  “For Priya” gift list (+ menu, + sheets)
  | 'web-vote' // A9   Ananya votes (mobile web)
  | 'web-match' // A11, A11b  Style match game (mobile web)
  | 'dates' // B0
  | 'wishlist-priya' // B1, B2, B3  Priya’s wishlist (+ hint sheets)
  | 'qr-hint' // B3b
  | 'hint-status' // B4, B4b, B5, B6
  | 'whatsapp' // C0
  | 'hint-page' // C1, C2, E2, E3  Hint landing (mobile web)
  | 'hint-closed' // E1

export type Persona = 'Rahul' | 'Priya' | 'Ananya' | 'Mom'
export type Channel = 'CaratLane app' | 'Mobile web' | 'WhatsApp'

/** How a route enters when pushed. */
export type Transition = 'push' | 'modal' | 'app'

export interface FrameMeta {
  id: FrameId
  route: RouteId
  title: string
  persona: Persona
  channel: Channel
  /** Design rationale, verbatim from the Figma note under the frame. */
  note: string
  /** “Main path · n” or “Also possible” pill from Figma. */
  tag?: string
  /** Figma node id of the frame (for traceability). */
  figma: string
  /** Story time-stamp so the shell can show when this happens. */
  when?: string
  /** Dark screens get a white home indicator. */
  dark?: boolean
}

export const ROUTE_TRANSITION: Record<RouteId, Transition> = {
  pdp: 'push',
  'wishlist-rahul': 'push',
  'list-priya': 'push',
  'web-vote': 'app',
  'web-match': 'app',
  dates: 'push',
  'wishlist-priya': 'push',
  'qr-hint': 'modal',
  'hint-status': 'push',
  whatsapp: 'app',
  'hint-page': 'app',
  'hint-closed': 'app',
}

const F = (m: FrameMeta) => m

export const FRAMES: Record<FrameId, FrameMeta> = {
  // ── Row 01 · Save for someone, with confidence ─────────────────────────
  A1: F({ id: 'A1', route: 'pdp', title: 'Product page', persona: 'Rahul', channel: 'CaratLane app', tag: 'Main path · 1', figma: '656:5592', when: 'Tue 11 Nov · 1:05 pm',
    note: 'The gifting banner answers “can I give this?” before he asks: box, note and a price-free invoice.' }),
  A2: F({ id: 'A2', route: 'pdp', title: 'Saved, with a toast', persona: 'Rahul', channel: 'CaratLane app', tag: 'Main path · 2', figma: '804:33833', when: 'Tue 11 Nov · 1:05 pm',
    note: 'Saving is instant. The toast offers the gifting path without forcing it: “Add to gift list”.' }),
  A3: F({ id: 'A3', route: 'pdp', title: 'Who is this for?', persona: 'Rahul', channel: 'CaratLane app', tag: 'Main path · 3', figma: '681:2370', when: 'Tue 11 Nov · 1:06 pm',
    note: 'His first gift list, so this goes straight to “Who is this for?”. Relationship, occasion, date and her size turn a save into a plan. Next time, the same tap shows his lists first.' }),
  A4: F({ id: 'A4', route: 'pdp', title: 'A great pick for Priya', persona: 'Rahul', channel: 'CaratLane app', tag: 'Main path · 4', figma: '687:8526', when: 'Tue 11 Nov · 1:06 pm',
    note: 'Proof tuned to the relationship: what partners gift, a size safety net, and a way out through exchange.' }),
  A4b: F({ id: 'A4b', route: 'pdp', title: 'Same ring, for Mom', persona: 'Rahul', channel: 'CaratLane app', figma: '834:39993',
    note: 'The relationship changes the advice: daily wear, what people usually spend on Mom, and a store near her to swap it.' }),
  A4c: F({ id: 'A4c', route: 'pdp', title: 'Same ring, for a friend', persona: 'Rahul', channel: 'CaratLane app', figma: '834:42835',
    note: 'Honest when it’s above the norm for a friend, with lighter picks one tap away. Confidence includes not overspending.' }),
  A5: F({ id: 'A5', route: 'wishlist-rahul', title: 'Wishlist', persona: 'Rahul', channel: 'CaratLane app', figma: '701:13774',
    note: 'Gift lists sit above everything saved, so planning for someone is the first thing he sees.' }),
  A6: F({ id: 'A6', route: 'list-priya', title: 'For Priya', persona: 'Rahul', channel: 'CaratLane app', tag: 'Main path · 5', figma: '707:843', when: 'Tue 11 Nov · 1:07 pm',
    note: 'Countdown, an order-by date and one clear next step. “Ask a friend” starts the secret vote in row 02.' }),
  A7: F({ id: 'A7', route: 'list-priya', title: 'Long-press menu', persona: 'Rahul', channel: 'CaratLane app', figma: '707:2275',
    note: 'Quick actions without clutter: share, ask, find similar, try in store, track price drops.' }),

  // ── Row 02 · Also possible: a second opinion ───────────────────────────
  A8: F({ id: 'A8', route: 'list-priya', title: 'Ask someone close', persona: 'Rahul', channel: 'CaratLane app', tag: 'Also possible', figma: '830:21285', when: 'Tue 11 Nov · 1:20 pm',
    note: 'Rahul picks who knows her taste and up to three pieces. Prices can stay hidden, and the link closes after one vote.' }),
  A9: F({ id: 'A9', route: 'web-vote', title: 'Ananya votes, secretly', persona: 'Ananya', channel: 'Mobile web', tag: 'Also possible', figma: '830:24190', when: 'Tue 11 Nov · 6:30 pm',
    note: 'No app, no login. One tap for the piece, one for her size, and an optional line for Rahul.' }),
  A10: F({ id: 'A10', route: 'list-priya', title: 'Style match, a game for two', persona: 'Rahul', channel: 'CaratLane app', tag: 'Also possible', figma: '834:36736', when: 'Sun 2 Nov · 9:00 pm',
    note: 'CaratLane’s 30-second couples game, sent on Sun 2 Nov, weeks before. Rahul’s shortlist hides among look-alikes, so it reads as a game, not a plan.' }),
  A11: F({ id: 'A11', route: 'web-match', title: 'Priya plays Style match', persona: 'Priya', channel: 'Mobile web', tag: 'Also possible', figma: '834:39540', when: 'Sun 2 Nov · 9:02 pm',
    note: 'Swipe right to love it, left to leave it. No prices. Her loves quietly rank Rahul’s shortlist; she sees “you matched on 5 of 8”.' }),
  A11b: F({ id: 'A11b', route: 'web-match', title: 'Time’s up, softly', persona: 'Priya', channel: 'Mobile web', tag: 'Also possible', figma: '834:77256',
    note: 'The timer is for fun, not a lock. When it runs out she can keep going or see how well they match.' }),
  A12: F({ id: 'A12', route: 'list-priya', title: 'Every signal lines up', persona: 'Rahul', channel: 'CaratLane app', tag: 'Also possible', figma: '830:25734', when: 'Wed 12 Nov · 8:30 am',
    note: 'Wed 12 Nov: Priya’s game pick, Ananya’s vote and Priya’s own hint all land on the same ring. That’s the confidence he was missing.' }),

  // ── Row 03 · Drop a hint ────────────────────────────────────────────────
  B0: F({ id: 'B0', route: 'dates', title: 'Dates that matter', persona: 'Priya', channel: 'CaratLane app', figma: '834:78695',
    note: 'Where Priya saves the dates that trigger B1’s nudge, 14 days before each. Only she sees them.' }),
  B1: F({ id: 'B1', route: 'wishlist-priya', title: 'Priya’s wishlist', persona: 'Priya', channel: 'CaratLane app', tag: 'Main path · 6', figma: '727:7615', when: 'Tue 11 Nov · 9:30 pm',
    note: 'A saved date triggers the nudge 14 days out, inside the wishlist, when a hint feels natural.' }),
  B2: F({ id: 'B2', route: 'wishlist-priya', title: 'Compose the hint', persona: 'Priya', channel: 'CaratLane app', tag: 'Main path · 7', figma: '736:2886', when: 'Tue 11 Nov · 9:38 pm',
    note: 'Up to six picks with a note on each, a tone dial, and control over what Rahul sees: price ranges, holds, size.' }),
  B3: F({ id: 'B3', route: 'wishlist-priya', title: 'Send your hint', persona: 'Priya', channel: 'CaratLane app', tag: 'Main path · 8', figma: '736:3446', when: 'Tue 11 Nov · 9:41 pm',
    note: 'WhatsApp first; link, QR and Messages as backups. The footer repeats exactly what’s being shared.' }),
  B3b: F({ id: 'B3b', route: 'qr-hint', title: 'A QR card he’ll find', persona: 'Priya', channel: 'CaratLane app', tag: 'Also possible', figma: '834:47402', dark: true,
    note: 'Full-screen show mode: the dark stage keeps the card bright and easy to scan from a screen. Save, print or share it, then leave it where he’ll find it.' }),
  B4: F({ id: 'B4', route: 'hint-status', title: 'Your hint is out', persona: 'Priya', channel: 'CaratLane app', figma: '793:15766', when: 'Tue 11 Nov · 9:41 pm',
    note: 'The tracker shows what Priya should know: sent and opened. Who bought what stays a surprise.' }),
  B4b: F({ id: 'B4b', route: 'hint-status', title: 'A day later', persona: 'Priya', channel: 'CaratLane app', figma: '804:35455', when: 'Wed 12 Nov · 8:10 am',
    note: 'Rahul opened it. Who’s holding what stays hidden from Priya until after the 25th, so nothing spoils the surprise.' }),
  B5: F({ id: 'B5', route: 'hint-status', title: 'Edit picks', persona: 'Priya', channel: 'CaratLane app', figma: '804:35856',
    note: 'Same link, updated quietly. Removing a pick never cancels or reveals a hold.' }),
  B6: F({ id: 'B6', route: 'hint-status', title: 'Not opened in 7 days', persona: 'Priya', channel: 'CaratLane app', figma: '804:36065', when: 'Tue 18 Nov',
    note: 'A gentle nudge Priya sends herself, from her own WhatsApp. CaratLane never chases Rahul.' }),

  // ── Row 04 · The hint lands ─────────────────────────────────────────────
  C0: F({ id: 'C0', route: 'whatsapp', title: 'WhatsApp', persona: 'Rahul', channel: 'WhatsApp', tag: 'Main path · 9', figma: '804:36178', when: 'Wed 12 Nov · 8:10 am',
    note: 'What Rahul sees first: her words and a rich preview, not a promotion.' }),
  C1: F({ id: 'C1', route: 'hint-page', title: 'The hint lands', persona: 'Rahul', channel: 'Mobile web', tag: 'Main path · 10', figma: '793:16400', when: 'Wed 12 Nov · 8:10 am',
    note: 'Her note, her date, her picks with her size and price ranges. “I’ll get this” holds a pick for 24 hours.' }),
  C2: F({ id: 'C2', route: 'hint-page', title: 'Held for you', persona: 'Rahul', channel: 'Mobile web', tag: 'Main path · 11', figma: '736:4410', when: 'Wed 12 Nov · 8:14 am',
    note: 'Left checkout? The pick stays held. Mom is on the hint too, so holds stop double gifts.' }),
  E1: F({ id: 'E1', route: 'hint-closed', title: 'Link closed', persona: 'Rahul', channel: 'Mobile web', figma: '804:38245',
    note: 'Expired or revoked: nothing personal stays on the page, and there’s a graceful way back in.' }),
  E2: F({ id: 'E2', route: 'hint-page', title: 'Nothing left', persona: 'Rahul', channel: 'Mobile web', figma: '804:38414',
    note: 'Mom has one and two sold out in size 12. Offer similar pieces or a gift card instead.' }),
  E3: F({ id: 'E3', route: 'hint-page', title: 'Things changed', persona: 'Rahul', channel: 'Mobile web', figma: '804:38587',
    note: 'Price drops and sold-out sizes since she sent it, flagged at the top and on each pick.' }),
}

export const FRAME_IDS = Object.keys(FRAMES) as FrameId[]

export const isFrameId = (v: string): v is FrameId => v in FRAMES
