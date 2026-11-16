import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { jumpTo } from '../scroll'

/**
 * Story navigation: the story rail (custom scrollbar) and the contents overlay.
 *
 * Rail: a thin line down the right edge, split into the story's four parts in their colours.
 * The reader's position is a glowing bead that leaves a long-exposure light trail (longer when
 * scrolling faster). Each section is a tick; hover shows the labels, click jumps there.
 * Dragging the rail scrubs the story.
 * Contents: opened from the hero ("Contents") or the rail's top, a full-screen table of contents.
 * Every jump goes through a camera shutter (a quick blink to black), never a long scroll through
 * every scene.
 */
type Part = 'pro' | 'i' | 'ii' | 'iii'
const PART_COLOUR: Record<Part, string> = { pro: '#e89135', i: '#e95d46', ii: '#f58e12', iii: '#6fd8d0' }
const PARTS: { k: Part; numeral: string; name: string; items: { sel: string; label: string }[] }[] = [
  { k: 'pro', numeral: '', name: 'Prologue', items: [{ sel: '.hero', label: 'Pragya Reddy A' }] },
  { k: 'i', numeral: 'I', name: 'Signal', items: [
    { sel: '.ch1', label: 'Introduction' }, { sel: '.ch2', label: 'Education' }, { sel: '.ch3', label: 'Experience & Research' } ] },
  { k: 'ii', numeral: 'II', name: 'Reflection', items: [
    { sel: '.ch4', label: 'Featured work' }, { sel: '.ch5', label: 'More work' } ] },
  { k: 'iii', numeral: 'III', name: 'Clarity', items: [
    { sel: '.ch6', label: 'Toolkit' }, { sel: '.ch7', label: 'Contact' } ] },
]
const FLAT = PARTS.flatMap((p) => p.items.map((it) => ({ ...it, part: p.k })))

