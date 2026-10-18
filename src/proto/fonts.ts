/**
 * Proxima Nova with Figma’s vertical metrics.
 *
 * The Adobe Fonts web build reports hhea metrics (ascent 1.079em, descent
 * ~0.34em), so `line-height: normal` comes out ~1.43×. Figma lays text out
 * with the font’s typo metrics (ascent 0.75em, descent 0.25em, no gap), so an
 * “Auto” 14px line is exactly 14px tall. To match Figma 1:1 we re-register
 * the kit’s own font files under “Proxima Nova Figma” with metric overrides.
 * 76% / 24% (not 75 / 25): browsers round ascent and descent separately, and
 * this split rounds to exact Figma line boxes for every size from 11 to 32px.
 * The URLs are read from the live kit CSS, so the kit can be republished
 * without touching this code.
 *
 * Browsers without metric-override support get `html.no-font-metrics`, and
 * CSS pins `leading-[normal]` to 1 there, so box heights still match.
 */
const KIT_CSS = 'https://use.typekit.net/xug7vit.css'

/**
 * The kit’s font URLs ask for its “default” subset (`subset_id=2`), which
 * Adobe serves with no OpenType features at all: no ligatures, and none of
 * the stylistic sets Figma uses (single-storey a, alternate l and y: SALT,
 * SS01–SS07, SS16 on buttons). Without that parameter the same kit serves the
 * same licensed font with its full feature set, so the text matches Figma.
 */
const full = (url: string) => url.replace(/([?&])subset_id=\d+&?/, '$1').replace(/[?&]$/, '')
export const FIGMA_FAMILY = 'Proxima Nova Figma'

function supportsMetricOverrides() {
  try {
    const f = new FontFace('x', 'local(x)', { ascentOverride: '75%' } as FontFaceDescriptors)
    return (f as FontFace & { ascentOverride?: string }).ascentOverride === '75%'
  } catch {
    return false
  }
}

export async function loadFigmaFonts(timeoutMs = 1500): Promise<void> {
  if (typeof document === 'undefined' || !('FontFace' in window)) return
  if (!supportsMetricOverrides()) document.documentElement.classList.add('no-font-metrics')

  const work = (async () => {
    const css = await fetch(KIT_CSS, { mode: 'cors' }).then((r) => r.text())
    const faces = [...css.matchAll(/@font-face\s*{([^}]*)}/g)].map((m) => m[1])
    const loads: Promise<FontFace>[] = []
    for (const block of faces) {
      if (!/font-family:\s*"proxima-nova"/.test(block)) continue
      const woff2 = block.match(/url\("([^"]+)"\)\s*format\("woff2"\)/)?.[1]
      const woff = block.match(/url\("([^"]+)"\)\s*format\("woff"\)/)?.[1]
      const weight = block.match(/font-weight:\s*(\d+)/)?.[1] ?? '400'
      const style = block.match(/font-style:\s*(\w+)/)?.[1] ?? 'normal'
      if (!woff2 && !woff) continue
      const src = [woff2 && `url(${full(woff2)}) format("woff2")`, woff && `url(${full(woff)}) format("woff")`].filter(Boolean).join(', ')
      const face = new FontFace(FIGMA_FAMILY, src, {
        weight,
        style,
        display: 'swap',
        ascentOverride: '76%',
        descentOverride: '24%',
        lineGapOverride: '0%',
      } as FontFaceDescriptors)
      document.fonts.add(face)
      loads.push(face.load())
    }
    await Promise.allSettled(loads)
  })().catch(() => {
    /* offline or blocked: the kit stylesheet / system fonts still render */
  })

  await Promise.race([work, new Promise((r) => setTimeout(r, timeoutMs))])
}
