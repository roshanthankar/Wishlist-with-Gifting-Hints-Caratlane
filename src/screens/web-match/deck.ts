import type { ProductId } from '@/data/products'

export type Swipe = 'love' | 'leave'

/**
 * One Style match card. Only four listing photos exist, so Rahul’s real
 * shortlist (Classic Vanki, Twist Diamond, Hearts Vine) hides among
 * look-alikes that reuse the same photos under other names.
 */
export interface MatchCard {
  id: string
  name: string
  photo: ProductId
  tags: [string, string]
  /** True for a piece on Rahul’s shortlist (never shown to Priya). */
  shortlist?: boolean
  /** How Rahul swiped it when he set up the game (drives the match score). */
  rahul: Swipe
}

export const DECK: MatchCard[] = [
  { id: 'classic-vanki', name: 'Classic Vanki', photo: 'vanki', tags: ['Yellow gold', 'Traditional'], shortlist: true, rahul: 'love' },
  { id: 'heart-vine-band', name: 'Heart vine band', photo: 'hearts-vine', tags: ['Rose gold', 'Dainty'], rahul: 'leave' },
  { id: 'twist-diamond', name: 'Twist diamond', photo: 'twist', tags: ['Yellow gold', 'Diamond'], shortlist: true, rahul: 'love' },
  // Figma A11 starts here: card 4 of 8 in front, two fanned behind it.
  { id: 'fine-v', name: 'Fine V ring', photo: 'vanki', tags: ['Yellow gold', 'Everyday'], rahul: 'love' },
  { id: 'petite-cluster', name: 'Petite cluster', photo: 'petite-cluster', tags: ['Yellow gold', 'Everyday'], rahul: 'leave' },
  { id: 'hearts-vine', name: 'Hearts vine', photo: 'hearts-vine', tags: ['Yellow gold', 'Statement'], shortlist: true, rahul: 'love' },
  { id: 'twist-band', name: 'Twist band', photo: 'twist', tags: ['White gold', 'Stackable'], rahul: 'leave' },
  { id: 'cluster-bloom', name: 'Cluster bloom', photo: 'petite-cluster', tags: ['Rose gold', 'Cocktail'], rahul: 'love' },
]

/** What Priya had already swiped when Figma A11 was captured (3 done, “4 of 8”). */
export const SEED: Swipe[] = ['love', 'leave', 'love']

/** Full round length (“Timer · 30 s”) and where Figma catches it (0:18). */
export const ROUND_MS = 30_000
export const FIGMA_LEFT_MS = 18_000

export function tally(decisions: Swipe[]) {
  const loved = decisions.filter((d) => d === 'love').length
  const matched = decisions.filter((d, i) => DECK[i]?.rahul === d).length
  const bothLoved = DECK.filter((c, i) => decisions[i] === 'love' && c.rahul === 'love')
  return { seen: decisions.length, loved, matched, bothLoved }
}
