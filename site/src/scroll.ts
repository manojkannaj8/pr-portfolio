import type Lenis from 'lenis'

/** Shared smooth-scroll access, so navigation can move the page through Lenis when it runs. */
let lenis: Lenis | null = null
export const setLenis = (l: Lenis) => { lenis = l }
/** Jump straight to a position (used behind the shutter, so no long scroll through every scene). */
export function jumpTo(y: number) {
  if (lenis) lenis.scrollTo(y, { immediate: true, force: true })
  else window.scrollTo({ top: y, behavior: 'auto' })
}
