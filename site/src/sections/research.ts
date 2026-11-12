import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import type { HeroScene } from '../gl/hero'
import type { Backdrop } from '../gl/backdrop'

gsap.registerPlugin(ScrollTrigger)

/**
 * Section 03 · Chapter I · Experience & Research (last red section)
 * Background: red-grid (beams animated in the shader), arriving through grid tiles from the rooftop.
 * Every fact below is from the CV (Experience and Research; Achievements).
 *
 * Three screens: Experience · HIEN (title) · How HIEN works (interactive pipeline diagram).
 */
const STACK = ['Python', 'PyTorch Geometric', 'WavLM', 'DeBERTa-v3', 'HMM', 'SHAP']
const REEL = 'Stack Roulette'
const FILLER = 'ABCDEFGHIJKLMNOPRSTUVWXYZ'

// ---------- pipeline diagram ----------
// Speaker nodes are illustrative (the CV gives no count); every label is the CV's own term.
const NODES: [number, number][] = [[58, 66], [168, 30], [270, 92], [218, 196], [86, 178]]
const EDGES: [number, number][] = [[0, 1], [1, 2], [2, 3], [3, 4], [4, 0], [0, 3], [1, 4], [2, 0]]

const INFO: Record<string, string> = {
  idle: 'Point at, tap or tab to any step to see what it does.',
  audio: 'Audio: speech embeddings from WavLM.',
  text: 'Text: transcript embeddings from DeBERTa-v3.',
  fuse: 'Fusion: audio and text embeddings are fused before they reach the graph.',
  graph: 'Graph neural network (PyTorch Geometric): models how one speaker’s emotion shifts another’s, on MELD and EmoryNLP.',
  node: 'Each edge carries emotional influence from one speaker to the next.',
  score: 'Result: macro-F1 0.228 against a 0.225 baseline.',
  explain: 'Interpretability: HMM, GMM and SHAP explain the predictions.',
}

function reelHTML(phrase: string) {
  let i = 0
  // each word stays whole (nowrap); phones may break between the words
  return phrase
    .split(' ')
    .map((word) => {
      const slots = [...word].map((ch) => {
        const n = 7 + i // later letters spin longer
        let strip = ''
        for (let k = 0; k < n; k++) strip += `<span>${FILLER[(i * 7 + k * 5) % FILLER.length]}</span>`
        i++
        return `<span class="slot"><span class="ghost">${ch}</span><span class="strip">${strip}<span>${ch}</span></span></span>`
      })
      return `<span class="word">${slots.join('')}</span>`
    })
    .join(' ')
}

const conn = (paths: string[]) =>
  `<svg class="pl-conn" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">${paths
    .map((d) => `<path class="wire" d="${d}" pathLength="1"/><path class="spark" d="${d}" pathLength="1"/>`)
    .join('')}</svg>`

function graphSVG() {
  return `<svg class="pl-graph" viewBox="0 0 330 230" aria-hidden="true">
    ${EDGES.map(([a, b], i) => {
      const d = `M${NODES[a][0]} ${NODES[a][1]} L${NODES[b][0]} ${NODES[b][1]}`
      return `<path class="edge" data-a="${a}" data-b="${b}" d="${d}" pathLength="1"/>
              <path class="flow" data-a="${a}" data-b="${b}" d="${d}" pathLength="1" style="--dur:${(1.9 + ((i * 37) % 13) / 9).toFixed(2)}s;--del:${(-(i * 0.57) % 2.2).toFixed(2)}s"/>`
    }).join('')}
    ${NODES.map(([x, y], i) => `<g class="spk" data-i="${i}"><circle class="halo" cx="${x}" cy="${y}" r="19"/><circle class="core" cx="${x}" cy="${y}" r="8"/><circle class="hit" cx="${x}" cy="${y}" r="24"/></g>`).join('')}
  </svg>`
}

