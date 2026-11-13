import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import type { HeroScene } from '../gl/hero'
import type { Backdrop } from '../gl/backdrop'

gsap.registerPlugin(ScrollTrigger)

/**
 * Section 07 · Chapter III · Contact (the finale)
 * Background: cool-hongkong (Neon Hong Kong Night Ride), arriving as light painting over the fog.
 * The night ends where it began: her name returns as a signature, then one clear action, email.
 * Contact details are from the CV. The phone number is NEVER published (client decision).
 */
const EMAIL = 'pragyareddy103@gmail.com'
const LINKS = [
  { k: 'GitHub', href: 'https://github.com/pragya2409', label: 'github.com/pragya2409' },
  { k: 'LinkedIn', href: 'https://www.linkedin.com/in/pragya-reddy-a-5a6219424/', label: 'Pragya Reddy A' },
  { k: 'LeetCode', href: 'https://leetcode.com/u/FvvSYKrNjQ/', label: 'Problem solving' },
]
const ARROW = '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M4 12 L12 4 M6 4 H12 V10"/></svg>'

export function mountContact(root: HTMLElement, hero: HeroScene, backdrop: Backdrop) {
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  const u = hero.uniforms

  const el = document.createElement('section')
  el.className = 'ch7'
  el.setAttribute('aria-labelledby', 'ch7-h')
  el.innerHTML = `
    <p class="ch7-corner tl t-caps" data-deco>Chapter III<br>07 · Contact</p>
    <p class="ch7-corner tr t-caps" data-deco>Chennai,<br>Tamil Nadu</p>

    <div class="ch7-main">
      <h2 id="ch7-h" class="ch7-sign">
        <span class="sr-only">Contact Pragya Reddy A</span>
        <span class="ch7-script t-script" aria-hidden="true">Pragya</span>
        <span class="ch7-serif t-display" aria-hidden="true">Reddy A</span>
      </h2>

      <ul class="ch7-facts" role="list" data-support>
        <li><b class="t-display">9.26</b><span>CGPA out of 10 · B.Tech Computer Science and Engineering, SRM IST Ramapuram</span></li>
        <li><b class="t-secondary">HIEN</b><span>Research paper on interpretable emotional-influence modelling in multi-party conversations</span></li>
      </ul>

      <div class="ch7-cta" data-support>
        <a class="ch7-email" href="mailto:${EMAIL}"><span class="ch7-email-t">${EMAIL}</span><i class="ch7-tube" aria-hidden="true"></i></a>
        <div class="ch7-actions">
          <a class="ch7-btn primary" href="mailto:${EMAIL}">Email Pragya</a>
          <button type="button" class="ch7-btn ch7-copy">Copy address</button>
          <span class="ch7-copied" role="status" aria-live="polite"></span>
        </div>
      </div>

      <ul class="ch7-links" role="list" data-support>
        ${LINKS.map((l) => `<li><a href="${l.href}" target="_blank" rel="noopener noreferrer"><span class="t-caps">${l.k}</span><span class="ch7-link-t">${l.label}</span>${ARROW}</a></li>`).join('')}
      </ul>
    </div>

    <footer class="ch7-foot t-caps" data-deco>
      <span>Pragya Reddy A</span><span>AI/ML · B.Tech CSE 2024 — 2028</span>
    </footer>
  `
  root.appendChild(el)

  // ---------- background: fog skyline -> night ride, painted in by a beam of light ----------
  backdrop.add({ from: 'cool-fog', to: 'cool-hongkong', style: 'sweep', trigger: el, start: 'top bottom', end: 'top 10%' })
  ScrollTrigger.create({
    trigger: el,
    start: 'top bottom',
    end: 'bottom bottom',
    onUpdate: (self) => {
      if (!reduce) u.uNextZoom.value = 1.03 + self.progress * 0.03
      u.uNextBright.value = 1
    },
  })

  // ---------- copy the address ----------
  const copy = el.querySelector<HTMLButtonElement>('.ch7-copy')!
  const copied = el.querySelector<HTMLElement>('.ch7-copied')!
  let t: number | undefined
  copy.addEventListener('click', async () => {
    let ok = false
    try { await navigator.clipboard.writeText(EMAIL); ok = true } catch { ok = false }
    if (!ok) {
      // older browsers, or a clipboard permission refusal: copy through a temporary selection
      const ta = document.createElement('textarea')
      ta.value = EMAIL
      ta.setAttribute('readonly', '')
      ta.style.cssText = 'position:fixed;opacity:0;pointer-events:none'
      document.body.appendChild(ta)
      ta.select()
      try { ok = document.execCommand('copy') } catch { ok = false }
      ta.remove()
      copy.focus()
    }
    copied.textContent = ok ? 'Copied' : `Copy failed: ${EMAIL}`
    copy.classList.toggle('done', ok)
    window.clearTimeout(t)
    t = window.setTimeout(() => { copied.textContent = ''; copy.classList.remove('done') }, 2200)
  })

  // ---------- entrance: the signature writes itself, then the rest ----------
  const script = el.querySelector<HTMLElement>('.ch7-script')!
  const serif = el.querySelector<HTMLElement>('.ch7-serif')!
  const support = el.querySelectorAll<HTMLElement>('[data-support]')
  const deco = el.querySelectorAll<HTMLElement>('[data-deco]')
  const tube = el.querySelector<HTMLElement>('.ch7-tube')!
  if (reduce) {
    el.classList.add('lit')
    return
  }
  script.style.setProperty('--p', '-15%')
  gsap.set(serif, { opacity: 0, yPercent: 30 })
  gsap.set(support, { opacity: 0, y: 14 })
  gsap.set(deco, { opacity: 0 })
  ScrollTrigger.create({
    trigger: el,
    start: 'top 35%',
    once: true,
    onEnter: () => {
      const pen = { p: -15 }
      gsap.timeline({ onComplete: () => el.classList.add('lit') })
        .to(pen, { p: 130, duration: 1.8, ease: 'power1.inOut', onUpdate: () => script.style.setProperty('--p', `${pen.p}%`) }, 0)
        .to(serif, { opacity: 1, yPercent: 0, duration: 1.1, ease: 'expo.out' }, 1.2)
        .to(support, { opacity: 1, y: 0, duration: 0.9, ease: 'expo.out', stagger: { each: 0.12, ease: 'power1.in' } }, 1.5)
        .to(deco, { opacity: 1, duration: 0.8, ease: 'power1.out' }, 1.9)
        // the neon tube under the address switches on last, like Chapter I's sign
        .call(() => tube.classList.add('on'), undefined, 2.2)
    },
  })
}
