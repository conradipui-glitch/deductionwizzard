# Decisions proposals — first live case run

Run: https://github.com/conradipui-glitch/deductionwizzard/actions/runs/40452886249

On 27 October 2026, **18 API calls** (3 models × 6 selected hypothesis/claim pairs) completed via the GitHub secret `DECIS_API`. All returned a recognized label. **No historical fact was modified.** Full unreviewed proposals are retained as a downloadable GitHub Actions artifact for 14 days.

| Pair | Perplexity Decider V1.2 | Mammoth 1 free | Elephant 1 free |
| --- | --- | --- | --- |
| Идалия / письмо о поцелуе 1833 | Недостаточно данных | Недостаточно данных | Совместимо |
| Идалия / московский слух 1836 | Недостаточно данных | Недостаточно данных | Совместимо |
| Геккерн / обвинение Пушкина | Совместимо | Совместимо | Совместимо |
| Геккерн / ответный вызов 1837 | Недостаточно данных | Недостаточно данных | Совместимо |
| Политическая операция / двор 1834 | Недостаточно данных | Недостаточно данных | Недостаточно данных |
| Политическая операция / реакция Лермонтова | Недостаточно данных | Недостаточно данных | Недостаточно данных |

## Interpretation

This evaluates summaries and scholarly notes; it has **not** inspected primary documents themselves. `compatible` means consistency, **not independent corroboration**. Perplexity and Mammoth agreed on all six narrow cases. Elephant chose the broader `compatible` option on three of the same cases; it did not report any proof of the proposed conspiracies.

The model proposals are stored in a separate artifact with `review_status=not_reviewed`. They are never merged automatically with the curated assessments and never alter the published narrative's factual layer.

## Future work

Use richer excerpts, primary-language text, separate source-dependency checks and reviewer annotations. Add a dedicated UI drawer clearly separate from the evidence heatmap. Do not interpret count of model votes as independent historical witnesses.

To reproduce safely, run the `Decisions hypothesis suggestions` GitHub workflow manually (18 calls maximum).