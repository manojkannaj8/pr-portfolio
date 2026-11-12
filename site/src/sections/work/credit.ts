import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

/**
 * Credit Risk Scoring · live stacking diagram.
 * Facts are from the CV: stacked ensemble (LightGBM, XGBoost and Logistic Regression base learners,
 * LR meta-learner) on Home Credit (~307K applicants), 5-fold out-of-fold CV, AUC 0.7579 vs 0.7562
 * (best single model); reject inference with fuzzy augmentation on a simulated selection-biased
 * population; gender/age fairness audit; team project covering SHAP adverse-action explanations,
 * DiCE counterfactual recommendations and a Markov-chain + Monte Carlo credit-trajectory simulator
 * on UPI transaction data. The fold animation shows the METHOD (how out-of-fold CV works), not data.
 */

const INFO: Record<string, string> = {
  idle: 'Point at, tap or tab to any part to see what it does.',
  learners: 'Three base learners: LightGBM, XGBoost and Logistic Regression.',
  folds: '5-fold out-of-fold cross-validation: each fold is held out once and predicted by models trained on the other four.',
  oof: 'The out-of-fold predictions become the training data for the meta-learner.',
  meta: 'A Logistic Regression meta-learner combines the three base learners.',
  auc: 'AUC 0.7579 for the stacked ensemble, against 0.7562 for the best single model.',
}

const ALSO = [
  { k: 'Reject inference', t: 'Reject inference with fuzzy augmentation on a simulated selection-biased population.' },
  { k: 'Fairness audit', t: 'A gender and age fairness audit of the model.' },
  { k: 'SHAP + DiCE', t: 'Team project: SHAP adverse-action explanations and DiCE counterfactual recommendations.' },
  { k: 'Trajectory simulator', t: 'Team project: a Markov-chain + Monte Carlo credit-trajectory simulator on UPI transaction data.' },
]

const LO = 0.75, HI = 0.76
const pct = (v: number) => (((v - LO) / (HI - LO)) * 100).toFixed(2) + '%'

export function creditHTML() {
  const grid = Array.from({ length: 5 }, (_, r) =>
    `<div class="cr-row" data-r="${r}">${Array.from({ length: 5 }, (_, c) => `<i class="${c === r ? 'hold' : ''}"></i>`).join('')}</div>`).join('')
  return `
  <div class="cr" data-active="">
    <div class="cr-flow">
      <button type="button" class="cr-part cr-learners" data-k="learners">
        <span class="t-caps cr-tag">Base learners</span>
        <span class="cr-chip">LightGBM</span><span class="cr-chip">XGBoost</span><span class="cr-chip">Logistic Regression</span>
      </button>
      <span class="cr-arrow" aria-hidden="true"></span>
      <button type="button" class="cr-part cr-folds" data-k="folds">
        <span class="t-caps cr-tag">5-fold CV</span>
        <span class="cr-grid" aria-hidden="true">${grid}</span>
        <span class="cr-legend t-caps" aria-hidden="true"><i class="hold"></i>Held out</span>
      </button>
      <span class="cr-arrow" aria-hidden="true"></span>
      <button type="button" class="cr-part cr-oof" data-k="oof">
        <span class="t-caps cr-tag">Out-of-fold predictions</span>
        <span class="cr-col" aria-hidden="true">${'<i></i>'.repeat(5)}</span>
      </button>
      <span class="cr-arrow" aria-hidden="true"></span>
      <button type="button" class="cr-part cr-meta" data-k="meta">
        <span class="t-caps cr-tag">Meta-learner</span>
        <span class="cr-name t-secondary">Logistic Regression</span>
      </button>
    </div>

    <button type="button" class="cr-part cr-meter" data-k="auc" aria-label="AUC 0.7579 for the stacked ensemble against 0.7562 for the best single model">
      <span class="cr-meter-head">
        <span class="t-caps cr-tag">AUC</span>
        <span class="t-caps cr-zoom">Axis zoomed · 0.750 – 0.760</span>
      </span>
      <span class="cr-ruler" aria-hidden="true">
        ${Array.from({ length: 11 }, (_, i) => `<i class="tick${i % 5 === 0 ? ' major' : ''}" style="left:${i * 10}%"></i>`).join('')}
        <span class="cr-gap" style="left:${pct(0.7562)};width:calc(${pct(0.7579)} - ${pct(0.7562)})"><b class="t-caps">+0.0017</b></span>
        <span class="cr-mark base" style="--x:${pct(0.7562)}"><b class="t-display">0.7562</b><em class="t-caps">Best single model</em></span>
        <span class="cr-mark main" style="--x:${pct(0.7579)}"><b class="t-display">0.7579</b><em class="t-caps">Stacked ensemble</em></span>
      </span>
    </button>

    <p class="cr-info" aria-live="polite"><span class="t-caps">How it works</span><span class="cr-info-t">${INFO.idle}</span></p>

    <div class="cr-also">
      <div class="cr-tabs" role="tablist" aria-label="Also in the project">
        ${ALSO.map((a, i) => `<button type="button" role="tab" id="cr-tab-${i}" aria-controls="cr-panel" aria-selected="${i === 0}" tabindex="${i === 0 ? 0 : -1}">${a.k}</button>`).join('')}
      </div>
      <p id="cr-panel" class="cr-panel" role="tabpanel" aria-labelledby="cr-tab-0">${ALSO[0].t}</p>
    </div>
  </div>`
}

