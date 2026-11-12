import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import type { HeroScene } from '../gl/hero'
import type { Backdrop } from '../gl/backdrop'
import { argoHTML, mountArgo } from './work/argo'
import { creditHTML, mountCredit } from './work/credit'

gsap.registerPlugin(ScrollTrigger)

/**
 * Section 04 · Chapter II "Reflection" · Featured work (first gold section)
 * Background: gold-reflections, arriving as rising water from the red grid (the chapter change).
 * Every fact below is from the CV (Projects 1 and 2).
 *
 * Three screens: chapter title · ARGO Ocean Data · Credit Risk Scoring.
 */
const PROJECTS = [
  {
    id: 'argo',
    title: ['AI-Powered Conversational', 'Interface for ARGO Ocean Data'],
    summary:
      'A plain-English chat interface over ARGO float data: temperature, salinity and BGC. An LLM grounded by retrieval-augmented generation turns each question into a SQL query. An automated Python ETL pipeline converts raw NetCDF files into PostgreSQL tables and indexes float metadata in a vector database; a Streamlit + Plotly dashboard reports trajectories, depth–time profiles and profile comparisons.',
    stack: ['Python', 'LLMs', 'RAG', 'PostgreSQL', 'Streamlit'],
    piece: argoHTML(),
  },
  {
    id: 'credit',
    title: ['Credit Risk Scoring with Reject', 'Inference & Counterfactuals'],
    summary:
      'A stacked ensemble on the Home Credit dataset of ~307K applicants, evaluated with 5-fold out-of-fold cross-validation, beats the best single model on AUC.',
    stack: ['Python', 'LightGBM', 'XGBoost', 'SHAP', 'DiCE'],
    piece: creditHTML(),
  },
]

function projectHTML(p: (typeof PROJECTS)[number], n: number) {
  return `
    <section class="ch4-proj ch4-${p.id}" aria-labelledby="ch4-${p.id}-h">
      <p class="ch4-corner tl t-caps" data-deco>Chapter II<br>04 · Featured work</p>
      <p class="ch4-corner tr t-caps" data-deco>Project ${n + 1} of 2</p>
      <div class="ch4-text">
        <h3 id="ch4-${p.id}-h" class="ch4-name t-secondary">
          ${p.title.map((l) => `<span class="line"><span class="in">${l}</span></span>`).join(' ')}
        </h3>
        <p class="ch4-sum" data-support>${p.summary}</p>
        <ul class="ch4-stack t-caps" role="list" aria-label="Tools" data-support>${p.stack.map((t) => `<li>${t}</li>`).join('')}</ul>
      </div>
      <div class="ch4-piece" data-piece>${p.piece}</div>
    </section>`
}

