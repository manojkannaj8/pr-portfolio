/**
 * Cursor comet (reference: aa-pr-upscaled-photos/cursor flow.jpeg).
 * A hot glowing head at the pointer, a long tail of flowing light strands that
 * fans out behind it, and fine sparkles drifting off the tail.
 * Colours come from the current chapter palette and blend when it changes.
 *
 * Canvas 2D with additive blending. Runs only on fine pointers and only while
 * something is alive (the loop stops when the tail has burned out).
 */

type RGB = [number, number, number]
type Palette = [RGB, RGB, RGB, RGB] // head, strand A, strand B, strand C

const hex = (h: string): RGB => [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)]
const pal = (a: string, b: string, c: string, d: string): Palette => [hex(a), hex(b), hex(c), hex(d)]

export const PALETTES: Record<string, Palette> = {
  hero: pal('#fff1d0', '#e89135', '#e42e08', '#ebe8da'),
  red: pal('#ffe3da', '#ff6a4d', '#c40a06', '#ff9d7e'),
  gold: pal('#fff0cf', '#f58e12', '#ca8334', '#ffd27a'),
  cool: pal('#e6ecff', '#4fb3ff', '#b0409a', '#f09b33'),
}

const LIFE = 1.5           // seconds a tail point lives
const STRANDS = 26
const BLEND_RATE = 2.2     // palette blend speed (1/s): ~1.2s to settle

interface Pt { x: number; y: number; age: number; sp: number; vx: number; vy: number; nx: number; ny: number }
interface Spark { x: number; y: number; vx: number; vy: number; age: number; life: number; c: number; s: number; tw: number }

export interface Comet {
  setPalette(name: keyof typeof PALETTES): void
  /** dev/testing: advance one frame by `ms` without requestAnimationFrame */
  step?(ms: number): void
}

