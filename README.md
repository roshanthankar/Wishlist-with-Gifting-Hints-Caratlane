# CaratLane · Wishlist with Gifting Hints — interactive prototype

A coded, production-feel prototype of the **Wishlist with Gifting Hints** case study, built 1:1 from the Figma file *Foundational Framework → “Section 2”* (node `703:712`).

- **On a laptop or tablet** it plays inside an **iPhone 17** mockup (to scale: 402×874 pt display, 62 pt corners, Lavender aluminium), with a flows sidebar. Turning on **Annotations** pins numbered markers on the screen and opens the notes panel.
- **On a phone** it runs full-screen in Safari or Chrome like a real app. A small draggable button opens the prototype menu.
- Every Figma frame (30 states across 4 rows), including edge cases, is reachable from the sidebar and has its own shareable link.
- **The whole story in one place:** the Figma “Section 6” board (node `954:13531`) documents the thinking (14 framework cards), then research, wireframes, the five concept rounds, the final 30 screens, motion GIFs recorded from this prototype, the banner and icon explorations, extra screens, and the design system.

---

## 1. Hosting on GitHub Pages (what to upload)

You host the **whole project folder**. GitHub builds it for you, so you never upload a build by hand.

### Option A, recommended: automatic deploys with GitHub Actions

1. Create a new GitHub repository, e.g. `caratlane-gifting-prototype`.
2. Upload or push **everything in this folder** *except* what `.gitignore` already excludes (`node_modules/`, `dist/`, `.figma-staging/`). From this folder:
   ```bash
   git init
   git add .
   git commit -m "CaratLane gifting prototype"
   git branch -M main
   git remote add origin https://github.com/<your-username>/caratlane-gifting-prototype.git
   git push -u origin main
   ```
3. On GitHub: **Settings → Pages → Build and deployment → Source: “GitHub Actions”**.
4. The workflow in `.github/workflows/deploy.yml` builds and publishes on every push to `main`. After ~1 minute the site is live at
   `https://<your-username>.github.io/caratlane-gifting-prototype/`

### Option B: upload a pre-built site

1. Build once on your machine: `npm install` then `npm run build`.
2. Everything you need is now in **`dist/`**. Upload the *contents* of `dist/` to a repo (or a `gh-pages` branch) and point **Settings → Pages** at that branch and folder.

> The build uses relative paths (`base: './'`) and hash links (`#/A3`), so it works from any sub-path without extra setup.

### Fonts (Adobe Fonts kit `xug7vit`)
Proxima Nova loads from an **Adobe Fonts web project** in your Adobe account, “CaratLane Gifting Prototype”, kit `xug7vit`. It is enabled for `localhost` and `*.github.io`. DM Serif Text is bundled in the build.

Two one-time settings at **fonts.adobe.com → Web Projects → CaratLane Gifting Prototype → Edit project**:

1. **OpenType features:** nothing to set. The kit’s default font files ship without OpenType features, so `src/proto/fonts.ts` loads the same licensed files from the same kit in their full version. Ligatures, the single-storey *a* and the alternate *l* and *y* (SALT, SS01–SS07, SS16 on buttons) then render exactly as in Figma.
2. **Domains:** add your custom domain if you use one instead of `github.io`.

If Proxima Nova ever fails to load, the prototype falls back to the system sans.

> **Why the text lines up with Figma:** the web build of Proxima Nova reports taller line metrics than the desktop font Figma uses. `src/proto/fonts.ts` re-registers the kit’s own files with Figma’s metrics, so an “Auto” 14px line is 14px tall, exactly as in Figma.

---

## 2. Sharing it with a recruiter

| Link | Opens |
|---|---|
| `…/caratlane-gifting-prototype/` | The intro (“About the case study”), then Row 01 from A1 |
| `…/#/A1?f=row-1` | Row 01 · Save for someone, with confidence |
| `…/#/B0?f=row-3` | Row 03 · Drop a hint |
| `…/#/C1` | Any frame directly (`A1`…`E3`) |
| `…/?notes=1#/A3` | Any frame, with **annotations already on** |

