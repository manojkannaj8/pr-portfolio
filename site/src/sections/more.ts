import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import type { HeroScene } from '../gl/hero'
import type { Backdrop } from '../gl/backdrop'
import { MINIS } from './work/minis'

gsap.registerPlugin(ScrollTrigger)

/**
 * Section 05 · Chapter II · More work (last gold section)
 * Background: gold-silhouette, opening outward from its burning horizon (dusk bloom).
 * The photograph leads: the four projects stand as an index on the left; choosing one slides in an
 * instrument plate with a working demo of its mechanism. Every fact is from the CV (Projects 3–6).
 */
const ITEMS = [
  { k: 'health', name: 'AI Critical Health Predictor', stack: ['Python', 'Streamlit'],
    text: 'Team ML project predicting critical health risk; she helped build its Streamlit risk-prediction dashboard.' },
  { k: 'exam', name: 'Exam Scheduler', stack: ['Python', 'HTML'],
    text: 'Sole developer on a team project: automated conflict-free timetable generation, data storage and core logic.' },
  { k: 'shop', name: 'Multi-Vendor E-Commerce System', stack: ['Python', 'SQL', 'Streamlit'],
    text: 'Team project: helped design the relational database schema and backend logic for the platform.' },
  { k: 'path', name: 'Path Finder', stack: ['Java', 'HTML'],
    text: 'Dijkstra shortest-path route planner (the algorithm behind OSPF routing), shown on an amusement-park map.' },
] as const

export function mountMore(root: HTMLElement, hero: HeroScene, backdrop: Backdrop) {
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  const u = hero.uniforms

  const el = document.createElement('section')
  el.className = 'ch5'
  el.setAttribute('aria-labelledby', 'ch5-h')
  el.innerHTML = `
    <p class="ch5-corner tl t-caps" data-deco>Chapter II<br>05 · More work</p>
    <p class="ch5-corner tr t-caps" data-deco>Four projects</p>
    <div class="ch5-index">
      <h2 id="ch5-h" class="ch5-h t-secondary"><span class="in">More work</span></h2>
      <ol class="ch5-list" role="list">
        ${ITEMS.map((it) => `
          <li>
            <button type="button" class="ch5-item" data-k="${it.k}" aria-expanded="false" aria-controls="ch5-stage">
              <span class="ch5-name t-secondary">${it.name}</span>
              <span class="ch5-stack t-caps">${it.stack.join(' · ')}</span>
              <span class="ch5-text">${it.text}</span>
            </button>
          </li>`).join('')}
      </ol>
    </div>
    <div class="ch5-stage" id="ch5-stage" role="region" aria-label="Project demo" hidden>
      <div class="ch5-plate">
        <div class="ch5-plate-head">
          <p class="ch5-plate-name t-secondary"></p>
          <button type="button" class="ch5-close" aria-label="Close demo"><i></i><i></i></button>
        </div>
        <div class="ch5-demo"></div>
        <p class="ch5-note"></p>
      </div>
    </div>
  `
  root.appendChild(el)

  // ---------- background: gold reflections -> silhouette, dusk bloom from the horizon ----------
  backdrop.add({ from: 'gold-reflections', to: 'gold-silhouette', style: 'dusk', trigger: el, start: 'top bottom', end: 'top 10%' })
  ScrollTrigger.create({
    trigger: el,
    start: 'top bottom',
    end: 'bottom bottom',
    onUpdate: (self) => {
      // the silhouette photo at full strength; a slow push toward the figure
      u.uNextBright.value = 0.8 + 0.2 * gsap.utils.clamp(0, 1, self.progress * 2)
      if (!reduce) u.uNextZoom.value = 1.05 - 0.05 * gsap.utils.clamp(0, 1, self.progress * 2) + self.progress * 0.03
    },
  })

  // ---------- choosing a project ----------
  const items = [...el.querySelectorAll<HTMLButtonElement>('.ch5-item')]
  const stage = el.querySelector<HTMLElement>('.ch5-stage')!
  const plate = el.querySelector<HTMLElement>('.ch5-plate')!
  const demo = el.querySelector<HTMLElement>('.ch5-demo')!
  const pname = el.querySelector<HTMLElement>('.ch5-plate-name')!
  const note = el.querySelector<HTMLElement>('.ch5-note')!
  const close = el.querySelector<HTMLButtonElement>('.ch5-close')!
  const phone = window.matchMedia('(max-width: 820px)')
  let open = ''

  const show = (k: string) => {
    const it = ITEMS.find((x) => x.k === k)!
    const mini = MINIS[it.k]
    open = k
    items.forEach((b) => { const on = b.dataset.k === k; b.setAttribute('aria-expanded', String(on)); b.classList.toggle('on', on) })
    el.classList.add('has-open')
    pname.textContent = it.name
    note.textContent = mini.note
    demo.innerHTML = mini.html
    // on phones the plate sits right under the chosen project
    if (phone.matches) items.find((b) => b.dataset.k === k)!.closest('li')!.appendChild(stage)
    else el.appendChild(stage)
    const wasHidden = stage.hidden
    stage.hidden = false
    mini.mount(demo, reduce)
    if (!reduce && wasHidden) gsap.fromTo(plate, { clipPath: 'inset(0 0 0 100%)', x: 24 }, { clipPath: 'inset(0 0 0 0%)', x: 0, duration: 0.7, ease: 'expo.out' })
    else if (!reduce) gsap.fromTo(demo, { opacity: 0, y: 8 }, { opacity: 1, y: 0, duration: 0.4, ease: 'expo.out' })
  }
  const hide = (refocus = true) => {
    const was = open
    open = ''
    items.forEach((b) => { b.setAttribute('aria-expanded', 'false'); b.classList.remove('on') })
    el.classList.remove('has-open')
    const done = () => { stage.hidden = true; demo.innerHTML = '' }
    if (reduce) done()
    else gsap.to(plate, { clipPath: 'inset(0 0 0 100%)', x: 16, duration: 0.35, ease: 'power2.in', onComplete: done })
    if (refocus && was) items.find((b) => b.dataset.k === was)?.focus()
  }
  items.forEach((b) => b.addEventListener('click', () => (open === b.dataset.k ? hide(false) : show(b.dataset.k!))))
  close.addEventListener('click', () => hide())
  el.addEventListener('keydown', (e) => { if (e.key === 'Escape' && open) hide() })

  // ---------- entrance ----------
  const h = el.querySelector<HTMLElement>('.ch5-h .in')!
  const rows = el.querySelectorAll<HTMLElement>('.ch5-list li')
  const deco = el.querySelectorAll<HTMLElement>('[data-deco]')
  if (reduce) return
  gsap.set(h, { yPercent: 110 })
  gsap.set(rows, { opacity: 0, x: -18 })
  gsap.set(deco, { opacity: 0 })
  ScrollTrigger.create({
    trigger: el,
    start: 'top 35%',
    once: true,
    onEnter: () => {
      gsap.timeline()
        .to(h, { yPercent: 0, duration: 1.1, ease: 'expo.out' }, 0)
        .to(rows, { opacity: 1, x: 0, duration: 0.8, ease: 'expo.out', stagger: { each: 0.09, ease: 'power1.in' } }, 0.15)
        .to(deco, { opacity: 1, duration: 0.8, ease: 'power1.out' }, 0.5)
    },
  })
}
