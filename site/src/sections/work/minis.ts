import gsap from 'gsap'

/**
 * Section 05 mini demos. Each shows the MECHANISM of a CV project; the maps, exams, tables and
 * dashboard parts are illustrations (labelled on screen), not her data or code.
 *   - Path Finder: Dijkstra shortest path, computed live on a small illustrative park map.
 *   - Exam Scheduler: conflict-free timetable by greedy colouring of a conflict graph (illustration).
 *   - Multi-Vendor E-Commerce: an example relational schema; pointing at a table lights its keys.
 *   - AI Critical Health Predictor: the shape of a Streamlit risk-prediction dashboard.
 */

export interface Mini { html: string; mount(el: HTMLElement, reduce: boolean): void; note: string }

// ---------------------------------------------------------------- Path Finder
const P_NODES: { id: string; x: number; y: number }[] = [
  { id: 'Gate', x: 40, y: 160 }, { id: 'A', x: 120, y: 70 }, { id: 'B', x: 130, y: 220 },
  { id: 'C', x: 220, y: 130 }, { id: 'D', x: 230, y: 40 }, { id: 'E', x: 250, y: 250 },
  { id: 'F', x: 330, y: 170 }, { id: 'G', x: 350, y: 70 }, { id: 'H', x: 420, y: 230 },
]
const P_EDGES: [number, number, number][] = [
  [0, 1, 4], [0, 2, 3], [1, 3, 3], [1, 4, 5], [2, 3, 4], [2, 5, 6], [3, 6, 2], [4, 7, 4],
  [3, 4, 3], [5, 6, 2], [6, 7, 5], [6, 8, 4], [5, 8, 7], [7, 8, 8],
]

function dijkstra(src: number) {
  const n = P_NODES.length
  const dist = Array(n).fill(Infinity), prev = Array(n).fill(-1), done = Array(n).fill(false)
  const order: number[] = []
  dist[src] = 0
  for (let k = 0; k < n; k++) {
    let u = -1
    for (let i = 0; i < n; i++) if (!done[i] && (u < 0 || dist[i] < dist[u])) u = i
    done[u] = true
    order.push(u)
    for (const [a, b, w] of P_EDGES) {
      const v = a === u ? b : b === u ? a : -1
      if (v >= 0 && dist[u] + w < dist[v]) { dist[v] = dist[u] + w; prev[v] = u }
    }
  }
  return { dist, prev, order }
}

const path: Mini = {
  note: 'Illustrative map; the shortest path is computed live with Dijkstra’s algorithm.',
  html: `
    <svg class="pf" viewBox="0 0 460 290" role="group" aria-label="Park map: choose a destination">
      ${P_EDGES.map(([a, b, w], i) => {
        const A = P_NODES[a], B = P_NODES[b]
        return `<g class="pf-e" data-a="${a}" data-b="${b}"><path id="pfe${i}" d="M${A.x} ${A.y} L${B.x} ${B.y}" pathLength="1"/><text x="${(A.x + B.x) / 2}" y="${(A.y + B.y) / 2 - 6}">${w}</text></g>`
      }).join('')}
      ${P_NODES.map((n, i) => `<g class="pf-n${i === 0 ? ' src' : ''}" data-i="${i}" ${i ? `tabindex="0" role="button" aria-label="Route from Gate to ${n.id}"` : ''}><circle cx="${n.x}" cy="${n.y}" r="${i ? 13 : 16}"/><text x="${n.x}" y="${n.y + 4}">${n.id}</text></g>`).join('')}
    </svg>
    <p class="mini-out" aria-live="polite"><span class="t-caps">Route</span><span class="pf-out">Choose a destination on the map.</span></p>`,
  mount(el, reduce) {
    const svg = el.querySelector<SVGSVGElement>('.pf')!
    const out = el.querySelector<HTMLElement>('.pf-out')!
    const { dist, prev, order } = dijkstra(0)
    let tl: gsap.core.Timeline | null = null
    const go = (t: number) => {
      tl?.kill()
      svg.querySelectorAll('.pf-n, .pf-e').forEach((g) => g.classList.remove('seen', 'on', 'dst'))
      const route: number[] = []
      for (let v = t; v >= 0; v = prev[v]) route.unshift(v)
      const finish = () => {
        route.forEach((v, i) => {
          svg.querySelector(`.pf-n[data-i="${v}"]`)!.classList.add('on')
          if (i) svg.querySelectorAll(`.pf-e`).forEach((e) => {
            const a = Number((e as SVGElement).dataset.a), b = Number((e as SVGElement).dataset.b)
            if ((a === route[i - 1] && b === v) || (b === route[i - 1] && a === v)) e.classList.add('on')
          })
        })
        svg.querySelector(`.pf-n[data-i="${t}"]`)!.classList.add('dst')
        out.textContent = `${route.map((v) => P_NODES[v].id).join(' → ')} · distance ${dist[t]}`
      }
      if (reduce) { finish(); return }
      out.textContent = 'Exploring nearest-first…'
      // the frontier grows in Dijkstra's real visiting order until the destination is settled
      tl = gsap.timeline({ onComplete: finish })
      for (const v of order) {
        tl.call(() => svg.querySelector(`.pf-n[data-i="${v}"]`)!.classList.add('seen'), undefined, '+=0.16')
        if (v === t) break
      }
    }
    svg.querySelectorAll<SVGGElement>('.pf-n[data-i]:not(.src)').forEach((g) => {
      const t = Number(g.dataset.i)
      g.addEventListener('click', () => go(t))
      g.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); go(t) } })
    })
    go(8)
  },
}

