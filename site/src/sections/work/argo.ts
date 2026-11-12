import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

/**
 * ARGO Ocean Data · "ask the ocean" console.
 * Facts are from the CV: plain-English chat over ARGO float data (temperature, salinity, BGC);
 * an LLM grounded by RAG turns each question into SQL; Python ETL loads NetCDF into PostgreSQL and
 * indexes float metadata in a vector database; Streamlit + Plotly report trajectories, depth–time
 * profiles and profile comparisons.
 * The questions, the SQL and the drawn charts are ILLUSTRATIONS of that flow (labelled on screen).
 */

interface Ask { q: string; sql: string; kind: 'track' | 'depth' | 'compare'; caption: string }

const ASKS: Ask[] = [
  {
    q: 'Where has this float travelled?',
    sql: 'SELECT time, latitude, longitude\nFROM float_positions\nWHERE float_id = :float\nORDER BY time;',
    kind: 'track',
    caption: 'Float trajectory',
  },
  {
    q: 'How does temperature change with depth over time?',
    sql: 'SELECT time, pressure, temperature\nFROM profiles\nWHERE float_id = :float\nORDER BY time, pressure;',
    kind: 'depth',
    caption: 'Depth–time profile · temperature',
  },
  {
    q: 'Compare salinity in two profiles.',
    sql: 'SELECT cycle, pressure, salinity\nFROM profiles\nWHERE float_id = :float\n  AND cycle IN (:a, :b);',
    kind: 'compare',
    caption: 'Profile comparison · salinity',
  },
]

const STAGES = [
  { k: 'ask', label: 'Question' },
  { k: 'rag', label: 'Vector DB' },
  { k: 'sql', label: 'LLM → SQL' },
  { k: 'db', label: 'PostgreSQL' },
  { k: 'plot', label: 'Plotly' },
]

const STATUS = [
  'Retrieving float metadata from the vector database',
  'LLM writes the SQL, grounded by RAG',
  'Running the query on PostgreSQL',
  'Drawing it in the Plotly dashboard',
]

// deterministic pseudo-random, so every visit draws the same illustration
const rnd = (i: number) => { const x = Math.sin(i * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x) }

function seaSVG(W: number, H: number, L: number, B: number) {
  let d = ''
  for (let k = 0; k < 7; k++) {
    let p = ''
    for (let x = L; x <= W - 6; x += 8) {
      const y = 16 + k * ((H - B - 20) / 6) + Math.sin(x * 0.035 + k * 1.7) * 5 + Math.sin(x * 0.011 + k) * 7
      p += `${x === L ? 'M' : 'L'}${x} ${y.toFixed(1)} `
    }
    d += `<path class="iso" style="--k:${k}" d="${p}"/>`
  }
  return `<g class="sea">${d}</g>`
}