function pipelineHTML() {
  return `
  <div class="pl" data-active="">
    <div class="pl-col pl-in">
      <button type="button" class="pl-step" data-k="audio">
        <span class="pl-tag t-caps">01 · Audio</span>
        <span class="pl-name t-secondary">WavLM</span>
        <span class="pl-wave" aria-hidden="true">${'<i></i>'.repeat(14)}</span>
      </button>
      <button type="button" class="pl-step" data-k="text">
        <span class="pl-tag t-caps">01 · Text</span>
        <span class="pl-name t-secondary">DeBERTa-v3</span>
        <span class="pl-lines" aria-hidden="true"><i></i><i></i><i></i></span>
      </button>
    </div>
    ${conn(['M0 25 C55 25 45 50 100 50', 'M0 75 C55 75 45 50 100 50'])}
    <div class="pl-col pl-mid">
      <button type="button" class="pl-step pl-fuse" data-k="fuse">
        <span class="pl-diamond" aria-hidden="true"></span>
        <span class="pl-tag t-caps">02 · Fusion</span>
        <span class="pl-name t-secondary">Fused embeddings</span>
      </button>
    </div>
    ${conn(['M0 50 L100 50'])}
    <div class="pl-col pl-gnn">
      <button type="button" class="pl-step pl-graphbox" data-k="graph">
        <span class="pl-head">
          <span class="pl-tag t-caps">03 · Graph neural network</span>
          <span class="pl-sub t-caps">PyTorch Geometric · MELD · EmoryNLP</span>
        </span>
        ${graphSVG()}
        <span class="pl-sub pl-note t-caps">Speakers · emotional influence</span>
      </button>
    </div>
    ${conn(['M0 50 C55 50 45 25 100 25', 'M0 50 C55 50 45 75 100 75'])}
    <div class="pl-col pl-out">
      <button type="button" class="pl-step" data-k="score">
        <span class="pl-tag t-caps">04 · Macro-F1</span>
        <span class="pl-score"><b class="t-display">0.228</b><span class="t-caps">vs 0.225 baseline</span></span>
      </button>
      <button type="button" class="pl-step" data-k="explain">
        <span class="pl-tag t-caps">04 · Explained by</span>
        <span class="pl-name t-secondary">HMM · GMM · SHAP</span>
      </button>
    </div>
  </div>
  <p class="pl-info" aria-live="polite"><span class="pl-info-k t-caps">How it works</span><span class="pl-info-t">${INFO.idle}</span></p>`
}

