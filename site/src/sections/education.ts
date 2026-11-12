import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import type { HeroScene } from '../gl/hero'
import type { Backdrop } from '../gl/backdrop'

gsap.registerPlugin(ScrollTrigger)

/**
 * Section 02 · Chapter I · Education
 * Background: red-rooftop-gate, arriving through a falling-rain dissolve from the crimson image.
 * Every fact below is from the CV.
 */
const COURSEWORK = ['Operating Systems', 'DBMS', 'Data Structures & Algorithms', 'Machine Learning', 'OOP']

export function mountEducation(root: HTMLElement, hero: HeroScene, backdrop: Backdrop) {
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  const u = hero.uniforms

  const el = document.createElement('section')
  el.className = 'ch2'
  el.setAttribute('aria-labelledby', 'ch2-h')
  el.innerHTML = `
    <div class="ch2-pin">
      <p class="ch2-corner tl t-caps" data-deco>Chapter I<br>02 · Education</p>
      <p class="ch2-corner tr t-caps" data-deco>Aug 2024 —<br>May 2028</p>

      <div class="ch2-grid">
        <div class="ch2-school">
          <h2 id="ch2-h" class="ch2-name t-secondary"><span class="sr-only">Education: </span>
            <span class="line"><span class="in">SRM Institute of</span></span>
            <span class="line"><span class="in">Science and Technology,</span></span>
            <span class="line"><span class="in">Ramapuram</span></span>
          </h2>
          <p class="ch2-degree" data-support>B.Tech in Computer Science and Engineering</p>
        </div>

        <div class="ch2-score" aria-label="CGPA 9.26 out of 10">
          <p class="t-caps ch2-score-label" data-support aria-hidden="true">CGPA</p>
          <p class="ch2-num t-display" aria-hidden="true"><span class="in">9.26</span></p>
          <p class="t-caps ch2-of" data-support aria-hidden="true">out of 10</p>
        </div>
      </div>

      <div class="ch2-course">
        <h3 class="t-caps" data-support>Relevant coursework</h3>
        <ul role="list">
          ${COURSEWORK.map((c) => `<li><i class="rule"></i><span class="t-secondary">${c}</span></li>`).join('')}
        </ul>
      </div>
    </div>
  `
  root.appendChild(el)

  // ---------- background: rain dissolve crimson -> rooftop ----------
  backdrop.add({ from: 'red-crimson-haze', to: 'red-rooftop-gate', style: 'rain', trigger: el })
  ScrollTrigger.create({
    trigger: el,
    start: 'top bottom',
    end: 'top 15%',
    onUpdate: (self) => {
      if (!reduce) u.uNextZoom.value = 1.03 + self.progress * 0.02
      // from the dimmed reading screen back up to full for the new photograph
      u.uNextBright.value = 0.6 + 0.4 * gsap.utils.clamp(0, 1, self.progress * 1.4)
    },
  })

  // ---------- content ----------
  // Lead: the school name lines + the 9.26 figure (one beat).
  // Support: degree, labels. Decoration: corners (fade only). Coursework: rules draw, names follow.
  const lines = el.querySelectorAll<HTMLElement>('.ch2-name .in')
  const num = el.querySelector<HTMLElement>('.ch2-num .in')!
  const support = el.querySelectorAll<HTMLElement>('[data-support]')
  const deco = el.querySelectorAll<HTMLElement>('[data-deco]')
  const rules = el.querySelectorAll<HTMLElement>('.ch2-course .rule')
  const courses = el.querySelectorAll<HTMLElement>('.ch2-course li span')

  if (reduce) {
    gsap.set([lines, num, support, deco, courses], { opacity: 0 })
    ScrollTrigger.create({
      trigger: el, start: 'top 35%', once: true,
      onEnter: () => gsap.to([lines, num, support, deco, courses], { opacity: 1, duration: 0.6, ease: 'power1.out' }),
    })
    return
  }

  gsap.set(lines, { yPercent: 110 })
  gsap.set(num, { yPercent: 105 })
  gsap.set(support, { opacity: 0, y: 12 })
  gsap.set(deco, { opacity: 0 })
  gsap.set(rules, { scaleX: 0 })
  gsap.set(courses, { opacity: 0, y: 10 })

  ScrollTrigger.create({
    trigger: el,
    start: 'top 30%', // once the rain has mostly cleared
    once: true,
    onEnter: () => {
      const tl = gsap.timeline()
      tl.to(lines, { yPercent: 0, duration: 1.1, ease: 'expo.out', stagger: { each: 0.09, ease: 'power1.in' } }, 0)
        .to(num, { yPercent: 0, duration: 1.3, ease: 'expo.out' }, 0.05)
        .to(support, { opacity: 1, y: 0, duration: 0.8, ease: 'expo.out', stagger: 0.05 }, 0.25)
        .to(deco, { opacity: 1, duration: 0.8, ease: 'power1.out' }, 0.5)
    },
  })

  ScrollTrigger.create({
    trigger: el.querySelector('.ch2-course'),
    start: 'top 88%',
    once: true,
    onEnter: () => {
      gsap.to(rules, { scaleX: 1, duration: 0.9, ease: 'expo.out', stagger: { each: 0.07, ease: 'power1.in' } })
      gsap.to(courses, { opacity: 1, y: 0, duration: 0.7, ease: 'expo.out', stagger: { each: 0.07, ease: 'power1.in' }, delay: 0.15 })
    },
  })
}
