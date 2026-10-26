# Decision layer architecture

```
Original sources + immutable source lineage
      ↓
Deterministic parsing / provenance / dating / authority checks
      ↓
Claim-centered question builder (small, complete evidence windows)
      ↓
Decision models: one primary + independent challenger when needed
      ↓
Structured answers: classification / rubric / disagreement + abstain
      ↓
Human review and model-written explanation with direct source citations
      ↓
Versioned casebook graph, timeline and alternative reconstructions
```

**Decision models are judges, not historians.** Generative LLMs may propose entities, links and hypotheses but never write adjudicated facts without a source record. The truth status of an **utterance**, the **content of an utterance**, the **event it alleges**, and a model's **assessment** are four separate objects.

## Three canonical operations

- `choice`: label **a claim's evidentiary relation to an excerpt**, choices `directly_documented`, `accusation_only`, `interpretation_only`, `insufficient_data`.
- `noul`: evaluate one narrowly defined test, e.g., “does this excerpt independently verify the alleged act?”; **not** “did a conspiracy occur?”
- `score`: rate **review priority** against named rubric, **not** epistemic likelihood of an ancient deity's identity.

Store: investigation id, claim id, excerpt id, source revision and derivative graph, question/rubric version, tested model id, provider id, raw typed answer, timestamp, cost and review override.

## Safeguards

1. Explicit `not_enough_evidence` and `needs_human_review` paths. Never let a model's non-zero probability override contradictory dated originals.
2. Counterfactual label swap and position swap tests, multilingual cases, double-pass disagreement flags. Report label accuracy separately from probability calibration.
3. Validate dates and contradictions **without a model**, including Old/New Style and uncertain BCE intervals.
4. Dedupe reprints, translations, retrospective memories and derivative citations. Witness multiplicity is not source multiplicity.
5. New person, source or event enters as **candidate**, not established identity/action.
6. No automatic hypotheses deletion. Confidence heat reflects a **transparent measured rubric** and its missingness, not metaphysical certainty.
7. Deity equivalence requires transmission hypothesis, geography, date, motif specificity and independent evidence; similar names do not imply same historic individual.
8. Respect budget and privacy: one opt-in bounded test suite, API secret server-side only; no publishing private source data or credential-bearing requests.
