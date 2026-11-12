import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import type * as THREE from 'three'
import type { HeroScene } from '../gl/hero'
import type { Backdrop } from '../gl/backdrop'
import { MINIS } from './work/minis'
import { scrollToY } from '../scroll'

gsap.registerPlugin(ScrollTrigger)

/**
 * Section 05 · Chapter II · More work (last gold section)
 * Story: she looks out over the city, and four of its lights are her projects.
 * The silhouette photograph is alive in the shader (drifting clouds, breathing fire, twinkling
 * windows, traffic on the highway, rising embers). The section holds while you scroll; each step
 * the camera glides toward one light in the city, a beacon blooms there, a line draws from that
 * light to the project's plate, and the plate rises in with its working demo.
 * Every fact is from the CV (Projects 3–6); the demos are labelled illustrations.
 */
const STEPS = [
  { k: 'health', short: 'Health Predictor', name: 'AI Critical Health Predictor', stack: ['Python', 'Streamlit'],
    text: 'Team ML project predicting critical health risk; she helped build its Streamlit risk-prediction dashboard.',
    at: [0.21, 0.45] },
  { k: 'exam', short: 'Exam Scheduler', name: 'Exam Scheduler', stack: ['Python', 'HTML'],
    text: 'Sole developer on a team project: automated conflict-free timetable generation, data storage and core logic.',
    at: [0.42, 0.31] },
  { k: 'shop', short: 'E-Commerce', name: 'Multi-Vendor E-Commerce System', stack: ['Python', 'SQL', 'Streamlit'],
    text: 'Team project: helped design the relational database schema and backend logic for the platform.',
    at: [0.93, 0.45] },
  { k: 'path', short: 'Path Finder', name: 'Path Finder', stack: ['Java', 'HTML'],
    text: 'Dijkstra shortest-path route planner (the algorithm behind OSPF routing), shown on an amusement-park map.',
    at: [0.83, 0.35] },
] as const

const TEX_ASPECT = 1672 / 941
const OVERSCAN = 0.97 // must match ZOOM in hero.ts
const INTRO = 0.14    // share of the scroll spent on the opening view

