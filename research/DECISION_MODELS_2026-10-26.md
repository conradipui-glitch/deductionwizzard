# OpenRouter Decisions — research snapshot, 26 October 2026

**Scope:** `GET https://openrouter.ai/api/v1/models?output_modalities=decisions`, 30 catalog entries including 4 moving aliases and several free duplicates. This is **a fit shortlist, not an accuracy leaderboard**. Public model descriptions and published prices were checked 2026-10-26; live benchmark results appear separately after running the action. Catalog can change.

The Decisions API is `POST /api/alpha/decisions`; these are **not** general chat models. `noul`, `choice`, `score` answer typed questions from supplied state. Confidence/probability is **a model output about a specified criterion**, never calibrated probability that a historical theory is true.

## Provisional fit ranking — our work (not benchmark wins)

| Rank | Model / exact ID | USD / 1M input tokens | Declared context | Role / reason |
|---|---|---:|---:|---|
| 1 | **Jev 1.14**, `typesafe/jev-1.14` | $0.042 | 262,144 | Broad typed decision pipeline, image input, documented tooling, strong first reference |
| 2 | **Decider V1.2**, `perplexity/pplx-decider-v1.2` | $0.020 | 262,144 | Cheap corroborating second judge; suitable for claim labels and rubrics |
| 3 | **GPT-6 Luna Decisions**, `openai/gpt-6-luna-decisions` | $0.100 | 1,050,000 | Complex long-context edge cases, multi-question judgments; budget-gated |
| 4 | **Mammoth 1 (free)**, `baseten/mammoth-1:free` | $0 | 16,384 | New 27B low-cost baseline, may be rate-limited and needs real testing |
| 5 | **Drex Max**, `nace-ai/drex-max` | $0.060 | 262,144 | Alternative independent family for disagreements |
| 6 | **Decider Flash V1.2**, `perplexity/pplx-decider-flash-v1.2` | $0.010 | 262,144 | Very cheap high-volume triage (4B) |
| 7 | **Elephant 1 (free)**, `baseten/elephant-1:free` | $0 | 16,384 | Small 9B rapid pre-filter and free baseline |
| 8 | **ScaleDown Classify-1**, `scaledown/classify-1` | $0.040 | 1,000,000 | Long text / image / **file** inputs; require separate document benchmark |
| 9 | **Respan Span-02**, `respan/span-02` | $0.010 | 131,072 | Text + image option at low price |
| 10 | **Clef**, `cloudflare/clef` | $0.042 | 65,537 nominal / 16,384 provider | Independent open model; important provider context constraint |

Other interesting options: `liquid/d1-ultra` ($0.042/M, 32K), `cloudflare/clef-flash` ($0.019/M, provider truncates long state to about 2K), `inception/mercury-decide:free` (free), `upstage/solar-decide-flash` ($0.05/M, 524K), `cloudflare/clef-omni` ($0.15/M, audio/video), `microsoft/microsoft-decision-1` ($0.042/M), `nace-ai/drex-v2.0` ($0.06/M). The experimental Tev1 model is **chat-only despite being cataloged as decisions**: its documentation says it uses chat completions and emits option letters, so do not assume universal protocol compatibility.

Aliases `~typesafe/jev-latest`, `~perplexity/pplx-decider-latest` and `~perplexity/pplx-decider-flash-latest` auto-update; pin exact versions for reproducible studies.

## Every listed family / variant (snapshot, total 30 catalog entries)

- Baseten: Mammoth 1 free, Elephant 1 free.
- Nace: Drex Max, Drex v2.0, Drex v1.5.
- Perplexity: Decider V1.2, Decider Flash V1.2, latest aliases (two).
- Respan: Span-02, Span-01, Span-01 Lite, Span-01 Lite free.
- Liquid: d1-ultra, d1.
- TypeSafe: Jev 1.14, Jev 1.13, Jev latest alias.
- ScaleDown: Classify-1.
- Microsoft: Microsoft-Decision-1.
- Cloudflare: Clef Omni, Clef Flash, Clef.
- Upstage: Solar Decide Flash, Solar Decide.
- OpenAI: GPT-6 Luna Decisions.
- Together: Tev1 4B Experimental (different chat interface).
- Inception: Mercury Decide, Mercury Decide free.
- Jared Palmer: Kev 4B.

**Known limitations:** no independent historical source verification; a high model score on a claim cannot prove an event; free tier availability can fluctuate; model-specific state schemas may differ (ScaleDown and Respan Span-01); calibration needs a labeled gold set. Do not infer accuracy from popularity, parameter count or model name.

## Test plan

First *smoke test*: 6 models × 4 manually labeled historical-reasoning examples. It measures API response validity, errors, and whether a model separates the **truth of an accusation** from **proof the accusation was made**. The tiny sample **cannot** measure general performance.

Then create 50–100 labeled examples with hold-out cases, adversarial near-duplicates, independent reviewers and explicit ambiguous labels. Evaluate false-positive rates for `directly_documented`, disagreement rates, stability under paraphrase, latency and $/1000 judgments. Calibrate decision thresholds per model and per language, with **abstain** as a first-class outcome.

### Authoritative references
- https://openrouter.ai/api/v1/models?output_modalities=decisions
- https://openrouter.ai/docs/guides/community/jev
- https://openrouter.ai/docs/guides/community/jev-tutorial
- https://openrouter.ai/docs/api/api-reference/alphadecisions/submit-a-decisions-request
- https://openrouter.ai/rankings/decisions
