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
uniform float uMode;       // transition style: 0 = falling rain, 1 = grid tiles, 2 = rising water, 3 = rush into the street, 4 = fog rolls in
uniform float uFxA;        // live effect of the photo in slot A: 0 none, 1 red-grid beams, 2 neon canyon, 3 fog skyline
uniform float uFxB;        // same for slot B
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

// ---- neon canyon photo (Section 05): subtle, alive, answers the pointer ----
const vec2 VP = vec2(0.43, 0.68);   // the street's vanishing point in the canyon photo (image uv, y up)
float luma(vec3 c) { return dot(c, vec3(0.299, 0.587, 0.114)); }
// depth parallax: the near buildings move with the pointer, the far end of the street barely does
vec2 canyonShift(vec2 uv) {
  float d = length((uv - VP) * vec2(uTexAspect, 1.0));
  return -(uMouse - 0.5) * vec2(0.014, 0.009) * clamp(d * 1.3, 0.0, 1.0) * uMotion;
}
vec3 canyon(vec2 uv, vec3 c) {
  float d = length((uv - VP) * vec2(uTexAspect, 1.0));
  // neon: strongly red or strongly teal/green pixels
  float neon = smoothstep(0.08, 0.3, max(c.r - max(c.g, c.b), c.g - c.r)) * smoothstep(0.3, 0.6, max(c.r, c.g));
  // 1. traffic: light pulses travel up the street toward the viewer, only on head and tail lights
  float road = (1.0 - smoothstep(0.6, 0.68, uv.y)) * smoothstep(0.26, 0.33, uv.x) * (1.0 - smoothstep(0.72, 0.8, uv.x));
  float lamps = smoothstep(0.55, 0.9, luma(c));
  float wave = pow(0.5 + 0.5 * sin(log(d + 0.02) * 9.0 - uTime * 2.2), 6.0);
  c += c * road * lamps * wave * 0.5 * uMotion;
  // 2. tired tubes: now and then one vertical band of neon dips and catches again
  float band = floor(uv.x * 16.0);
  float clock = floor(uTime * 3.0 + hash(band) * 30.0);
  c *= 1.0 - neon * step(0.968, hash(band * 13.0 + clock)) * 0.45 * uMotion;
  // 3. the neon field breathes, band by band
  c *= 1.0 + neon * 0.06 * sin(uTime * 0.8 + band) * uMotion;
  // 4. the pointer warms the signs around it
  vec2 pd = (vUv - uMouse) * vec2(uRes.x / uRes.y, 1.0);
  c += c * neon * exp(-dot(pd, pd) / 0.02) * 0.45 * uBend * uMotion;
  return c;
}
// ---- fog skyline photo (Section 06, Chapter III "Clarity") ----
const vec3 FOG = vec3(0.30, 0.41, 0.41);   // the photo's teal-grey fog, lifted
float fogField(vec2 q, float t) {
  return noise2(q * 2.4 + vec2(t * 0.035, t * 0.008)) * 0.62 + noise2(q * 6.0 - vec2(t * 0.05, 0.0)) * 0.38;
}
vec3 fogSky(sampler2D t, vec2 uv, vec3 c) {
  vec2 q = uv * vec2(uTexAspect, 1.0);
  float sky = smoothstep(0.42, 0.56, uv.y);            // the fog bank above the skyline
  float water = 1.0 - smoothstep(0.19, 0.25, uv.y);    // the river
  // 1. wisps drift through the fog bank
  float w = fogField(q, uTime);
  c = mix(c, c + FOG * 0.32, sky * smoothstep(0.45, 0.85, w) * 0.65 * uMotion);
  // 2. the river's reflections shimmer
  if (water > 0.0) {
    vec2 wu = uv + vec2(sin(uv.y * 240.0 + uTime * 1.5) * 0.0008 + sin(uv.y * 90.0 - uTime * 0.9) * 0.0005, 0.0) * uMotion;
    c = mix(c, texture2D(t, clamp(wu, 0.0, 1.0)).rgb, water);
  }
  // 3. the amber towers glow and ease, slowly, out of step with each other
  float amber = smoothstep(0.35, 0.7, c.r) * smoothstep(0.08, 0.3, c.r - c.b);
  c *= 1.0 + amber * 0.07 * sin(uTime * 0.7 + uv.x * 9.0) * uMotion;
  // 4. clarity: around the pointer the fog thins and the scene clears
  vec2 pd = (vUv - uMouse) * vec2(uRes.x / uRes.y, 1.0);
  float clear = exp(-dot(pd, pd) / 0.03) * uBend * uMotion;
  c = mix(c, max((c - FOG * 0.16) * 1.14, 0.0), clear * sky * 0.75);
  return c;
}

