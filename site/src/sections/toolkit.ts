import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import type { HeroScene } from '../gl/hero'
import type { Backdrop } from '../gl/backdrop'

gsap.registerPlugin(ScrollTrigger)

/**
 * Section 06 · Chapter III "Clarity" · Toolkit (first cool section)
 * Background: cool-fog (Neon Fog Over Chongqing), arriving as fog rolling in over the neon canyon.
 * Two screens: the chapter title, then the six skill groups from the CV. Pointing at a skill shows
 * where she used it, derived ONLY from the stacks and descriptions of the CV's projects.
 */

const P = {
  argo: 'ARGO Ocean Data',
  credit: 'Credit Risk Scoring',
  hien: 'HIEN research',
  health: 'AI Critical Health Predictor',
  exam: 'Exam Scheduler',
  shop: 'Multi-Vendor E-Commerce',
  path: 'Path Finder',
} as const
type Pk = keyof typeof P

// [skill, projects where the CV shows it]
const GROUPS: { name: string; skills: [string, Pk[]][] }[] = [
  { name: 'Languages', skills: [
    ['Python', ['argo', 'credit', 'hien', 'health', 'exam', 'shop']], ['SQL', ['argo', 'shop']], ['Java', ['path']],
    ['C++', []], ['HTML', ['exam', 'path']] ] },
  { name: 'AI & LLMs', skills: [
    ['Large Language Models', ['argo']], ['Retrieval-Augmented Generation', ['argo']], ['Vector Databases', ['argo']],
    ['Hugging Face Transformers', []], ['Model Evaluation (AUC, macro-F1, cross-validation)', ['credit', 'hien']] ] },
  { name: 'Responsible & Explainable AI', skills: [
    ['SHAP', ['hien', 'credit']], ['DiCE', ['credit']], ['Fairness Auditing', ['credit']] ] },
  { name: 'Machine Learning', skills: [
    ['scikit-learn', []], ['LightGBM', ['credit']], ['XGBoost', ['credit']], ['PyTorch', []], ['PyTorch Geometric', ['hien']],
    ['Graph Neural Networks', ['hien']], ['HMM', ['hien']], ['GMM', ['hien']], ['Monte Carlo Simulation', ['credit']], ['Markov Chains', ['credit']] ] },
  { name: 'Data & Reporting', skills: [
    ['PostgreSQL', ['argo']], ['ETL Pipelines', ['argo']], ['Pandas', []], ['NumPy', []], ['Plotly', ['argo']],
    ['Streamlit Dashboards', ['argo', 'health', 'shop']], ['Flask', []] ] },
  { name: 'Tools', skills: [
    ['Git', []], ['GitHub', []], ['PyCharm', []], ['Google Colab', []], ['Kaggle Notebooks', []] ] },
]

const IDLE = 'Point at, tap or tab to a skill to see where she used it.'