function plotSVG(kind: Ask['kind']) {
  const W = 320, H = 196, L = 30, B = 22
  const axes = seaSVG(W, H, L, B) + `<path class="ax" d="M${L} 8 V${H - B} H${W - 6}"/>`
  if (kind === 'track') {
    let x = 52, y = 120
    const pts: [number, number][] = []
    for (let i = 0; i < 20; i++) {
      x += 9 + rnd(i) * 10
      y += (rnd(i + 40) - 0.55) * 26
      y = Math.max(22, Math.min(H - B - 14, y))
      pts.push([x, y])
    }
    const d = pts.map((p, i) => `${i ? 'L' : 'M'}${p[0].toFixed(1)} ${p[1].toFixed(1)}`).join(' ')
    const grid = [60, 100, 140].map((gy) => `<path class="grid" d="M${L} ${gy} H${W - 6}"/>`).join('') +
      [100, 170, 240].map((gx) => `<path class="grid" d="M${gx} 8 V${H - B}"/>`).join('')
    const dots = pts.map((p, i) => `<circle class="dot" style="--i:${i}" cx="${p[0].toFixed(1)}" cy="${p[1].toFixed(1)}" r="${i === pts.length - 1 ? 4.5 : 2.2}"/>`).join('')
    const [lx, ly] = pts[pts.length - 1]
    const ping = `<circle class="ping" cx="${lx.toFixed(1)}" cy="${ly.toFixed(1)}" r="4"/><circle class="ping p2" cx="${lx.toFixed(1)}" cy="${ly.toFixed(1)}" r="4"/>`
    return `${grid}${axes}<path class="line" d="${d}" pathLength="1"/>${dots}${ping}
      <text x="${W - 6}" y="${H - 6}" text-anchor="end">Longitude</text><text x="${L}" y="-5">Latitude</text>`
  }
  if (kind === 'depth') {
    const cols = 26, rows = 12, cw = (W - 6 - L) / cols, rh = (H - B - 8) / rows
    let cells = ''
    for (let c = 0; c < cols; c++) {
      for (let r = 0; r < rows; r++) {
        const season = Math.sin((c / cols) * Math.PI * 2 + 0.6) * 0.34 * Math.exp(-r / 3.4)
        const v = Math.max(0, Math.min(1, 1 - r / (rows - 1) * 0.95 + season + (rnd(c * 31 + r) - 0.5) * 0.06))
        cells += `<rect class="cell" style="--c:${c};--v:${v.toFixed(3)}" x="${(L + c * cw).toFixed(1)}" y="${(8 + r * rh).toFixed(1)}" width="${(cw + 0.4).toFixed(1)}" height="${(rh + 0.4).toFixed(1)}"/>`
      }
    }
    return `${cells}${axes}<text x="${W - 6}" y="${H - 6}" text-anchor="end">Time</text><text x="${L}" y="-5">Depth ↓</text>`
  }
  const curve = (a: number, b: number) => {
    let d = ''
    for (let i = 0; i <= 24; i++) {
      const t = i / 24
      const y = 8 + t * (H - B - 8)
      const x = L + 30 + (W - L - 60) * (a + b * Math.tanh((t - 0.28) * 6) * 0.5 + 0.5 * (1 - a)) * (0.55 + 0.25 * Math.sin(t * 3 + a * 5))
      d += `${i ? 'L' : 'M'}${x.toFixed(1)} ${y.toFixed(1)} `
    }
    return d
  }
  return `${axes}
    <path class="line" d="${curve(0.35, 0.6)}" pathLength="1"/>
    <path class="line alt" d="${curve(0.55, 0.35)}" pathLength="1"/>
    <text x="${W - 6}" y="${H - 6}" text-anchor="end">Salinity</text><text x="${L}" y="-5">Depth ↓</text>
    <g class="key"><path class="line" d="M${W - 92} 18 h14" pathLength="1"/><text x="${W - 74}" y="22">Profile A</text>
    <path class="line alt" d="M${W - 92} 34 h14" pathLength="1"/><text x="${W - 74}" y="38">Profile B</text></g>`
}

export function argoHTML() {
  return `
  <div class="argo">
    <div class="argo-asks" role="group" aria-label="Try a question">
      ${ASKS.map((a, i) => `<button type="button" class="argo-q" data-i="${i}" aria-pressed="false">${a.q}</button>`).join('')}
    </div>
    <div class="argo-console">
      <ol class="argo-stages" role="list" aria-label="Pipeline">
        ${STAGES.map((s) => `<li data-k="${s.k}"><i aria-hidden="true"></i><span class="t-caps">${s.label}</span></li>`).join('')}
      </ol>
      <div class="argo-body">
        <div class="argo-chat">
          <p class="argo-you"><span class="t-caps">You</span><span class="argo-typed" aria-live="polite"></span><b class="caret" aria-hidden="true"></b></p>
          <ul class="argo-status" role="list">
            ${STATUS.map((s) => `<li><i aria-hidden="true"></i>${s}</li>`).join('')}
          </ul>
          <pre class="argo-sql" aria-label="Generated SQL"><code></code></pre>
        </div>
        <figure class="argo-plot">
          <svg viewBox="0 -16 320 212" aria-hidden="true"></svg>
          <figcaption class="t-caps"></figcaption>
        </figure>
      </div>
    </div>
    <p class="argo-note">Illustration of the flow: the questions, query and charts are examples, not real ARGO data.</p>
  </div>`
}