vec3 live(sampler2D t, vec2 uv, vec3 c, float fx) {
  if (fx > 2.5) return fogSky(t, uv, c);
  if (fx > 1.5) return canyon(uv, c);
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
  vec2 np = (cover(vUv) - 0.5) / uNextZoom + 0.5;
  np -= (uMouse - 0.5) * vec2(0.006, 0.004) * uMotion;
  // next chapter image: full brightness and the same light sharpening as the hero photo
  vec2 na = (uFxA > 1.5 && uFxA < 2.5) ? np + canyonShift(np) : np;   // depth parallax is the canyon's only
  vec3 nx = sharpSample(uNext, clamp(na, 0.0, 1.0));
  if (uFxA > 0.5) nx = live(uNext, clamp(na, 0.0, 1.0), nx, uFxA);
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
  } else if (uBlend > 0.0 && uMode < 3.5) {
    // rush into the street (gold reflections -> neon canyon). Long exposure, again: the river city
    // is pulled into light streaks toward the street's vanishing point, as if the camera were
    // yanked forward; the canyon opens outward from that same point, out of its own depth, its
    // edge tinted with the street's two neons (red, teal); then the motion blur clears.
    vec2 asp = vec2(uTexAspect, 1.0);
    vec2 dir = np - VP;
    float dist = length(dir * asp);
    float e = uBlend;
    float ease = 1.0 - pow(1.0 - e, 3.0);
    float ang = atan(dir.y * asp.y, dir.x * asp.x);
    float front = e * 1.3 - dist * 0.9 - (noise1(ang * 2.2 + 4.0) - 0.5) * 0.14 * uMotion;
    float m = smoothstep(0.0, 0.06, front);
    // A streaks toward the vanishing point (zoom blur that grows as the rush builds)
    float ka = 0.4 * smoothstep(0.0, 0.7, e) * uMotion;
    // per-pixel jitter turns the 10 samples into smooth streaks instead of stepped ghosts
    float jit = hash2(gl_FragCoord.xy + fract(uTime) * 17.0);
    vec3 sa = vec3(0.0);
    for (int i = 0; i < 10; i++) {
      float f = (float(i) + jit) / 10.0;
      sa += texture2D(uNext, clamp(VP + dir * (1.0 - ka * f), 0.0, 1.0)).rgb;
    }
    sa = sa / 10.0 * (1.0 + 0.5 * ka);
    // B arrives from deep down the street: scaled from far to near, its own blur clearing
    float bz = mix(2.4, 1.0, ease);
    float kb = 0.22 * (1.0 - smoothstep(0.45, 1.0, e)) * uMotion;
    vec3 sb = vec3(0.0);
    for (int i = 0; i < 10; i++) {
      float f = (float(i) + jit) / 10.0;
      sb += texture2D(uNextB, clamp(VP + dir / bz * (1.0 + kb * f), 0.0, 1.0)).rgb;
    }
    sb /= 10.0;
    // land exactly on the settled, sharpened photograph
    sb = mix(sb, sharpSample(uNextB, clamp(np, 0.0, 1.0)), smoothstep(0.85, 1.0, e));
    vec3 neonTint = mix(vec3(1.0, 0.2, 0.12), vec3(0.18, 0.95, 0.85), 0.5 + 0.5 * sin(ang * 5.0 + uTime * 1.2));
    float edge = exp(-abs(front - 0.03) * 34.0) * (1.0 - smoothstep(0.8, 1.0, e));
    nx = mix(sa, sb, m) + neonTint * edge * 0.6;
  } else if (uBlend > 0.0) {
    // fog rolls in (gold -> cool: Chapter II -> Chapter III "Clarity"). Drifting fog comes in off
    // the river and swallows the neon canyon, cooling it as it thickens; when it thins again it
    // is the new skyline that shows, first through the clearings, then everywhere.
    float e = uBlend;
    vec2 q = np * vec2(uTexAspect, 1.0);
    float drift = e * 1.4;                                   // the bank rolls across as you scroll
    float f = fogField(q + vec2(-drift, drift * 0.15), uTime * 6.0);
    float g = noise2(q * 1.1 + vec2(-drift * 0.6, 0.0));
    float dens = smoothstep(0.0, 0.48, e) * (1.0 - smoothstep(0.52, 1.0, e));   // 0 -> thick -> 0
    float veil = clamp(dens * 1.45 + (f - 0.5) * 1.1 * dens + (g - 0.5) * 0.5 * dens, 0.0, 1.0);
    // the swap happens under the fog, clearings first
    float swap = smoothstep(0.36, 0.66, e + (f - 0.5) * 0.32);
    vec3 nb = sharpSample(uNextB, clamp(np, 0.0, 1.0));
    if (uFxB > 0.5) nb = live(uNextB, clamp(np, 0.0, 1.0), nb, uFxB);
    // the canyon cools as the fog arrives: its warm neon greys toward teal
    float lumA = dot(nx, vec3(0.3, 0.55, 0.15));
    vec3 cooled = mix(nx, lumA * vec3(0.72, 1.0, 1.0) + nx * 0.25, smoothstep(0.08, 0.45, e));
    vec3 base = mix(cooled, nb, swap);
    // fog: teal-grey, lit from within by whatever burns behind it
    vec3 fogC = mix(FOG * 0.42, FOG * 1.45, smoothstep(0.2, 0.85, f)) + base * 0.3;   // billows: light and dark
    nx = mix(base, fogC, veil * 0.97);
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
