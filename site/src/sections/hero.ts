import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { createHero } from '../gl/hero'

gsap.registerPlugin(ScrollTrigger)

export function mountHero(root: HTMLElement) {
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches

  root.innerHTML = `
    <canvas class="gl" aria-hidden="true"></canvas>
    <section class="hero" aria-label="Pragya Reddy A">
      <div class="hero-pin">
        <p class="corner tl t-caps" data-fade>Pragya Reddy A<br>Chennai, Tamil Nadu</p>
        <p class="corner tc t-caps" data-fade>B.Tech · Computer Science<br>and Engineering</p>
        <p class="corner tr t-caps" data-fade>SRM Institute of Science<br>and Technology, Ramapuram</p>

        <h1 class="lockup" aria-label="Pragya Reddy">
          <span class="script t-script" aria-hidden="true"><span class="ink">Pragya</span><span class="glint">Pragya</span></span>
          <span class="serif t-display" aria-hidden="true">Reddy</span>
        </h1>
        <div class="under" data-fade>
          <i class="rule"></i><span class="pill t-caps">2024 — 2028</span><i class="rule"></i>
        </div>

        <p class="corner bl t-caps" data-fade>CGPA<br>9.26 / 10</p>
        <p class="corner bc t-caps" data-fade><span class="cue"></span>Scroll</p>
        <p class="corner br t-caps" data-fade>AI &amp; LLMs<br>Explainable AI</p>
      </div>
    </section>
  `

  const canvas = root.querySelector<HTMLCanvasElement>('.gl')!
  const hero = createHero(canvas, { reducedMotion: reduce })
  const u = hero.uniforms
  const pin = root.querySelector<HTMLElement>('.hero-pin')!
  const serif = root.querySelector<HTMLElement>('.serif')!
  const script = root.querySelector<HTMLElement>('.script')!
  const fades = root.querySelectorAll<HTMLElement>('[data-fade]')

  // ---------- intro ----------
  // "Pragya" leads: written on left to right with a soft hot edge, while the city exposes.
  // "Reddy" follows quietly once the name is written.
  if (reduce) {
    gsap.set(script, { '--p': '130%' })
    gsap.set([script, serif, fades], { opacity: 0 })
    hero.ready.then(() => {
      gsap.to(u.uReveal, { value: 1, duration: 0.6, ease: 'power1.out' })
      gsap.to([script, serif, fades], { opacity: 1, duration: 0.6, ease: 'power1.out' })
    })
  } else {
    gsap.set(script, { '--p': '-15%' })
    gsap.set(serif, { opacity: 0, yPercent: 35, filter: 'blur(6px)' })
    gsap.set(fades, { opacity: 0 })
    hero.ready.then(() => {
      const tl = gsap.timeline()
      tl.to(u.uReveal, { value: 1, duration: 1.1, ease: 'power2.out' }, 0)
        .to(u.uStretch, { value: 1, duration: 3.4, ease: 'power2.inOut' }, 0.25)
        .to(script, { '--p': '130%', duration: 2.3, ease: 'power1.inOut' }, 0.9)
        .to(serif, { opacity: 1, yPercent: 0, filter: 'blur(0px)', duration: 1.3, ease: 'expo.out' }, 2.9)
        .to(fades, { opacity: 1, duration: 0.9, ease: 'power1.out', stagger: 0.06 }, 3.2)
    })
  }

  // ---------- scroll exit ----------
  ScrollTrigger.create({
    trigger: root.querySelector('.hero'),
    start: 'top top',
    end: 'bottom top',
    scrub: reduce ? true : 0.6,
    onUpdate: (self) => {
      const p = self.progress
      u.uExit.value = p
      // type lifts with the streaks and is gone before the dissolve peaks
      const t = Math.min(p / 0.45, 1)
      pin.style.opacity = String(1 - t)
      pin.style.transform = reduce ? '' : `translate3d(0, ${-t * 9}vh, 0)`
      pin.style.visibility = t >= 1 ? 'hidden' : 'visible'
    },
  })

  return hero
}
