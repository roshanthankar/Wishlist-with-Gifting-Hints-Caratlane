import { extendTailwindMerge } from 'tailwind-merge'

/**
 * Join class names; later Tailwind classes win over earlier conflicting ones
 * (so `<Button className="font-medium">` overrides the default weight).
 * Font size and line height are independent here, as in Figma.
 */
const merge = extendTailwindMerge({
  override: { conflictingClassGroups: { 'font-size': [] } },
})

export function cn(...parts: Array<string | false | null | undefined>) {
  return merge(parts.filter(Boolean).join(' '))
}
