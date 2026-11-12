---
name: Pragya Reddy A · Portfolio
description: One night told in three colour chapters, shot as a long exposure.
colors:
  exposure-ink: "#120b0b"
  exposure-ember: "#2b150f"
  exposure-red: "#e42e08"
  exposure-amber: "#e89135"
  exposure-white: "#ebe8da"
  poster-red: "#e50c0a"
  signal-ink: "#0a0302"
  signal-deep: "#3d0402"
  signal-core: "#a30202"
  signal-glow: "#e95d46"
  signal-hot: "#ffd9cf"
  signal-amber: "#ffb05a"
  reflection-ink: "#120c06"
  reflection-deep: "#482506"
  reflection-core: "#ca8334"
  reflection-glow: "#f58e12"
  reflection-hot: "#ffe6c2"
  reflection-pale: "#fff4e0"
  clarity-ink: "#060e14"
  clarity-blue: "#4fb3ff"
  clarity-magenta: "#7a3068"
  clarity-fog-amber: "#f09b33"
  clarity-hot: "#e6ecff"
typography:
  script:
    fontFamily: "Pinyon Script, cursive"
    fontSize: "min(19vw, 30svh)"
    fontWeight: 400
    lineHeight: 1
  display:
    fontFamily: "Noto Serif Display Variable, Noto Serif Display, serif"
    fontSize: "clamp(110px, 15vw, 340px)"
    fontWeight: 500
    lineHeight: 0.86
    letterSpacing: "0.01em"
    fontVariation: "'wdth' 62.5"
  headline:
    fontFamily: "Charlton, Noto Serif Display Variable, serif"
    fontSize: "clamp(34px, 4.5vw, 96px)"
    fontWeight: 300
    lineHeight: 1.02
    letterSpacing: "-0.01em"
  chapter-word:
    fontFamily: "Charlton, Noto Serif Display Variable, serif"
    fontSize: "min(54vw, 78svh)"
    fontWeight: 100
    lineHeight: 0.86
    letterSpacing: "-0.02em"
  body:
    fontFamily: "Archivo Variable, Archivo, system-ui, sans-serif"
    fontSize: "clamp(15px, 1.15vw, 18px)"
    fontWeight: 400
    lineHeight: 1.55
  label:
    fontFamily: "Archivo Variable, Archivo, system-ui, sans-serif"
    fontSize: "clamp(10px, 0.82vw, 13px)"
    fontWeight: 600
    lineHeight: 1.25
    letterSpacing: "0.16em"
    fontVariation: "'wdth' 62"
rounded:
  none: "0px"
spacing:
  gutter: "clamp(16px, 6vw, 112px)"
  corner: "clamp(16px, 2.4vw, 32px)"
  stack-sm: "clamp(10px, 1.6svh, 20px)"
  stack-md: "clamp(16px, 2.6svh, 28px)"
  stack-lg: "clamp(28px, 6svh, 72px)"
components:
  instrument-plate:
    backgroundColor: "{colors.reflection-ink}"
    textColor: "{colors.reflection-pale}"
    rounded: "{rounded.none}"
    padding: "clamp(14px, 1.6vw, 22px)"
  instrument-step:
    backgroundColor: "{colors.signal-ink}"
    textColor: "{colors.signal-hot}"
    rounded: "{rounded.none}"
    padding: "clamp(14px, 1.6vw, 22px)"
  instrument-step-on:
    backgroundColor: "{colors.signal-deep}"
    textColor: "{colors.signal-hot}"
    rounded: "{rounded.none}"
  question-button:
    backgroundColor: "{colors.reflection-ink}"
    textColor: "{colors.reflection-pale}"
    rounded: "{rounded.none}"
    padding: "10px 14px"
  question-button-pressed:
    backgroundColor: "{colors.reflection-deep}"
    textColor: "{colors.reflection-pale}"
    rounded: "{rounded.none}"
  corner-label:
    textColor: "{colors.exposure-white}"
    typography: "{typography.label}"
---

# Design System: Pragya Reddy A · Portfolio

## Overview

**Creative North Star: "Long Exposure"**

