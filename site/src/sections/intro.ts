import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import type { HeroScene } from '../gl/hero'

gsap.registerPlugin(ScrollTrigger)

/**
 * Section 01 · Chapter I "Signal" · Introduction
 * Background: red-crimson-haze (drawn by the hero canvas as its "next" image).
 * Every fact below is from the CV.
 */

// Statement: built only from CV wording (degree, institution, skill groups, projects)
const STATEMENT =
  'A Computer Science undergraduate at SRM IST, Ramapuram, working where machine learning meets language: large language models grounded by retrieval, and models that explain their own predictions.'

const SIGNALS = [
  {
    k: '01',
    h: 'AI & LLMs',
    p: 'Large language models, retrieval-augmented generation, vector databases and Hugging Face Transformers.',
  },
  {
    k: '02',
    h: 'Explainable AI',
    p: 'SHAP explanations, DiCE counterfactuals and fairness auditing.',
  },
  {
    k: '03',
    h: 'Machine learning',
    p: 'Graph neural networks, LightGBM and XGBoost ensembles, HMMs, Markov chains and Monte Carlo simulation.',
  },
]

export function mountIntro(root: HTMLElement, hero: HeroScene) {
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  const u = hero.uniforms

  const words = STATEMENT.split(' ').map((w) => `<span class="w">${w}</span>`).join(' ')
  const title = [...'Signal'].map((c) => `<span class="tube">${c}</span>`).join('')

  const el = document.createElement('div')
  el.className = 'ch1'
  el.innerHTML = `
    <section class="ch1-title" aria-labelledby="ch1-h">
      <p class="ch1-corner tl t-caps" data-deco>Chapter I<br>of III</p>
      <p class="ch1-corner tr t-caps" data-deco>Introduction</p>
      <div class="ch1-head">
        <p class="ch1-kicker t-caps" data-support><i class="rule"></i>Chapter I<i class="rule"></i></p>
        <h2 id="ch1-h" class="ch1-word t-secondary" aria-label="Signal">${title}</h2>
      </div>
      <p class="ch1-corner bl t-caps" data-deco>Chennai,<br>Tamil Nadu</p>
      <p class="ch1-corner br t-caps" data-deco>B.Tech CSE<br>2024 — 2028</p>
    </section>

    <section class="ch1-intro" aria-label="Introduction">
      <div class="ch1-pin">
        <p class="ch1-statement t-secondary">${words}</p>
        <ul class="ch1-signals" role="list">
          ${SIGNALS.map(
            (s) => `<li><span class="t-caps num">${s.k}</span><h3 class="t-caps">${s.h}</h3><p>${s.p}</p></li>`,
          ).join('')}
        </ul>
      </div>
    </section>
  `
  root.appendChild(el)

  const tubes = el.querySelectorAll<HTMLElement>('.tube')
  const support = el.querySelectorAll<HTMLElement>('[data-support]')
  const deco = el.querySelectorAll<HTMLElement>('[data-deco]')
  const wordEls = el.querySelectorAll<HTMLElement>('.w')
  const signals = el.querySelector<HTMLElement>('.ch1-signals')!

  // ---------- background grade: slow push into the crimson, dim for reading ----------
  ScrollTrigger.create({
    trigger: el,
    start: 'top bottom',
    end: 'bottom bottom',
    scrub: true,
    onUpdate: (self) => {
      const p = self.progress
      if (!reduce) u.uNextZoom.value = 1 + p * 0.03 // gentle: enlarging softens the photo
      // full strength behind the title; dimmed to 60% only behind the reading screen, for legibility
      const read = gsap.utils.clamp(0, 1, (p - 0.42) / 0.25)
      u.uNextBright.value = 1 - read * 0.4
    },
  })

  // ---------- title: the word switches on like neon ----------
  // Lead: "Signal" tubes, irregular ignition (not a uniform stagger).
  // Support: kicker, with the first tube. Decoration: corners fade only.
  if (reduce) {
    gsap.set([tubes, support, deco], { opacity: 0 })
    ScrollTrigger.create({
      trigger: el.querySelector('.ch1-title'),
      start: 'top 55%',
      once: true,
      onEnter: () => gsap.to([tubes, support, deco], { opacity: 1, duration: 0.6, ease: 'power1.out' }),
    })
  } else {
    tubes.forEach((t) => t.classList.add('off'))
    gsap.set(support, { opacity: 0, y: 14 })
    gsap.set(deco, { opacity: 0 })
    // ignition order and timing by hand: S first, then a, l, i, g, n
    const ignite = [0, 0.42, 0.3, 0.55, 0.12, 0.22]
    ScrollTrigger.create({
      trigger: el.querySelector('.ch1-title'),
      start: 'top 45%',
      once: true,
      onEnter: () => {
        tubes.forEach((t, i) => {
          t.style.animationDelay = `${ignite[i]}s`
          t.classList.remove('off')
          t.classList.add('on')
        })
        gsap.to(support, { opacity: 1, y: 0, duration: 0.9, ease: 'expo.out', delay: 0.05 })
        gsap.to(deco, { opacity: 1, duration: 0.8, ease: 'power1.out', delay: 0.6 })
      },
    })
    // the whole word drifts up slightly as the chapter scrolls on (title only, not body text)
    gsap.to(el.querySelector('.ch1-head'), {
      yPercent: -18,
      ease: 'none',
      scrollTrigger: { trigger: el.querySelector('.ch1-title'), start: 'top top', end: 'bottom top', scrub: true },
    })
  }

  // ---------- statement: words light up in reading order as you scroll ----------
  if (reduce) {
    wordEls.forEach((w) => w.classList.add('lit'))
  } else {
    gsap.fromTo(
      wordEls,
      { opacity: 0.16 },
      {
        opacity: 1,
        ease: 'none',
        stagger: 0.12,
        scrollTrigger: { trigger: el.querySelector('.ch1-intro'), start: 'top 70%', end: 'center 45%', scrub: 0.4 },
      },
    )
  }

  // ---------- signals: one entrance for the row ----------
  if (!reduce) {
    gsap.set(signals.children, { opacity: 0, y: 16 })
    ScrollTrigger.create({
      trigger: signals,
      start: 'top 85%',
      once: true,
      onEnter: () =>
        gsap.to(signals.children, { opacity: 1, y: 0, duration: 0.7, ease: 'expo.out', stagger: { each: 0.1, ease: 'power1.in' } }),
    })
  }
}
