import type { Annotation, FrameAnnotations } from '@/proto/annotations'

/* Shared entries (A1 and A2 show the same page). */
const nav: Annotation = {
  id: 'nav',
  title: 'Sticky navigation',
  body: 'A plain white iOS bar keeps the product name, share, wishlist and bag in reach while Rahul scrolls. The heart opens his wishlist, where his gift lists sit above everything saved.',
}
const price: Annotation = {
  id: 'price',
  title: 'Price, said once',
  body: 'One bold number, the struck MRP and the tax note. Gifting never hides or restates the price on this page, so Rahul compares rings the way he always does.',
}
const giftingBanner: Annotation = {
  id: 'gifting-hints',
  title: 'Gifting Hints, said loudly',
  body: 'Where “Gifting-ready” sat, a banner in the same hot-pink language sells the feature in 8 seconds: “Gifting Hints” punches in with confetti, then it settles while the three steps play: save it for them, they drop a hint, gift it right. Animated in Figma with Figma Motion and played as a 3× animated WebP, so it stays sharp on any phone; the still shows for reduced motion. Tap to start “Who is this for?”.',
}
const seeLive: Annotation = {
  id: 'see-live',
  title: 'See it Live',
  body: 'The existing video-call path stays as the secondary action. Gifting adds no third button to the bar; it rides on the heart instead.',
}
const addToBag: Annotation = {
  id: 'add-to-bag',
  title: 'Add to Bag stays primary',
  body: 'Buying is still the strongest action on the page. The gifting flow is an option layered on saving, never a detour in front of checkout.',
}

/* Sheet entries shared by A4, A4b and A4c. */
const scrim: Annotation = {
  id: 'scrim',
  title: 'Page held behind a scrim',
  body: 'The product page dims to 50% instead of navigating away, so Rahul never loses his place. Tapping it, swiping the sheet down or the close button all return to the page with the ring still saved.',
}
const pickItem: Annotation = {
  id: 'pick-item',
  title: 'What was saved',
  body: 'The exact ring, price and size go back to Rahul as one row, so the confirmation is concrete: this ring, in this size, on this list.',
}
const pickSaved: Annotation = {
  id: 'pick-saved',
  title: '“Saved” in green',
  body: 'A small receipt rather than a celebration. Green marks a finished system state, the same way CaratLane uses it for offers.',
}
const pickKeep: Annotation = {
  id: 'pick-keep',
  title: 'Keep browsing',
  body: 'Equal weight to the list CTA on purpose. Most people save several options before deciding, so carrying on shopping is a first-class outcome.',
}

