# Building screens — conventions

How every screen in this prototype is built. Read this before touching `src/screens/`.

## The model

- **Frame** = one Figma frame in “Section 2” (node `703:712`), e.g. `A3`. All frames, with notes, personas and Figma node ids, live in `src/proto/frames.ts`.
- **Route** = one screen component that renders several frames (states). For example, `pdp` renders A1 (product page), A2 (+ toast), A3 (+ “Who is this for?” sheet) and A4 / A4b / A4c (+ “A great pick” sheet).
- The navigator (`src/proto/nav.tsx`) gives each route component its current `frame`. **The frame is the source of truth for overlays and states**: the component derives which sheet, toast or variant is visible from `frame`, and animates between them.
- Moving to a frame of the **same route** changes state in place (the sheet slides up, the toast springs in). Moving to another route **pushes** a new screen with an iOS transition (`push`, `modal` or `app`, see `ROUTE_TRANSITION`).

```tsx
import { useNav } from '@/proto/nav'
const { go, back } = useNav()
go('A3')                         // same route → in-place state change
go('A6', { leaveAs: 'A1' })      // push A6; going back returns to A1 (sheet closed)
back()                           // iOS back (pops, or falls back to the parent screen)
```

Shared prototype data (saved hearts, selected relationship, held pick…) goes in the store, namespaced by route:

```tsx
import { useProtoState } from '@/proto/store'
const [saved, setSaved] = useProtoState('pdp.saved', false)
```

Actions that would lead to a screen that isn’t built get **no handler at all**. Shared buttons, chips, cards and nav icons with no `onClick` render inert (no press animation, hover or pointer), so a dead end never looks tappable. Don’t show “not part of this prototype” messages.

## Screen anatomy

```tsx
<Screen bg="#fdfdfd">                      {/* frame fill from Figma; draws the iOS status bar in the mockup */}
  <ScrollView backdrop={<PinkPageAura />} bottomInset={BOTTOM_BAR_INSET}>
    <NavBar title="Wishlist" onBack={back} />   {/* sticky under the status bar */}
    …content…
  </ScrollView>
  <BottomBar fade="#fdfdfd">
    <Button variant="secondary" block="flex">Ask a friend</Button>
    <Button block="flex">Pick the gift</Button>
  </BottomBar>
  <Sheet open={frame === 'A8'} onClose={() => go('A6')} tone="pink">…</Sheet>
  <Toast open={frame === 'A2'}>…</Toast>
</Screen>
```

- Figma frames are **402×896**; the iPhone 17 viewport is **402×874**. Content therefore scrolls and bottom bars stay pinned, as in a real app. **Never hard-code 402 widths.** Layouts must be fluid (`px-4`, flex, `grid-cols-2`) so they work from 360px to 430px wide phones. Keep Figma heights, paddings, gaps and radii exact.
- `--safe-top` is 62px in the mockup (status bar) and the real safe area on phones. `--safe-bottom-pad` is 36px in the mockup. Use `ScrollView`, `BottomBar` and `NavBar`, which already apply them.
- Mobile-web screens (A9, A11, C1, C2, E*) use `<WebHeader>` and `<SafariBar>`. The Safari bar is drawn only in the mockup; on a real phone the real browser chrome is used. Use `useSafariInset()` for bottom padding.
- Sheets and toasts sit **directly inside `<Screen>`**, not inside the scroller, so they cover the whole phone.

## Primitives (`src/ui`, import from `@/ui`)

