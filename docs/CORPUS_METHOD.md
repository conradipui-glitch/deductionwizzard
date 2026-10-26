# Historical QA dataset — first 88 exercises

**Scope, not overclaim:** 22 paraphrased source anchors × four adversarial question transformations = **88 evaluation exercises**; these are **not 88 independent historical discoveries or 88 primary documents**. 10 anchor facts are imported from the Pushkin casebook v0.1 (require independent source-by-source reread), 12 from British Museum and Metropolitan Museum of Art institutional pages. We explicitly mark all labels as **preliminary, NOT human-adjudicated gold standard**.

Source excerpts in benchmark fixtures are **synthetic paraphrases designed for classification tests**, never reproduced historical quotations. Their intentionally speculative text is *not evidence* of any historical conspiracy. Each exercise has source URL, anchor ID, date note, expected label, label rationale, variant, and audit status. Do not mix fixtures into the evidence graph as real events.

## Four variants per anchor

1. Document attestation (whether the source actually reports X).
2. Close paraphrase of the same report (robustness to rewording).
3. A generated, clearly described speculative interpretation (must stay interpretation).
4. An unsupported conspiratorial leap (must abstain / insufficient data).

Labels: directly_documented, accusation_only, interpretation_only, insufficient_data. The accusation_only category is covered by the existing four-case live smoke set for Pushkin accusations; grow the corpus with **authentic independently verified allegations** rather than inventing them.

## Future adjudication

- Manually inspect each original link and check the quoted location and translation against the manuscript/catalogue. Correct known casebook date conflicts if found.
- Recruit two independent reviewers and resolve labeling disagreements before claiming benchmark accuracy.
- Deduplicate paraphrase variants from same anchor during train/test split, otherwise leakage inflates scores.
- Add realistic adversarial counterexamples, copied-source lineage, ancient uncertain dating, myth comparisons, and non-Western sources.
- Evaluate per-category precision/recall and abstention, not only global accuracy.

Generate with `python tools/build_corpus.py`; tests with `python -m unittest discover -s tests -v`.