export const annotations: FrameAnnotations = {
  A1: [
    nav,
    {
      id: 'media',
      title: 'The ring in 3D',
      body: 'The real Classic Vanki in 3D, rebuilt from CaratLane’s product views: a size-12 band that rises into crisp chevrons on the top and underside of the finger. It turns on its own like a showroom turntable; drag to turn it to any angle, the way you would turn a ring in a store, and it eases back into its spin when let go. On the first view a fingertip swipes across it and the ring follows, and a “3D · Drag to rotate” chip stays until it’s touched. Photos follow in the carousel; social proof and rating sit on top.',
    },
    {
      id: 'heart',
      title: 'Save, one tap',
      body: 'A 44px glass heart in the thumb’s reach. Saving needs no sign-in, list picker or name: one tap, a haptic and a pop. Everything about gifting comes after, and only if Rahul wants it.',
    },
    price,
    {
      id: 'emi',
      title: '9=10 plans',
      body: 'Instalments sit in a quiet violet pill. The “1 month free” badge gives a reason to tap without competing with the price.',
    },
    {
      id: 'offer',
      title: 'Offer in green',
      body: 'Green is kept for CaratLane offers only, so a discount never gets mistaken for the pink gifting layer or the violet hints.',
    },
    {
      id: 'pincode',
      title: 'Pincode check',
      body: 'A real field for delivery date and the nearest store. For a gift with a date attached, “will it arrive in time?” is the next question after price.',
    },
    giftingBanner,
    {
      id: 'customise',
      title: 'Metal and size, as CaratLane sells it',
      body: '9, 14 or 18 KT yellow gold, and every size from 5 to 24. Find my size sits beside the label for anyone measuring at home.',
    },
    {
      id: 'ring-size',
      title: 'Size with its circumference',
      body: 'Tap a size and its inner circumference updates beside the label, so 12 reads as 51.8 mm, not a guess. The row scrolls from 5 to 24.',
    },
    {
      id: 'delivery',
      title: 'Delivery and services',
      body: 'The pincode gives a date and the nearest store. Below it, CaratLane’s three ways to get the ring: express delivery, store pick-up and try at home.',
    },
    {
      id: 'video-call',
      title: 'A video call, in the page',
      body: 'The same See it Live service as the button below, with who is available right now, for anyone who wants to see it on a hand first.',
    },
    {
      id: 'assurance',
      title: 'CaratLane Assurance',
      body: '15-day returns on online orders, a 1-year warranty, lifetime exchange and BIS Hallmark: the four promises that make buying gold online feel safe.',
    },
    {
      id: 'why',
      title: 'Why you’ll love this',
      body: 'CaratLane’s own description, tightened: what the Vanki is and why it suits everyday wear.',
    },
    {
      id: 'details',
      title: 'Details on demand',
      body: 'Specs are open by default. The full size guide and care tips are one tap away, so the page stays short for people who don’t need them.',
    },
    {
      id: 'in-the-box',
      title: 'What’s in the box',
      body: 'Signature box, gift wrap and a note, a price-free invoice and the certificate. In gifting pink, because this is the part that makes it giftable.',
    },
    {
      id: 'reviews',
      title: 'Ratings and reviews',
      body: 'The score, how it spreads, and two recent reviews, one from someone who bought it as a gift. Review copy and counts here are illustrative.',
    },
    {
      id: 'also-like',
      title: 'You may also like',
      body: 'Similar pieces to keep browsing. The heart saves one without leaving the page.',
    },
    {
      id: 'recent',
      title: 'Recently viewed',
      body: 'What Rahul looked at before, one swipe away.',
    },
    seeLive,
    addToBag,
  ],
  A2: [
    nav,
    {
      id: 'heart',
      title: 'Saved, instantly',
      body: 'The heart fills violet with a haptic and a pop the moment it is tapped, with no network wait. Tapping again un-saves and the toast leaves with it.',
    },
    price,
    giftingBanner,
    {
      id: 'toast',
      title: 'Saved toast',
      body: 'Saving is instant. The toast confirms it with the ring’s photo and offers the gifting path without forcing it: “Add to gift list”. It sits just above the actions and can be swiped away.',
    },
    seeLive,
    addToBag,
  ],
  A3: [
    scrim,
    {
      id: 'sheet',
      title: 'One sheet, two steps',
      body: 'This sheet stays mounted when Rahul saves: the content cross-fades and the height springs to the shorter “great pick” step, like an iOS detent change rather than a second modal.',
    },
    {
      id: 'who-title',
      title: 'Who is this for?',
      body: 'Rahul’s first gift list, so the question comes straight away. Next time the same tap shows his existing lists first. Pink marks everything that comes from the giver.',
    },
    {
      id: 'who-copy',
      title: 'Why we ask',
      body: 'One line explains the payoff of answering: a reminder before the date and the size kept with the list. “Free resizing covers it” removes the fear of guessing wrong.',
    },
    {
      id: 'relationship',
      title: 'Relationship',
      body: 'Partner, Mom, Sister or Friend tunes the advice on the next step, and prefills a name Rahul can still edit. “Someone else” jumps straight to the name field.',
    },
    {
      id: 'occasion',
      title: 'Occasion',
      body: 'Five chips cover most Indian gifting moments, Karva Chauth included. One tap, no typing, and it decides which date the reminder hangs on.',
    },
    {
      id: 'date',
      title: 'The date',
      body: 'Shown as a weekday plus “in 14 days” so the deadline is felt, not calculated. This is the date that triggers the reminder and the order-by nudge.',
    },
    {
      id: 'size',
      title: 'A best-guess size',
      body: '“A best guess” is honest wording: Rahul doesn’t have to know Priya’s exact size to keep going. Resizing and a secret ask cover the rest later.',
    },
    {
      id: 'name',
      title: 'Their name, optional',
      body: 'Prefilled from the relationship and fully editable. The CTA label follows the name as Rahul types, so the list feels personal before it exists.',
    },
    {
      id: 'save',
      title: 'Save to Priya’s list',
      body: 'One primary action that names the outcome. It saves with a haptic and routes to advice tuned to the relationship picked above.',
    },
    {
      id: 'privacy',
      title: 'Privacy, in one line',
      body: 'Says exactly who can see the list, at the moment Rahul is naming a person. Nothing is shared until an invite is sent.',
    },
  ],
  A4: [
    scrim,
    {
      id: 'sheet',
      title: 'Same sheet, new step',
      body: 'The “Who is this for?” sheet morphs into this one instead of closing, so saving feels like progress rather than a new interruption.',
    },
    {
      id: 'pick-title',
      title: 'A great pick for Priya',
      body: 'Reassurance first, in the giver’s pink serif. It names Priya, so the confidence is about this person rather than the ring in general.',
    },
    pickItem,
    pickSaved,
    {
      id: 'pick-reasons',
      title: 'Proof for partners',
      body: 'Tuned to the relationship: a size safety net, what other partners gift at this price, and a way out through lifetime exchange if Priya prefers another.',
    },
    pickKeep,
    {
      id: 'pick-cta',
      title: 'View Priya’s list',
      body: 'Opens the new list, where the countdown and the next step live. Going back lands on the product page with the sheet closed.',
    },
  ],
  A4b: [
    scrim,
    {
      id: 'sheet',
      title: 'Same sheet, for Mom',
      body: 'Same structure as the partner version, so only the advice changes. Rahul learns the pattern once.',
    },
    {
      id: 'pick-title',
      title: 'A great pick for Mom',
      body: 'Uses the name Rahul gave the list, which for most people is simply “Mom”.',
    },
    pickItem,
    pickSaved,
    {
      id: 'pick-reasons',
      title: 'Advice for Mom',
      body: 'The relationship changes the advice: daily wear over occasion pieces, what people usually spend on Mom, and a CaratLane store near her for swaps.',
    },
    pickKeep,
    {
      id: 'pick-cta',
      title: 'View Mom’s list',
      body: 'Confirms the list is ready and returns to the product page. Only Priya’s list is prototyped end to end.',
    },
  ],
  A4c: [
    scrim,
    {
      id: 'sheet',
      title: 'Same sheet, for a friend',
      body: 'Friends, sisters and anyone else share this variant, because the honest advice about spend applies to all of them.',
    },
    {
      id: 'pick-title',
      title: 'A great pick for Kavya',
      body: 'Still a positive headline: the ring is a good choice even when it is more than people usually spend.',
    },
    pickItem,
    pickSaved,
    {
      id: 'pick-reasons',
      title: 'Honest about spend',
      body: 'Says when it’s above the norm for a friend and points to lighter picks. Confidence includes not overspending; exchange keeps the decision reversible.',
    },
    pickKeep,
    {
      id: 'pick-cta',
      title: 'View Kavya’s list',
      body: 'Confirms the list is ready and returns to the product page. Only Priya’s list is prototyped end to end.',
    },
  ],
}
