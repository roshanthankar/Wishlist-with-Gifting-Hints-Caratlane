/**
 * Liquid Glass refraction for the web.
 *
 * iOS 26/27 glass is a lens: content behind it bends at the rim (with a hint
 * of colour fringing), while the middle stays clear. CSS blur can’t do that,
 * so every element using a glass utility (.glass, .glass-panel, .glass-chip,
 * .glass-dark) gets its own SVG filter here: a displacement map shaped like a
 * convex bezel around that element’s rounded rectangle. The filter is passed
 * to the utility through `--lens`, and the utility puts it in front of the
 * blur in `backdrop-filter`.
 *
 * Only Chromium renders SVG filters in `backdrop-filter` (desktop Chrome,
 * Edge, Android). Safari and Firefox keep the CSS glass (frost, specular rim,
 * shadow), which is why nothing visual depends on the lens being there.
 */

const SELECTOR = '.glass, .glass-panel, .glass-chip, .glass-dark'
const NS = 'http://www.w3.org/2000/svg'

/** Bezel width and peak displacement (px) per surface type. */
function lensFor(el: Element, w: number, h: number, r: number) {
  const c = el.classList
  if (c.contains('glass-panel')) return { bezel: Math.min(24, r, w / 2, h / 2), shift: 14 }
  if (c.contains('glass-chip')) return { bezel: Math.min(8, r, h / 2), shift: 5 }
  return { bezel: Math.min(14, r, w / 2, h / 2), shift: 10 }
}

export function supportsLens() {
  if (typeof navigator === 'undefined' || typeof CSS === 'undefined') return false
  const brands = (navigator as Navigator & { userAgentData?: { brands?: { brand: string }[] } }).userAgentData?.brands
  return !!brands?.some((b) => /Chromium/i.test(b.brand)) && CSS.supports('backdrop-filter', 'url(#a) blur(1px)')
}

/**
 * Displacement map for a w×h rounded rectangle (radius r): inside a bezel of
 * width `bezel` along the edge, each pixel samples the backdrop from further
 * in, along the inward normal, strongest at the very edge (a convex lens).
 * R = x shift, G = y shift, 128 = none.
 */
function buildMap(w: number, h: number, r: number, bezel: number) {
  const canvas = document.createElement('canvas')
  canvas.width = w
  canvas.height = h
  const ctx = canvas.getContext('2d')!
  const img = ctx.createImageData(w, h)
  const d = img.data
  const hw = w / 2
  const hh = h / 2
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const px = x + 0.5 - hw
      const py = y + 0.5 - hh
      const qx = Math.abs(px) - (hw - r)
      const qy = Math.abs(py) - (hh - r)
      // Distance in from the edge, and the outward normal.
      let dist: number
      let nx = 0
      let ny = 0
      if (qx > 0 && qy > 0) {
        const len = Math.hypot(qx, qy)
        dist = r - len
        nx = (qx / (len || 1)) * Math.sign(px)
        ny = (qy / (len || 1)) * Math.sign(py)
      } else if (qx > qy) {
        dist = r - qx
        nx = Math.sign(px)
      } else {
        dist = r - qy
        ny = Math.sign(py)
      }
      let m = 0
      if (dist >= 0 && dist < bezel) {
        // Slope of a squircle-shaped bezel: steep at the rim, flat where it meets the clear middle.
        const t = 1 - dist / bezel
        m = t * t * (3 - 2 * t) * t
      }
      const i = (y * w + x) * 4
      d[i] = 128 - nx * m * 127 // sample inward (x)
      d[i + 1] = 128 - ny * m * 127 // sample inward (y)
      d[i + 2] = 128
      d[i + 3] = 255
    }
  }
  ctx.putImageData(img, 0, 0)
  return canvas.toDataURL()
}

let defs: SVGDefsElement | null = null
const filters = new Map<string, string>()