| Need | Use |
|---|---|
| Screen shell, scroller, pinned CTAs | `Screen`, `ScrollView`, `BottomBar`, `BOTTOM_BAR_INSET` |
| Navigation bar / back / nav icons | `NavBar`, `BackButton`, `NavIcon` |
| iOS 27 Liquid Glass buttons | `Button` (`primary` violet, `secondary` #F1F1F1, `whatsapp`, `pink`, `white` glass, `outline`; sizes `lg` 52, `md` 50, `sm` 36, `xs` 32) |
| Round glass icon button | `GlassCircle` (36/44/48; `light`, `flat`, `dark`, `white`) |
| Sheet (iOS 27 floating) + title row | `Sheet` (`tone` pink / violet / plain) and `SheetHeader` |
| Chips, switches, grouped rows, fields | `Chip`, `Toggle`, `ToggleRow`, `ListGroup`, `FieldRow`, `SectionLabel` |
| Product photo with Figma crop | `ProductPhoto id="vanki"` (products in `src/data/products.ts`) |
| Saved tile, gift list cards, select tile | `ProductTile`, `GiftListCard`, `CreateListCard`, `FindMoreCard`, `SelectTile`, `SavedHeart`, `TileTag` |
| Auras and patterns | `PinkPageAura`, `PinkSheetAura`, `VioletSheetAura`, `LatticePageAura`, `AuraBlob`, `PATTERNS` |
| Mobile web | `WebHeader`, `Logo`, `SafariBar`, `BottomFade`, `useSafariInset` |
| Small pieces | `OccasionPill`, `PrivacyFootnote`, `LuLock`, `HeroArt`, `Avatar`, `Card`, `Toast`, `SavedToast` |

Do **not** edit `src/ui`, `src/proto` or `src/shell` from a screen task. If a primitive cannot express the design, build a local component in your route folder (e.g. `src/screens/hint-page/PickCard.tsx`).

## Fidelity rules (1:1 with Figma)

1. Pull the real values with the Figma MCP. Load the `figma:figma-design-to-code` skill first. Full frames are too large, so call `get_design_context` on the frame’s children (`Nav bar`, `Content`, the sheet, `Bottom actions`…) and use the code as the reference for values.
2. Type: Proxima Nova is the default (stylistic sets SALT and SS01–SS07 are applied globally). It is loaded with Figma’s line metrics (`src/proto/fonts.ts`), so `leading-[normal]` equals Figma’s “Auto” (14px text → 14px line). Don’t add line-height hacks. DM Serif Text uses `className="serif"`, italic quotes use `serif italic`, SF Pro uses `sf`. Match size, weight, line-height and colour exactly.
3. Colours come from the tokens in `src/index.css` (`text-pink`, `bg-violet-tint`, `text-muted`…). Arbitrary hex values (`bg-[#f4f4f6]`) are fine when Figma uses them.
4. Icons are Phosphor (`@phosphor-icons/react`) at the Figma size, weight and colour (`HeartFill` → `<Heart weight="fill">`). For Lucide icons in Figma (`lu/*`), inline the SVG.
5. Images use the shared assets in `src/assets` (products, illustrations, patterns). If the frame needs something else, download it with `download_assets` / `get_design_context` URLs into `src/assets/<route>/`. Never ship a temporary Figma URL.
6. Every rounded layer in Figma uses 60% iOS smoothing. CSS radius is close enough; don’t fake it.
7. Even numbers only: text sizes, radii, paddings and gaps in the design are even. Keep them.

## Motion (Motion for React, `motion/react`)

- Springs, not linear tweens: sheets `stiffness 360 / damping 38`, taps `whileTap={{ scale: 0.97 }}`, selection pops `stiffness 600–700`.
- Use `AnimatePresence` for anything that appears or disappears (sheets, toasts, held states, menus). Use `layout` for reflowing lists.
- Respect reduced motion: `MotionConfig reducedMotion="user"` is set globally; `useReducedMotion()` for custom sequences.
- One haptic tap (`haptic()` from `@/proto/haptics`) on meaningful confirmations only: save, hold, send.

## Annotations

Each route module exports its annotations per frame:

```tsx
export const annotations: FrameAnnotations = {
  A1: [
    { id: 'gifting-banner', title: 'Gifting banner', body: 'Answers “can I give this?” before he asks: box, note and a price-free invoice.' },
    …
  ],
}
```

…and the element carries the matching attribute: `<div data-anno="gifting-banner">`. Many primitives accept a `data-anno` prop.

- Annotate **every meaningful element on the screen**, usually 6–12 per frame, ordered top to bottom: the nav, key content blocks, CTAs, sheet parts, states.
- Title: 2–5 words. Body: one or two sentences on what it does and **why** (the design decision, edge case or behaviour). Write like a design director explaining the screen to a hiring manager. Use names (Priya, Rahul), not gendered pronouns.
- Ids must be unique within a frame. Frames that share elements can share ids.

## Verifying

```bash
# Typecheck (only fix errors in your own files)
cd caratlane-prototype && npx tsc -b

# Figma vs code, side by side (+ 2x render), dev server on :5173
node <scratchpad>/pw/compare.mjs A1,A2 --wait 1600
#   → <scratchpad>/compare/A1.compare.png   [ Figma | Code | Diff ]
```

Open the compare image, fix differences, repeat until the code matches the Figma column. Also click through the interactions and check the console is clean.