export function mountArgo(root: HTMLElement, reduce: boolean) {
  const qs = root.querySelectorAll<HTMLButtonElement>('.argo-q')
  const stages = root.querySelectorAll<HTMLElement>('.argo-stages li')
  const typed = root.querySelector<HTMLElement>('.argo-typed')!
  const status = root.querySelectorAll<HTMLElement>('.argo-status li')
  const code = root.querySelector<HTMLElement>('.argo-sql code')!
  const svg = root.querySelector<SVGSVGElement>('.argo-plot svg')!
  const cap = root.querySelector<HTMLElement>('.argo-plot figcaption')!
  const con = root.querySelector<HTMLElement>('.argo-console')!
  let tl: gsap.core.Timeline | null = null

  const typeTo = (el: HTMLElement, text: string, dur: number) => {
    const o = { n: 0 }
    return gsap.to(o, { n: text.length, duration: dur, ease: 'none', onUpdate: () => { el.textContent = text.slice(0, Math.round(o.n)) } })
  }
  const stage = (i: number) => stages.forEach((s, j) => { s.classList.toggle('done', j < i); s.classList.toggle('on', j === i) })

  const run = (i: number) => {
    const a = ASKS[i]
    tl?.kill()
    qs.forEach((b, j) => b.setAttribute('aria-pressed', String(j === i)))
    con.classList.add('busy')
    con.dataset.kind = a.kind
    typed.textContent = ''
    code.textContent = ''
    status.forEach((s) => s.classList.remove('on', 'done'))
    svg.innerHTML = plotSVG(a.kind)
    cap.textContent = a.caption
    const lines = svg.querySelectorAll<SVGPathElement>('.line')
    const dots = svg.querySelectorAll<SVGElement>('.dot')
    const cells = svg.querySelectorAll<SVGElement>('.cell')
    const done = () => { stage(5); con.classList.remove('busy') }

    if (reduce) {
      typed.textContent = a.q
      code.textContent = a.sql
      status.forEach((s) => s.classList.add('done'))
      done()
      return
    }
    gsap.set(lines, { strokeDashoffset: 1 })
    const marks = [...dots, ...cells]
    if (marks.length) gsap.set(marks, { opacity: 0 })
    gsap.set(svg, { opacity: 0.25 })
    tl = gsap.timeline({ onComplete: done })
    tl.call(() => stage(0))
      .add(typeTo(typed, a.q, a.q.length * 0.028))
      .call(() => { stage(1); status[0].classList.add('on') }, undefined, '+=0.15')
      .to({}, { duration: 0.55 })
      .call(() => { status[0].classList.replace('on', 'done'); status[1].classList.add('on'); stage(2) })
      .add(typeTo(code, a.sql, a.sql.length * 0.012))
      .call(() => { status[1].classList.replace('on', 'done'); status[2].classList.add('on'); stage(3) })
      .to({}, { duration: 0.5 })
      .call(() => { status[2].classList.replace('on', 'done'); status[3].classList.add('on'); stage(4) })
      .to(svg, { opacity: 1, duration: 0.3, ease: 'power1.out' })
      .to(lines, { strokeDashoffset: 0, duration: 1.1, ease: 'power2.inOut', stagger: 0.15 }, '<')
    if (dots.length) tl.to(dots, { opacity: 1, duration: 0.25, stagger: 0.04 }, '<0.1')
    if (cells.length) tl.to(cells, { opacity: 1, duration: 0.3, stagger: { each: 0.0025, from: 'start' } }, '<')
    tl
      .call(() => status[3].classList.replace('on', 'done'))
  }

  qs.forEach((b) => b.addEventListener('click', () => run(Number(b.dataset.i))))
  // the first question asks itself when the console comes into view
  ScrollTrigger.create({ trigger: con, start: 'top 75%', once: true, onEnter: () => run(0) })
}
