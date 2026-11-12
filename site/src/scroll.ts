import type Lenis from 'lenis'

/** Shared smooth-scroll access, so sections can move the page through Lenis when it runs. */
let lenis: Lenis | null = null
export const setLenis = (l: Lenis) => { lenis = l }
export function scrollToY(y: number, reduce: boolean) {
  if (lenis) lenis.scrollTo(y, { duration: reduce ? 0 : 1.2 })
  else window.scrollTo({ top: y, behavior: reduce ? 'auto' : 'smooth' })
}