export function createComet(): Comet {
  const fine = window.matchMedia('(hover: hover) and (pointer: fine)').matches
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  if (!fine || reduce) return { setPalette() {} }

  const canvas = document.createElement('canvas')
  canvas.className = 'comet'
  canvas.setAttribute('aria-hidden', 'true')
  document.body.appendChild(canvas)
  document.documentElement.classList.add('has-comet')
  const ctx = canvas.getContext('2d')!

  let w = 0, h = 0, dpr = 1
  const resize = () => {
    dpr = Math.min(window.devicePixelRatio, 2)
    w = window.innerWidth; h = window.innerHeight
    canvas.width = Math.round(w * dpr); canvas.height = Math.round(h * dpr)
  }
  resize()
  window.addEventListener('resize', resize)

  // palette state (blends toward target)
  const cur: Palette = PALETTES.hero.map((c) => [...c]) as Palette
  let target: Palette = PALETTES.hero
  const css = (c: RGB, a: number) => `rgba(${c[0] | 0},${c[1] | 0},${c[2] | 0},${a})`
  const mix = (a: RGB, b: RGB, t: number): RGB => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t]

  // pointer state
  let mx = -100, my = -100, hx = -100, hy = -100
  let seen = false, inside = false, hot = 0, hotTarget = 0
  const pts: Pt[] = []
  const sparks: Spark[] = []

  // per-strand constants: lateral position, wobble frequency/speed/phase, colour slot
  const strands = Array.from({ length: STRANDS }, (_, k) => {
    const r = (n: number) => { const x = Math.sin((k + 1) * n) * 43758.5453; return x - Math.floor(x) }
    return {
      w: (k / (STRANDS - 1)) * 2 - 1 + (r(12.9) - 0.5) * 0.12,
      f: 4.2 + r(78.2) * 4.5,
      v: 0.9 + r(39.3) * 1.5,
      ph: r(11.1) * 6.283,
      c: 1 + (k % 3),
      a: 0.55 + r(5.7) * 0.45,
    }
  })

  let raf = 0, last = 0, time = 0
  const kick = () => { if (!raf) { last = performance.now(); raf = requestAnimationFrame(frame) } }

  window.addEventListener('pointermove', (e) => {
    if (e.pointerType === 'touch') return
    mx = e.clientX; my = e.clientY
    if (!seen) { hx = mx; hy = my; seen = true }
    inside = true
    hotTarget = (e.target as Element | null)?.closest?.('a, button, [role="button"]') ? 1 : 0
    kick()
  }, { passive: true })
  document.documentElement.addEventListener('pointerleave', () => { inside = false; kick() })
  document.addEventListener('visibilitychange', kick)

  function frame(now: number) {
    raf = 0
    const dt = Math.min((now - last) / 1000, 0.05)
    last = now
    time += dt

    // palette blend
    const kb = 1 - Math.exp(-dt * BLEND_RATE)
    let blending = false
    for (let i = 0; i < 4; i++) for (let j = 0; j < 3; j++) {
      const d = target[i][j] - cur[i][j]
      if (Math.abs(d) > 0.5) blending = true
      cur[i][j] += d * kb
    }

    // head follows the pointer almost 1:1 (the lag is what lays the tail down smoothly)
    const px = hx, py = hy
    const kf = 1 - Math.exp(-dt * 26)
    hx += (mx - hx) * kf; hy += (my - hy) * kf
    const ddx = hx - px, ddy = hy - py
    const dist = Math.hypot(ddx, ddy)
    const speed = dist / Math.max(dt, 1e-3)
    const sp = Math.min(speed / 1500, 1)
    hot += (hotTarget - hot) * (1 - Math.exp(-dt * 12))

    // lay down tail points (subdivide fast moves so the tail stays a curve)
    if (dist > 0.4) {
      const steps = Math.min(Math.ceil(dist / 7), 8)
      for (let s = 1; s <= steps; s++) {
        const t = s / steps
        pts.unshift({
          x: px + ddx * t, y: py + ddy * t, age: (1 - t) * dt, sp,
          vx: (Math.random() - 0.5) * 10 - ddx * 0.6, vy: (Math.random() - 0.5) * 10 - ddy * 0.6 - 5,
          nx: 0, ny: 0,
        })
      }
      // sparkles: more when moving fast, thrown off sideways
      const n = Math.random() < sp * 2.6 ? 2 + ((sp * 5) | 0) : 0
      for (let i = 0; i < n && sparks.length < 420; i++) {
        const base = pts[(Math.random() * Math.min(pts.length, 40)) | 0]
        const ang = Math.random() * 6.283
        const v = 12 + Math.random() * 46
        sparks.push({
          x: base.x + (Math.random() - 0.5) * 36, y: base.y + (Math.random() - 0.5) * 36,
          vx: Math.cos(ang) * v - ddx * 1.2, vy: Math.sin(ang) * v - ddy * 1.2 - 8,
          age: 0, life: 0.7 + Math.random() * 1.3, c: (Math.random() * 4) | 0,
          s: 0.35 + Math.random() * 0.85, tw: Math.random() * 6.283,
        })
      }
    }

    // age + drift
    for (let i = pts.length - 1; i >= 0; i--) {
      const p = pts[i]
      p.age += dt
      if (p.age > LIFE) { pts.splice(i, 1); continue }
      p.x += p.vx * dt; p.y += p.vy * dt
      p.vx *= 0.96; p.vy *= 0.96
    }
    for (let i = sparks.length - 1; i >= 0; i--) {
      const s = sparks[i]
      s.age += dt
      if (s.age > s.life) { sparks.splice(i, 1); continue }
      s.x += s.vx * dt; s.y += s.vy * dt
      s.vx *= 0.975; s.vy = s.vy * 0.975 - 6 * dt
    }

    // normals along the path
    const n = pts.length
    for (let i = 0; i < n; i++) {
      const a = pts[Math.max(i - 1, 0)], b = pts[Math.min(i + 1, n - 1)]
      let tx = a.x - b.x, ty = a.y - b.y
      const l = Math.hypot(tx, ty) || 1
      tx /= l; ty /= l
      pts[i].nx = -ty; pts[i].ny = tx
    }

    // ---------- draw ----------
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    ctx.clearRect(0, 0, w, h)
    ctx.globalCompositeOperation = 'lighter'
    ctx.lineCap = 'round'

    if (n > 2) {
      ctx.lineCap = 'butt'
      ctx.lineJoin = 'round'
      const CH = 4 // points per stroke: each chunk is one continuous path, so no beading at the joints
      // soft body: the luminous haze the strands sit in
      for (let i = 0; i < n - 1; i += CH) {
        const p = pts[i]
        const t = p.age / LIFE
        const a = Math.pow(1 - t, 1.5) * 0.11 * (0.45 + 0.55 * p.sp)
        if (a < 0.004) continue
        ctx.strokeStyle = css(mix(cur[1], cur[2], Math.min(t * 1.4, 1)), a)
        ctx.lineWidth = 8 + 78 * Math.pow(t, 0.8) * (0.4 + 0.6 * p.sp)
        ctx.beginPath(); ctx.moveTo(p.x, p.y)
        for (let m = i + 1; m <= Math.min(i + CH, n - 1); m++) ctx.lineTo(pts[m].x, pts[m].y)
        ctx.stroke()
      }
      // strands: tight at the head, fanning out and weaving toward the tail
      const xs = new Float32Array(n), ys = new Float32Array(n)
      for (let k = 0; k < STRANDS; k++) {
        const st = strands[k]
        const col = cur[st.c]
        for (let i = 0; i < n; i++) {
          const p = pts[i]
          const t = p.age / LIFE
          const amp = 0.45 + 0.55 * p.sp
          const fan = st.w * (1.5 + 62 * Math.pow(t, 0.9))
          const weave = Math.sin(t * st.f + time * st.v + st.ph) * 20 * t + Math.sin(t * st.f * 2.3 - time * st.v * 0.7 + st.ph * 1.7) * 6 * t
          const off = (fan + weave) * amp
          xs[i] = p.x + p.nx * off; ys[i] = p.y + p.ny * off
        }
        for (let i = 0; i < n - 1; i += CH) {
          const t = pts[i].age / LIFE
          // thin out right behind the head, where all strands overlap, so it never burns to a solid bar
          const a = Math.pow(1 - t, 1.35) * 0.46 * st.a * (0.22 + 0.78 * Math.min(t / 0.16, 1))
          if (a < 0.006) continue
          ctx.strokeStyle = css(mix(cur[0], col, Math.min(t * 3.0, 1)), a)
          ctx.lineWidth = 0.55 + 1.25 * (1 - t)
          ctx.beginPath(); ctx.moveTo(xs[i], ys[i])
          for (let m = i + 1; m <= Math.min(i + CH, n - 1); m++) ctx.lineTo(xs[m], ys[m])
          ctx.stroke()
        }
      }
    }

    // sparkles
    for (const s of sparks) {
      const t = s.age / s.life
      const tw = 0.55 + 0.45 * Math.sin(time * 14 + s.tw)
      const a = (1 - t) * tw
      ctx.fillStyle = css(mix(cur[s.c], [255, 255, 255], 0.35), a)
      ctx.beginPath(); ctx.arc(s.x, s.y, s.s * (1 - t * 0.5), 0, 6.283); ctx.fill()
    }

    // head: white-hot core inside a coloured bloom
    if (seen && inside) {
      const r = (46 + 30 * sp + 16 * hot) * (1 + Math.sin(time * 5.3) * 0.04)
      const g = ctx.createRadialGradient(hx, hy, 0, hx, hy, r)
      g.addColorStop(0, css(cur[0], 0.95))
      g.addColorStop(0.14, css(mix(cur[0], cur[1], 0.45), 0.8))
      g.addColorStop(0.42, css(cur[1], 0.28))
      g.addColorStop(0.7, css(cur[2], 0.09))
      g.addColorStop(1, css(cur[2], 0))
      ctx.fillStyle = g
      ctx.beginPath(); ctx.arc(hx, hy, r, 0, 6.283); ctx.fill()
      // hot inner flare, slightly stretched along the direction of travel
      const fr = r * 0.42
      const f = ctx.createRadialGradient(hx, hy, 0, hx, hy, fr)
      f.addColorStop(0, 'rgba(255,255,255,0.95)')
      f.addColorStop(0.35, css(cur[0], 0.75))
      f.addColorStop(1, css(cur[1], 0))
      ctx.fillStyle = f
      ctx.beginPath(); ctx.arc(hx, hy, fr, 0, 6.283); ctx.fill()
      ctx.fillStyle = 'rgba(255,255,255,0.95)'
      ctx.beginPath(); ctx.arc(mx, my, 3 + hot * 1.5, 0, 6.283); ctx.fill()
    }

    const settled = Math.hypot(mx - hx, my - hy) < 0.3 && Math.abs(hotTarget - hot) < 0.01
    if ((n > 0 || sparks.length > 0 || !settled || blending) && !document.hidden) raf = requestAnimationFrame(frame)
  }

  return {
    setPalette(name) { target = PALETTES[name]; kick() },
    step(ms) { if (raf) { cancelAnimationFrame(raf); raf = 0 } frame(last + ms); if (raf) { cancelAnimationFrame(raf); raf = 0 } },
  }
}