The URL updates as you click through, so you can copy the address bar at any moment to share that exact screen.

**Tip for phones:** in Safari, *Share → Add to Home Screen* opens it full-screen, like an installed app.

**Link previews:** `public/og-image.png` is the card WhatsApp, LinkedIn and Slack show. Some apps need an absolute URL, so once the site is live, change `content="./og-image.png"` in `index.html` to `https://<your-username>.github.io/caratlane-gifting-prototype/og-image.png`.

---

## 3. Using the prototype

- **Tap anything.** Hearts save, chips select, toggles switch, sheets drag down to close, the Style match cards swipe, and the hint opens with its signature motion.
- **Sidebar (left):** the four rows of the Figma section, in the same order: Row 01 Save for someone, with confidence · Row 02 Also possible: a second opinion · Row 03 Drop a hint · Row 04 The hint lands. Each row lists its screens left to right as in Figma, with who acts (R, P, A); every screen appears once. Click any screen to jump to it.
- **Annotations:** the switch in the sidebar (or `N`) pins numbered markers on the phone and opens the notes panel on the right: why the screen exists (the Figma note) and what each numbered element does. Click a pin to jump to its note; click a note to scroll the phone to it.
- **Keyboard:** `←` `→` step through every screen in Figma order, row to row · `N` annotations · `R` restart from A1.
- **Gestures:** swipe from the left edge of the phone to go back, like iOS.
- **Phones:** the small round button (drag it anywhere) opens flows, notes, annotations and next/previous.
- **Liquid Glass:** buttons, bars, badges, the long-press menu and the toast are glass. In Chrome and Edge (and Chrome on Android) the glass also refracts what is behind it at the edges, like iOS; Safari and Firefox show the same glass without the bending. Press and hold a round glass button and it swells into a clear lens.
- **Gifting Hints banner (A1):** where “Gifting-ready” sat, a hot-pink banner sells the feature in an 8-second loop: “Gifting Hints” punches in over a sunburst with confetti, then it settles while the three steps play, one pink frosted-glass icon each, with no repeats (save it for them: heart; they drop a hint: sealed envelope; gift it right: gift box). It is animated in Figma with Figma Motion (section “A1 · Gifting Hints banner (motion)”), exported at 4× and encoded as a 3× H.264 video (`src/assets/pdp/gifting-hints.mp4`, 1110 × 450, 30 fps, 1.6 MB) so it plays smoothly in Safari too. It autoplays muted, loops, and pauses off screen or under a sheet; a 3× still from the Figma component is its poster and shows for reduced motion. Tap it to start “Who is this for?”. Two other explored versions are kept, unshipped, in `docs/explorations/gifting-hints-banners/`.
- **Glass envelope motion:** the envelope is cut into layers (body, flap, seal, plus an hourglass, a padlock and a heart), so each state tells its own short story. All of them loop unless noted, and show the still art with reduced motion.
  - **A9** (after Ananya votes): a note writes itself, slips in, the flap folds shut, the seal stamps down and the envelope flies off.
  - **B4** Your hint is out: it floats and knocks now and then, with rings from the seal, like an unread message.
  - **B4b** Rahul opened your hint: it flies in, the seal pops, the flap opens, the note rises and a glass heart pops up.
  - **B6** Not opened yet: the hourglass drains and turns over beside the sealed envelope.
  - **C0** WhatsApp preview: the sealed envelope knocks and hearts rise from behind it.
  - **C1** The hint lands (once): the large envelope opens the same way as B4b, then glides into place.
  - **E1** Link closed: a padlock drops on and clicks shut (once), then rattles now and then.