export function mountStoryNav() {
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  const fine = window.matchMedia('(hover: hover) and (pointer: fine)').matches
  document.documentElement.classList.add('has-rail')

  // ---------- the shutter ----------
  const shutter = document.createElement('div')
  shutter.className = 'shutter'
  shutter.setAttribute('aria-hidden', 'true')
  document.body.appendChild(shutter)
  const topOf = (sel: string) => {
    const el = document.querySelector<HTMLElement>(sel)
    return el ? el.getBoundingClientRect().top + window.scrollY : 0
  }
  let busy = false
  const travel = (y: number, after?: () => void) => {
    if (busy) return
    if (reduce) { jumpTo(y); ScrollTrigger.update(); after?.(); return }
    busy = true
    gsap.timeline({ onComplete: () => { busy = false } })
      .to(shutter, { opacity: 1, duration: 0.22, ease: 'power2.in' })
      .call(() => { jumpTo(y); ScrollTrigger.update(); after?.() })
      .to(shutter, { opacity: 0, duration: 0.45, ease: 'power2.out' }, '+=0.12')
  }

  // ---------- the rail ----------
  const rail = document.createElement('nav')
  rail.className = 'rail'
  rail.setAttribute('aria-label', 'Story chapters')
  rail.innerHTML = `
    <button type="button" class="rail-index t-caps" aria-haspopup="dialog">Contents</button>
    <div class="rail-track">
      ${PARTS.map((p) => `<i class="rail-seg" data-part="${p.k}" style="--c:${PART_COLOUR[p.k]}"></i>`).join('')}
      <span class="rail-trail" aria-hidden="true"></span>
      <span class="rail-bead" aria-hidden="true"></span>
      ${FLAT.map((it, i) => `<button type="button" class="rail-tick" data-i="${i}" style="--c:${PART_COLOUR[it.part]}"><span class="t-caps">${it.label}</span></button>`).join('')}
    </div>`
  document.body.appendChild(rail)
  const track = rail.querySelector<HTMLElement>('.rail-track')!
  const segs = [...rail.querySelectorAll<HTMLElement>('.rail-seg')]
  const ticks = [...rail.querySelectorAll<HTMLButtonElement>('.rail-tick')]
  const bead = rail.querySelector<HTMLElement>('.rail-bead')!
  const trail = rail.querySelector<HTMLElement>('.rail-trail')!

  let starts: number[] = []
  let max = 1
  const layout = () => {
    max = Math.max(1, document.documentElement.scrollHeight - window.innerHeight)
    starts = FLAT.map((it) => Math.min(1, topOf(it.sel) / max))
    ticks.forEach((t, i) => t.style.setProperty('--y', `${(starts[i] * 100).toFixed(3)}%`))
    PARTS.forEach((p, pi) => {
      const first = FLAT.findIndex((f) => f.part === p.k)
      const nextFirst = pi < PARTS.length - 1 ? FLAT.findIndex((f) => f.part === PARTS[pi + 1].k) : -1
      const a = starts[first], b = nextFirst >= 0 ? starts[nextFirst] : 1
      segs[pi].style.top = `${(a * 100).toFixed(3)}%`
      segs[pi].style.height = `${((b - a) * 100).toFixed(3)}%`
    })
  }
  ScrollTrigger.addEventListener('refresh', layout)
  window.addEventListener('load', layout)
  layout()

  // the bead follows the reader; its trail stretches with speed (a long exposure of the scroll)
  let lastY = window.scrollY
  let vel = 0
  let current = -1
  gsap.ticker.add((_t, dt) => {
    const y = window.scrollY
    const f = Math.min(1, Math.max(0, y / max))
    const v = (y - lastY) / Math.max(dt, 1) // px per ms
    lastY = y
    vel += (v - vel) * 0.18
    const h = track.clientHeight
    bead.style.transform = `translate3d(-50%, ${(f * h).toFixed(1)}px, 0)`
    const len = reduce ? 0 : Math.min(140, Math.abs(vel) * 34)
    trail.style.height = `${len.toFixed(1)}px`
    trail.style.transform = `translate3d(-50%, ${(f * h - (vel > 0 ? len : 0)).toFixed(1)}px, 0)`
    trail.classList.toggle('up', vel < 0)
    // the section in view lights its tick and colours the bead
    let idx = 0
    for (let i = 0; i < starts.length; i++) if (f + 0.002 >= starts[i]) idx = i
    if (idx !== current) {
      current = idx
      ticks.forEach((t, i) => { t.classList.toggle('on', i === idx); t.toggleAttribute('aria-current', i === idx) })
      rail.style.setProperty('--now', PART_COLOUR[FLAT[idx].part])
    }
  })

  ticks.forEach((t, i) => t.addEventListener('click', (e) => { e.stopPropagation(); travel(starts[i] * max + 2) }))

  // drag the rail to scrub the story
  if (fine) {
    let dragging = false
    const scrub = (clientY: number) => {
      const r = track.getBoundingClientRect()
      const f = Math.min(1, Math.max(0, (clientY - r.top) / r.height))
      jumpTo(f * max)
    }
    track.addEventListener('pointerdown', (e) => {
      if ((e.target as HTMLElement).closest('.rail-tick')) return
      dragging = true
      track.setPointerCapture(e.pointerId)
      rail.classList.add('dragging')
      scrub(e.clientY)
    })
    track.addEventListener('pointermove', (e) => { if (dragging) scrub(e.clientY) })
    const end = () => { dragging = false; rail.classList.remove('dragging') }
    track.addEventListener('pointerup', end)
    track.addEventListener('pointercancel', end)
  }

  // ---------- contents overlay ----------
  const dlg = document.createElement('div')
  dlg.className = 'contents'
  dlg.setAttribute('role', 'dialog')
  dlg.setAttribute('aria-modal', 'true')
  dlg.setAttribute('aria-label', 'Contents')
  dlg.hidden = true
  dlg.innerHTML = `
    <button type="button" class="contents-close" aria-label="Close contents"><i></i><i></i></button>
    <p class="contents-title t-caps">Contents · one night in three chapters</p>
    <ol class="contents-parts" role="list">
      ${PARTS.map((p) => `
        <li class="contents-part" style="--c:${PART_COLOUR[p.k]}">
          <p class="contents-head"><span class="contents-num t-display">${p.numeral || '·'}</span><span class="contents-name t-secondary">${p.name}</span></p>
          <ul role="list">
            ${p.items.map((it) => `<li><button type="button" class="contents-go" data-i="${FLAT.findIndex((f) => f.sel === it.sel)}">${it.label}</button></li>`).join('')}
          </ul>
        </li>`).join('')}
    </ol>`
  document.body.appendChild(dlg)
  const parts = dlg.querySelectorAll<HTMLElement>('.contents-part')
  let opener: HTMLElement | null = null

  const open = (from: HTMLElement | null) => {
    opener = from
    dlg.hidden = false
    document.documentElement.classList.add('contents-open')
    if (reduce) { dlg.style.opacity = '1' }
    else {
      gsap.fromTo(dlg, { opacity: 0 }, { opacity: 1, duration: 0.35, ease: 'power2.out' })
      gsap.fromTo(parts, { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 0.7, ease: 'expo.out', stagger: 0.06, delay: 0.08 })
    }
    dlg.querySelector<HTMLButtonElement>('.contents-go')?.focus()
  }
  const close = (refocus = true) => {
    const done = () => { dlg.hidden = true; document.documentElement.classList.remove('contents-open') }
    if (reduce) done()
    else gsap.to(dlg, { opacity: 0, duration: 0.25, ease: 'power2.in', onComplete: done })
    if (refocus) opener?.focus()
  }
  dlg.querySelector('.contents-close')!.addEventListener('click', () => close())
  dlg.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') { e.preventDefault(); close() }
    if (e.key === 'Tab') {
      // keep focus inside the dialog
      const f = [...dlg.querySelectorAll<HTMLElement>('button')]
      const i = f.indexOf(document.activeElement as HTMLElement)
      if (e.shiftKey && i <= 0) { e.preventDefault(); f[f.length - 1].focus() }
      else if (!e.shiftKey && i === f.length - 1) { e.preventDefault(); f[0].focus() }
    }
  })
  dlg.querySelectorAll<HTMLButtonElement>('.contents-go').forEach((b) =>
    b.addEventListener('click', () => {
      const i = Number(b.dataset.i)
      // the overlay is already dark: jump behind it, then let it fade like an opening shutter
      if (reduce) { jumpTo(starts[i] * max + 2); ScrollTrigger.update(); close(false); return }
      gsap.to(parts, { opacity: 0, y: -10, duration: 0.2, ease: 'power2.in' })
      gsap.delayedCall(0.22, () => {
        jumpTo(starts[i] * max + 2)
        ScrollTrigger.update()
        gsap.to(dlg, { opacity: 0, duration: 0.5, ease: 'power2.out', delay: 0.1, onComplete: () => { dlg.hidden = true; document.documentElement.classList.remove('contents-open') } })
      })
    }))

  rail.querySelector<HTMLButtonElement>('.rail-index')!.addEventListener('click', (e) => open(e.currentTarget as HTMLElement))
  document.querySelectorAll<HTMLButtonElement>('[data-open-contents]').forEach((b) => b.addEventListener('click', () => open(b)))
}