export function mountResearch(root: HTMLElement, hero: HeroScene, backdrop: Backdrop) {
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  const u = hero.uniforms

  const el = document.createElement('div')
  el.className = 'ch3'
  el.innerHTML = `
    <section class="ch3-exp" aria-labelledby="ch3-exp-h">
      <p class="ch3-corner tl t-caps" data-deco>Chapter I<br>03 · Experience</p>
      <p class="ch3-corner tr t-caps" data-deco>2026</p>
      <div class="ch3-exp-head">
        <h2 id="ch3-exp-h" class="ch3-club t-secondary"><span class="sr-only">Experience: </span>
          <span class="line"><span class="in">Logic Play</span></span>
          <span class="line"><span class="in">Technical Club</span></span>
        </h2>
        <p class="ch3-role t-caps" data-support>Technical Team Member · 2026</p>
      </div>
      <div class="ch3-exp-body">
        <p class="ch3-lead" data-support>Helped run and judged</p>
        <p class="ch3-reel t-display"><span class="sr-only">${REEL}</span><span aria-hidden="true">${reelHTML(REEL)}</span></p>
        <p class="ch3-lead" data-support>a hackathon where teams built an app on a randomly drawn tech stack.</p>
      </div>
    </section>

    <section class="ch3-res" aria-labelledby="ch3-res-h">
      <p class="ch3-corner tl t-caps" data-deco>Chapter I<br>03 · Research</p>
      <p class="ch3-corner tr t-caps" data-deco>2026<br>Research project</p>
      <div class="ch3-res-head">
        <h2 id="ch3-res-h" class="ch3-hien t-display"><span class="sr-only">Research: </span><span class="in">HIEN</span></h2>
        <p class="ch3-title t-secondary" data-support>Interpretable Emotional Influence Modelling in Multi-Party Conversations</p>
      </div>
      <div class="ch3-res-side">
        <p class="ch3-desc" data-support>A graph neural network over fused audio + text embeddings models how one speaker’s emotion shifts another’s, on the MELD and EmoryNLP datasets. HMM, GMM and SHAP explain the predictions.</p>
        <ul class="ch3-stack t-caps" role="list" aria-label="Tools" data-support>
          ${STACK.map((s) => `<li>${s}</li>`).join('')}
        </ul>
        <p class="ch3-paper t-caps" data-support><span>Achievement</span> Research paper</p>
      </div>
    </section>

    <section class="ch3-model" aria-labelledby="ch3-model-h">
      <p class="ch3-corner tl t-caps" data-deco>Chapter I<br>03 · Research</p>
      <div class="ch3-model-head">
        <h3 id="ch3-model-h" class="ch3-model-h t-secondary" data-support>How HIEN works</h3>
      </div>
      ${pipelineHTML()}
    </section>
  `
  root.appendChild(el)

  const exp = el.querySelector<HTMLElement>('.ch3-exp')!
  const res = el.querySelector<HTMLElement>('.ch3-res')!
  const model = el.querySelector<HTMLElement>('.ch3-model')!
  const pl = model.querySelector<HTMLElement>('.pl')!

  // ---------- background: grid tiles rooftop -> red grid ----------
  backdrop.add({ from: 'red-rooftop-gate', to: 'red-grid', style: 'grid', trigger: el })
  ScrollTrigger.create({
    trigger: el,
    start: 'top bottom',
    end: 'bottom bottom',
    onUpdate: (self) => {
      if (!reduce) u.uNextZoom.value = 1.05 + self.progress * 0.03
    },
  })
  // full photograph (beams moving) behind Experience and HIEN; dimmed for the diagram
  ScrollTrigger.create({
    trigger: model,
    start: 'top 75%',
    end: 'top 15%',
    onUpdate: (self) => { u.uNextBright.value = 1 - self.progress * 0.42 },
    onLeaveBack: () => { u.uNextBright.value = 1 },
  })

  setupPipeline(pl, model.querySelector<HTMLElement>('.pl-info-t')!)

  // ---------- entrances ----------
  const xLines = exp.querySelectorAll<HTMLElement>('.ch3-club .in')
  const xSupport = exp.querySelectorAll<HTMLElement>('[data-support]')
  const xDeco = exp.querySelectorAll<HTMLElement>('[data-deco]')
  const strips = exp.querySelectorAll<HTMLElement>('.strip')
  const hien = res.querySelector<HTMLElement>('.ch3-hien .in')!
  const rSupport = res.querySelectorAll<HTMLElement>('[data-support]')
  const rDeco = res.querySelectorAll<HTMLElement>('[data-deco]')
  const mSupport = model.querySelectorAll<HTMLElement>('[data-support], [data-deco]')
  const steps = pl.querySelectorAll<HTMLElement>('.pl-step')
  const wires = pl.querySelectorAll<SVGPathElement>('.pl-conn .wire')
  const spks = pl.querySelectorAll<SVGGElement>('.spk')
  const edges = pl.querySelectorAll<SVGPathElement>('.pl-graph .edge')
  const info = model.querySelector<HTMLElement>('.pl-info')!
  const conns = pl.querySelectorAll<SVGSVGElement>('.pl-conn')

  if (reduce) {
    const all = [xLines, xSupport, xDeco, hien, rSupport, rDeco, mSupport, steps, info]
    gsap.set(all, { opacity: 0 })
    pl.classList.add('built')
    const fade = (t: Element, els: gsap.TweenTarget) =>
      ScrollTrigger.create({ trigger: t, start: 'top 40%', once: true, onEnter: () => gsap.to(els, { opacity: 1, duration: 0.6 }) })
    fade(exp, [xLines, xSupport, xDeco])
    fade(res, [hien, rSupport, rDeco])
    fade(model, [mSupport, steps, info])
    return
  }

  // Experience. Lead: "Logic Play / Technical Club" rises as the reel starts. Each letter spins
  // down its strip and lands, left to right, later letters spinning longer (a drawn result).
  gsap.set(xLines, { yPercent: 110 })
  gsap.set(xSupport, { opacity: 0, y: 12 })
  gsap.set(xDeco, { opacity: 0 })
  ScrollTrigger.create({
    trigger: exp,
    start: 'top 30%',
    once: true,
    onEnter: () => {
      const tl = gsap.timeline()
      tl.to(xLines, { yPercent: 0, duration: 1.1, ease: 'expo.out', stagger: 0.1 }, 0)
        .to(xSupport, { opacity: 1, y: 0, duration: 0.8, ease: 'expo.out', stagger: 0.08 }, 0.2)
        .to(xDeco, { opacity: 1, duration: 0.8, ease: 'power1.out' }, 0.5)
      strips.forEach((s, i) => {
        const n = s.children.length
        tl.to(s, { yPercent: (-100 * (n - 1)) / n, duration: 0.75 + i * 0.075 + ((i * 29) % 7) * 0.02, ease: 'power3.out' }, 0.35 + i * 0.02)
      })
    },
  })

  // HIEN title screen. Lead: HIEN rises; title, description, tools follow.
  gsap.set(hien, { yPercent: 105 })
  gsap.set(rSupport, { opacity: 0, y: 12 })
  gsap.set(rDeco, { opacity: 0 })
  ScrollTrigger.create({
    trigger: res,
    start: 'top 40%',
    once: true,
    onEnter: () => {
      gsap.timeline()
        .to(hien, { yPercent: 0, duration: 1.2, ease: 'expo.out' }, 0)
        .to(rSupport, { opacity: 1, y: 0, duration: 0.8, ease: 'expo.out', stagger: { each: 0.08, ease: 'power1.in' } }, 0.15)
        .to(rDeco, { opacity: 1, duration: 0.8, ease: 'power1.out' }, 0.5)
    },
  })

  // Diagram. One pass left to right, in the order the data flows: inputs, wire, fusion, wire,
  // graph (speakers pop, edges draw), wire, outputs; then the info line. Played once on entry.
  gsap.set(mSupport, { opacity: 0, y: 12 })
  gsap.set(steps, { opacity: 0, y: 14 })
  gsap.set(wires, { strokeDashoffset: 1 })
  gsap.set(edges, { strokeDashoffset: 1 })
  gsap.set(spks, { opacity: 0, scale: 0.4, transformOrigin: '50% 50%', transformBox: 'fill-box' })
  gsap.set(info, { opacity: 0 })
  const q = (s: string) => pl.querySelectorAll(s)
  ScrollTrigger.create({
    trigger: pl,
    start: 'top 75%',
    once: true,
    onEnter: () => {
      gsap.timeline({ defaults: { ease: 'expo.out' }, onComplete: () => pl.classList.add('built') })
        .to(mSupport, { opacity: 1, y: 0, duration: 0.8, stagger: 0.06 }, 0)
        .to(q('.pl-in .pl-step'), { opacity: 1, y: 0, duration: 0.7, stagger: 0.08 }, 0.1)
        .to(conns[0].querySelectorAll('.wire'), { strokeDashoffset: 0, duration: 0.5, ease: 'power2.inOut' }, 0.4)
        .to(q('.pl-mid .pl-step'), { opacity: 1, y: 0, duration: 0.7 }, 0.65)
        .to(conns[1].querySelectorAll('.wire'), { strokeDashoffset: 0, duration: 0.4, ease: 'power2.inOut' }, 0.85)
        .to(q('.pl-gnn .pl-step'), { opacity: 1, y: 0, duration: 0.7 }, 1.0)
        .to(spks, { opacity: 1, scale: 1, duration: 0.5, ease: 'back.out(2)', stagger: 0.07 }, 1.15)
        .to(edges, { strokeDashoffset: 0, duration: 0.6, ease: 'power2.out', stagger: { each: 0.05, ease: 'power1.in' } }, 1.3)
        .to(conns[2].querySelectorAll('.wire'), { strokeDashoffset: 0, duration: 0.5, ease: 'power2.inOut' }, 1.7)
        .to(q('.pl-out .pl-step'), { opacity: 1, y: 0, duration: 0.7, stagger: 0.1 }, 1.9)
        .to(info, { opacity: 1, duration: 0.6, ease: 'power1.out' }, 2.2)
    },
  })
}

