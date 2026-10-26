# Architecture · foundation specification (v0.1)

## Purpose

One general-purpose, inspectable research engine. The Pushkin dispute is **dataset A**, not a hard-coded product. Comparative mythology, religious history, ancient dynasties, chronicle analysis and archaeology will use the **same** primitives.

## Current execution path

```
casebook.json → structural/reference validator →
  ├─ source-linked chronology (original dates + comparable dates)
  ├─ typed relationship graph (Mermaid text)
  └─ side-by-side hypothesis assessments (no fabricated probabilities)
```

Files in `data/cases/` are source of truth. Git preserves edits; claims preserve contradictions. Core implementation is in `src/historicdeductionsim/core.py`, CLI in `__main__.py`.

### Entities

Types: `person`, `group`, `institution`, `place`, `culture`, `deity`, `text`, `concept`, `other`. Store alternative names and original-language forms in `aliases` and context in optional metadata. Two similarly named deities are initially **two distinct entities**. An asserted identity requires a separate claim and independent reasoning.

### Sources and evidence

`source.type` identifies primary/secondary/tertiary; `created` stores production date, **not** date described. `locator` is a bibliographic or URL pointer. `derived_from` captures citation inheritance. Claim evidence has its own `locator` (passage, page or line) and polarity. A cited accusation proves that **the accusation was made**, not its truth.

### Claims and event references

Claims are atomic. For example:

- `Pushkin wrote that Heckern authored anonymous letters` → primary letter supports statement about Pushkin's belief.
- `Heckern actually authored the letters` → a *different*, contested claim requiring independent evidence.

Events refer to claim IDs and do not silently turn interpretations into fact. Relations refer to claim IDs. Any newly encountered event or entity gets a stable ID and its source links, including weak, hypothetical or contradicted reports.

### Time model

Every dated event retains `original` (historical wording/calendar) and an interval `[earliest, latest]` in a **normalized comparison scale**. Precision and method explicitly show whether an exact day, an approximate year, or a broad range was reconstructed. Unknown dates are `null`, never guessed.

**Normalization for this prototype:** use modern CE/BCE year ordering; negative integers denote BCE, positive CE, with **no year zero**. Calendar conversion must be explicitly documented in `normalization`. Conversion between Julian/Gregorian is demonstrated for the 1800s (12-day offset). Ancient Egyptian, Mayan, Inca and other dates require an attributed scholarly conversion, uncertainty range, and the original calendar notation. Never pretend dates from different cultural systems are directly comparable without a supported correlation convention.

**Later requirement:** A perspective-mode `known_to(person, moment)` needs a separate transmission/knowledge event, not merely the fact that a source existed. Not part of v0.1.

### Hypotheses

Each hypothesis carries a falsifiable / discriminating search question and explicit assumptions. `assessment` specifies one claim's qualitative contribution. Stronger claims are not automatically causal. `compare` shows support/contradiction and roots of source lineage but deliberately produces **no composite winner or calibrated percentages** in v0.1. User-controlled heatmap and ranked views follow only once weighting criteria and independent source groups have been reviewed.

### Future modules (NOT yet implemented)

- `ingest`: ingest PDFs, books, images, handwritten letters with verified page citations and manual review.
- `temporal`: partial ordering, uncertain dates, multiple calendars and person-specific knowledge state.
- `graph`: relation types, evolving links, causal propositions and path explanations.
- `hypothesis`: reversible qualitative weighting, sensitivity analyses and prediction of discriminating evidence.
- `analysis_adapters`: pluggable LLM interfaces (incl. requested Jeff once identified).
- `ui`: searchable interactive timeline, concurrent tracks, evidence heatmap, graph, source detail and side-by-side reconstructed narratives.

### What the engine will NOT do

It will not treat popular traditions as historical proof; infer shared identity of gods from visual/iconographic similarity alone; give numerical probabilities without calibrated priors, conditional assumptions and source dependence controls; or silently promote an LLM-generated story into a sourced historical fact.