function filterFor(w: number, h: number, r: number, bezel: number, shift: number) {
  const key = `${w}x${h}r${Math.round(r)}b${Math.round(bezel)}s${shift}`
  const existing = filters.get(key)
  if (existing) return existing
  if (!defs) {
    const svg = document.createElementNS(NS, 'svg')
    svg.setAttribute('aria-hidden', 'true')
    svg.setAttribute('width', '0')
    svg.setAttribute('height', '0')
    svg.style.cssText = 'position:absolute;width:0;height:0;overflow:hidden;pointer-events:none'
    defs = document.createElementNS(NS, 'defs')
    svg.appendChild(defs)
    document.body.appendChild(svg)
  }
  const id = `lens-${key}`
  const f = document.createElementNS(NS, 'filter')
  f.id = id
  for (const [k, v] of Object.entries({ x: '0', y: '0', width: `${w}`, height: `${h}`, filterUnits: 'userSpaceOnUse', primitiveUnits: 'userSpaceOnUse', 'color-interpolation-filters': 'sRGB' })) {
    f.setAttribute(k, v)
  }
  const map = buildMap(w, h, r, bezel)
  // Red bends a little more than blue: the faint colour fringe at the rim.
  const scale = shift * 2
  f.innerHTML = `
    <feImage href="${map}" x="0" y="0" width="${w}" height="${h}" preserveAspectRatio="none" result="map"/>
    <feDisplacementMap in="SourceGraphic" in2="map" scale="${scale * 1.06}" xChannelSelector="R" yChannelSelector="G" result="dr"/>
    <feDisplacementMap in="SourceGraphic" in2="map" scale="${scale}" xChannelSelector="R" yChannelSelector="G" result="dg"/>
    <feDisplacementMap in="SourceGraphic" in2="map" scale="${scale * 0.94}" xChannelSelector="R" yChannelSelector="G" result="db"/>
    <feColorMatrix in="dr" type="matrix" values="1 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 1 0" result="r"/>
    <feColorMatrix in="dg" type="matrix" values="0 0 0 0 0 0 1 0 0 0 0 0 0 0 0 0 0 0 1 0" result="g"/>
    <feColorMatrix in="db" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 1 0 0 0 0 0 1 0" result="b"/>
    <feBlend in="r" in2="g" mode="screen" result="rg"/>
    <feBlend in="rg" in2="b" mode="screen"/>`
  defs.appendChild(f)
  const ref = `url(#${id})`
  filters.set(key, ref)
  return ref
}

function apply(el: HTMLElement) {
  const w = Math.round(el.offsetWidth)
  const h = Math.round(el.offsetHeight)
  if (w < 8 || h < 8) return
  const cs = getComputedStyle(el)
  const r = Math.min(parseFloat(cs.borderTopLeftRadius) || 0, w / 2, h / 2)
  const { bezel, shift } = lensFor(el, w, h, r)
  if (bezel < 2) return
  el.style.setProperty('--lens', filterFor(w, h, r, bezel, shift))
}

/** Watches the page for glass surfaces and keeps each one’s lens sized to it. */
export function startLiquidGlass() {
  if (!supportsLens()) return
  document.documentElement.classList.add('has-lens')
  const seen = new WeakSet<Element>()
  const ro = new ResizeObserver((entries) => entries.forEach((e) => apply(e.target as HTMLElement)))
  const scan = (root: ParentNode) => {
    root.querySelectorAll<HTMLElement>(SELECTOR).forEach((el) => {
      if (seen.has(el)) return
      seen.add(el)
      ro.observe(el)
    })
  }
  scan(document)
  new MutationObserver((records) => {
    for (const rec of records) {
      rec.addedNodes.forEach((n) => {
        if (!(n instanceof HTMLElement)) return
        if (n.matches(SELECTOR) && !seen.has(n)) {
          seen.add(n)
          ro.observe(n)
        }
        scan(n)
      })
      rec.removedNodes.forEach((n) => {
        if (!(n instanceof HTMLElement)) return
        const gone = n.matches(SELECTOR) ? [n, ...n.querySelectorAll(SELECTOR)] : [...n.querySelectorAll(SELECTOR)]
        gone.forEach((c) => {
          ro.unobserve(c)
          seen.delete(c)
        })
      })
    }
  }).observe(document.body, { childList: true, subtree: true })
}
