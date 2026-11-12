# updates.md — Pragya Reddy A · Portfolio

> **New session? Read this whole file before doing anything else.**
> Working rule: build **one section at a time**, stop after each, tell the client how to view it, and wait for approval before moving on.
> Design context: **`PRODUCT.md`** (who the site is for, purpose, constraints) and **`DESIGN.md`** + `.impeccable/design.json` (the visual system, North Star "Long Exposure") live at the project root (set up 2026-11-13 with impeccable). Read them too. For every section: load the relevant design skills (impeccable, ui-ux-pro-max, taste-skill, animate, choreograph), run impeccable's critique before showing the client, and run `impeccable detect --json <changed files>` until it is clean.

Last updated: 2026-11-13 · Stage: **Branch `skills-polish`: design-skills pass over Sections 00–04, waiting for client review (approve = merge into `main`, reject = delete the branch).**

---

## 1. Project summary

A cinematic, storytelling-driven portfolio site (Awwwards/FWA ambition) for **Pragya Reddy A**, built on a set of night-city neon photographs. The site is one continuous "night" told in three colour chapters (red → gold → cool neon), each graded to match its photographs, with a WebGL long-exposure hero and a comet cursor that recolours with every chapter.

All written content comes **only** from `Pragya_Reddy_A-CV-Optum-IEDP.pdf`. No invented facts.

### Source assets (project root)

| File | Use |
|---|---|
| `Pragya_Reddy_A-CV-Optum-IEDP.pdf` | All content |
| `aa-pr-upscaled-photos/landing page-(remove the top right font).png` | Hero (text top-right to be removed) |
| `aa-pr-upscaled-photos/*.png` (7 more) | Chapter images |
| `aa-pr-upscaled-photos/cursor flow.jpeg` | Cursor comet reference |
| `main font.jpeg` | Display font pair + poster layout reference |
| `font 2.png` | Charlton (secondary font) reference |

All photos are 1671–1672 × 941 px (RGB).

---

## 2. CV content (verbatim facts available)

