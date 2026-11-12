# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Stack

Vite + vanilla TypeScript, three.js (one fullscreen shader), GSAP + ScrollTrigger, Lenis. Static build (`npm --prefix site run build`), hosted on **Vercel or Netlify** (client decision 2026-11-13; which of the two is not yet chosen).

## Users

- **Recruiters and hiring panels** screening Pragya Reddy A for internships, graduate programmes and AI/ML roles (the source CV was prepared for the Optum IEDP application). They visit briefly, often between other candidates, and need to see who she is, what she has built and how to reach her within a few minutes.
- **Professors and research groups** evaluating her for research positions or collaboration. They read the research and the projects more closely and care about method and honest results.

## Product Purpose

A cinematic, storytelling portfolio that presents Pragya Reddy A as an **AI/ML engineer**: a B.Tech Computer Science and Engineering student at SRM Institute of Science and Technology, Ramapuram (2024–2028, CGPA 9.26/10) working on LLMs, retrieval-augmented generation and explainable machine learning.

Success: a recruiter or academic finishes the story with a clear picture of her work and **emails her**. GitHub, LinkedIn and LeetCode are supporting links.

## Positioning

The site is built as one continuous night told in three colour chapters (red, gold, cool neon) over the client's own night-city photographs. The projects are shown working, not described: the HIEN research as an interactive model pipeline, the ARGO project as a live question-to-chart console, the credit-risk model as a playing stacking diagram. A visitor experiences how she thinks, not only a list of what she did.

## Operating Context

- Viewed on desktop and laptop browsers between other applications, and on phones from links in emails or messages.
- Read once, start to finish, in scroll order; a visitor may also jump back to a project.
- Content is evaluated against her CV, so every claim must match it.

## Capabilities and Constraints

- **All content comes only from `Pragya_Reddy_A-CV-Optum-IEDP.pdf`.** No invented facts, metrics, employers, testimonials or claims. Missing or unclear facts are asked about, not filled in.
- Interactive demonstrations that go beyond the CV (example questions, SQL, chart data, illustrative diagram nodes) must be labelled as illustrations on screen.
- Contact on the site: **email only** (pragyareddy103@gmail.com) plus GitHub, LinkedIn and LeetCode links from the CV. **The phone number is never published.**
- Built one section at a time, each approved by the client before the next; `updates.md` is the running handover log and must be read first by any new session.
- Source photographs are about 1672×941 px; larger originals would be needed for full sharpness on large screens.
- Charlton (secondary typeface) was supplied by the client from Creativetacos; the client is responsible for holding a web licence.

## Brand Commitments

- Name as written: **Pragya Reddy A**. "Pragya" leads, "Reddy" is secondary.
- Presented as an AI/ML engineer.
- The client's eight photographs in `aa-pr-upscaled-photos/` (with the hero's top-right text, the crimson sign text and the DP World sign removed) and the poster lettering reference `main font.jpeg` are binding source material.

## Evidence on Hand

- CV: `Pragya_Reddy_A-CV-Optum-IEDP.pdf` (education, Logic Play Technical Club, HIEN research and paper, six projects, skills, achievements).
- Real results from the CV: CGPA 9.26/10; HIEN macro-F1 0.228 vs 0.225 baseline (MELD, EmoryNLP); credit-risk stacked ensemble AUC 0.7579 vs 0.7562 best single model on ~307K Home Credit applicants.
- Absent, and not to be fabricated: screenshots or live demos of the projects, project repository links beyond her GitHub profile, testimonials, employer names beyond the CV, publication venue for the HIEN paper.

## Product Principles

1. **The CV is the only source of truth.** If it is not in the CV, it is not on the site, or it is labelled as an illustration.
2. **Show the work working.** Each project earns an interaction that demonstrates its mechanism.
3. **One story, read in order.** Every section moves the night forward; nothing feels like a separate template block.
4. **Lead to one action.** Everything ends at emailing her.
5. **Honest numbers.** Results appear next to their baselines, with zoomed axes labelled as zoomed.

## Accessibility & Inclusion

- Every interactive piece works with mouse, touch and keyboard, with visible focus.
- `prefers-reduced-motion` gets final states and fades instead of motion; the comet cursor and WebGL motion turn off.
- Text over photographs keeps readable contrast with scrims.
