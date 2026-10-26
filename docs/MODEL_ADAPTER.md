# Research-model adapter: future Jeff integration

The name “Jeff” is treated as a user-proposed model label; **its exact service and documented API are not yet identified**. We do not assume access, capability or pricing.

## Proposed interface

`analyze(casebook_snapshot, task, allowed_source_ids) -> suggestions[]`

Each suggestion requires:
- proposed entity/event/claim/hypothesis type and reason;
- source IDs and precise locators;
- explicit alternative explanation;
- novel discriminating test;
- model identifier, version and run timestamp;
- status `pending_review` by default.

Separate *retrieval* (what material exists), *extraction* (what it literally says), *inference* (what could explain it) and *adjudication* (human-reviewed comparison). Import requires structural validation and a reviewer approving the cited connection. Keep all source text and credentials outside prompt logs when privacy/licensing demands it.

The initial implementation needs no paid model, token budget or always-on hosting. An adapter can be added after the data model and comparison UI have been exercised on real cases.