The site is a camera shutter left open over one city night. Light is the material: streaks, glow, neon and reflections on water. The visitor scrolls through a single continuous exposure told in three colour chapters, **I · Signal** (red), **II · Reflection** (gold) and **III · Clarity** (cool neon), each graded to match the client's own photographs. Chapters never cut; one image always dissolves into the next through a transition born from the photograph itself (rain on the rooftop, tiles on the grid, a rising tide on the river).

The photographs are the stage and stay visible: one fullscreen WebGL canvas draws them, sharpened and alive, and every section sits on top of it with the lightest scrim that keeps type readable. Typography is poster-like and enormous at the chapter moments, then precise and small for the facts. Interface pieces are **instruments in the dark**: square-edged plates with fine lines that light up in the chapter's glow when touched, so the work is shown operating rather than described.

**Key Characteristics:**
- One fullscreen photograph at a time, always visible, transitioning by its own physics.
- Three palettes, one per chapter; the comet cursor and every accent follow the chapter in view.
- Giant poster type for chapters and names; condensed caps for labels; a readable sans for facts.
- Square instrument plates, 1px rules, glow only as a response to state.
- Every project demonstrates its mechanism through interaction.

## Colors

Each chapter is a night-photograph grade: a near-black ink, a deep tone, a core, a glow and a hot near-white for type.

### Primary
- **Exposure Red** (exposure-red): the hero's streak core and the ember edge of the hero's burn-out exit.
- **Signal Glow** (signal-glow): Chapter I accents: labels, neon text shadow, active diagram edges.
- **Reflection Glow** (reflection-glow): Chapter II accents: labels, active states, the chart line, the AUC marker.

### Secondary
- **Exposure Amber** (exposure-amber) and **Signal Amber** (signal-amber): moving light: the bridge light, pulses on graph edges, sparks along wires, opening edges in transitions.
- **Reflection Core** (reflection-core): filled or completed states in Chapter II (done steps, filled out-of-fold cells).

### Tertiary
- **Clarity Blue** (clarity-blue), **Clarity Magenta** (clarity-magenta), **Clarity Fog Amber** (clarity-fog-amber): reserved for Chapter III (the comet palette already uses them); values are refined when Chapter III is built.

### Neutral
- **Exposure Ink** (exposure-ink): page background behind the canvas.
- **Signal Ink / Reflection Ink** (signal-ink, reflection-ink): instrument plates and scrims, at 0.5–0.94 alpha.
- **Exposure White, Signal Hot, Reflection Hot / Pale** (exposure-white, signal-hot, reflection-hot, reflection-pale): all text and display type, never pure white except a hot core in a glow.

### Named Rules
**The Chapter Rule.** Accents come only from the chapter in view. A gold accent never appears in Chapter I, a red one never in Chapter II. The comet cursor changes palette at the chapter boundary.

**The Photograph First Rule.** A scrim may darken a photograph for reading but never bury it: project screens keep the photograph at 0.8 or more brightness; full-strength behind chapter titles.

## Typography

**Script Font:** Pinyon Script (cursive fallback)
**Display Font:** Noto Serif Display, ExtraCondensed width 62.5, weight 500
**Secondary Font:** Charlton (Thin, Light) (with Noto Serif Display fallback)
**Body/Label Font:** Archivo variable (normal width for body, 62% width caps for labels)

**Character:** A poster pair, calligraphic script over a high-contrast condensed serif, taken from the client's lettering reference, with Charlton's airy hairlines for chapter words and headings and Archivo for honest, legible facts.

### Hierarchy
- **Script** (400, min(19vw, 30svh)): only the name "Pragya" in the hero lockup, written on with a mask.
- **Display** (500, condensed, up to 340px, 0.86): single dramatic words and numbers: "Reddy", "HIEN", "9.26", "STACK ROULETTE", AUC and macro-F1 values.
- **Chapter word** (Charlton 100, min(54vw, 78svh) for Chapter I, min(27vw, 43svh) for Chapter II with its reflection): one word per chapter ("Signal", "Reflection"), neon glow.
- **Headline** (Charlton 300, clamp 34–96px, 1.02): institution names, project titles, the model heading.
- **Body** (Archivo 400, clamp 15–18px, 1.55, max ~52ch): descriptions and info lines.
- **Label** (Archivo 600, 62% width, uppercase, 0.12–0.2em tracking): corners, tags, stage names, tools.

