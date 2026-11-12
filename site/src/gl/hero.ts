import * as THREE from 'three'

/**
 * Hero "Long Exposure" scene: one fullscreen shader over the Chongqing photo.
 *
 * Uniforms driven from outside:
 *   uReveal   0..1  fade up from black
 *   uStretch  0..1  intro: streaks compressed at the waterline -> full height
 *   uExit     0..1  scroll: streaks stretch further and dissolve into the next image
 *   uMotion   0|1   0 under prefers-reduced-motion (no shimmer, no bend, no pulse)
 */

const vert = /* glsl */ `
varying vec2 vUv;
void main() { vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }
`

const frag = /* glsl */ `
precision highp float;
varying vec2 vUv;
uniform sampler2D uTex;
uniform sampler2D uNext;   // chapter image A (current)
uniform sampler2D uNextB;  // chapter image B (incoming)
uniform float uBlend;      // 0 = A, 1 = B: transition between chapter images
uniform float uMode;       // transition style: 0 = falling rain, 1 = grid tiles, 2 = rising water, 3 = dusk bloom
uniform float uFxA;        // live effect of the photo in slot A: 0 none, 1 red-grid beams, 2 silhouette dusk
uniform float uFxB;        // same for slot B
uniform vec2 uNextPan;     // camera pan across the chapter photograph (image uv units)
uniform vec2 uBeacon;      // a light in the photograph, image uv (Section 05 story)
uniform float uBeaconAmt;  // 0..1 beacon strength
uniform vec2 uRes;
uniform float uTexAspect;
uniform vec2 uTexel;     // 1 / texture size
uniform float uTime;
uniform float uReveal;
uniform float uStretch;
uniform float uExit;
uniform float uMotion;
uniform float uNextZoom;   // >1 pushes into the next image (Section 01 drift)
uniform float uNextBright; // grade of the next image (Section 01 dims it for reading)
uniform vec2 uMouse;   // 0..1, y up, smoothed
uniform vec2 uVel;     // smoothed pointer velocity
uniform float uBend;   // 0..1 pointer presence

const float HORIZON = 0.30;   // waterline in image space (y up)
const float ZOOM = 0.97;      // small overscan so parallax never shows an edge (kept small: less enlargement)

float hash(float n) { return fract(sin(n * 127.1) * 43758.5453); }
float hash2(vec2 p) { return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453); }
float noise1(float x) { float i = floor(x), f = fract(x); f = f * f * (3.0 - 2.0 * f); return mix(hash(i), hash(i + 1.0), f); }
float noise2(vec2 p) {
  vec2 i = floor(p), f = fract(p); f = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash2(i), hash2(i + vec2(1, 0)), f.x), mix(hash2(i + vec2(0, 1)), hash2(i + vec2(1, 1)), f.x), f.y);
}

vec3 sharpSample(sampler2D t, vec2 uv) {
  vec3 c = texture2D(t, uv).rgb;
  vec3 nb = (texture2D(t, uv + vec2(uTexel.x, 0.0)).rgb + texture2D(t, uv - vec2(uTexel.x, 0.0)).rgb
           + texture2D(t, uv + vec2(0.0, uTexel.y)).rgb + texture2D(t, uv - vec2(0.0, uTexel.y)).rgb) * 0.25;
  return max(c + (c - nb) * 0.6, 0.0);
}

// ---- red-grid photo: the red beams come alive ----
// beam pixels: strongly red, little green or blue
float redness(vec3 c) { return smoothstep(0.10, 0.32, c.r - max(c.g, c.b)) * smoothstep(0.22, 0.55, c.r); }
vec3 beams(sampler2D t, vec2 uv, vec3 c) {
  // 1. the beam layer floats against the city: it drifts on its own slow swell and leans with the pointer.
  //    Composited with max() (lighten), so a moved beam never leaves a dark hole behind.
  float k = 0.36; // the beams fall gently to the right
  float row = (uv.y + uv.x * k) * 21.0;
  float rid = floor(row);
  vec2 drift = vec2(
    sin(uTime * 0.42 + rid * 0.9) * 0.0032 + (uMouse.x - 0.5) * 0.010,
    cos(uTime * 0.31 + rid * 0.6) * 0.0016 + (uMouse.y - 0.5) * 0.006) * uMotion;
  vec3 s = texture2D(t, uv + drift).rgb;
  float ms = redness(s);
  c = max(c, s * ms * 1.04);
  float m = max(redness(c), ms);
  // 2. light runs along every beam, each row at its own speed and phase, like a neon chase
  float along = uv.x - uv.y * k;
  float ph = hash(rid + 4.0) * 6.2832;
  float sp = 0.7 + hash(rid + 19.0) * 1.1;
  float dir = hash(rid + 33.0) > 0.35 ? 1.0 : -1.0;
  float band = pow(0.5 + 0.5 * sin(along * 15.0 - dir * uTime * sp * 1.9 + ph), 12.0);
  c += (c * 1.5 + vec3(0.18, 0.02, 0.0)) * m * band * uMotion;
  // 3. the whole structure breathes slowly
  c *= 1.0 + m * 0.16 * sin(uTime * 0.9 + rid * 0.35) * uMotion;
  // 4. the small square lanterns at the beam ends flicker
  float amber = smoothstep(0.45, 0.7, c.r) * smoothstep(0.28, 0.5, c.g) * (1.0 - smoothstep(0.35, 0.6, c.b));
  vec2 lid = floor(uv * vec2(90.0, 50.0));
  float fl = step(0.82, hash2(lid + floor(uTime * 7.0 + hash2(lid) * 7.0)));
  c += c * amber * (0.35 + 0.65 * fl) * 0.45 * uMotion;
  return c;
}

// ---- silhouette photo: the dusk comes alive (the figure itself never moves) ----
float luma(vec3 c) { return dot(c, vec3(0.299, 0.587, 0.114)); }
vec3 dusk(sampler2D t, vec2 uv, vec3 c) {
  // 1. clouds drift: the sky above the figure's head is sampled through a slow flowing offset
  float sky = smoothstep(0.62, 0.72, uv.y);
  vec2 flow = vec2(noise2(uv * vec2(2.5, 6.0) + vec2(uTime * 0.05, 0.0)) - 0.5,
                   noise2(uv * vec2(3.0, 5.0) - vec2(uTime * 0.04, 0.0) + 7.0) - 0.5);
  vec3 s = texture2D(t, clamp(uv + flow * vec2(0.014, 0.007) * uMotion, 0.0, 1.0)).rgb;
  c = mix(c, s, sky);
  // 2. the fire breathes: the burning parts of the sky swell and ebb in slow patches
  float warm = smoothstep(0.25, 0.7, c.r) * smoothstep(0.05, 0.3, c.r - c.b);
  float breath = noise2(uv * vec2(2.0, 3.0) + vec2(uTime * 0.07, uTime * 0.03));
  c *= 1.0 + warm * (breath - 0.35) * 0.35 * uMotion;
  // 3. city windows twinkle: bright points below the horizon flare or dip, each on its own clock
  float city = 1.0 - smoothstep(0.5, 0.6, uv.y);
  float bright = smoothstep(0.55, 0.9, luma(c));
  vec2 cell = floor(uv * vec2(480.0, 270.0));
  float ph = hash2(cell);
  float flick = sin(uTime * (0.8 + ph * 2.6) + ph * 40.0);
  c *= 1.0 + city * bright * step(0.55, ph) * flick * 0.3 * uMotion;
  // 4. traffic: light streams along the glowing roads on the right of the city
  float region = smoothstep(0.66, 0.78, uv.x) * smoothstep(0.24, 0.29, uv.y) * (1.0 - smoothstep(0.41, 0.46, uv.y));
  float road = region * smoothstep(0.42, 0.75, luma(c)) * smoothstep(0.05, 0.25, c.r - c.b);
  float lane = floor(uv.y * 220.0);
  float stream = pow(0.5 + 0.5 * sin(uv.x * 85.0 - uTime * (2.4 + hash(lane) * 2.0) + hash(lane + 9.0) * 6.28), 14.0);
  c += vec3(1.0, 0.86, 0.62) * road * stream * 0.9 * uMotion;
  // 5. embers rise through the whole frame, sparse, drifting as they climb
  vec2 eg = uv * vec2(28.0, 16.0);
  eg.y -= uTime * 0.32;
  vec2 ei = floor(eg), ef = fract(eg) - 0.5;
  float er = hash2(ei);
  vec2 ep = (vec2(hash2(ei + 3.1), hash2(ei + 5.7)) - 0.5) * 0.6;
  ep.x += sin(uTime * 1.3 + er * 6.28) * 0.15;
  vec2 dd = ef - ep;
  float ember = step(0.84, er) * exp(-dot(dd, dd) * 650.0) * (0.55 + 0.45 * sin(uTime * 6.0 + er * 40.0));
  c += vec3(1.0, 0.55, 0.16) * ember * 1.3 * uMotion;
  return c;
}

vec3 live(sampler2D t, vec2 uv, vec3 c, float fx) {
  if (fx > 1.5) return dusk(t, uv, c);
  return beams(t, uv, c);
}

vec2 cover(vec2 uv) {
  float ra = uRes.x / uRes.y;
  vec2 s = ra > uTexAspect ? vec2(1.0, uTexAspect / ra) : vec2(ra / uTexAspect, 1.0);
  return (uv - 0.5) * s * ZOOM + 0.5;
}

// light travelling along the bridge (quadratic bezier in image space, y up)
float bridge(vec2 p, float t0) {
  vec2 a = vec2(0.317, 0.138), b = vec2(0.500, 0.225), c = vec2(0.655, 0.268);
  float best = 1e9, bt = 0.0;
  for (int i = 0; i <= 28; i++) {
    float t = float(i) / 28.0;
    vec2 q = mix(mix(a, b, t), mix(b, c, t), t);
    vec2 d = (p - q) * vec2(uTexAspect, 1.0);
    float dd = dot(d, d);
    if (dd < best) { best = dd; bt = t; }
  }
  float line = exp(-best / 0.000035);
  float head = exp(-pow((bt - t0) / 0.035, 2.0));
  float tail = step(bt, t0) * exp(-(t0 - bt) / 0.22) * 0.45;
  return line * (head + tail);
}

void main() {
  vec2 p = cover(vUv);
  vec2 m = cover(uMouse);

  // 1. depth: water and bridge (near) move more than skyline, sky least
  float depth = mix(1.0, 0.18, smoothstep(0.05, 0.75, p.y));
  p -= (uMouse - 0.5) * vec2(0.013, 0.008) * depth * uMotion;

  // 2. pointer pulls the streaks toward it, and drags a wake behind fast moves
  vec2 dm = p - m;
  float fall = exp(-dm.x * dm.x / 0.012) * exp(-dm.y * dm.y / 0.16);
  float sky = 0.25 + 0.75 * smoothstep(HORIZON - 0.06, HORIZON + 0.12, p.y);
  p.x += dm.x * fall * 0.62 * uBend * sky;
  p.x -= uVel.x * fall * 1.6 * uBend * sky;
  p.y -= uVel.y * fall * 0.35 * uBend * sky;

  // 3. per-column life: every streak breathes on its own clock
  float col = p.x * 150.0;
  float n = noise2(vec2(col, uTime * 0.35));
  float nSlow = noise2(vec2(col * 0.23, uTime * 0.08 + 7.0));
  float above = smoothstep(HORIZON - 0.02, HORIZON + 0.08, p.y);
  p.x += sin(uTime * 0.11 + p.y * 2.7) * 0.0012 * uMotion;

  // 4. the exposure: compressed at the waterline -> stretched to full height (and beyond on exit)
  float colRand = noise1(col * 0.42) * 0.65 + noise1(col * 0.07 + 3.0) * 0.35;
  float lead = noise1(col * 0.035 + 11.0);            // broad districts open slightly apart
  float open = clamp(uStretch * (1.06 + 0.16 * lead) - 0.06 * lead, 0.0, 1.0);
  open = 1.0 - pow(1.0 - open, 3.0);
  float s = mix(0.05, 1.0, open) * (1.0 + uExit * (2.5 + 3.0 * nSlow));
  vec2 q = p;
  if (p.y > HORIZON) q.y = HORIZON + (p.y - HORIZON) / s;
  q.y -= (n - 0.5) * 0.004 * above * uMotion;

  // 5. smear upward: each pixel gathers light from below it
  float len = (0.0025 + 0.012 * nSlow * uMotion + uExit * 0.05) * above + (1.0 - open) * 0.0;
  vec3 acc = vec3(0.0); float wsum = 0.0;
  for (int i = 0; i < 10; i++) {
    float f = float(i) / 9.0;
    float w = 1.0 - f * 0.75;
    vec2 sp = vec2(q.x, q.y - f * len * 6.0);
    acc += texture2D(uTex, clamp(sp, 0.0, 1.0)).rgb * w; wsum += w;
  }
  // sharp base: the photo itself plus a light unsharp mask (it is enlarged on most screens)
  vec2 qc = clamp(q, 0.0, 1.0);
  vec3 base = texture2D(uTex, qc).rgb;
  vec3 nb = (texture2D(uTex, qc + vec2(uTexel.x, 0.0)).rgb + texture2D(uTex, qc - vec2(uTexel.x, 0.0)).rgb
           + texture2D(uTex, qc + vec2(0.0, uTexel.y)).rgb + texture2D(uTex, qc - vec2(0.0, uTexel.y)).rgb) * 0.25;
  base = max(base + (base - nb) * 0.6, 0.0);
  // light trails are added on top ("lighten"), never blended over the detail
  vec3 c = max(base, acc / wsum * 0.9 * above);
  // above the stretched top there is only night sky
  c *= 1.0 - 0.6 * smoothstep(1.0, 1.6, q.y);
  // shimmer: bright columns flicker slightly
  float lum = dot(c, vec3(0.299, 0.587, 0.114));
  c *= 1.0 + (n - 0.5) * 0.34 * smoothstep(0.25, 0.9, lum) * above * uMotion;
  // while compressed, the short streaks are hotter (same light, less area)
  c *= 1.0 + (1.0 - open) * 0.9 * above;

  // 6. bridge light
  float t0 = fract(uTime * 0.085);
  float t1 = fract(uTime * 0.085 + 0.52);
  float br = (bridge(p, t0) + 0.7 * bridge(p, t1)) * uMotion * uStretch * (1.0 - uExit);
  c += vec3(1.0, 0.72, 0.36) * br * 1.35;

  // 7. scrim behind the lockup so type holds, then vignette
  vec2 cc = (vUv - vec2(0.5, 0.54)) * vec2(uRes.x / uRes.y, 1.0);
  c *= 1.0 - 0.30 * exp(-dot(cc, cc) / 0.16) * (1.0 - uExit);
  vec2 vv = vUv - 0.5;
  c *= 1.0 - dot(vv, vv) * 0.55;

  // 8. scroll exit: columns burn out top-down into the next chapter's image
  vec2 np = (cover(vUv) - 0.5) / uNextZoom + 0.5 + uNextPan;
  np -= (uMouse - 0.5) * vec2(0.006, 0.004) * uMotion;
  // next chapter image: full brightness and the same light sharpening as the hero photo
  vec3 nx = sharpSample(uNext, clamp(np, 0.0, 1.0));
  if (uFxA > 0.5) nx = live(uNext, clamp(np, 0.0, 1.0), nx, uFxA);
  if (uBeaconAmt > 0.001) {
    // a light in the city blooms: hot core, a soft halo and a ring that keeps pulsing outward
    vec2 bd = (np - uBeacon) * vec2(uTexAspect, 1.0);
    float r = length(bd);
    float ring = fract(uTime * 0.45);
    float pulse = exp(-pow((r - ring * 0.09) / 0.004, 2.0)) * (1.0 - ring);
    float glow = exp(-r * r / 0.0009) * 0.9 + exp(-r * r / 0.00006) * 1.6;
    nx += vec3(1.0, 0.72, 0.36) * (glow + pulse * 0.9 * uMotion) * uBeaconAmt;
  }
  if (uBlend > 0.0 && uMode < 0.5) {
    // falling-rain dissolve: thin columns of B run down from the top at their own speeds,
    // each with a bright wet leading edge, then the rest of the frame floods in
    float rc = floor(vUv.x * 240.0);
    float rr = hash(rc), rs = hash(rc + 71.0);
    float front = uBlend * (1.5 + rs * 0.6) - rr * 0.45 - (1.0 - vUv.y) * 0.9;
    float m = smoothstep(0.0, 0.07, front);
    float flood = smoothstep(0.55, 1.0, uBlend);
    m = max(m, flood);
    // the run drags B down slightly near its edge (a drip), then settles
    vec2 bp = np + vec2(0.0, (1.0 - smoothstep(0.0, 0.25, front)) * 0.035 * (1.0 - flood));
    vec3 nb = sharpSample(uNextB, clamp(bp, 0.0, 1.0));
    if (uFxB > 0.5) nb = live(uNextB, clamp(bp, 0.0, 1.0), nb, uFxB);
    float edge = smoothstep(0.0, 0.025, front) * (1.0 - smoothstep(0.025, 0.09, front)) * (1.0 - flood);
    nx = mix(nx, nb, m) + vec3(1.0, 0.36, 0.26) * edge * 0.55;
  } else if (uBlend > 0.0 && uMode < 1.5) {
    // grid tiles: the frame splits into square cells that open from their centres,
    // in a diagonal sweep (left to right, top to bottom) with a little randomness per cell.
    // While it runs, the cell borders glow like the red beam grid in the photograph.
    vec2 cells = vec2(9.0 * uRes.x / uRes.y, 9.0);
    vec2 id = floor(vUv * cells);
    vec2 f = fract(vUv * cells);
    float order = 0.58 * (id.x + 0.5) / cells.x + 0.24 * (1.0 - (id.y + 0.5) / cells.y) + 0.18 * hash2(id + 3.1);
    float t = smoothstep(order * 0.68, order * 0.68 + 0.32, uBlend);
    float d = max(abs(f.x - 0.5), abs(f.y - 0.5)) * 2.0;     // 0 at the cell centre, 1 at its edge
    float r = t * 1.1;
    float m = 1.0 - smoothstep(r - 0.05, r, d);
    vec3 nb = sharpSample(uNextB, clamp(np, 0.0, 1.0));
    if (uFxB > 0.5) nb = live(uNextB, clamp(np, 0.0, 1.0), nb, uFxB);
    float run = sin(3.14159 * clamp(uBlend, 0.0, 1.0));
    float ring = (1.0 - smoothstep(0.0, 0.07, abs(d - r))) * step(0.001, t) * (1.0 - t);
    float line = 1.0 - smoothstep(0.0, 0.045, 1.0 - d);
    nx = mix(nx, nb, m)
       + vec3(1.0, 0.55, 0.22) * ring * 0.9                 // amber opening edge (the LED column)
       + vec3(1.0, 0.16, 0.08) * line * run * 0.32;         // red grid lines while the tiles turn
  } else if (uBlend > 0.0 && uMode < 2.5) {
    // rising water (chapter change, red -> gold): the next photograph comes up from the bottom
    // like a tide. The waterline rolls with a slow swell, B ripples just under the surface and
    // calms with depth, a gold glint rides the line, and the old photograph warms toward gold
    // as the water climbs, so the colour grade turns before the picture does.
    float swell = (sin(vUv.x * 7.0 + uTime * 0.8) * 0.014 + sin(vUv.x * 19.0 - uTime * 1.3) * 0.006
                 + (noise1(vUv.x * 5.0 + uTime * 0.15) - 0.5) * 0.04) * uMotion;
    float level = uBlend * 1.3 - 0.12 + swell;
    float d = level - vUv.y;                       // > 0 under water
    float m = smoothstep(0.0, 0.018, d);
    float settle = 1.0 - smoothstep(0.82, 1.0, uBlend);
    float rip = exp(-max(d, 0.0) * 6.0) * settle * uMotion;
    vec2 bp = np + vec2(sin(vUv.y * 95.0 - uTime * 2.4) * 0.007, cos(vUv.x * 40.0 + uTime * 1.7) * 0.004) * rip;
    vec3 nb = sharpSample(uNextB, clamp(bp, 0.0, 1.0));
    if (uFxB > 0.5) nb = live(uNextB, clamp(bp, 0.0, 1.0), nb, uFxB);
    // above the line: the old image turns amber, strongest close to the water
    float lum = dot(nx, vec3(0.45, 0.42, 0.13));
    vec3 warm = lum * vec3(1.45, 0.86, 0.3) + nx * vec3(0.25, 0.18, 0.05);
    float heat = smoothstep(0.0, 0.85, uBlend) * (0.45 + 0.55 * exp(min(d, 0.0) * 4.0));
    nx = mix(nx, warm, heat * 0.8);
    float glint = exp(-abs(d) * 110.0) * (0.55 + 0.45 * sin(vUv.x * 160.0 + uTime * 3.0)) * settle;
    float glow = exp(-abs(d) * 14.0) * 0.22 * settle;
    nx = mix(nx, nb, m) + vec3(1.0, 0.74, 0.32) * (glint * 0.9 + glow);
  } else if (uBlend > 0.0) {
    // dusk bloom (gold -> gold, into the silhouette): the incoming photograph opens outward from
    // its burning horizon band, up and down at once, with a hot orange edge and a heat shimmer
    // that settles. The silhouette photo's horizon sits about 60% up the frame.
    float hz = 0.6;
    float shimmer = (noise2(vec2(vUv.x * 14.0, uTime * 0.7)) - 0.5) * 0.05 * uMotion;
    float reach = uBlend * 1.25 - abs(vUv.y - hz) * 1.6 + shimmer + (noise1(vUv.x * 6.0 + 3.0) - 0.5) * 0.12;
    float m = smoothstep(0.0, 0.08, reach);
    float settle = 1.0 - smoothstep(0.85, 1.0, uBlend);
    vec2 bp = np + vec2(0.0, shimmer * 0.12 * settle);
    vec3 nb = sharpSample(uNextB, clamp(bp, 0.0, 1.0));
    if (uFxB > 0.5) nb = live(uNextB, clamp(bp, 0.0, 1.0), nb, uFxB);
    float edge = exp(-abs(reach - 0.02) * 40.0) * settle;
    nx = mix(nx, nb, m) + vec3(1.0, 0.45, 0.08) * edge * 0.7;
  }
  nx *= uNextBright;
  float burn = uExit * 1.7 - colRand * 0.32 - nSlow * 0.22 - (1.0 - vUv.y) * 0.38;
  float mixv = smoothstep(0.0, 0.38, burn);
  c += vec3(0.89, 0.18, 0.03) * smoothstep(0.0, 0.12, burn) * (1.0 - smoothstep(0.12, 0.4, burn)) * 0.35; // ember edge
  c = mix(c, nx, mixv);

  // 9. film grain + fade up
  float g = hash2(gl_FragCoord.xy + fract(uTime) * 91.7) - 0.5;
  c += g * 0.03 * (1.0 - 0.75 * uExit);   // grain mostly off once the next image is up
  c *= uReveal;
  gl_FragColor = vec4(max(c, 0.0), 1.0);
}
`

