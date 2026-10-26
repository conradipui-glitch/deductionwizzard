# Deduction Wizard — Historical Investigation Engine

An open, evidence-first workspace for **building and questioning historical reconstructions**, not announcing that speculative explanations are proven.

## Live Detective Board

Expected GitHub Pages URL (when activated and successful): https://conradipui-glitch.github.io/deductionwizzard/

Two clearly separated layers:

- `packages/deduction-core/`: deterministic Python validation, source-lineage tracking, event chronology and transparent claim→hypothesis comparisons; based on the tested Historic Deduction Sim v0.1 foundation.
- `apps/board-ui/`: React/TypeScript/Vite 2.5D detective board for exploring a versioned casebook; no secret handling or cloud model calls.
- `cases/pushkin/casebook.json`: first seven-event/12-person Pushkin case (starter, not exhaustive).
- `benchmark/historical_qa_88.json`: 88 **synthetic classification tasks derived from 22 sourced historical anchors**; not 88 independent source discoveries or manually verified gold labels. See [benchmark methodology](docs/CORPUS_METHOD.md).
- `tools/build_corpus.py`: deterministic generator and provenance tags.
- `research/`: separately verified pilot of six OpenRouter Decisions models, including 24 live requests / 23 label agreements. Review its tiny sample limitations.

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

**Roadmap:** B01 — extend primary-source casebook and provenance audit; B02 — card-level filters, multi-case selector and rich board; B03 — calibrated disagreement analysis; B04 — safe editor and proposals; B05 — historical deification and mythology comparisons. Current state is first runnable display and reproducible test dataset, not a completed historical investigation.

License of migrated Python core: MIT (see `packages/deduction-core/LICENSE`). Front-end created for this repository.
