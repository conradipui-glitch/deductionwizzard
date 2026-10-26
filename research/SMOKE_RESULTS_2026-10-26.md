# First live Decisions evaluation — 26 October 2026

GitHub Actions: https://github.com/conradipui-glitch/deductionwizzard/actions/runs/40375494353

**24 API requests, 23/24 label agreements, total API cost $0.000460814.** Six unit tests passed. This is an API/criterion **micro-benchmark**, not evidence of broad model accuracy or probability calibration. Cases contain no private data.

| Model | Label matches / 4 | Mean observed latency (ms) | Cost across four requests |
| --- | ---: | ---: | ---: |
| `typesafe/jev-1.14` | 3/4 | 203 | $0.00012209 |
| `perplexity/pplx-decider-v1.2` | 4/4 | 685 | $0.00002944 |
| `openai/gpt-6-luna-decisions` | 4/4 | 287 | $0.00020680 |
| `baseten/mammoth-1:free` | 4/4 | 200 | $0 |
| `baseten/elephant-1:free` | 4/4 | 394 | $0 |
| `nace-ai/drex-max` | 4/4 | 393 | $0.00010248 |

**Observed disagreement**: On `modern_theory_not_firsthand`, Jev 1.14 selected `accusation_only` rather than manually annotated `interpretation_only` (Noul `directly_supported` = 0.02). It did *not* incorrectly claim the historical action was directly proven. The choice-label confusion is important for mapping source types.

A prior 12-request test using only the first two fixtures returned 12/12 expected labels (cost $0.00023174): https://github.com/conradipui-glitch/deductionwizzard/actions/runs/40374667442

## Preliminary engineering implication

- **Default pilot**: Perplexity Decider V1.2, economically inexpensive and matches 4/4 in this micro-test.
- **Zero-cost experimental fast path**: Mammoth 1 / Elephant 1 free, require availability and larger holdout checks.
- **High-context challenger**: GPT-6 Luna Decisions, reserve for long or contested cases due to higher input cost.
- **Independent judge**: Drex Max or Jev 1.14. Test Jev with more nuanced rubrics and independently re-labeled cases.

Don't promote based on 4 items: score on **50–100 manually labeled, independent-source examples** first, followed by separate adversarial multilingual, BCE chronology, copied-witness, and false-identity examples. Include abstention, model/cost history, multiple model versions and human review.

## What the scores do NOT mean

A probability for `directly_supported` measures the model's response to a narrow question. It is **not** a measured likelihood that Dantes, Idalia, or anyone else organized an actual historical conspiracy. Observational document provenance has priority over any model score. Two models agreeing do not necessarily provide independent evidence of an event.

**Reproduce:** `python tools/decision_bench.py --run --max-calls 24`, with `DECIS_API` set only in environment. See [fixtures](../benchmark/fixtures.json) and [model review](DECISION_MODELS_2026-10-26.md). Raw typed decision outputs are retained as the Actions `decisions-smoke` artifact (14-day retention), no credentials in the file.
