import { ScrollTrigger } from 'gsap/ScrollTrigger'
import type { HeroScene } from './hero'

/**
 * Chapter backdrop: the photographs behind every section after the hero, in scroll order.
 *
 * The shader has two chapter slots (uNext = A, uNextB = B) and one blend (uBlend, style uMode).
 * Each transition is a ScrollTrigger. On every update the whole state is worked out from the
 * scroll position: the first transition still running owns the slots (A = from, B = to);
 * transitions already finished just hand their image on as the next A. So scrolling fast,
 * jumping, or scrolling back always lands on the right pair, whatever order triggers fire in.
 */
export type Transition = 'rain' | 'grid' | 'water' | 'dusk'
const MODE: Record<Transition, number> = { rain: 0, grid: 1, water: 2, dusk: 3 }
// photographs with a live effect in the shader: 1 = beams(), 2 = dusk() in hero.ts
const LIVE: Record<string, number> = { 'red-grid': 1, 'gold-silhouette': 2 }

interface Step { from: string; to: string; mode: number; st: ScrollTrigger }

export interface Backdrop {
  add(o: { from: string; to: string; style: Transition; trigger: Element; start?: string; end?: string }): ScrollTrigger
  apply(): void
}

export function createBackdrop(hero: HeroScene, first: string): Backdrop {
  const u = hero.uniforms
  const steps: Step[] = []

  const apply = () => {
    let a = first
    let b: string | null = null
    let p = 0
    let mode = 0
    for (const s of steps) {
      const q = s.st.progress
      if (q <= 0) break
      if (q >= 1) { a = s.to; continue }
      a = s.from; b = s.to; p = q; mode = s.mode
      break
    }
    const ta = hero.texture(a)
    if (ta) u.uNext.value = ta
    const tb = b ? hero.texture(b) : undefined
    // until the incoming image has loaded, hold on the current one
    u.uBlend.value = tb ? p : 0
    if (tb) u.uNextB.value = tb
    u.uMode.value = mode
    u.uFxA.value = LIVE[a] ?? 0
    u.uFxB.value = b ? LIVE[b] ?? 0 : 0
  }

  return {
    add({ from, to, style, trigger, start = 'top bottom', end = 'top 15%' }) {
      hero.preload(from).then(apply)
      hero.preload(to).then(apply)
      const st = ScrollTrigger.create({ trigger, start, end, onUpdate: apply, onRefresh: apply })
      steps.push({ from, to, mode: MODE[style], st })
      return st
    },
    apply,
  }
}
