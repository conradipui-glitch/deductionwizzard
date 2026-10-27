# Product compass · Deduction Wizard

## North star — what are we building and why?

Deduction Wizard is an **evidence-first historical investigation engine**. Its job is to help a researcher trace **what happened, when, according to whom, with which provenance**, compare rival causal explanations, uncover contradictions and missing information, and publish a comprehensible, source-linked reconstruction.

It is **not** a game that decides historical truth by voting, a conspiracy generator, or a general-purpose AI novelist. The aesthetic detective board is an interface for understanding the underlying evidence graph.

### Three ordered layers

1. **Evidence Core (must work without UI):** people and institutions, events, precise/uncertain dates and calendar systems, verbatim claims and citations, source date vs event date, source-dependency graph, links, versioning.
2. **Deduction Layer (must be inspectable):** hypotheses with falsifiable predictions, conflicts, missing evidence, alternative explanations, manual/AI assessment provenance. Model outputs are **suggestions pending review**, not new independent witnesses.
3. **Reader Layer (must reveal provenance):** atmospheric cork/chalk board, timeline, interactive story, illustration/portrait labeled archival or artistic. Editorially prepared, reviewable versions; no per-click speculative story generation.

### What a successful v1 investigation must demonstrate

One complete Pushkin case can be followed *end to end*:
- Open the dated source and see the supported **claim** versus author's **allegation**.
- Follow links from claims to people and events on the chronology.
- Compare at least two hypotheses against **the same evidence**, including a meaningful counterpoint.
- Add a candidate claim or hypothesis without treating it as a verified fact.
- Read a curated narrative that cites its factual steps and labels conditional reconstructions.
- Identify at least one genuinely **unresolved discriminating question** and source to investigate next.

## Change control for each feature proposal

Before implementing, document a short **WHY / WHAT / COST / TEST / SCOPE**:

| Field | Decision question |
|---|---|
| Why | What research or reading friction does this remove? For whom? |
| What | Is it Core, Deduction, Reader, or a separate **experiment**? |
| Evidence | Does it increase knowledge, only presentation clarity, or neither? |
| Cost | Build/maintenance, GPU/browser load, inference cost, privacy, complexity |
| Test | What will be measurably better after shipping? |
| Scope | Must-have now, later, experiment, or drop? How to roll back? |

If a proposal primarily increases novelty without improving investigation quality or comprehension, default to **backlog**. Separate exciting options from committed core scope; be willing to recommend *not building* an idea. Ask one clarifying **“Для чего мы это делаем?”** when the intended outcome is genuinely unclear.

### Decisions as of 2026-10-27

| Decision | Status | Reason |
|---|---|---|
| Verified evidence/time graph + hypothesis matrix | CORE | Directly serves the north star |
| Adding discovered events, people and source dependencies | CORE | Enables falsifiable competing reconstructions |
| Third-party Decisions models | LIMITED SUPPORT | Review-only classification; benchmark accuracy first |
| 3-step selection → evidence review → curated reading | CORE READER | Fixes an unclear UX interaction |
| Atmospheric imagery, gentle camera lift, onboarding | SUPPORTING | Helps orientation and comprehension, must be cheap and switchable |
| Per-request DeepSeek story generation | **DROPPED** | Produces paraphrase variation, not improved evidence; unnecessary API and governance burden |
| User draft hypotheses | EXPERIMENT | Needs explicit “unreviewed” provenance and future source-linked review |
| Gamification, achievements, full 3D, procedural scenes | BACKLOG | No demonstrated gain in historical reasoning |
| Ancient cross-cultural religions/myths | NEXT CASE / HORIZON | Test uncertain chronology, identity and transmission with same core, not an automatic claim of shared gods |

### Sequence

1. Finish one **source-audited** Pushkin case, not just a collection of attractive cards.
2. Make hypothesis review useful (actual conflicts and discriminating evidence, not counts alone).
3. Publish a small **curated set** of narrative views and high-quality, appropriately labeled visuals.
4. Test with a reader unfamiliar with the UI; fix confusion before extending it.
5. Only after these succeed, reuse core for comparative religion/deification case.

**Design principle:** Investigate first; visualize second. A confident-looking connection must never outrun its evidence.