- **Name:** Pragya Reddy A
- **Location:** Chennai, Tamil Nadu
- **Contact to publish (client decision: email only, no phone):**
  - Email: pragyareddy103@gmail.com (`mailto:` link in CV)
  - GitHub: https://github.com/pragya2409
  - LinkedIn: https://www.linkedin.com/in/pragya-reddy-a-5a6219424/
  - LeetCode: https://leetcode.com/u/FvvSYKrNjQ/
  - (URLs extracted from the CV PDF's link annotations.) **Do not publish the phone number.**
- **Education:** SRM Institute of Science and Technology, Ramapuram · B.Tech Computer Science and Engineering · Aug 2024 – May 2028 · CGPA 9.26/10 · Coursework: Operating Systems, DBMS, Data Structures & Algorithms, Machine Learning, OOP
- **Experience:** Logic Play Technical Club — Technical Team Member (2026). Helped run and judged *Stack Roulette*, a hackathon where teams built an app on a randomly drawn tech stack.
- **Research:** HIEN — Interpretable Emotional Influence Modelling in Multi-Party Conversations (2026). Python, PyTorch Geometric, WavLM, DeBERTa-v3, HMM, SHAP. Graph neural network over fused audio + text embeddings models how one speaker's emotion shifts another's (MELD, EmoryNLP): macro-F1 0.228 vs 0.225 baseline; HMM, GMM and SHAP explain the predictions.
- **Projects:**
  1. AI-Powered Conversational Interface for ARGO Ocean Data — Python, LLMs, RAG, PostgreSQL, Streamlit. Plain-English chat over ARGO float data (temperature, salinity, BGC); RAG-grounded LLM translates questions to SQL; Python ETL from NetCDF → PostgreSQL + vector DB for metadata; Streamlit + Plotly dashboard (trajectories, depth–time profiles, profile comparisons).
  2. Credit Risk Scoring with Reject Inference & Counterfactuals — Python, LightGBM, XGBoost, SHAP, DiCE. Stacked ensemble (LightGBM, XGBoost, LR base; LR meta) on Home Credit (~307K applicants), 5-fold OOF CV: AUC 0.7579 vs 0.7562 best single model. Reject inference with fuzzy augmentation on a simulated selection-biased population; gender/age fairness audit. Team project also covering SHAP adverse-action explanations, DiCE counterfactuals, Markov-chain + Monte Carlo credit-trajectory simulator on UPI transaction data.
  3. AI Critical Health Predictor — Python, Streamlit. Team ML project; helped build the Streamlit risk-prediction dashboard.
  4. Exam Scheduler — Python, HTML. Sole developer on a team project: conflict-free timetable generation, data storage, core logic.
  5. Multi-Vendor E-Commerce System — Python, SQL, Streamlit. Team project: helped design relational schema and backend logic.
  6. Path Finder — Java, HTML. Dijkstra shortest-path route planner (the algorithm behind OSPF routing) on an amusement-park map.
- **Skills:** Languages (Python, SQL, Java, C++, HTML) · AI & LLMs (LLMs, RAG, Vector DBs, Hugging Face Transformers, Model Evaluation: AUC, macro-F1, cross-validation) · Responsible & Explainable AI (SHAP, DiCE, Fairness Auditing) · Machine Learning (scikit-learn, LightGBM, XGBoost, PyTorch, PyTorch Geometric, GNNs, HMM, GMM, Monte Carlo, Markov Chains) · Data & Reporting (PostgreSQL, ETL, Pandas, NumPy, Plotly, Streamlit, Flask) · Tools (Git, GitHub, PyCharm, Colab, Kaggle Notebooks)
- **Achievements:** CGPA 9.26/10 · HIEN research paper.

---

## 3. Image analysis and colour groups

Measured from each image (shadow = darkest 30% avg, mid = median band, high = brightest 5% avg):

| Image | Shadow | Mid | Highlight | Character |
|---|---|---|---|---|
| Landing (hero) | `#150D0D` | `#2B150F` | `#CD9255` | Vertical long-exposure streaks: red `#E42E08`, amber `#E89135`, white-hot `#EBE8DA` |
| Crimson Neon Sign Through Red Haze | `#160401` | `#500301` | `#E95D46` | Monochrome red, blurred haze, neon script sign |
| Neon Rooftop Gate in the Rain | `#040202` | `#0F080A` | `#98473B` | Red neon on near-black, **navy/teal sky** in the back |
| Neon Red Grid Cityscape | `#070303` | `#1B0B08` | `#9F6C3C` | Red beam grid, **amber LED column**, small cyan neon |
| Golden Reflections Over the Night City | `#181006` | `#351D06` | `#E4A253` | Amber city + river reflections, **red arch bridge** |
| Woman Silhouette Over a Glowing Cityscape | `#080808` | `#241710` | `#F58E12` | Fiery orange sky, black silhouette |
| Neon Fog Over Chongqing Skyline | `#0C1A1A` | `#42382C` | `#F09B33` | **Amber towers inside teal fog**, ghost figures |
| Neon Hong Kong Night Ride | `#100723` | `#411C57` | `#ACA5C4` | Electric blue + magenta + red signage, wet street |

**Verdict on the client's grouping (plan accepted by client 2026-11-12):** confirmed — the three groups are right. Adjustment is only to the **order inside each group**, so each chapter ends on an image that already contains the next chapter's colour (built-in bridge for the scroll transitions):

- Hero → **Red**: hero streaks are red/amber → Crimson (pure red)
- Red ends on **Red Grid** (has an amber LED column) → Gold
- Gold starts on **Golden Reflections** (has a red arch bridge — echoes red), ends on **Woman Silhouette** (orange)
- Cool starts on **Neon Fog** (amber towers in teal fog — gold meets cool) → ends on **Hong Kong Ride** (blue/magenta)
- Rooftop Gate's navy sky is a quiet foreshadow of the cool chapter.

### Draft palettes (hex) — to be refined during each section's build

| Token | Hero "Exposure" | I · Red | II · Gold | III · Cool neon |
|---|---|---|---|---|
| ink (bg) | `#120B0B` | `#0A0302` | `#120C06` | `#060E14` |
| deep | `#2B150F` | `#3D0402` | `#482506` | `#112A6F` / `#1A2724` |
| core | `#E42E08` | `#A30202` | `#CA8334` | `#7A3068` (magenta) |
| glow | `#E89135` | `#E95D46` | `#F58E12` | `#F09B33` (fog amber) / `#4FB3FF` (cobalt neon, est.) |
| hot (text/head) | `#EBE8DA` | `#FFD9CF` | `#FFE6C2` | `#E6ECFF` |

---

## 4. Story plan (accepted 2026-11-12)

Concept: **"Long Exposure."** The hero is a camera shutter left open over a city. Scrolling is the exposure continuing through one night: red (signal), gold (reflection), cool neon (clarity). Chapter titles are mine; every fact under them is from the CV.

| # | Section | Image | Group | CV content |
|---|---|---|---|---|
| 00 | **Hero — Exposure** | Landing (text removed) | Hero (red/amber) | Name "Pragya Reddy A" in poster style (script over condensed serif); corner caps: Chennai, Tamil Nadu · B.Tech CSE · SRM IST Ramapuram · 2024–2028; pill label |
| 01 | **I · Signal — Introduction** | Crimson Neon Sign Through Red Haze | Red | Who she is: B.Tech CSE student at SRM IST Ramapuram, CGPA 9.26/10, Chennai; one-line statement built only from CV wording (AI/LLMs, explainable ML) |
| 02 | **I · Signal — Education** | Neon Rooftop Gate in the Rain | Red | SRM IST, Aug 2024 – May 2028, CGPA 9.26/10, coursework list |
| 03 | **I · Signal — Experience & Research** | Neon Red Grid Cityscape (grid ≈ graph) | Red | Logic Play Technical Club / Stack Roulette; HIEN research (GNN, fused audio+text, macro-F1 0.228 vs 0.225, HMM/GMM/SHAP); research paper |
| 04 | **II · Reflection — Featured work** | Golden Reflections (river ≈ ocean data) | Gold | ARGO Ocean Data interface; Credit Risk Scoring (AUC 0.7579 vs 0.7562, ~307K applicants, fairness audit, DiCE) |
| 05 | **II · Reflection — More work** | Woman Silhouette | Gold | Index of 4: AI Critical Health Predictor, Exam Scheduler, Multi-Vendor E-Commerce, Path Finder |
| 06 | **III · Clarity — Toolkit** | Neon Fog Over Chongqing (skills emerge from fog) | Cool | Six skill groups from CV |
| 07 | **III · Clarity — Contact / finale** | Neon Hong Kong Night Ride | Cool | Achievements recap + contact links (subject to client answer on phone/email) |

Cross-cutting builds (each its own review step):
- **Cursor comet** (after hero)
- **Chapter transitions** red→gold and gold→cool (built with the section that opens each new chapter)
- **Final polish pass**

### Proposed build order and model

| Step | What | Model |
|---|---|---|
| 0 | Project setup, asset pipeline (copy/slug/compress images, remove hero text), font specimen comparison | Regular (Opus 5.5) |
| 1 | Section 00 Hero (WebGL streaks, intro, cursor bend, bridge light, parallax depth, type reveal, scroll exit) | **Fable 5.2** |
| 2 | Cursor comet | **Fable 5.2** |
| 3 | Sections 01–03 (Red chapter) + hero→red exit | Regular for layout; Fable for the hero→red transition if not done in step 1 |
| 4 | Sections 04–05 (Gold) + red→gold transition | **Fable 5.2** for transition, regular for layout |
| 5 | Sections 06–07 (Cool) + gold→cool transition | **Fable 5.2** for transition, regular for layout |
| 6 | Final polish pass (performance, mobile, reduced motion, accessibility) | **Fable 5.2** |

---

## 5. Decisions (draft until approved)

### Fonts
- **Display script ("Start" in poster): APPROVED: Pinyon Script 400** (Google Fonts, OFL; self-hosted via `@fontsource/pinyon-script`, latin subset). Round 1 (Ballet etc.) rejected by client as "too clumsy"; round 2 offered 8 cleaner scripts, client picked A.
- **Lockup rule:** "Pragya" has two descenders (g, y) that collide with "Reddy"; the poster's "Start" has none. Script sits at **0.82x** the serif's size, lifted so its baseline only grazes the top of the serif caps: `translate(-54%, -66%) rotate(-7deg)` relative to the serif word's top-centre. CSS token `--script-scale`.
- **Display serif ("Somewhere"):** **APPROVED: Noto Serif Display, wdth 62.5 (ExtraCondensed), wght 500** (Google Fonts, OFL; self-hosted via `@fontsource-variable/noto-serif-display/wdth.css`, family name `Noto Serif Display Variable`, use `font-stretch: 62.5%`).
- Font tokens live in `site/src/style.css` (`--font-script`, `--font-display`, `--font-secondary`, `--font-ui`, utility classes `.t-script`, `.t-display`, `.t-secondary`, `.t-caps`). The specimen page still uses the Google Fonts CDN, for comparison only; the site itself makes no external font requests.
- **Secondary — Charlton:** by Faraz Ahmad / Creativetacos (© 2018, creativetacos.com). Client supplied `aa-pr-upscaled-photos/charlton.zip` (9 OTFs: Thin, Light, Regular, Medium, Bold + italics). Converted to woff2 in `site/public/fonts/`. No licence file in the zip; the client is responsible for holding a web licence.
- **Body/UI: Archivo** (Google Fonts, OFL; self-hosted via `@fontsource-variable/archivo/wdth.css`, family `Archivo Variable`, stretch 62-125%). Condensed caps (`font-stretch: 62%`, 600, uppercase, +0.06em) for poster-style corner labels; normal width for body; tabular figures for metrics.
- Avoid: Inter, Geist, Space Grotesk, Instrument Serif.

### Tech stack (installed)
- Vite ^8.3.6 + vanilla TypeScript ~7.0.2 (multi-page: `index.html` site, `specimen.html` type specimen)
- three ^0.187.0 (+ @types/three): WebGL hero shader, distortion, chapter grading, comet
- gsap ^3.15.1: ScrollTrigger + SplitText (GSAP is fully free)
- lenis ^1.3.27: smooth scroll
- Python 3.13 + OpenCV 5 + fontTools + brotli: asset pipeline `site/scripts/prep_assets.py`

### Planned folder structure
```
/                         source assets (untouched originals, never edit)
/.claude/launch.json      desktop-app preview config ("site" -> npm --prefix site run dev, port 5173)
/site                     Vite project
  index.html              the site (currently a Step 0 stub)
  specimen.html           type specimen for font choice (Step 0)
  vite.config.ts          multi-page build, port 5173
  /scripts/prep_assets.py asset pipeline (cleaning + WebP + woff2)
  /public/img             processed images: <slug>.webp (1672px) + <slug>-960.webp
  /public/fonts           Charlton-*.woff2 (+ chosen display fonts later)
  /public/ref             poster.jpg, charlton.png (reference only)
  /src
    main.ts, style.css
    /gl                   (to come) shaders + WebGL scenes (hero, grade, comet)
    /sections             (to come) one module per section
/updates.md
```

Image slugs: `hero-chongqing`, `red-crimson-haze`, `red-rooftop-gate`, `red-grid`, `gold-reflections`, `gold-silhouette`, `cool-fog`, `cool-hongkong`.

Image cleaning done by `prep_assets.py` (client-approved):
- hero: "CYBERPUNK DREAMS 1 / FROM CHONGQING / 重庆" removed (sky refill with matched grain; no seam at 4x exposure)
- red-crimson-haze: "...we found one of them" removed
- red-rooftop-gate: "DP WORLD" sign removed

### Run locally
```
cd site
npm install
npm run dev
```
Then open http://localhost:5173 (site) or http://localhost:5173/specimen.html (type specimen).
Re-run assets after changing source photos: `cd site && python scripts/prep_assets.py`

---

## 6. Section status

| # | Section | Status | Built with | Client feedback | Changes made |
|---|---|---|---|---|---|
| — | Overall plan | Approved (client answered all questions, no changes) | Opus 5.5 | Right CV; remove Crimson text; email only; links from PDF; Charlton supplied; remove DP World | Applied all |
| 0 | Setup + assets + font specimen | **Approved** | Opus 5.5 | Round 1: serif OK; script (Ballet) "too clumsy". Round 2: picked A, Pinyon Script | Swapped in 8 cleaner scripts, shrank and lifted the script layer; self-hosted the final fonts |
| 00 | Hero | **Approved** ("the landing page is perfect") | Fable 5.2 (build), Opus 5.5 (rounds 2-4) | R1: image blurry; Pragya should lead and animate first. R3: Reddy a little bigger. R4: bigger again, g/y tails complete | See section 8 |
| — | Cursor comet | **Approved** | **Fable 5.2** | Approved first round | — |
| 01 | Introduction | **Approved** | Opus 5.5 | Brief from client: "make the Chapter I font really big"; approved first round | Built as in section 9 |
| 02 | Education | **Approved** | Opus 5.5 | Approved first round | — |
| 03 | Experience & Research | **Approved (round 2)** | Opus 5.5 | R1: make the red cuboids move; HIEN diagram broken, texts overlapping, make it proper and interactive | Shader beams animation; HIEN split into title screen + interactive pipeline diagram; reel clip fix |
| 04 | Featured work + red->gold transition | **Approved (round 2)** | Fable 5.2 (R1), Opus 5.5 (R2) | R1: project slides look soulless, plain, no interaction, "AI slop" | Rebuilt ARGO as an interactive console and Credit Risk as a live stacking diagram; photo shows through again |
| 05 | More work | Planned | — | — | — |
| 06 | Toolkit | Planned | — | — | — |
| 07 | Contact / finale | Planned | — | — | — |
| — | Final polish | Planned | — | — | — |

---

## 7. Questions and answers

Answered 2026-11-12:
1. Right CV? **Yes.** Present her as an AI/ML engineer; claim nothing about design.
2. "...we found one of them": **remove** (done).
3. Contact: **email is enough**, no phone on the site.
4. LinkedIn / LeetCode: **use the links embedded in the PDF** (extracted, see section 2).
5. Charlton: **file supplied** (`charlton.zip`, converted).
6. DP World sign: **remove** (done).

Open:
- None blocking.

## 8. Hero implementation notes (Section 00)

Files: `site/src/gl/hero.ts` (three.js fullscreen shader), `site/src/sections/hero.ts` (DOM, intro timeline, scroll exit), `site/src/main.ts` (Lenis + ScrollTrigger wiring), hero block in `site/src/style.css`.

Shader uniforms and what drives them:
- `uReveal` 0->1, 1.1s power2.out: fade up from black
- `uStretch` 0->1, 3.4s power2.inOut from 0.25s: the photo above the waterline (`HORIZON = 0.30`, image space, y up) is compressed to 5% height at the waterline, then stretches to full height. Broad low-frequency noise makes districts open slightly apart. (Per-column random delays were tried and rejected: they looked like bars, then like flames.)
- shimmer/drift (always on): per-column noise wobbles each streak vertically, flickers bright columns +/-17%, and varies a 10-tap upward smear
- pointer: `uMouse` (damped follow, rate 6/s), `uVel` (wake), `uBend` (presence). Gaussian falloff pulls streaks toward the pointer (0.62 strength, wide vertically, mostly above the waterline)
- depth: UV offset by pointer, 0.022 x / 0.012 y, scaled 1.0 at the water down to 0.18 in the sky; `ZOOM = 0.94` overscan hides edges
- bridge light: quadratic bezier (0.317,0.138) -> (0.500,0.225) -> (0.655,0.268) in image space (y up), two amber pulses, 0.085 cycles/s, head + exponential tail
- `uExit` 0->1 from ScrollTrigger (hero is 240svh with a sticky 100svh pin, scrub 0.6): stretch multiplies up to 6.5x, smear lengthens, columns burn out top-down with an ember edge into `red-crimson-haze` at 62% brightness. Type lifts 9vh and fades out by 45% of the exit.
- scrim behind the lockup (42% darkening, gaussian), vignette, film grain 5.5%

Type (DOM over the canvas): "Reddy" letters rise from a mask (expo.out, 1.25s, 70ms stagger, from 1.75s); "Pragya" is written left to right with a clip-path wipe (1.5s power2.inOut, from 2.25s); corners, rules and pill fade in (from 2.9s). Lockup size `min(21vw, 34svh)`, phones `min(34vw, 30svh)`. Type colour is warm white (`--hot`), not poster red: red type disappeared against the red/amber streaks.

Hero copy (all from the CV): corners "Pragya Reddy A / Chennai, Tamil Nadu", "B.Tech · Computer Science and Engineering", "SRM Institute of Science and Technology, Ramapuram", "CGPA 9.26 / 10", "AI & LLMs / Explainable AI"; pill "2024 — 2028".

Reduced motion: no stretch intro, shimmer, bend, parallax or bridge pulse; simple 0.6s fades; native scroll (no Lenis); exit still crossfades with scroll.
Performance: DPR capped at 1.75; 960px textures when the short side is under 700px; render loop stops when the tab is hidden.
Dev: `window.__hero.uniforms` is exposed in dev builds for inspecting any frame.

Placeholder: `.next-stub` ("Chapter I / Signal") after the hero exists only so the exit has a destination. Section 01 replaces it. The fixed canvas currently only knows the hero; when Section 01 is built it must take over the crimson image the hero dissolves into.

Verified in the browser preview: final frame, mid-intro frames, pointer bend, scroll exit at 3 positions, 375x812 phone layout, no console errors, `tsc --noEmit` clean. Not verified: real-device touch behaviour, frame rate on low-end phones, reduced-motion mode (code path only).

Skills: `taste-skill` and `animate` loaded. taste-skill's kit, dealer and gate target company sites built from its templates, so only its rules were applied (real content only, no captions under images, reduced motion, phone layout).

### Round 2 changes (client feedback, built on Opus 5.5)

Sharpness (sources are 1672 x 941 px; nothing above that resolution exists):
- The loader picked the 960px file whenever the window's short side was under 700 CSS px (most laptop windows). Now it decides by real device pixels: `max(screen.w, screen.h) * dpr < 1100` -> 960px, else full size.
- Full-size WebP re-exported at quality 97 (was 90).
- The upward smear used to be blended 55% over the photo, blurring all detail. Now trails are added with `max()` ("lighten"), so the photo's own detail stays.
- Light unsharp mask on the base sample (0.6, 1-texel cross). `uTexel` uniform set from the loaded image.
- Overscan `ZOOM` 0.94 -> 0.97 (less enlargement); parallax reduced to 0.013 / 0.008 so it still fits.
- Per-column vertical wobble 0.010 -> 0.004; grain 5.5% -> 3%; centre scrim 42% -> 30%; DPR cap 1.75 -> 2.

Name hierarchy:
- "Pragya" is the lead line: Pinyon Script at `--name: min(19vw, 30svh)` (phones `min(25vw, 26svh)`), rotated -5deg, warm white with a red glow.
- Written on first, 0.9s -> 3.2s: a CSS mask driven by `--p` (pen position, soft 10% edge, power1.inOut 2.3s) plus a `.glint` copy that shows only a hot amber edge just behind the pen.
- "Reddy" is secondary: Noto Serif Display ExtraCondensed at 0.58x the script size, margin-top -0.2em so it tucks under the g/y tails (rounds 3-4: client asked for it bigger and for the g and y to read complete; was 0.36x), tracked +0.1em. Script hairlines thickened with `-webkit-text-stroke: max(1px, .011em)` + `paint-order: stroke fill`, because Pinyon hairlines fell below 1px and the g/y tails broke up, 82% opacity, below the script. Enters after the name is written (2.9s): fade + rise + 6px blur to sharp, 1.3s expo.out, as one word (no per-letter stagger).
- The old lockup rule (script 0.82x over a large serif) is retired for the hero.

## 9. Section 01 · Chapter I "Signal" · Introduction (built, Opus 5.5)

Files: `site/src/sections/intro.ts`, Section 01 block in `site/src/style.css`. Mounted in `main.ts` after the hero. The old `.next-stub` placeholder is removed.
Skills applied: `taste-skill` (real content only, no captions, reduced motion, phone layout), `animate` (curves, reduced motion), `choreograph` (lead/support/decoration casting, non-uniform timing, one entrance per row).

Background: still the hero canvas; the crimson image is its `uNext` texture. New uniforms `uNextZoom` (1 -> 1.14 slow push-in across the section) and `uNextBright` (1 behind the title, 0.55 behind the reading screen). It also follows the pointer slightly (0.006 / 0.004).

Screen 1, title (100svh):
- Kicker "Chapter I" with rules, corners "Chapter I of III", "Introduction", "Chennai, Tamil Nadu", "B.Tech CSE 2024 — 2028".
- "Signal" in Charlton Thin (100) at `min(54vw, 78svh)` (phones 53vw): fills ~80-90% of the width. Colour #ffe9e2 with a four-layer neon glow in the red palette.
- Choreography: Lead = the six letters, switched on like neon tubes (CSS `neon-on`, 1.15s steps, two false starts) with hand-set ignition delays S 0, a .42, l .30, i .55, g .12, n .22 (not uniform). Support = kicker (fade + 14px rise, expo.out .9s). Decoration = corners (fade only, from .6s). Triggered once at `top 45%`. The title block drifts up 18% while scrolling past (title only, never body text).

Screen 2, reading (210svh with a sticky 100svh pin; phones not pinned):
- Statement (Charlton Light, clamp 30-76px), built only from CV wording: "A Computer Science undergraduate at SRM IST, Ramapuram, working where machine learning meets language: large language models grounded by retrieval, and models that explain their own predictions."
- Words go from 16% to 100% opacity in reading order, scrubbed by scroll (`top 70%` -> `center 45%`).
- Three signals from the CV skill groups: 01 AI & LLMs; 02 Explainable AI; 03 Machine learning. One entrance for the row (fade + 16px rise, 0.7s expo.out, 100ms easing stagger).

Red palette tokens (on `.ch1`): `--r-ink #0a0302`, `--r-deep #3d0402`, `--r-core #a30202`, `--r-glow #e95d46`, `--r-hot #ffd9cf`.
Reduced motion: no ignition flicker, push-in, drift or word scrub; everything fades in together.

Verified: desktop title after ignition, the reading screen mid-scrub and fully lit, phone width (no sideways scroll, word 24-351px of 375). The phone ignition could not be watched because the hidden preview pane froze the animation clock; nothing is wrong in the code (each letter's animation was running, just not advancing). Not verified: real devices, reduced-motion mode.

## 10. Cursor comet (built, Fable 5.2)

File: `site/src/fx/comet.ts`; canvas styles at the end of `site/src/style.css`; wired in `site/src/main.ts`.
Reference: `aa-pr-upscaled-photos/cursor flow.jpeg`.

How it works (Canvas 2D, additive `lighter` blending, canvas has `mix-blend-mode: screen`, z-index 100, pointer-events none):
- Head: follows the pointer at rate 26/s (near 1:1; the small lag lays the tail down as a curve). Coloured bloom r = 46 + 30*speed + 16 on links, plus a white-hot inner flare (0.42 r) and a 3px white core at the exact pointer position. Native cursor hidden (`html.has-comet * { cursor: none }`).
- Tail: path points live `LIFE = 1.5s`, drift slightly up and back, fast moves are subdivided (max 7px steps). `STRANDS = 26` strands, each with its own lateral position, weave frequency, speed, phase and one of three palette colours. Offset from the path = fan (1.5 -> 62px, grows with age^0.9) + two sine weaves (20px and 6px), scaled by the speed at which that part was drawn. Strands are stroked in 4-point chunks with butt caps (round caps beaded), alpha (1-t)^1.35 * 0.46, thinned to 22% right behind the head so overlapping strands never burn to a solid bar.
- Haze: one wide low-alpha stroke under the strands (8 -> 86px wide) for the silky body.
- Sparkles: up to 420, emitted from the last 40 tail points when moving fast, 0.35-1.2px, twinkle at 14 rad/s, life 0.7-2s, drift up.
- Loop stops when the tail and sparkles have burned out and the head is settled; restarts on pointer move.

Palettes (`PALETTES` in comet.ts: head, strand A, strand B, strand C):
- hero `#fff1d0 #e89135 #e42e08 #ebe8da`
- red  `#ffe3da #ff6a4d #c40a06 #ff9d7e`
- gold `#fff0cf #f58e12 #ca8334 #ffd27a` (ready, not yet triggered)
- cool `#e6ecff #4fb3ff #b0409a #f09b33` (ready, not yet triggered)
Blend: every colour eases toward the target at `BLEND_RATE = 2.2/s` (about 1.2s to settle). Triggered by ScrollTrigger in `main.ts`: `.ch1` at `top 60%` -> `red`, back -> `hero`. **When the gold and cool chapters are built, add the same trigger for each** (`comet.setPalette('gold' | 'cool')`).

Off on touch devices and under reduced motion (native cursor stays).
Dev: `window.__comet.step(ms)` advances one frame without requestAnimationFrame (the preview pane freezes rAF when hidden); `window.__comet.setPalette(name)`.

Verified with simulated sweeps stepped frame by frame: hero palette over the skyline, red palette over the Section 01 text, no console errors, types clean. Not verified: the feel in real time (follow lag, tail length, weave speed), which needs the client's hand on a real mouse; the palette blend was checked at its end state only.

### Image quality round (client: "did you reduce the image quality? increase it", re the crimson image; Opus 5.5)
The crimson source is 1671 x 941 px (no newer upload exists in the folder). Losses removed:
- All full-size images are now exported as **lossless WebP** (`prep_assets.py`, quality 101). Sizes 1.2-2.5 MB each, so image weight must be watched once all eight load (lazy-load the later chapters).
- The crimson ("next") image used to be drawn at 62% brightness: now 100% behind the title, dimmed to 60% only behind the reading screen (legibility).
- Push-in while scrolling cut from +14% to +3% (enlarging softens it).
- Same light unsharp mask as the hero photo applied to the next image.
- Grain fades to 25% once the exit completes.

## 11. Section 02 · Chapter I · Education (approved, Opus 5.5)

Files: `site/src/sections/education.ts`, Section 02 block in `site/src/style.css`, mounted in `main.ts` after Section 01.

Background system (reusable for every later chapter image), in `site/src/gl/hero.ts`:
- Two chapter texture slots after the hero: `uNext` (A, currently crimson) and `uNextB` (B). `hero.setImage(slot, slug)` loads and caches `/img/<slug>.webp` into a slot.
- `uBlend` 0 -> 1 runs a **falling-rain dissolve**: 240 thin columns of B run down from the top at their own speeds, each with a wet red leading edge (`#ff5c42`-ish, 0.55) and a small downward drip offset, then the rest floods in from 55% to 100%.
- Both images are drawn with `sharpSample()` (the same light unsharp mask as the hero).
- For later sections: when a transition finishes, move the incoming image into `uNext`, load the next one into `uNextB`, and drive `uBlend` again (or use another transition style per chapter).

Section 02 (190svh, sticky 100svh pin; phones not pinned):
- Rain dissolve crimson -> rooftop scrubbed from section `top bottom` to `top 15%`; brightness rises 0.6 -> 1.0 and the push-in continues 1.03 -> 1.05.
- CSS scrim on the pin (left and bottom gradients) for legibility over the bright sign.
- Layout: corners "Chapter I / 02 · Education", "Aug 2024 — May 2028". Left: kicker "Education", school name in Charlton Light (clamp 40-96px, three masked lines), degree line. Right: "9.26" in Noto Serif Display ExtraCondensed (clamp 120-300px) with "CGPA" / "out of 10". Bottom: "Relevant coursework", five items with rules (2 columns on phones).
- Choreography: Lead = the three name lines (mask rise, expo.out 1.1s, easing stagger) together with "9.26" (one beat); Support = kicker, degree, labels (fade + 12px); Decoration = corners (fade only). Coursework: rules draw left to right, names follow 0.15s behind, both with easing staggers. Triggered once at `top 30%`, when the rain has mostly cleared.
- Content all from the CV: SRM Institute of Science and Technology, Ramapuram; B.Tech in Computer Science and Engineering; Aug 2024 – May 2028; CGPA 9.26/10; coursework Operating Systems, DBMS, Data Structures & Algorithms, Machine Learning, OOP.
- Reduced motion: no drift, no masks; one fade at `top 35%`.

Verified: rain dissolve mid-way, final desktop layout, phone layout (no sideways scroll), no console errors, types clean. Not verified: the dissolve in motion at real speed (the hidden preview pane freezes animation frames), real devices.

## 12. Section 03 · Chapter I · Experience & Research (built, Opus 5.5)

Files: `site/src/sections/research.ts`, Section 03 block at the end of `site/src/style.css`, mounted in `main.ts` after Section 02.

**Backdrop controller (new, replaces per-section image swapping):** `site/src/gl/backdrop.ts`.
- `createBackdrop(hero, 'red-crimson-haze')` is made once in `main.ts`; each section calls `backdrop.add({ from, to, style: 'rain' | 'grid', trigger, start?, end? })` **in scroll order** (default range: trigger `top bottom` -> `top 15%`).
- On every update it works out the whole state from scroll position: the first transition still running owns the slots (uNext = from, uNextB = to, uBlend = progress, uMode = style); finished ones hand their image on as the next A. Fast scrolling, jumps and scrolling back always show the right pair (checked: Chapter I, mid-02, end of 02, end of page, and back).
- Images are preloaded when `add` is called; the blend holds at 0 until the incoming image has loaded.
- `hero.ts` gained `preload(slug)`, `texture(slug)` and `uMode`. Section 02 now uses the controller (same rain dissolve; no extra scrub smoothing, Lenis already smooths).
- **For later chapters:** just `backdrop.add(...)` with the previous image as `from`. New transition styles go in the shader as another `uMode` branch plus a name in `MODE`.

Transition into 03 — **grid tiles** (`uMode = 1`): the frame splits into square cells (9 rows) that open from their centres in a diagonal sweep (left to right, top to bottom, a little randomness per cell); each opening edge is amber (the photo's LED column), and the cell borders glow red while it runs (the photo's beam grid). Zoom continues 1.05 -> 1.08 across Section 03.

Experience (110svh, not pinned; full photograph):
- Corners "Chapter I / 03 · Experience", "2026". Kicker "Experience"; "Logic Play / Technical Club" (Charlton Light, masked lines); "Technical Team Member · 2026".
- "Helped run and judged" / **STACK ROULETTE** / "a hackathon where teams built an app on a randomly drawn tech stack." The phrase is set in Noto Serif Display ExtraCondensed caps, neon glow, and each letter spins down a slot-machine strip and lands, left to right, later letters spinning longer (a drawn result, echoing "randomly drawn"). The strips hold filler letters only, no invented stacks. Screen readers get the plain phrase. On phones it breaks onto two lines between the words.

Research (230svh, sticky pin on desktop; image dimmed to 0.62 for reading):
- Corners "Chapter I / 03 · Research", "2026 / Research project". "HIEN" huge (display serif); full title in Charlton; description "A graph neural network over fused audio + text embeddings models how one speaker's emotion shifts another's, on the MELD and EmoryNLP datasets."; tools Python · PyTorch Geometric · WavLM · DeBERTa-v3 · HMM · SHAP.
- Diagram (SVG, builds with scroll through the pin): Audio · WavLM and Text · DeBERTa-v3 -> Fused -> graph of speakers (five illustrative nodes; the CV gives no count) with influence edges -> "HMM · GMM · SHAP explain the predictions". Once built, amber pulses keep travelling along the edges (CSS, off under reduced motion). A dark pool sits behind it for legibility over the beams.
- Metric row: Macro-F1 **0.228** · Baseline 0.225 · Achievement: Research paper. (Wording avoids "published": the CV only says "HIEN research paper".)
- Phones: not pinned; the diagram plays once when it scrolls into view.
- Reduced motion: no reel spin, no drift, no pulses; fades only.

Dev helpers: `window.__st` (ScrollTrigger) and `window.__gsap` are exposed in dev only, so stills can be checked in the hidden preview pane (`__st.update()`, `__gsap.globalTimeline.time(...)`).

Verified: grid transition mid-way, Experience and Research final layouts on desktop (1024) and phone (375, no sideways scroll), backdrop state at every chapter including scrolling back, types clean, no new console errors. Not verified: the reel spin, tile sweep and pulses at real speed (the hidden pane freezes animation), real devices. **Polish-pass note:** diagram labels are small on phones (~7px).

### Section 03 · round 2 (client feedback 2026-11-12)

Feedback: (1) "make the red cuboid like structures move in an animated way"; (2) "the HIEN project images and structure is off and broken, texts are overlapping; make the diagram proper and correctly interactive".

What was wrong: in the old SVG diagram the connector lines ran through the "Audio"/"Text" labels, and at laptop heights (e.g. 1536x730) the pinned layout was tight. The Stack Roulette reel could also show strip letters outside their slots mid-spin (composited layer escaping `overflow: hidden`).

Changes:
- **Moving beams** (`beams()` in `site/src/gl/hero.ts`, switched on per photo by `LIVE` in `backdrop.ts`; uniforms `uFxA`/`uFxB`). Only on `red-grid`. The beam pixels (strongly red) are picked out in the shader and: (a) float against the city on a slow per-row swell and lean with the pointer (composited with lighten, so no holes); (b) a neon light chase runs along every beam, each row at its own speed, phase and direction; (c) the structure breathes slowly; (d) the small square lanterns flicker. Off under reduced motion (`uMotion`). It is still one photograph, so the beams glow, flow and float rather than rearrange.
- **HIEN rebuilt as two screens** (no pin any more):
  - *HIEN* (100svh): huge "HIEN", full title, and on the right the description, tools and "Achievement · Research paper".
  - *How HIEN works* (100svh): an **interactive pipeline diagram** in HTML (text can no longer collide with lines): 01 Audio · WavLM (live waveform) and 01 Text · DeBERTa-v3 -> 02 Fusion · Fused embeddings -> 03 Graph neural network (PyTorch Geometric · MELD · EmoryNLP, five illustrative speaker nodes with influence edges) -> 04 Macro-F1 0.228 vs 0.225 baseline, and 04 Explained by HMM · GMM · SHAP. Curved wires join the steps (SVG, non-scaling strokes) with amber sparks running along them.
  - Interaction: every step is a real button (hover, tap, keyboard Tab). The active step lights amber, the others dim, and the "How it works" line explains it in CV wording. Pointing at a speaker lights only the edges leaving it and the speakers it reaches. Tap toggles on touch.
  - Entrance: one left-to-right pass in data-flow order (inputs, wire, fusion, wire, graph with speakers popping and edges drawing, wire, outputs, info line), once.
  - Phones: the pipeline stacks top to bottom, inputs and outputs side by side, wires become short vertical stems.
- Reel: each letter window now also uses `clip-path`, and the strips no longer use `will-change`.
- The image dims (to 0.58) only behind the diagram screen; Experience and HIEN show the photograph at full strength with the beams moving.

Dev note: Vite once cached `style.css` as empty because the file was read mid-rewrite. If styles vanish after an edit, touch the file again.

Verified at 1536x730 (the laptop size where the problem showed) and 375 phone: no overlaps, every step on one screen on desktop, no sideways scroll, speaker-hover state correct, no shader or console errors. Not verified: the beam animation, sparks and reel at real speed (the hidden preview pane freezes animation).

## 13. Section 04 · Chapter II "Reflection" · Featured work (built, Fable 5.2)

Files: `site/src/sections/featured.ts`, Section 04 block at the end of `site/src/style.css`, mounted in `main.ts` after Section 03. Gold palette tokens on `.ch4` (`--g-ink #120c06, --g-deep #482506, --g-core #ca8334, --g-glow #f58e12, --g-hot #ffe6c2, --g-pale #fff4e0`).

**Chapter transition red -> gold: "rising water"** (`uMode = 2`, style `'water'` in `backdrop.ts`, shader branch in `hero.ts`). Scrubbed from `.ch4` `top bottom` to `top 10%`:
- The gold photograph comes up from the bottom edge like a tide; the waterline rolls with a slow swell.
- Just under the surface the gold image ripples, and calms with depth; a gold glint and soft glow ride the line.
- Above the line the red photograph is graded toward amber as the water climbs (strongest near the water), so the colour turns before the picture does: no hard cut.
- Meanwhile the zoom pulls back 1.08 -> 1.02 and brightness returns 0.58 -> 1.
- Comet palette switches to `gold` at `.ch4` `top 55%` (back to `red` on the way up).

Screens:
1. **Chapter title** (100svh): kicker "Chapter II", the word **Reflection** (Charlton Thin, `min(27vw, 43svh)`, gold neon glow) with its own mirrored, faded, gently rippling reflection underneath (echoing the city's reflection in the photo). Letters rise out of the waterline from the middle outwards; the reflection fades in after they land. Corners: "Chapter II of III", "Featured work", "Two projects", "LLMs · Explainable AI".
2. **01 · AI-Powered Conversational Interface for ARGO Ocean Data**: tools Python · LLMs · RAG · PostgreSQL · Streamlit; a flow strip "Plain-English question -> LLM grounded by RAG -> SQL query -> PostgreSQL -> Plotly dashboard" whose steps light up one after another in a loop; three points (chat over float data: temperature, salinity, BGC; Python ETL from NetCDF to PostgreSQL + vector database; Streamlit + Plotly dashboard).
3. **02 · Credit Risk Scoring with Reject Inference & Counterfactuals**: tools Python · LightGBM · XGBoost · SHAP · DiCE; metric row AUC **0.7579** (stacked ensemble) · 0.7562 best single model · ~307K applicants (Home Credit); three points (stacked ensemble + 5-fold OOF CV; reject inference + fairness audit; team project: SHAP, DiCE, Markov-chain + Monte Carlo simulator on UPI data).
- Project screens: title lines rise (masked), number/tools/visual fade up, points follow in order, once each at `top 45%`. Image dimmed to 0.55 behind them; full strength behind the chapter title.
- Reduced motion: fades only, no ripple, no flow loop.

Verified: water transition mid-way (still), title and both project screens at 1536x730 and 1180x620 (each fits one screen), phone 375 (no sideways scroll), backdrop restores red-grid when scrolling back, no console or shader errors, types clean. Not verified: the tide, ripple and title entrance at real speed (hidden preview pane freezes animation). Known small thing: at narrower desktop widths the ARGO flow strip wraps onto two lines.

### Section 04 · round 2 (client feedback 2026-11-13)

Feedback: "the featured work slides ARGO and Credit Risk Scoring look soulless and plain with no interaction, like AI slop". Client also asked whether all design skills are used.

Skills used this round: **impeccable** (context + critique + craft floor + bolder/delight guides + its `detect` checker, which came back clean), **ui-ux-pro-max** (interaction/hover/GSAP guidance search), **taste-skill**, **animate**, **choreograph** (rules already loaded). impeccable reports there is no PRODUCT.md/DESIGN.md; offering `/impeccable init` to the client is a possible follow-up.

Critique (impeccable): the old screens used the hero-metric template (big number, small label, supporting stats), meaningless 01/02 section numbers and a/b/c bullet cards. They also opted out of the system's own strongest move (the interactive HIEN pipeline), and the photograph was dimmed nearly to black.

Rebuild (files `site/src/sections/work/argo.ts`, `site/src/sections/work/credit.ts`, `featured.ts`, Section 04 styles):
- Layout: text column (title, one CV summary paragraph, tools) on the left; the working piece on the right, larger. No index numbers, no bullets. The piece rises in first (clip reveal), then the title lines and the summary follow.
- **ARGO: "ask the ocean" console.** Three question buttons; the first asks itself when the console scrolls into view. Each run:
  1. types the question;
  2. steps the pipeline bar (Question -> Vector DB -> LLM -> SQL -> PostgreSQL -> Plotly) and the status lines (retrieve metadata from the vector database, LLM writes SQL grounded by RAG, run on PostgreSQL, draw in Plotly);
  3. types the SQL;
  4. draws the chart matching the CV's three views: trajectory, depth–time profile (temperature heat map), profile comparison (salinity).
  - Faint ocean contour lines drift under every chart, and a sonar ping pulses on the float's last position.
  - A new question cancels the running one cleanly.
  - On-screen note: "Illustration of the flow: the questions, query and charts are examples, not real ARGO data." **The SQL, table names and chart data are illustrative, not from the CV.**
- **Credit Risk: live stacking diagram.** Base learners (LightGBM, XGBoost, Logistic Regression) -> 5-fold CV grid -> out-of-fold predictions column -> Logistic Regression meta-learner.
  - The method plays on a loop while on screen: each fold is held out in turn, its predictions fill the OOF column, then the meta-learner fires. It shows how OOF CV works, not data.
  - AUC ruler (axis zoomed to 0.750–0.760, labelled): markers slide in to 0.7562 (best single model) and 0.7579 (stacked ensemble), with a +0.0017 bracket (derived from the two CV numbers).
  - Every part is a button (hover, tap, keyboard) that explains itself in the "How it works" line.
  - "Also in the project" tabs (arrow-key navigable): Reject inference, Fairness audit, SHAP + DiCE, Trajectory simulator, each with its CV sentence.
- The photograph shows through again: project-screen brightness 0.8 (was 0.55), lighter scrim; the pieces carry their own deep gold-black plates (no glass).
- Phones: everything stacks; the pipeline bar shows only the active stage's label; the stacking diagram becomes two rows.
- Reduced motion: final states only, no typing, loop, ping or swell.

Verified at 1536x730 (each screen fits) and 375 phone (no sideways scroll); all three ARGO runs, tabs and diagram parts exercised with no errors; impeccable detector clean; types clean. Not verified: typing, drawing and loop timing at real speed (hidden preview pane).

## 14. Design-skills pass over Sections 00–04 (branch `skills-polish`, Opus 5.5)

Client request 2026-11-13: "give my skills touches to previous made sections in a new branch; I will approve or revert". Skills used: impeccable (craft floor + critique + detector, clean before and after), ui-ux-pro-max (touch-target and interaction rules), DESIGN.md rules.

Changes:
- **Eyebrows removed** (impeccable bans a label above a heading; the corner labels already carry the chapter and section): "Chapter I" over Signal, "Chapter II" over Reflection, "Education", "Experience", "Research", "The model". Where the eyebrow was the heading, the real heading now is: the school name is the Education h2 and "Logic Play Technical Club" the Experience h2, each with a screen-reader-only prefix ("Education:", "Experience:", "Research:") so the outline still reads correctly.
- **Meaningless numbers removed:** 01/02/03 on the Chapter I signals. HIEN's pipeline step numbers stay (the order means something).
- **Browser surfaces themed:** text selection colour per chapter, thin themed scrollbar (red-to-amber thumb), caret colour, one consistent focus ring per chapter for anything without its own.
- **Type:** headings balance their lines (`text-wrap: balance`), paragraphs avoid orphaned last words (`text-wrap: pretty`), figures use lining tabular numerals.
- **Touch:** tabs, question buttons and diagram steps are at least 44px tall on coarse pointers.
- The hero is unchanged apart from the browser surfaces (it was approved as "perfect").

Verified at 1536x730: every touched screen still fits, heading outline correct, no errors; detector clean.

## 15. Exact next step

Client reviews Section 04 round 2 at http://localhost:5173 (scroll past the HIEN diagram). Apply changes, wait for approval. Then **Section 05 More work** (image `gold-silhouette`, last gold section; regular model is fine): index of four projects: AI Critical Health Predictor (Python, Streamlit), Exam Scheduler (Python, HTML), Multi-Vendor E-Commerce System (Python, SQL, Streamlit), Path Finder (Java, HTML). Add it with `backdrop.add({ from: 'gold-reflections', to: 'gold-silhouette', ... })`.
