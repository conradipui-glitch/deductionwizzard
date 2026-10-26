# Deduction Wizard — evidence-first historical reasoning

A reproducible investigation engine for timelines, sources, actors, conflicting testimonies and competing historical hypotheses. First case: **Pushkin / Dantes / 1836–1837**. Future cases: comparative histories of myth, deification and religion (without assuming shared identities from motif similarity).

## Decision-model pilot (2026-10-26)

We evaluate OpenRouter **Decisions** models, not chat/completions models. They consume structured `state` + typed `questions` and output probabilities/choices with no narrative reasoning. The authoritative record remains **documents and independently reviewable claims**, never a model probability.

- [Current review / preliminary fit ranking](research/DECISION_MODELS_2026-10-26.md)
- [Live 24-request evaluation: 23/24 label matches, total $0.000460814](research/SMOKE_RESULTS_2026-10-26.md)
- [Model roles and safeguards](docs/DECISION_ARCHITECTURE.md)
- [Reproducible benchmark fixtures](benchmark/fixtures.json)
- [Python standard-library benchmark](tools/decision_bench.py)
- [GitHub Action using secret DECIS_API](.github/workflows/decision-smoke.yml)
- [Public catalog API (filtered to Decisions)](https://openrouter.ai/api/v1/models?output_modalities=decisions)
- [Official Decisions API docs](https://openrouter.ai/docs/api/api-reference/alphadecisions/submit-a-decisions-request)

### Run offline tests (no credentials)

```bash
python -m unittest discover -s tests -v
python tools/decision_bench.py --dry-run
```

### Live small-scale test

```bash
export DECIS_API="your key" # NEVER COMMIT IT
python tools/decision_bench.py --run --max-calls 24
```

Requests use `https://openrouter.ai/api/alpha/decisions`. Default run uses 6 models × 4 fixture states = 24 requests. No uploads of private source material. Calls are sequential, bounded and error-safe. Summaries display no credentials or raw personal data. Each live call can incur small costs; the free variants may have limits.

### Method

- Separate **event date**, **date of source**, and **date of modern interpretation**.
- Preserve the original quote and archival reference.
- A reported allegation proves the allegation existed, not that it is true.
- Detect derivative testimony, no multiplication of copied witnesses.
- Keep disconfirmed hypotheses and their contradicting evidence.
- Store full model ID, model response, rubric version and disagreements for audit.
- Never interpret output probability as the probability a historical conspiracy really happened.

This repo is initialized with the decision-model pilot. The previous local Historic Deduction Sim foundation is a separate v0.1 artifact and has not yet been imported wholesale.