export interface HeroScene {
  uniforms: Record<string, THREE.IUniform>
  /** load a chapter image into a texture slot ('uNext' = A, 'uNextB' = B) */
  setImage(slot: 'uNext' | 'uNextB', slug: string): Promise<void>
  /** start loading a chapter image; resolves when it is ready */
  preload(slug: string): Promise<THREE.Texture>
  /** a chapter image that has finished loading, else undefined */
  texture(slug: string): THREE.Texture | undefined
  ready: Promise<void>
  setActive(on: boolean): void
}

export function createHero(canvas: HTMLCanvasElement, opts: { reducedMotion: boolean }): HeroScene {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: false, alpha: false, powerPreference: 'high-performance' })
  const scene = new THREE.Scene()
  const camera = new THREE.Camera()

  // always the full-quality lossless photographs: quality is the client's first priority, and a
  // size guess made once at load (from window.screen) proved unreliable and served soft images
  const suffix = ''
  const loader = new THREE.TextureLoader()
  const load = (url: string) =>
    new Promise<THREE.Texture>((res, rej) =>
      loader.load(url, (t) => {
        t.minFilter = THREE.LinearFilter
        t.magFilter = THREE.LinearFilter
        t.generateMipmaps = false
        t.wrapS = t.wrapT = THREE.ClampToEdgeWrapping
        res(t)
      }, undefined, rej),
    )

  const uniforms: Record<string, THREE.IUniform> = {
    uTex: { value: null },
    uNext: { value: null },
    uRes: { value: new THREE.Vector2(1, 1) },
    uTexAspect: { value: 1672 / 941 },
    uTexel: { value: new THREE.Vector2(1 / 1672, 1 / 941) },
    uTime: { value: 0 },
    uReveal: { value: 0 },
    uStretch: { value: opts.reducedMotion ? 1 : 0 },
    uExit: { value: 0 },
    uMotion: { value: opts.reducedMotion ? 0 : 1 },
    uNextB: { value: null },
    uBlend: { value: 0 },
    uMode: { value: 0 },
    uFxA: { value: 0 },
    uFxB: { value: 0 },
    uNextPan: { value: new THREE.Vector2(0, 0) },
    uBeacon: { value: new THREE.Vector2(0.5, 0.5) },
    uBeaconAmt: { value: 0 },
    uNextZoom: { value: 1 },
    uNextBright: { value: 1 },
    uMouse: { value: new THREE.Vector2(0.5, 0.5) },
    uVel: { value: new THREE.Vector2(0, 0) },
    uBend: { value: 0 },
  }

  const mesh = new THREE.Mesh(
    new THREE.PlaneGeometry(2, 2),
    new THREE.ShaderMaterial({ vertexShader: vert, fragmentShader: frag, uniforms, depthTest: false, depthWrite: false }),
  )
  scene.add(mesh)

  const resize = () => {
    const w = window.innerWidth, h = window.innerHeight
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.setSize(w, h, false)
    uniforms.uRes.value.set(w, h)
  }
  resize()
  window.addEventListener('resize', resize)

  // pointer: target -> critically damped follow, velocity feeds the wake
  const target = new THREE.Vector2(0.5, 0.5)
  let bendTarget = 0
  const fine = window.matchMedia('(hover: hover) and (pointer: fine)').matches
  if (!opts.reducedMotion) {
    window.addEventListener('pointermove', (e) => {
      target.set(e.clientX / window.innerWidth, 1 - e.clientY / window.innerHeight)
      bendTarget = 1
    }, { passive: true })
    const rest = () => { if (!fine) bendTarget = 0 }
    window.addEventListener('pointerup', rest, { passive: true })
    window.addEventListener('pointercancel', rest, { passive: true })
    document.documentElement.addEventListener('pointerleave', () => { bendTarget = 0 })
  }

  let active = true
  let raf = 0
  let last = performance.now()
  const frame = (now: number) => {
    raf = 0
    const dt = Math.min((now - last) / 1000, 0.05)
    last = now
    uniforms.uTime.value += dt
    const k = 1 - Math.exp(-dt * 6)
    const mouse = uniforms.uMouse.value as THREE.Vector2
    const vel = uniforms.uVel.value as THREE.Vector2
    const px = mouse.x, py = mouse.y
    mouse.lerp(target, k)
    const kv = 1 - Math.exp(-dt * 9)
    vel.x += ((mouse.x - px) / Math.max(dt, 1e-3) * 0.06 - vel.x) * kv
    vel.y += ((mouse.y - py) / Math.max(dt, 1e-3) * 0.06 - vel.y) * kv
    uniforms.uBend.value += (bendTarget - uniforms.uBend.value) * (1 - Math.exp(-dt * 3))
    renderer.render(scene, camera)
    if (active && !document.hidden) raf = requestAnimationFrame(frame)
  }
  const kick = () => { if (!raf && active && !document.hidden) { last = performance.now(); raf = requestAnimationFrame(frame) } }
  document.addEventListener('visibilitychange', kick)

  const cache = new Map<string, Promise<THREE.Texture>>()
  const loaded = new Map<string, THREE.Texture>()
  const preload = (slug: string) => {
    if (!cache.has(slug)) cache.set(slug, load(`/img/${slug}${suffix}.webp`).then((t) => { loaded.set(slug, t); return t }))
    return cache.get(slug)!
  }
  const ready = Promise.all([load(`/img/hero-chongqing${suffix}.webp`), preload('red-crimson-haze')]).then(([a, b]) => {
    const img = a.image as HTMLImageElement
    uniforms.uTexel.value.set(1 / img.width, 1 / img.height)
    uniforms.uTex.value = a
    uniforms.uNext.value = b
    kick()
  })

  return {
    uniforms,
    ready,
    setActive(on) { active = on; if (on) kick() },
    setImage(slot, slug) {
      return preload(slug).then((t) => { uniforms[slot].value = t })
    },
    preload,
    texture: (slug) => loaded.get(slug),
  }
}
