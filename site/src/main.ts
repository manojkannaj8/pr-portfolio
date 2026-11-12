import '@fontsource/pinyon-script/latin-400.css'
import '@fontsource-variable/noto-serif-display/wdth.css'
import '@fontsource-variable/archivo/wdth.css'
import './style.css'

import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Lenis from 'lenis'
import { mountHero } from './sections/hero'
import { mountIntro } from './sections/intro'
import { mountEducation } from './sections/education'
import { mountResearch } from './sections/research'
import { mountFeatured } from './sections/featured'
import { createBackdrop } from './gl/backdrop'
import { createComet } from './fx/comet'

const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches

if (!reduce) {
  const lenis = new Lenis({ lerp: 0.1 })
  lenis.on('scroll', ScrollTrigger.update)
  gsap.ticker.add((t) => lenis.raf(t * 1000))
  gsap.ticker.lagSmoothing(0)
}

history.scrollRestoration = 'manual'
window.scrollTo(0, 0)

document.fonts.ready.then(() => {
  const app = document.querySelector<HTMLDivElement>('#app')!
  const hero = mountHero(app)
  mountIntro(app, hero)
  // chapter photographs after the hero, in scroll order (crimson is already loaded by the hero)
  const backdrop = createBackdrop(hero, 'red-crimson-haze')
  mountEducation(app, hero, backdrop)
  mountResearch(app, hero, backdrop)
  mountFeatured(app, hero, backdrop)

  // cursor comet: palette follows the chapter in view
  const comet = createComet()
  ScrollTrigger.create({
    trigger: '.ch1',
    start: 'top 60%',
    onEnter: () => comet.setPalette('red'),
    onLeaveBack: () => comet.setPalette('hero'),
  })
  ScrollTrigger.create({
    trigger: '.ch4',
    start: 'top 55%',
    onEnter: () => comet.setPalette('gold'),
    onLeaveBack: () => comet.setPalette('red'),
  })
  ScrollTrigger.refresh()
  if (import.meta.env.DEV) Object.assign(window, { __hero: hero, __comet: comet, __st: ScrollTrigger, __gsap: gsap })
})
