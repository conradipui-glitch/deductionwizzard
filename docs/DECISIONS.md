# Architecture decision records

## ADR 001 — JSON casebooks under Git rather than a graph DB

**Decision:** portable JSON source of truth and Python standard-library validation for v0.1.

**Why:** small, reviewable, easy to change; keeps setup friction, hosting costs and maintenance near zero. Graph relationships can later be materialized into a database without sacrificing original records. Version history is handled by Git.

**Trade-off:** manually resolving concurrent edits and querying very large corpora will become difficult. Revisit after the first curated corpus and UI are validated.

## ADR 002 — A claim is not the same as a fact

**Decision:** store reported accusation as an attributed claim; event and relationship objects must point to claims. Evidence must cite specific passages. Conjectures get hypotheses, not attested events.

**Why:** prevents the system from converting, for example, “Pushkin accused Heckern” into “Heckern was the author.”

## ADR 003 — Dual timestamps and uncertain intervals

**Decision:** original date wording and date of source remain separate from normalized event interval; missing dates are explicit; BCE supported at coarse year level.

**Why:** old/new style Russian dates and much later traditions about earlier events need different clocks. Fine-grained comparative calendar conversion must be a separate sourced operation, not a hidden automatic guess.

## ADR 004 — No pseudo-scientific probability bar

**Decision:** initial comparison uses qualitative judgments and source roots, with no final winner or 0–100% estimate.

**Why:** available historical sources have correlated errors, selection effects and disputed reliability. A numeric posterior without an articulated likelihood model would mislead. Later score experiments must be transparent and reversible.

## ADR 005 — LLM adapter after the evidence model

**Decision:** later Jeff-compatible analysis via opt-in, source-constrained suggestion interface. Human approval required for assertions.

**Why:** avoid model-generated citations and autonomous narrative drift before source auditability exists.