### Named Rules
**The Two Scales Rule.** Type is either enormous (a single word or number that owns the screen) or small and precise. Nothing in between competes with the hero word of a screen.

## Layout

Every section is one or two screens tall (100–230svh); pinned screens use a sticky 100svh frame. Side gutters are clamp(16px, 6vw, 112px). Each screen carries **corner labels** in the four corners (chapter, section, place, dates), like the poster reference.

Content screens use an asymmetric two-column grid (roughly 7:5 or 4:7) with the working piece taking the larger side; the photograph shows through the open side. Below 820px everything stacks into one column, pins release into normal flow, and multi-column instrument rows become two columns or vertical stems. No horizontal scroll at any width.

## Elevation & Depth

Depth comes from the photograph and from light, not from surface stacking. The canvas is the deepest layer; scrims (linear gradients of the chapter ink) sit above it; instrument plates sit above the scrims with a single soft drop shadow (0 24px 60px -20px black, 0.8) and a 1px hairline border. Glow (text-shadow and box-shadow in the chapter glow colour) appears only on active state or on display type acting as neon.

### Named Rules
**The Light-Not-Lift Rule.** Elements never lift on shadow ramps. State is shown by light: the border turns the chapter glow, the plate warms, a soft glow appears.

## Shapes

Square everywhere: zero radius on plates, buttons, chips and tabs. Lines are 1px hairlines at 0.16–0.5 alpha of the chapter's hot colour. Circles appear only as data (graph nodes, plot dots, status markers) and diamonds only for the fusion node. Masks and clip-paths carry reveals (text lines rising out of masks, clip-path wipes on pieces).

## Components

### Instrument plate (signature)
- **Character:** a dark control panel lit from within.
- **Shape:** square, 1px hairline border (hot colour at 0.16 alpha).
- **Background:** chapter ink, 0.9–0.94 alpha, slight top-to-bottom gradient.
- **Shadow:** one soft ambient drop shadow; no glass, no blur.
- **Used by:** the HIEN pipeline, the ARGO console, the credit-risk stacking diagram.

### Instrument step (buttons inside a diagram)
- **Shape:** square, padding clamp(14px, 1.6vw, 22px), real `<button>`.
- **Default:** chapter ink plate, hairline border, caps tag in the chapter glow, name in Charlton.
- **Hover / Focus / Tap:** border turns the chapter accent, plate warms, soft glow; siblings dim to 0.45–0.5 opacity; a shared "How it works" line under the diagram explains the step in CV wording. 2px focus outline in the accent, offset 3px. Tap pins the state on touch.

### Question button and tabs
- **Shape:** square, 1px border, label in Archivo.
- **Pressed / selected:** accent border, deep-tone fill, white text; question buttons carry a drawn chevron that nudges right on hover. Tabs use `role="tab"` with arrow-key navigation.

### Pipeline bar and status lines
- Stage dots with hairline connectors: outline when pending, accent fill with glow when active, core fill when done. Status lines carry a spinner while running and a filled marker when done.

### Corner labels
- Archivo condensed caps, chapter hot colour, fixed to the four corners of a screen; fade in only (never move).

### Comet cursor
- Canvas comet replacing the native cursor on fine pointers: a white-hot head with a coloured bloom and a tail of woven strands, recoloured per chapter. Off on touch and reduced motion.

## Do's and Don'ts

### Do:
- **Do** keep every fact traceable to the CV; label illustrations as illustrations on screen.
- **Do** give each project an interaction that shows its mechanism working.
- **Do** transition between chapter photographs with an effect drawn from the photograph (rain, grid tiles, tide), through the shared backdrop controller.
- **Do** use the chapter's palette for every accent and switch the comet palette at the chapter boundary.
- **Do** keep pieces square with 1px hairlines and show state with light.
- **Do** ship reduced-motion final states for every animation.

### Don't:
- **Don't** use the hero-metric template (big number, small label, supporting stats) on its own as a project screen.
- **Don't** use meaningless section numbers or a/b/c bullet cards as structure.
- **Don't** bury the photograph under a heavy scrim.
- **Don't** use rounded cards, glassmorphism, gradient text or emoji icons.
- **Don't** publish the phone number, or invent results, links or testimonials.
- **Don't** use Inter, Geist, Space Grotesk or Instrument Serif.
