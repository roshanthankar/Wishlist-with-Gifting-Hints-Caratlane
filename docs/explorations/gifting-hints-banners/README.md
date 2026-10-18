# Gifting Hints banner · explorations (not shipped)

Two coded alternatives explored for the A1 banner before version 1 (the Figma
Motion banner, `src/screens/pdp/GiftingHints.tsx`) was chosen. Kept for
reference; nothing here is bundled. Figma has all three side by side in the
section “A1 · Gifting Hints banner (motion)”.

- `GiftingHintsStage.tsx` · version 2, “the hint drop”: a loud promo built from
  Mobbin references (arch and podium, tilted ribbons, a heart popping from the box).
- `GiftingHintsLuxe.tsx` · version 3, “the jewellery box”: aubergine velvet,
  quilted gold lining, gold foil type, the glass envelope and the 3D Vanki.
- `banners.css` · their keyframes (they lived in `src/index.css`).

To bring one back: move the file into `src/screens/pdp/`, paste `banners.css`
into `src/index.css`, and render it in `ProductPage.tsx` in place of `GiftingHints`.
