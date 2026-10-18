/**
 * One soft haptic tap “on supported phones” (spec M1).
 * - Android / Chrome: Vibration API.
 * - iOS 18+ Safari: toggling a native <input type="checkbox" switch> plays the
 *   system haptic, so we keep one hidden switch and click its label.
 * Everywhere else this is a silent no-op.
 */
let label: HTMLLabelElement | null = null

function iosSwitch() {
  if (typeof document === 'undefined') return null
  if (label) return label
  const input = document.createElement('input')
  input.type = 'checkbox'
  input.setAttribute('switch', '')
  input.id = '__proto_haptic'
  input.setAttribute('aria-hidden', 'true')
  input.tabIndex = -1
  label = document.createElement('label')
  label.htmlFor = input.id
  label.setAttribute('aria-hidden', 'true')
  const hide = 'position:fixed;left:-9999px;top:0;width:1px;height:1px;opacity:0;pointer-events:none;'
  input.style.cssText = hide
  label.style.cssText = hide
  document.body.append(input, label)
  return label
}

export function haptic(kind: 'soft' | 'success' = 'soft') {
  try {
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator && navigator.vibrate) {
      navigator.vibrate(kind === 'success' ? [8, 40, 8] : 8)
      return
    }
    const isIOS = typeof navigator !== 'undefined' && /iP(hone|ad|od)/.test(navigator.userAgent)
    if (isIOS) iosSwitch()?.click()
  } catch {
    /* haptics are best-effort */
  }
}