- **Product page (A1–A4c):** the whole CaratLane product page scrolls, as in Figma (A1 is a scrolling frame there): after the price and the Gifting Hints banner come metal and ring size (tap a size to see its circumference), delivery and services, a video call, CaratLane Assurance, why you’ll love it, details with a size guide, what’s in the box, reviews, You may also like and Recently viewed. Review copy and counts are illustrative.
- **3D ring (A1):** the Vanki on the product page turns on its own like a showroom turntable; drag it to any angle and it eases back into its spin. The first time the page is seen, a fingertip swipes across it to show it can be handled.
- **QR hint card (B3b):** when the screen opens, the card flips twice (CaratLane on the back, then the QR again) so it reads as something to play with, then it sways slowly while the QR’s gradient flows; it stops swaying while you handle it. Move the cursor over the card and it leans toward it; tap it to flip it. On a phone it tilts with the phone itself, and the QR gradient, the light on the card and the colour behind it move with it. iPhones ask for motion access the first time the card is tapped, which needs the HTTPS link that GitHub Pages provides.

---

## 4. Running it locally

Requires Node 20+.

```bash
npm install
npm run dev        # http://localhost:5173  (also on your Wi-Fi IP, to try it on your phone)
npm run build      # production build into dist/
npm run preview    # serve the production build
```

Handy URLs while developing:

- `?view=mockup` / `?view=device`: force the iPhone mockup or the full-screen phone mode.
- `?view=figma#/A3`: one bare 402×896 frame, the same size as the Figma export, for pixel comparison.
- `?view=ds`: every shared component on one screen.
- `?notes=1`: start with annotations on.

---

## 5. Tech stack (and why)

| Choice | Why |
|---|---|
| **React 19 + TypeScript** | Component model maps cleanly onto Figma components and variants; types keep all 30 states consistent. |
| **Vite** | Instant dev server; static `dist/` output that GitHub Pages serves as is. |
| **Tailwind CSS v4** | Figma Dev Mode speaks in the same units (px, colours, radii), so values carry over 1:1. Design tokens live in `src/index.css`. |
| **Motion** (`motion/react`) | Spring physics, gestures (drag-to-dismiss sheets, swipe deck), shared-layout and exit animations, with reduced-motion support built in. |
| **Phosphor Icons** | The icon set used in the Figma file. |
| **Adobe Fonts + Fontsource** | Licensed Proxima Nova for the web; DM Serif Text self-hosted. |

No backend. All prototype state lives in memory and resets with **Restart**.

---

## 6. Project structure

