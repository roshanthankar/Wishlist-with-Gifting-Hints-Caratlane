import type { FrameId } from '@/proto/frames'

/** Copy from the Figma cover “00 · Story” (830:27156), verbatim. */
export const STORY = {
  kicker: 'CaratLane · UX evaluation · Mobile app and mobile web',
  title: 'Wishlist with Gifting Hints',
  promise: 'From “I don’t know what to buy” to “I know she’ll love this.”',
  problem:
    'The problem isn’t the wishlist. It’s the confidence gap between two people. A wishlist is a private bucket; gifting needs a loop. One person signals, someone close validates, and both feel safe. So a save becomes a plan, with a person, a date and a hint.',
  cast: [
    { letter: 'R', name: 'Rahul, 32', role: 'The gifter', line: 'Wants their 3rd anniversary to land. Doesn’t know her size, or whether she’d really wear it.', tone: 'pink' },
    { letter: 'P', name: 'Priya, 29', role: 'The giftee', line: 'Knows exactly what she’d love. Won’t ask for it outright.', tone: 'violet' },
    { letter: 'A', name: 'Ananya', role: 'Priya’s sister', line: 'Knows her taste and her size. Happy to vote, in secret.', tone: 'pink' },
    { letter: 'M', name: 'Mom', role: 'Priya’s mother', line: 'Also gets Priya’s hint, and holds one pick so nobody doubles up.', tone: 'pink' },
  ],
  moves: [
    { who: 'Rahul, saving', title: 'Save it for her', line: '“Who is this for?” turns a save into a plan, and her own hint confirms it.', also: 'Also possible: ask Ananya to vote · play Style match', start: 'A1' as FrameId, flow: 'row-1' },
    { who: 'Priya', title: 'Drop a hint', line: 'A nudge 14 days before a saved date. Pick, set the tone, send on WhatsApp.', also: 'Also possible: a QR card he’ll find', start: 'B1' as FrameId, flow: 'row-3' },
    { who: 'Rahul, receiving', title: 'Open it and hold one', line: 'No app, no login. Her picks and her size; hold one for 24 hours.', also: 'Also possible: Mom gets it too, so no double gifts', start: 'C0' as FrameId, flow: 'row-4' },
  ],
  colours: [
    { swatch: '#dd1564', name: 'Pink · from Rahul', line: 'His gift list and the proof, and everything he sends: the secret vote to Ananya, Style match with Priya.' },
    { swatch: '#5a39e3', name: 'Violet · from Priya, and every main button', line: 'Her wishlist and hints, every page she sends, and the primary action on any screen.' },
    { swatch: '#288600', name: 'Green · offers', line: 'CaratLane’s existing offer colour. Nothing new added.' },
  ],
  type: 'DM Serif Text for moments and people’s own words (italic). Proxima Nova for everything else.',
  bets: [
    { title: 'Men don’t lack options. They lack a signal.', know: 'Gift lists with her hint reach checkout more often than plain wishlists.' },
    { title: 'Hints feel natural on WhatsApp in India.', know: 'Most hint links are opened within 24 hours of sending.' },
    { title: 'Surprise matters more than choice.', know: 'Senders keep holds hidden, and spoiled-surprise reports stay near zero.' },
    { title: 'A second opinion beats more options.', know: 'Lists with a vote or a Style match convert better than lists without.' },
  ],
  measures: [
    { kind: 'Primary', line: 'Hint link to purchase conversion, against private wishlists' },
    { kind: 'Activation', line: 'Share of saves made for someone · hints sent per wishlist' },
    { kind: 'Recipient', line: 'Link open rate · time from opening to the first hold' },
    { kind: 'Confidence', line: 'Exchange and return rate on hinted vs. unhinted gifts · votes per gift list' },
    { kind: 'Guardrail', line: 'Links revoked · nudges turned off · reports of a spoiled surprise' },
  ],
  timeline: [
    { when: 'Sun 2 Nov · 9:00 pm', what: 'They play Style match on the sofa. She loves the Vanki', frames: 'A10, A11', go: 'A10' as FrameId },
    { when: 'Tue 11 Nov · 1:05 pm', what: 'Rahul saves the Vanki ring for Priya', frames: 'A1–A4', go: 'A1' as FrameId },
    { when: 'Tue 11 Nov · 1:20 pm', what: 'He asks Ananya, her sister, to vote in secret', frames: 'A6, A8', go: 'A8' as FrameId },
    { when: 'Tue 11 Nov · 6:30 pm', what: 'Ananya votes: the Vanki, size 12', frames: 'A9', go: 'A9' as FrameId },
    { when: 'Tue 11 Nov · 9:41 pm', what: 'Priya drops a hint to Rahul and Mom', frames: 'B0–B4', go: 'B1' as FrameId },
    { when: 'Wed 12 Nov · 8:10 am', what: 'Rahul opens it on WhatsApp and holds the Vanki', frames: 'C0–C2', go: 'C0' as FrameId },
    { when: 'Wed 12 Nov · 8:30 am', what: 'Every signal agrees on the Vanki. He’s sure', frames: 'A12', go: 'A12' as FrameId },
    { when: 'Tue 25 Nov', what: 'Their 3rd anniversary. Priya never saw a price or a hold', frames: 'B4b', go: 'B4b' as FrameId },
  ],
}