// ---------------------------------------------------------------- Exam Scheduler
const EXAMS = ['Exam A', 'Exam B', 'Exam C', 'Exam D', 'Exam E', 'Exam F', 'Exam G']
// pairs of exams that share students (illustrative)
const CONFLICTS: [number, number][] = [[0, 1], [0, 2], [1, 3], [2, 3], [2, 4], [3, 5], [4, 6], [5, 6], [1, 4], [0, 6]]

function greedySlots() {
  const deg = EXAMS.map((_, i) => CONFLICTS.filter(([a, b]) => a === i || b === i).length)
  const order = EXAMS.map((_, i) => i).sort((a, b) => deg[b] - deg[a])
  const slot = Array(EXAMS.length).fill(-1)
  for (const e of order) {
    const used = new Set(CONFLICTS.filter(([a, b]) => a === e || b === e).map(([a, b]) => slot[a === e ? b : a]))
    let s = 0
    while (used.has(s)) s++
    slot[e] = s
  }
  return { slot, order }
}

const exam: Mini = {
  note: 'Illustration of conflict-free timetabling (exams that share students never share a slot); not her code or data.',
  html: `
    <div class="ex">
      <div class="ex-pool" aria-label="Exams to place">${EXAMS.map((e, i) => `<span class="ex-chip" data-i="${i}" tabindex="0">${e}</span>`).join('')}</div>
      <div class="ex-slots">${[0, 1, 2, 3].map((s) => `<div class="ex-slot" data-s="${s}"><span class="t-caps">Slot ${s + 1}</span><div class="ex-in"></div></div>`).join('')}</div>
      <button type="button" class="mini-btn ex-run">Generate timetable</button>
    </div>
    <p class="mini-out" aria-live="polite"><span class="t-caps">Conflicts</span><span class="ex-out">${CONFLICTS.length} pairs of exams share students. Point at an exam to see its clashes.</span></p>`,
  mount(el, reduce) {
    const pool = el.querySelector<HTMLElement>('.ex-pool')!
    const chips = [...el.querySelectorAll<HTMLElement>('.ex-chip')]
    const out = el.querySelector<HTMLElement>('.ex-out')!
    const btn = el.querySelector<HTMLButtonElement>('.ex-run')!
    const { slot, order } = greedySlots()
    const used = Math.max(...slot) + 1
    el.querySelectorAll<HTMLElement>('.ex-slot').forEach((s) => s.classList.toggle('spare', Number(s.dataset.s) >= used))
    let tl: gsap.core.Timeline | null = null
    const reset = () => { tl?.kill(); chips.forEach((c) => { pool.appendChild(c); c.classList.remove('placed'); gsap.set(c, { clearProps: 'all' }) }) }
    const run = () => {
      reset()
      btn.disabled = true
      if (reduce) {
        order.forEach((e) => { el.querySelector(`.ex-slot[data-s="${slot[e]}"] .ex-in`)!.appendChild(chips[e]); chips[e].classList.add('placed') })
        out.textContent = `Placed in ${used} slots with no clashes.`
        btn.disabled = false
        return
      }
      tl = gsap.timeline({ onComplete: () => { out.textContent = `Placed in ${used} slots with no clashes.`; btn.disabled = false; btn.textContent = 'Run again' } })
      // most-constrained exam first; each lands in the first slot none of its conflicts use (FLIP move)
      order.forEach((e) => {
        tl!.call(() => {
          const c = chips[e]
          const a = c.getBoundingClientRect()
          el.querySelector(`.ex-slot[data-s="${slot[e]}"] .ex-in`)!.appendChild(c)
          const b = c.getBoundingClientRect()
          c.classList.add('placed')
          gsap.fromTo(c, { x: a.left - b.left, y: a.top - b.top }, { x: 0, y: 0, duration: 0.45, ease: 'expo.out' })
          out.textContent = `${EXAMS[e]} → slot ${slot[e] + 1}`
        }, undefined, '+=0.32')
      })
    }
    // point at an exam: the exams it shares students with light up (they never share its slot)
    const clash = (i: number | null) => {
      el.querySelector('.ex')!.classList.toggle('probing', i !== null)
      chips.forEach((c, j) => {
        c.classList.toggle('self', j === i)
        c.classList.toggle('clash', i !== null && CONFLICTS.some(([a, b]) => (a === i && b === j) || (b === i && a === j)))
      })
      if (i !== null) {
        const n = CONFLICTS.filter(([a, b]) => a === i || b === i).map(([a, b]) => EXAMS[a === i ? b : a])
        out.textContent = `${EXAMS[i]} shares students with ${n.join(', ')}`
      }
    }
    chips.forEach((c, i) => {
      c.addEventListener('pointerenter', () => clash(i))
      c.addEventListener('focus', () => clash(i))
      c.addEventListener('pointerleave', () => clash(null))
      c.addEventListener('blur', () => clash(null))
    })
    btn.addEventListener('click', run)
    run()
  },
}

