import { useProtoState } from '@/proto/store'
import type { ProductId } from '@/data/products'

/** The hint Priya composes in B2 and sends in B3 (shared with B4–B6 and B3b). */
export type Tone = 'subtle' | 'clear' | 'very-clear'

export interface HintSettings {
  ranges: boolean
  hold: boolean
  size: boolean
}

/** The three picks shown in the compose sheet (of six saved). */
export const HINT_PICKS: ProductId[] = ['vanki', 'hearts-vine', 'twist']
export const SAVED_COUNT = 6

export const useHintPicks = () => useProtoState<ProductId[]>('hint.picks', HINT_PICKS)
export const useHintNotes = () =>
  useProtoState<Partial<Record<ProductId, boolean>>>('hint.notes', { vanki: true, 'hearts-vine': true, twist: false })
/** Picks on the hint after sending (B5). Figma starts with Hearts Vine cleared. */
export const useSentPicks = () => useProtoState<ProductId[]>('hintStatus.picks', ['vanki', 'twist'])
export const useHintTone = () => useProtoState<Tone>('hint.tone', 'clear')
export const useHintSettings = () => useProtoState<HintSettings>('hint.settings', { ranges: true, hold: true, size: true })

/** What Rahul reads, per tone. “Clear” is the Figma copy. */
export const TONE_MESSAGE: Record<Tone, string> = {
  subtle: '“Psst… I saved a few pretty things while browsing. No reason, just thought you might like a peek.”',
  clear: '“Psst… something’s coming up on 25 Nov. I found a few things I’d love, no pressure, just saying.”',
  'very-clear': '“25 Nov is almost here. These are the ones I’d love, so pick any and I’ll act surprised.”',
}

/** The notes Priya left on her picks (shown when a Note badge is tapped). */
export const PICK_NOTES: Partial<Record<ProductId, string>> = {
  vanki: 'I keep coming back to this one',
  'hearts-vine': 'Dainty enough for every day',
  twist: 'Simple, the way I like it',
}

/** One-line recap of what the link shares (B3 footer). */
export function shareSummary(s: HintSettings) {
  return [s.ranges ? 'Price ranges only' : 'Exact prices', s.size ? 'size shared' : 'size hidden', 'link expires 2 Dec'].join(' · ')
}