```
caratlane-prototype/
├─ index.html                 meta tags, Adobe Fonts kit, PWA and link-preview tags
├─ public/                    og-image (link preview)
├─ design-refs/               PNG export of every Figma frame (reference for visual checks; not shipped)
├─ docs/SCREEN_GUIDE.md       conventions for building or changing screens
├─ .github/workflows/         GitHub Pages deploy
└─ src/
   ├─ main.tsx · index.css    entry + design tokens (colours, fonts, Liquid Glass utilities)
   ├─ shell/                  presentation layer around the phone
   │  ├─ App.tsx              layouts: desktop/tablet (mockup + rails), phone (full-screen), ?view=figma
   │  ├─ Device.tsx           iPhone 17 (Lavender), scales to fit
   │  ├─ PhoneScreen.tsx      the app viewport: stage, annotations, banners, Dynamic Island
   │  ├─ Sidebar.tsx          flows and every state
   │  ├─ InfoPanel.tsx        notes panel (shown while annotations are on)
   │  ├─ MobileMenu.tsx       phones: draggable menu button + sheet
   │  ├─ AboutModal.tsx       the case study (from the Figma cover)
   │  └─ DsGallery.tsx        ?view=ds, every shared component
   ├─ proto/                  prototype engine
   │  ├─ frames.ts            every Figma frame: route, persona, note, Figma node id
   │  ├─ flows.ts             the sidebar: the four Figma rows, frames in Figma order, each screen once
   │  ├─ nav.tsx              navigation stack, deep links (#/A3), flow stepping
   │  ├─ Stage.tsx            iOS push / modal / app-switch transitions, edge-swipe back
   │  ├─ annotations.tsx      annotation pins, outlines and popovers
   │  ├─ fonts.ts             Proxima Nova with Figma line metrics
   │  ├─ store.ts             shared prototype state (saved, held, picks…)
   │  ├─ haptics.ts           haptic tap on supported phones
   │  ├─ env.tsx · ui.tsx     mockup vs. phone mode; annotation toggle
   ├─ ui/                     design-system primitives (from the Figma DS board 834:78991):
   │                          Screen, NavBar, Button, GlassCircle, Sheet, Chip, Toggle, ProductTile,
   │                          GiftListCard, SelectTile, OccasionPill, SafariBar, WebHeader, Logo…
   │                          liquidGlass.ts: the edge refraction behind every glass surface
   │                          envelope/: the layered glass-envelope animations (A9, B4, B4b, B6, C0, C1, E1)
   ├─ data/                   products and the case-study copy
   ├─ assets/                 product photos, glass illustrations, patterns (exported from Figma),
   │                          illustrations/envelope-parts/ the envelope, flap, seal, hourglass, padlock and heart layers,
   │                          brand/ CaratLane’s logo (from caratlane.com): web headers and the QR card’s back
   └─ screens/                one folder per screen (“route”); each renders several Figma frames
      ├─ registry.ts          route → component, and all annotations
      ├─ pdp/                 A1–A4c  the full product page (sections.tsx), toast, “Who is this for?”, “A great pick” (Partner / Mom / Friend)
      ├─ wishlist-rahul/      A5      Rahul’s wishlist
      ├─ list-priya/          A6, A7, A8, A10, A12  For Priya list, long-press menu, Ask someone close, Style match setup, signals
      ├─ web-vote/            A9      Ananya votes (mobile web)
      ├─ web-match/           A11, A11b  Style match swipe game with timer (mobile web)
      ├─ dates/               B0      Dates that matter
      ├─ wishlist-priya/      B1, B2, B3  Priya’s wishlist, compose and send sheets
      ├─ qr-hint/             B3b     QR hint card: recolourable QR, tilt and flip (QrCard.tsx)
      ├─ hint-status/         B4, B4b, B5, B6  hint tracker, edit picks, not-opened nudge
      ├─ whatsapp/            C0      WhatsApp rich preview
      ├─ hint-page/           C1, C2, E2, E3  hint landing (with its opening motion), held / sold-out / changed states
      └─ hint-closed/         E1      closed link
```

## 7. Frame map (Figma → code)

| Row | Frames | Persona · channel |
|---|---|---|
| 01 Save for someone, with confidence | A1 Product page · A2 Saved toast · A3 Who is this for? · A4 A great pick (partner) · A4b (Mom) · A4c (friend) · A5 Wishlist · A6 For Priya · A7 Long-press | Rahul · app |
| 02 Also possible: a second opinion | A8 Ask someone close · A9 Ananya votes · A10 Style match setup · A11 Priya plays · A11b Time’s up · A12 Every signal lines up | Rahul · app, Ananya / Priya · web |
| 03 Drop a hint | B0 Dates that matter · B1 Wishlist nudge · B2 Compose · B3 Send · B3b QR card · B4 Hint is out · B4b A day later · B5 Edit picks · B6 Not opened | Priya · app |
| 04 The hint lands | C0 WhatsApp · C1 The hint lands (opening motion on first open) · C2 Held for you · E1 Link closed · E2 Nothing left · E3 Things changed | Rahul · WhatsApp / web |

Each frame’s Figma node id is listed in `src/proto/frames.ts`.

## 8. Changing things

- **Copy or layout of a screen:** edit its file in `src/screens/<route>/`. The conventions are in `docs/SCREEN_GUIDE.md`.
- **Annotations:** each screen file exports `annotations`; the matching element has `data-anno="…"`.
- **Colours and type:** `src/index.css` (`@theme`).
- **The CaratLane logo:** one component, `Logo` in `src/ui/web.tsx`. It is a stand-in; swap the real logo in there.
- **Flows in the sidebar:** `src/proto/flows.ts` (rows and their frames, in Figma order).