// ---------------------------------------------------------------- Multi-Vendor E-Commerce
const TABLES: { id: string; x: number; y: number; cols: string[] }[] = [
  { id: 'vendors', x: 0, y: 0, cols: ['vendor_id', 'name'] },
  { id: 'products', x: 1, y: 0, cols: ['product_id', 'vendor_id', 'price'] },
  { id: 'customers', x: 0, y: 1, cols: ['customer_id', 'name'] },
  { id: 'orders', x: 1, y: 1, cols: ['order_id', 'customer_id', 'placed_at'] },
  { id: 'order_items', x: 2, y: 0.5, cols: ['order_id', 'product_id', 'qty'] },
]
const LINKS: [string, string][] = [['vendors', 'products'], ['customers', 'orders'], ['orders', 'order_items'], ['products', 'order_items']]

const shop: Mini = {
  note: 'Example schema showing the kind of relational design involved; not the project’s actual tables.',
  html: `
    <div class="db">
      <svg class="db-links" viewBox="0 0 300 200" preserveAspectRatio="none" aria-hidden="true">
        ${LINKS.map(([a, b]) => {
          const A = TABLES.find((t) => t.id === a)!, B = TABLES.find((t) => t.id === b)!
          const ax = 50 + A.x * 100, ay = 50 + A.y * 100, bx = 50 + B.x * 100, by = 50 + B.y * 100
          return `<path data-a="${a}" data-b="${b}" d="M${ax} ${ay} C${(ax + bx) / 2} ${ay} ${(ax + bx) / 2} ${by} ${bx} ${by}"/>`
        }).join('')}
      </svg>
      ${TABLES.map((t) => `<button type="button" class="db-t" data-t="${t.id}" style="--x:${t.x};--y:${t.y}"><span class="t-caps">${t.id}</span>${t.cols.map((c) => `<code${c.endsWith('_id') ? ' class="key"' : ''}>${c}</code>`).join('')}</button>`).join('')}
    </div>
    <p class="mini-out" aria-live="polite"><span class="t-caps">Relations</span><span class="db-out">Point at or tab to a table to see what it joins.</span></p>`,
  mount(el) {
    const out = el.querySelector<HTMLElement>('.db-out')!
    const db = el.querySelector<HTMLElement>('.db')!
    const set = (id: string | null) => {
      db.classList.toggle('focus', !!id)
      el.querySelectorAll<HTMLElement>('.db-t').forEach((t) => t.classList.toggle('on', t.dataset.t === id || (!!id && LINKS.some(([a, b]) => (a === id && b === t.dataset.t) || (b === id && a === t.dataset.t)))))
      el.querySelectorAll<SVGPathElement>('.db-links path').forEach((p) => p.classList.toggle('on', !!id && (p.dataset.a === id || p.dataset.b === id)))
      if (!id) { out.textContent = 'Point at or tab to a table to see what it joins.'; return }
      const joins = LINKS.filter(([a, b]) => a === id || b === id).map(([a, b]) => (a === id ? b : a))
      out.textContent = `${id} joins ${joins.join(' and ')}`
    }
    el.querySelectorAll<HTMLElement>('.db-t').forEach((t) => {
      t.addEventListener('pointerenter', () => set(t.dataset.t!))
      t.addEventListener('focus', () => set(t.dataset.t!))
      t.addEventListener('click', () => set(t.dataset.t!))
    })
    db.addEventListener('pointerleave', () => set(null))
  },
}

