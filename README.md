# Deduction Wizard — Historical Investigation Engine

An open, evidence-first workspace for **building and questioning historical reconstructions**, not announcing that speculative explanations are proven.

## Live Detective Board

Live GitHub Pages: https://conradipui-glitch.github.io/deductionwizzard/

Two clearly separated layers:

- `packages/deduction-core/`: deterministic Python validation, source-lineage tracking, event chronology and transparent claim→hypothesis comparisons; based on the tested Historic Deduction Sim v0.1 foundation.
- `apps/board-ui/`: React/TypeScript/Vite 2.5D detective board for exploring a versioned casebook; no secret handling or cloud model calls.
- `cases/pushkin/casebook.json`: growing Pushkin case with 23 events, 20 persons and 27 source-linked claims (work in progress).
- `benchmark/historical_qa_88.json`: 88 **synthetic classification tasks derived from 22 sourced historical anchors**; not 88 independent source discoveries or manually verified gold labels. See [benchmark methodology](docs/CORPUS_METHOD.md).
- `tools/build_corpus.py`: deterministic generator and provenance tags.
- `research/`: separately verified pilot of six OpenRouter Decisions models, including 24 live requests / 23 label agreements. Review its tiny sample limitations.

## v0.4.1 — guided evidence-first investigations

- **v0.3.1 Render hotfix:** default Safe mode reduces expensive GPU blending, filters and shadows; interruptible 1350ms camera crane flights with gentle rise/landing have on/off control and subtle paper motion. React error boundary prevents silent blank screens. GPU-specific rendering still needs browser testing across devices.
- **v0.4 Story Mode:** open **«Читать историю»**. 14 editorial scenes, slides or full-length reading; combine one, multiple or no rival hypotheses; include/exclude individual episodes; see source references and jump back to the relevant board event.
- **Guided investigation:** three steps: choose one of four curated perspectives (or compare them), review evidence/conflicts/missing checks, then read. A 5-step board tour explains real controls, and personal hypotheses remain **unreviewed local drafts**.
- **No on-demand story API:** per-request DeepSeek narrative generation was deliberately removed: the reader only displays curated editorial texts; the Decisions API remains in a separate review-only analytical lane.
- **Product scope:** read [Product Compass](docs/PRODUCT_COMPASS.md) before adding features. Every new idea needs a WHY / WHAT / COST / TEST / SCOPE decision.
- **Illustrations and characters:** internally rendered, intentionally schematic historical silhouettes and scene illustrations, **not archival portraits or documented views**.
- **Independent AI suggestion layer:** the existing evidence heatmap now optionally shows **18 unreviewed model votes** from Perplexity Decider V1.2, Mammoth 1 Free and Elephant 1 Free. These suggestions came from a bounded GitHub Actions run using `DECIS_API`, not from the user's browser. They never silently change human-created assessments.
- **Case updates:** `cases/pushkin/stories.json` contains story episodes linked to casebook event/claim IDs, while `cases/pushkin/model_proposals.preview.json` stores live but **not peer-reviewed** model votes separately.

Research and test record: [source notes](research/PUSHKIN_1833_1837_EVIDENCE.md), [Decisions proposal comparison](research/DECISIONS_PROPOSALS_2026-10-27.md). Both full historical reconstruction and unknown-source portrait production remain unfinished.

## Developer commands

Python core (no runtime dependencies):

```bash
PYTHONPATH=packages/deduction-core/src python -m historicdeductionsim validate cases/pushkin/casebook.json
python -m unittest discover -s tests -v
python tools/build_corpus.py
```

Board UI:

```bash
npm install
npm run dev
npm run build
```

## Source discipline

1. A statement was made ≠ that statement is true.
2. Time of the event ≠ time a source was written.
3. Similarities between myths ≠ proof that deities refer to the same historic individual.
4. Model outputs label **evidence relationships**, not probabilities of historical truth or guilt.
5. Dependent reproductions of one document do not count as multiple independent witnesses.
6. Never silently delete hypotheses or weak evidence; retain status and reasons.

## Architecture and roadmap

- [Original research protocol](docs/RESEARCH_PROTOCOL.md)
- [Original core architecture](docs/ARCHITECTURE.md)
- [Interactive board guide](docs/BOARD_UI.md)
- [Decisions integration](docs/DECISION_ARCHITECTURE.md)
- [Model comparison](research/DECISION_MODELS_2026-10-26.md)

**Roadmap:** source expansion and review → verified visual QA, mobile and accessibility → authoring tools with safe GitHub PR workflow → longer, independently checked Decisions benchmarks → cross-cultural mythology graph with uncertain chronology. The UI is a working prototype, not a completed historical investigation.

License of migrated Python core: MIT (see `packages/deduction-core/LICENSE`). Front-end created for this repository.