export function mountToolkit(root: HTMLElement, hero: HeroScene, backdrop: Backdrop) {
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  const u = hero.uniforms
  const word = [...'Clarity'].map((c) => `<span class="ch"><span class="in">${c}</span></span>`).join('')

  const el = document.createElement('div')
  el.className = 'ch6'
  el.innerHTML = `
    <section class="ch6-title" aria-labelledby="ch6-h">
      <p class="ch6-corner tl t-caps" data-deco>Chapter III<br>of III</p>
      <p class="ch6-corner tr t-caps" data-deco>Toolkit</p>
      <h2 id="ch6-h" class="ch6-word t-secondary" aria-label="Clarity">${word}</h2>
      <p class="ch6-corner bl t-caps" data-deco>Six skill groups</p>
      <p class="ch6-corner br t-caps" data-deco>Languages to LLMs</p>
    </section>

    <section class="ch6-kit" aria-labelledby="ch6-kit-h">
      <p class="ch6-corner tl t-caps" data-deco>Chapter III<br>06 · Toolkit</p>
      <div class="ch6-side">
        <h3 id="ch6-kit-h" class="ch6-h t-secondary">Toolkit</h3>
        <div class="ch6-evidence" aria-live="polite">
          <p class="ch6-ev-skill t-secondary"></p>
          <p class="ch6-ev-label t-caps"></p>
          <ul class="ch6-ev-list" role="list"></ul>
          <p class="ch6-ev-idle">${IDLE}</p>
        </div>
      </div>
      <div class="ch6-groups">
        ${GROUPS.map((g, gi) => `
          <div class="ch6-row" style="--r:${gi}">
            <h4 class="ch6-group t-caps">${g.name}</h4>
            <ul class="ch6-skills" role="list">
              ${g.skills.map(([s, ps]) => `<li><button type="button" class="ch6-skill" data-p="${ps.join(' ')}">${s}</button></li>`).join('')}
            </ul>
          </div>`).join('')}
      </div>
    </section>
  `
  root.appendChild(el)

  const title = el.querySelector<HTMLElement>('.ch6-title')!
  const kit = el.querySelector<HTMLElement>('.ch6-kit')!

  // ---------- background: the chapter change, neon canyon -> fog skyline, as fog rolling in ----------
  backdrop.add({ from: 'neon-canyon', to: 'cool-fog', style: 'fog', trigger: el, start: 'top bottom', end: 'top 5%' })
  ScrollTrigger.create({
    trigger: el,
    start: 'top bottom',
    end: 'bottom bottom',
    onUpdate: (self) => {
      if (!reduce) u.uNextZoom.value = 1.07 - self.progress * 0.05
      // full fog skyline behind the title; a little dimmer behind the toolkit for reading
      u.uNextBright.value = 1 - 0.22 * gsap.utils.clamp(0, 1, (self.progress - 0.45) / 0.3)
    },
  })

  // ---------- evidence: where each skill was used ----------
  const skills = [...el.querySelectorAll<HTMLButtonElement>('.ch6-skill')]
  const evSkill = el.querySelector<HTMLElement>('.ch6-ev-skill')!
  const evLabel = el.querySelector<HTMLElement>('.ch6-ev-label')!
  const evList = el.querySelector<HTMLElement>('.ch6-ev-list')!
  const evIdle = el.querySelector<HTMLElement>('.ch6-ev-idle')!
  const groups = el.querySelector<HTMLElement>('.ch6-groups')!
  let pinned: HTMLButtonElement | null = null

  const show = (b: HTMLButtonElement | null) => {
    groups.classList.toggle('probing', !!b)
    skills.forEach((s) => s.classList.remove('on', 'kin'))
    if (!b) {
      evSkill.textContent = ''; evLabel.textContent = ''; evList.innerHTML = ''; evIdle.hidden = false
      return
    }
    const ps = (b.dataset.p || '').split(' ').filter(Boolean) as Pk[]
    b.classList.add('on')
    // skills that share a project with this one glow too: the toolkit as it was actually used together
    if (ps.length) skills.forEach((s) => { if (s !== b && (s.dataset.p || '').split(' ').some((x) => ps.includes(x as Pk))) s.classList.add('kin') })
    evIdle.hidden = true
    evSkill.textContent = b.textContent
    evLabel.textContent = ps.length ? `Used in ${ps.length === 1 ? 'one project' : `${ps.length} projects`}` : 'Listed in her CV skills'
    evList.innerHTML = ps.length ? ps.map((k) => `<li>${P[k]}</li>`).join('') : '<li class="none">Not tied to a project shown on this site.</li>'
    if (!reduce) gsap.fromTo(evList.children, { opacity: 0, x: -8 }, { opacity: 1, x: 0, duration: 0.35, ease: 'expo.out', stagger: 0.04 })
  }
  skills.forEach((b) => {
    b.addEventListener('pointerenter', (e) => { if (e.pointerType === 'mouse') show(b) })
    b.addEventListener('focus', () => show(b))
    b.addEventListener('click', () => { pinned = pinned === b ? null : b; show(pinned) })
  })
  groups.addEventListener('pointerleave', (e) => { if (e.pointerType === 'mouse') show(pinned) })
  groups.addEventListener('focusout', (e) => { if (!groups.contains(e.relatedTarget as Node)) show(pinned) })

  // ---------- entrances ----------
  const chars = title.querySelectorAll<HTMLElement>('.ch .in')
  const deco = el.querySelectorAll<HTMLElement>('[data-deco]')
  const rows = kit.querySelectorAll<HTMLElement>('.ch6-row')
  const side = kit.querySelectorAll<HTMLElement>('.ch6-h, .ch6-evidence')
  if (reduce) {
    gsap.set([...chars, ...deco, ...rows, ...side], { opacity: 0 })
    ScrollTrigger.create({ trigger: title, start: 'top 50%', once: true, onEnter: () => gsap.to([...chars, ...title.querySelectorAll('[data-deco]')], { opacity: 1, duration: 0.6 }) })
    ScrollTrigger.create({ trigger: kit, start: 'top 50%', once: true, onEnter: () => gsap.to([...rows, ...side, ...kit.querySelectorAll('[data-deco]')], { opacity: 1, duration: 0.6 }) })
    return
  }

  // Lead: "Clarity" condenses out of the fog: each letter sharpens from a wide blur, the
  // tracking closes in, irregular order (the fog clears unevenly). Corners fade only.
  const order = [3, 0, 5, 1, 6, 2, 4]
  gsap.set(chars, { filter: 'blur(22px)', opacity: 0, scale: 1.12 })
  gsap.set(title.querySelector('.ch6-word'), { letterSpacing: '0.18em' })
  gsap.set(deco, { opacity: 0 })
  ScrollTrigger.create({
    trigger: title,
    start: 'top 40%',
    once: true,
    onEnter: () => {
      const tl = gsap.timeline()
      tl.to(title.querySelector('.ch6-word'), { letterSpacing: '-0.02em', duration: 2.2, ease: 'expo.out' }, 0)
      order.forEach((ci, k) => tl.to(chars[ci], { filter: 'blur(0px)', opacity: 1, scale: 1, duration: 1.4, ease: 'expo.out' }, 0.08 + k * 0.11 + (k % 2) * 0.04))
      tl.to(title.querySelectorAll('[data-deco]'), { opacity: 1, duration: 0.8, ease: 'power1.out' }, 0.9)
    },
  })
  gsap.to(title.querySelector('.ch6-word'), {
    yPercent: -12,
    ease: 'none',
    scrollTrigger: { trigger: title, start: 'top top', end: 'bottom top', scrub: true },
  })

  // Toolkit: the rows come into focus out of the fog, top to bottom; the side panel follows.
  gsap.set(rows, { filter: 'blur(10px)', opacity: 0.15, y: 10 })
  gsap.set(side, { opacity: 0, y: 12 })
  ScrollTrigger.create({
    trigger: kit,
    start: 'top 45%',
    once: true,
    onEnter: () => {
      gsap.timeline()
        .to(rows, { filter: 'blur(0px)', opacity: 1, y: 0, duration: 1.1, ease: 'expo.out', stagger: { each: 0.1, ease: 'power1.in' } }, 0)
        .to(side, { opacity: 1, y: 0, duration: 0.8, ease: 'expo.out', stagger: 0.08 }, 0.2)
        .to(kit.querySelectorAll('[data-deco]'), { opacity: 1, duration: 0.8 }, 0.5)
        .set(rows, { clearProps: 'filter' })
    },
  })
}