export function mountCredit(root: HTMLElement, reduce: boolean) {
  const cr = root.querySelector<HTMLElement>('.cr')!
  const info = cr.querySelector<HTMLElement>('.cr-info-t')!
  const rows = cr.querySelectorAll<HTMLElement>('.cr-row')
  const oof = cr.querySelectorAll<HTMLElement>('.cr-col i')
  const meta = cr.querySelector<HTMLElement>('.cr-meta')!
  const marks = cr.querySelectorAll<HTMLElement>('.cr-mark')
  const gap = cr.querySelector<HTMLElement>('.cr-gap')!

  // ---- explain on hover / focus / tap ----
  let pinned = ''
  const set = (k: string) => {
    cr.dataset.active = k
    cr.querySelectorAll<HTMLElement>('.cr-part').forEach((p) => p.classList.toggle('on', p.dataset.k === k))
    info.textContent = INFO[k || 'idle']
  }
  cr.querySelectorAll<HTMLElement>('.cr-part').forEach((p) => {
    const k = p.dataset.k!
    p.addEventListener('pointerenter', (e) => { if (e.pointerType === 'mouse') set(k) })
    p.addEventListener('focus', () => set(k))
    p.addEventListener('click', () => { pinned = pinned === k ? '' : k; set(pinned) })
  })
  cr.addEventListener('pointerleave', (e) => { if (e.pointerType === 'mouse') set(pinned) })

  // ---- "also in the project" tabs (arrow keys move between them) ----
  const tabs = [...cr.querySelectorAll<HTMLButtonElement>('.cr-tabs button')]
  const panel = cr.querySelector<HTMLElement>('.cr-panel')!
  const pick = (i: number, focus = false) => {
    tabs.forEach((t, j) => { t.setAttribute('aria-selected', String(i === j)); t.tabIndex = i === j ? 0 : -1 })
    panel.setAttribute('aria-labelledby', tabs[i].id)
    panel.textContent = ALSO[i].t
    if (!reduce) gsap.fromTo(panel, { opacity: 0, y: 6 }, { opacity: 1, y: 0, duration: 0.35, ease: 'expo.out' })
    if (focus) tabs[i].focus()
  }
  tabs.forEach((t, i) => {
    t.addEventListener('click', () => pick(i))
    t.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
        e.preventDefault()
        pick((i + (e.key === 'ArrowRight' ? 1 : tabs.length - 1)) % tabs.length, true)
      }
    })
  })

  // ---- the method, playing: each fold is held out in turn, its predictions drop into the OOF column;
  //      when all five are in, the meta-learner lights. Loops while on screen. ----
  if (reduce) {
    cr.classList.add('static')
    return
  }
  gsap.set(marks, { left: '0%', opacity: 0 })
  gsap.set(gap, { scaleX: 0, transformOrigin: 'left center' })
  const loop = gsap.timeline({ paused: true, repeat: -1, repeatDelay: 0.6 })
  rows.forEach((r, i) => {
    loop.call(() => { rows.forEach((x) => x.classList.toggle('on', x === r)) }, undefined, i * 0.9)
      .call(() => oof[i].classList.add('fill'), undefined, i * 0.9 + 0.5)
  })
  loop.call(() => { rows.forEach((x) => x.classList.remove('on')); meta.classList.add('fire') }, undefined, 5 * 0.9)
    .call(() => { meta.classList.remove('fire'); oof.forEach((o) => o.classList.remove('fill')) }, undefined, 5 * 0.9 + 1.4)

  const enter = gsap.timeline({ paused: true })
  enter.to(marks[0], { left: marks[0].style.getPropertyValue('--x'), opacity: 1, duration: 1.2, ease: 'expo.out' }, 0)
    .to(marks[1], { left: marks[1].style.getPropertyValue('--x'), opacity: 1, duration: 1.4, ease: 'expo.out' }, 0.15)
    .to(gap, { scaleX: 1, duration: 0.6, ease: 'power2.out' }, 1.0)

  ScrollTrigger.create({
    trigger: cr,
    start: 'top 80%',
    end: 'bottom top',
    onEnter: () => { enter.play(); loop.play() },
    onEnterBack: () => loop.play(),
    onLeave: () => loop.pause(),
    onLeaveBack: () => loop.pause(),
  })
}
