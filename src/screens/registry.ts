import type { ComponentType } from 'react'
import type { FrameId, RouteId } from '@/proto/frames'
import type { FrameAnnotations } from '@/proto/annotations'
import ProductPage, { annotations as ProductPageNotes } from './pdp/ProductPage'
import RahulWishlist, { annotations as RahulWishlistNotes } from './wishlist-rahul/RahulWishlist'
import ForPriyaList, { annotations as ForPriyaListNotes } from './list-priya/ForPriyaList'
import AnanyaVote, { annotations as AnanyaVoteNotes } from './web-vote/AnanyaVote'
import StyleMatch, { annotations as StyleMatchNotes } from './web-match/StyleMatch'
import DatesThatMatter, { annotations as DatesThatMatterNotes } from './dates/DatesThatMatter'
import PriyaWishlist, { annotations as PriyaWishlistNotes } from './wishlist-priya/PriyaWishlist'
import QrHint, { annotations as QrHintNotes } from './qr-hint/QrHint'
import HintStatus, { annotations as HintStatusNotes } from './hint-status/HintStatus'
import WhatsAppChat, { annotations as WhatsAppChatNotes } from './whatsapp/WhatsAppChat'
import HintPage, { annotations as HintPageNotes } from './hint-page/HintPage'
import HintClosed, { annotations as HintClosedNotes } from './hint-closed/HintClosed'

/**
 * One component per route (screen); it renders whichever Figma frame (state)
 * it is given. Each module also exports its annotations per frame.
 */
export const ROUTES: Record<RouteId, ComponentType<{ frame: FrameId }>> = {
  'pdp': ProductPage,
  'wishlist-rahul': RahulWishlist,
  'list-priya': ForPriyaList,
  'web-vote': AnanyaVote,
  'web-match': StyleMatch,
  'dates': DatesThatMatter,
  'wishlist-priya': PriyaWishlist,
  'qr-hint': QrHint,
  'hint-status': HintStatus,
  'whatsapp': WhatsAppChat,
  'hint-page': HintPage,
  'hint-closed': HintClosed,
}

export const ANNOTATIONS: FrameAnnotations = {
  ...ProductPageNotes,
  ...RahulWishlistNotes,
  ...ForPriyaListNotes,
  ...AnanyaVoteNotes,
  ...StyleMatchNotes,
  ...DatesThatMatterNotes,
  ...PriyaWishlistNotes,
  ...QrHintNotes,
  ...HintStatusNotes,
  ...WhatsAppChatNotes,
  ...HintPageNotes,
  ...HintClosedNotes,
}