export function mountFeatured(root: HTMLElement, hero: HeroScene, backdrop: Backdrop) {
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  const u = hero.uniforms

  const word = [...'Reflection'].map((c) => `<span class="ch"><span class="in">${c}</span></span>`).join('')

  const el = document.createElement('div')
  el.className = 'ch4'
  el.innerHTML = `
    <section class="ch4-title" aria-labelledby="ch4-h">
      <p class="ch4-corner tl t-caps" data-deco>Chapter II<br>of III</p>
      <p class="ch4-corner tr t-caps" data-deco>Featured work</p>
      <div class="ch4-head">
        <h2 id="ch4-h" class="ch4-word t-secondary" aria-label="Reflection">${word}</h2>
        <p class="ch4-mirror t-secondary" aria-hidden="true">Reflection</p>
      </div>
      <p class="ch4-corner bl t-caps" data-deco>Two projects</p>
      <p class="ch4-corner br t-caps" data-deco>LLMs · Explainable AI</p>
    </section>
    ${PROJECTS.map((p, n) => projectHTML(p, n)).join('')}
  `
  root.appendChild(el)

  const title = el.querySelector<HTMLElement>('.ch4-title')!
  const projs = el.querySelectorAll<HTMLElement>('.ch4-proj')
  mountArgo(el.querySelector<HTMLElement>('.ch4-argo')!, reduce)
  mountCredit(el.querySelector<HTMLElement>('.ch4-credit')!, reduce)

  // ---------- background: the chapter change, red grid -> gold, as rising water ----------
  backdrop.add({ from: 'red-grid', to: 'gold-reflections', style: 'water', trigger: el, start: 'top bottom', end: 'top 10%' })
  ScrollTrigger.create({
    trigger: el,
    start: 'top bottom',
    end: 'top 10%',
    onUpdate: (self) => {
      // pull back out of the red chapter as the water rises, and bring the light back up
      if (!reduce) u.uNextZoom.value = 1.08 - self.progress * 0.06
      u.uNextBright.value = 0.58 + 0.42 * self.progress
    },
  })
  // full photograph behind the chapter title; dimmed behind the project reading screens
  ScrollTrigger.create({
    trigger: projs[0],
    start: 'top 80%',
    end: 'top 20%',
    onUpdate: (self) => {
      u.uNextBright.value = 1 - self.progress * 0.2
      if (!reduce) u.uNextZoom.value = 1.02 + self.progress * 0.03
    },
  })

  // ---------- chapter title ----------
  const chars = title.querySelectorAll<HTMLElement>('.ch .in')
  const mirror = title.querySelector<HTMLElement>('.ch4-mirror')!
  const tDeco = title.querySelectorAll<HTMLElement>('[data-deco]')

  if (reduce) {
    gsap.set([...chars, mirror, ...tDeco], { opacity: 0 })
    ScrollTrigger.create({
      trigger: title, start: 'top 50%', once: true,
      onEnter: () => {
        gsap.to([...chars, ...tDeco], { opacity: 1, duration: 0.6 })
        gsap.to(mirror, { opacity: 0.3, duration: 0.6 })
      },
    })
    projs.forEach((p) => {
      const all = p.querySelectorAll<HTMLElement>('.ch4-name .in, [data-support], [data-deco], [data-piece]')
      gsap.set(all, { opacity: 0 })
      ScrollTrigger.create({ trigger: p, start: 'top 45%', once: true, onEnter: () => gsap.to(all, { opacity: 1, duration: 0.6 }) })
    })
    return
  }

  // Lead: the word surfaces. Letters rise out of the waterline from the middle outwards;
  // once they have landed, their reflection fades in under them. Corners fade only.
  gsap.set(chars, { yPercent: 108 })
  gsap.set(mirror, { opacity: 0 })
  gsap.set(tDeco, { opacity: 0 })
  ScrollTrigger.create({
    trigger: title,
    start: 'top 40%',
    once: true,
    onEnter: () => {
      gsap.timeline()
        .to(chars, { yPercent: 0, duration: 1.3, ease: 'expo.out', stagger: { each: 0.045, from: 'center', ease: 'power1.in' } }, 0)
        .to(mirror, { opacity: 1, duration: 1.4, ease: 'power2.out' }, 0.75)
        .to(tDeco, { opacity: 1, duration: 0.8, ease: 'power1.out' }, 0.7)
    },
  })
  gsap.to(title.querySelector('.ch4-head'), {
    yPercent: -14,
    ease: 'none',
    scrollTrigger: { trigger: title, start: 'top top', end: 'bottom top', scrub: true },
  })

  // ---------- projects ----------
  // Lead: the working piece rises in with the title lines, so the work is the first thing seen.
  // Support: summary and tools follow. Corners fade only.
  projs.forEach((p) => {
    const lines = p.querySelectorAll<HTMLElement>('.ch4-name .in')
    const support = p.querySelectorAll<HTMLElement>('[data-support]')
    const deco = p.querySelectorAll<HTMLElement>('[data-deco]')
    const piece = p.querySelector<HTMLElement>('[data-piece]')!
    gsap.set(lines, { yPercent: 110 })
    gsap.set(support, { opacity: 0, y: 12 })
    gsap.set(deco, { opacity: 0 })
    gsap.set(piece, { opacity: 0, y: 28, clipPath: 'inset(0 0 100% 0)' })
    ScrollTrigger.create({
      trigger: p,
      start: 'top 55%',
      once: true,
      onEnter: () => {
        gsap.timeline()
          .to(piece, { opacity: 1, y: 0, clipPath: 'inset(0 0 0% 0)', duration: 1.2, ease: 'expo.out' }, 0)
          .to(lines, { yPercent: 0, duration: 1.1, ease: 'expo.out', stagger: 0.1 }, 0.05)
          .to(support, { opacity: 1, y: 0, duration: 0.8, ease: 'expo.out', stagger: 0.08 }, 0.25)
          .to(deco, { opacity: 1, duration: 0.8, ease: 'power1.out' }, 0.5)
          .set(piece, { clearProps: 'clipPath' })
      },
    })
  })
}