/** Hover, focus or tap a step: it lights up with its wires, the rest dims, the info line explains it.
 *  Pointing at a speaker lights only the edges leaving it. */
function setupPipeline(pl: HTMLElement, infoText: HTMLElement) {
  let pinned = '' // last step tapped / clicked (touch has no hover)
  const set = (k: string) => {
    pl.dataset.active = k
    pl.querySelectorAll<HTMLElement>('.pl-step').forEach((s) =>
      s.classList.toggle('on', s.dataset.k === k || (k === 'node' && s.dataset.k === 'graph')))
    infoText.textContent = INFO[k || 'idle']
  }
  pl.querySelectorAll<HTMLElement>('.pl-step').forEach((s) => {
    const k = s.dataset.k!
    s.addEventListener('pointerenter', (e) => { if (e.pointerType === 'mouse') set(k) })
    s.addEventListener('focus', () => set(k))
    s.addEventListener('click', () => { pinned = pinned === k ? '' : k; set(pinned) })
  })
  pl.addEventListener('pointerleave', (e) => { if (e.pointerType === 'mouse') set(pinned) })
  pl.addEventListener('focusout', (e) => { if (!pl.contains(e.relatedTarget as Node)) set(pinned) })

  const svg = pl.querySelector<SVGSVGElement>('.pl-graph')!
  const edgeEls = [...svg.querySelectorAll<SVGPathElement>('.edge')]
  const lightFrom = (i: number | null) => {
    svg.querySelectorAll<SVGPathElement>('.edge, .flow').forEach((p) => p.classList.toggle('hot', i !== null && Number(p.dataset.a) === i))
    svg.querySelectorAll<SVGGElement>('.spk').forEach((g) => {
      const j = Number(g.dataset.i)
      g.classList.toggle('src', j === i)
      g.classList.toggle('dst', i !== null && edgeEls.some((p) => Number(p.dataset.a) === i && Number(p.dataset.b) === j))
    })
    svg.classList.toggle('focus', i !== null)
  }
  svg.querySelectorAll<SVGGElement>('.spk').forEach((g) => {
    g.addEventListener('pointerenter', () => { lightFrom(Number(g.dataset.i)); set('node') })
    g.addEventListener('pointerleave', () => { lightFrom(null); set(pinned || 'graph') })
  })
}