// ---------------------------------------------------------------- AI Critical Health Predictor
const PARTS: Record<string, string> = {
  inputs: 'Inputs: the values a user enters in the dashboard’s sidebar.',
  model: 'Model: the team’s ML model predicting critical health risk.',
  risk: 'Prediction: the risk the dashboard reports back.',
  chart: 'Charts: the dashboard’s visual reporting area.',
}
const health: Mini = {
  note: 'Sketch of a Streamlit risk-prediction dashboard; her part was building the dashboard. No real data.',
  html: `
    <div class="hd">
      <button type="button" class="hd-p hd-side" data-p="inputs"><span class="t-caps">Inputs</span>${'<i class="hd-field"><b></b></i>'.repeat(4)}</button>
      <div class="hd-main">
        <button type="button" class="hd-p hd-model" data-p="model"><span class="t-caps">Model</span><span class="hd-pulse" aria-hidden="true"></span></button>
        <button type="button" class="hd-p hd-risk" data-p="risk"><span class="t-caps">Risk</span><span class="hd-bar" aria-hidden="true"><i></i></span></button>
        <button type="button" class="hd-p hd-chart" data-p="chart"><span class="t-caps">Charts</span><svg viewBox="0 0 120 40" aria-hidden="true"><path d="M0 32 L15 28 L30 30 L45 20 L60 22 L75 12 L90 16 L105 8 L120 10" pathLength="1"/></svg></button>
      </div>
    </div>
    <p class="mini-out" aria-live="polite"><span class="t-caps">Dashboard</span><span class="hd-out">Point at, tap or tab to a part of the dashboard.</span></p>`,
  mount(el) {
    const out = el.querySelector<HTMLElement>('.hd-out')!
    const hd = el.querySelector<HTMLElement>('.hd')!
    const set = (p: string | null) => {
      hd.classList.toggle('focus', !!p)
      el.querySelectorAll<HTMLElement>('.hd-p').forEach((x) => x.classList.toggle('on', x.dataset.p === p))
      out.textContent = p ? PARTS[p] : 'Point at, tap or tab to a part of the dashboard.'
    }
    el.querySelectorAll<HTMLElement>('.hd-p').forEach((x) => {
      x.addEventListener('pointerenter', () => set(x.dataset.p!))
      x.addEventListener('focus', () => set(x.dataset.p!))
      x.addEventListener('click', () => set(x.dataset.p!))
    })
    hd.addEventListener('pointerleave', () => set(null))
  },
}

export const MINIS = { health, exam, shop, path }