export function mountMore(root: HTMLElement, hero: HeroScene, backdrop: Backdrop) {
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  const story = !reduce && window.matchMedia('(min-width: 821px)').matches
  const u = hero.uniforms
  const pan = u.uNextPan.value as THREE.Vector2
  const beacon = u.uBeacon.value as THREE.Vector2

  const el = document.createElement('section')
  el.className = `ch5${story ? ' is-story' : ''}`
  el.setAttribute('aria-labelledby', 'ch5-h')
  el.innerHTML = `
    <div class="ch5-pin">
      <p class="ch5-corner tl t-caps" data-deco>Chapter II<br>05 · More work</p>
      <p class="ch5-corner tr t-caps" data-deco>Four projects</p>
      <div class="ch5-intro">
        <h2 id="ch5-h" class="ch5-h t-secondary"><span class="in">More work</span></h2>
        <p class="ch5-sub t-secondary">Four more projects, one light at a time.</p>
      </div>
      <svg class="ch5-lead" aria-hidden="true"><path pathLength="1"/><circle r="5"/></svg>
      ${STEPS.map((s, i) => `
        <article class="ch5-card" data-k="${s.k}" aria-labelledby="ch5-${s.k}-h">
          <p class="ch5-count t-caps">Project ${i + 1} of 4</p>
          <h3 id="ch5-${s.k}-h" class="ch5-name t-secondary"><span class="in">${s.name}</span></h3>
          <p class="ch5-stack t-caps">${s.stack.join(' · ')}</p>
          <p class="ch5-text">${s.text}</p>
          <div class="ch5-demo"></div>
          <p class="ch5-note">${MINIS[s.k].note}</p>
        </article>`).join('')}
      <nav class="ch5-rail" aria-label="More work projects">
        ${STEPS.map((s, i) => `<button type="button" data-i="${i + 1}"><i aria-hidden="true"></i><span>${s.short}</span></button>`).join('')}
      </nav>
    </div>
  `
  root.appendChild(el)

  const cards = [...el.querySelectorAll<HTMLElement>('.ch5-card')]
  const rail = [...el.querySelectorAll<HTMLButtonElement>('.ch5-rail button')]
  const intro = el.querySelector<HTMLElement>('.ch5-intro')!
  const lead = el.querySelector<SVGSVGElement>('.ch5-lead')!
  const leadPath = lead.querySelector('path')!
  const leadDot = lead.querySelector('circle')!
  const mounted = new Set<string>()
  const mountDemo = (i: number) => {
    const s = STEPS[i]
    if (mounted.has(s.k)) return
    mounted.add(s.k)
    const box = cards[i].querySelector<HTMLElement>('.ch5-demo')!
    box.innerHTML = MINIS[s.k].html
    MINIS[s.k].mount(box, reduce)
  }

  // ---------- background: gold reflections -> silhouette, dusk bloom from the horizon ----------
  backdrop.add({ from: 'gold-reflections', to: 'gold-silhouette', style: 'dusk', trigger: el, start: 'top bottom', end: 'top 10%' })
  const calm = () => { gsap.to(pan, { x: 0, y: 0, duration: 0.8, ease: 'power2.out', overwrite: true }); gsap.to(u.uBeaconAmt, { value: 0, duration: 0.4, overwrite: true }) }
  ScrollTrigger.create({
    trigger: el,
    start: 'top bottom',
    end: 'bottom top',
    onUpdate: (self) => { if (self.progress < 0.2) u.uNextBright.value = 0.8 + 0.2 * gsap.utils.clamp(0, 1, self.progress * 6) },
    onLeaveBack: () => { calm(); u.uNextZoom.value = 1.05 },
  })

  // where a point of the photograph lands on screen (inverse of the shader's cover + zoom + pan + pointer)
  const toScreen = (ix: number, iy: number) => {
    const W = window.innerWidth, H = window.innerHeight
    const ra = W / H
    const sc = ra > TEX_ASPECT ? [1, TEX_ASPECT / ra] : [ra / TEX_ASPECT, 1]
    const z = u.uNextZoom.value as number
    const m = u.uMouse.value as THREE.Vector2
    const mo = u.uMotion.value as number
    const cx = (ix - 0.5 - pan.x + (m.x - 0.5) * 0.006 * mo) * z + 0.5
    const cy = (iy - 0.5 - pan.y + (m.y - 0.5) * 0.004 * mo) * z + 0.5
    const sx = (cx - 0.5) / (sc[0] * OVERSCAN) + 0.5
    const sy = (cy - 0.5) / (sc[1] * OVERSCAN) + 0.5
    return [sx * W, (1 - sy) * H]
  }
  // camera framing for a light: glide toward it so it sits on the far side from its plate
  const frame = (i: number) => {
    const [ix, iy] = STEPS[i].at
    const zoom = 1.18
    const W = window.innerWidth, H = window.innerHeight, ra = W / H
    const sc = ra > TEX_ASPECT ? [1, TEX_ASPECT / ra] : [ra / TEX_ASPECT, 1]
    const targetX = ix < 0.5 ? 0.28 : 0.72
    const lim = [0.5 - (0.5 * sc[0] * OVERSCAN) / zoom - 0.004, 0.5 - (0.5 * sc[1] * OVERSCAN) / zoom - 0.004]
    const px = gsap.utils.clamp(-lim[0], lim[0], ix - 0.5 - ((targetX - 0.5) * sc[0] * OVERSCAN) / zoom)
    const py = gsap.utils.clamp(-lim[1], lim[1], (iy - 0.5) * 0.6)
    return { zoom, px, py, side: ix < 0.5 ? 'right' : 'left' }
  }

  // ---------- phones and reduced motion: the same story told in flow, one plate after another ----------
  if (!story) {
    cards.forEach((c, i) => {
      mountDemo(i)
      ScrollTrigger.create({
        trigger: c,
        start: 'top 65%',
        end: 'bottom 35%',
        onToggle: (self) => {
          if (!self.isActive) return
          const f = frame(i)
          beacon.set(STEPS[i].at[0], STEPS[i].at[1])
          if (reduce) { pan.set(f.px, f.py); u.uBeaconAmt.value = 1; return }
          gsap.to(pan, { x: f.px * 0.6, y: f.py * 0.6, duration: 1.2, ease: 'power2.inOut', overwrite: true })
          gsap.fromTo(u.uBeaconAmt, { value: 0 }, { value: 1, duration: 0.8, ease: 'power2.out', overwrite: true })
        },
      })
    })
    rail.forEach((b) => b.addEventListener('click', () => cards[Number(b.dataset.i) - 1].scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' })))
    return
  }

  // ---------- the story: one step per light ----------
  let step = -1
  let tl: gsap.core.Timeline | null = null
  let lineOn = false
  const total = () => el.offsetHeight - window.innerHeight
  const stepTop = (i: number) => el.getBoundingClientRect().top + window.scrollY + total() * (i === 0 ? 0 : INTRO + (i - 0.5) * ((1 - INTRO) / 4))

  const drawLine = () => {
    if (!lineOn || step < 1) return
    const card = cards[step - 1].getBoundingClientRect()
    const [bx, by] = toScreen(STEPS[step - 1].at[0], STEPS[step - 1].at[1])
    const side = cards[step - 1].dataset.side
    const ex = side === 'right' ? card.left : card.right
    const ey = gsap.utils.clamp(card.top + 40, card.bottom - 40, by)
    const mx = (bx + ex) / 2
    leadPath.setAttribute('d', `M${bx.toFixed(1)} ${by.toFixed(1)} C${mx.toFixed(1)} ${by.toFixed(1)} ${mx.toFixed(1)} ${ey.toFixed(1)} ${ex.toFixed(1)} ${ey.toFixed(1)}`)
    leadDot.setAttribute('cx', ex.toFixed(1))
    leadDot.setAttribute('cy', ey.toFixed(1))
  }

  const go = (next: number) => {
    if (next === step) return
    const prev = step
    step = next
    tl?.kill()
    rail.forEach((b) => { const on = Number(b.dataset.i) === next; b.classList.toggle('on', on); b.setAttribute('aria-current', on ? 'step' : 'false') })
    el.classList.toggle('at-intro', next === 0)
    tl = gsap.timeline()
    // leaving: the old plate and line go quickly, all at once
    if (prev >= 1) tl.to(cards[prev - 1], { autoAlpha: 0, y: -10, duration: 0.25, ease: 'power2.in' }, 0)
    tl.to(leadPath, { strokeDashoffset: 1, duration: 0.2, ease: 'power2.in' }, 0).set(leadDot, { opacity: 0 }, 0)
    lineOn = false

    if (next === 0) {
      calm()
      gsap.to(u.uNextZoom, { value: 1.05, duration: 1.2, ease: 'power2.inOut', overwrite: true })
      tl.to(intro, { autoAlpha: 1, y: 0, duration: 0.7, ease: 'expo.out' }, 0.1)
      return
    }
    tl.to(intro, { autoAlpha: 0, y: -16, duration: 0.3, ease: 'power2.in' }, 0)
    const i = next - 1
    const f = frame(i)
    const card = cards[i]
    card.dataset.side = f.side
    mountDemo(i)
    // the camera glides to the light; the beacon fades out, moves, and blooms again
    gsap.to(u.uNextZoom, { value: f.zoom, duration: 1.3, ease: 'power2.inOut', overwrite: true })
    gsap.to(pan, { x: f.px, y: f.py, duration: 1.3, ease: 'power2.inOut', overwrite: true })
    gsap.timeline()
      .to(u.uBeaconAmt, { value: 0, duration: 0.2, overwrite: true })
      .call(() => beacon.set(STEPS[i].at[0], STEPS[i].at[1]))
      .to(u.uBeaconAmt, { value: 1, duration: 0.9, ease: 'power2.out' }, '+=0.35')
    // then the line draws from the light to the plate, and the plate rises in
    const name = card.querySelector('.ch5-name .in')
    const rest = card.querySelectorAll('.ch5-count, .ch5-stack, .ch5-text, .ch5-demo, .ch5-note')
    tl.set(card, { autoAlpha: 1, y: 0 }, 0.3)
      .fromTo(name, { yPercent: 110 }, { yPercent: 0, duration: 0.9, ease: 'expo.out' }, 0.75)
      .fromTo(rest, { autoAlpha: 0, y: 12 }, { autoAlpha: 1, y: 0, duration: 0.7, ease: 'expo.out', stagger: { each: 0.06, ease: 'power1.in' } }, 0.85)
      .call(() => { lineOn = true; drawLine() }, undefined, 1.05)
      .fromTo(leadPath, { strokeDashoffset: 1 }, { strokeDashoffset: 0, duration: 0.7, ease: 'power2.inOut' }, 1.05)
      .to(leadDot, { opacity: 1, duration: 0.2 }, 1.6)
  }

  gsap.set(cards, { autoAlpha: 0 })
  gsap.set(leadPath, { strokeDashoffset: 1 })
  gsap.set(leadDot, { opacity: 0 })
  const h = el.querySelector<HTMLElement>('.ch5-h .in')!
  gsap.set(h, { yPercent: 110 })
  gsap.set(el.querySelectorAll('.ch5-sub, [data-deco], .ch5-rail'), { autoAlpha: 0 })
  ScrollTrigger.create({
    trigger: el,
    start: 'top 35%',
    once: true,
    onEnter: () => {
      gsap.timeline()
        .to(h, { yPercent: 0, duration: 1.2, ease: 'expo.out' }, 0)
        .to(el.querySelectorAll('.ch5-sub'), { autoAlpha: 1, duration: 0.9, ease: 'power1.out' }, 0.35)
        .to(el.querySelectorAll('[data-deco], .ch5-rail'), { autoAlpha: 1, duration: 0.8, ease: 'power1.out' }, 0.6)
    },
  })

  ScrollTrigger.create({
    trigger: el,
    start: 'top top',
    end: 'bottom bottom',
    onUpdate: (self) => {
      const p = self.progress
      go(p < INTRO ? 0 : Math.min(4, 1 + Math.floor((p - INTRO) / ((1 - INTRO) / 4))))
    },
    onLeaveBack: () => { go(0) },
  })
  // the line follows the light as the camera and the pointer move
  gsap.ticker.add(drawLine)
  rail.forEach((b) => b.addEventListener('click', () => scrollToY(stepTop(Number(b.dataset.i)), reduce)))
}
