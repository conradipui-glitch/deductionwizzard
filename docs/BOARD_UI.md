# Detective Board — initial release

A static React + TypeScript + Vite app. Paths are fixed to the repository's GitHub Pages prefix `/deductionwizzard/`. The board is **a read-only projection** of the authoritative casebook and does **not** use API credentials. DECIS_API stays in server-side GitHub Actions only.

## User features implemented

- Immersive cork / chalk presentation; controllable lamp ambience.
- Drag background to pan; scroll to pan; Ctrl+wheel or +/- to zoom.
- Drag cards; reset layout; click to inspect facts, source link and provenance.
- Filter people, events, sources, hypotheses; highlight neighboring edges.
- Time slider uses *ordered normalized* event dates while displaying original Julian dates for Russian events. It does not retroactively rewrite participants' knowledge.
- Switch current hypothesis and show its required discriminating test, without treating a model score as proof.
- Responsive display with accessible button controls and reduced-motion support.

## Limitations and next tranche

- The UI is a **read-only static app**. Dragged card positions are session-local and are reset after refresh. No authenticated authoring or persistent save yet; adding an event means editing versioned casebook data in the repository and letting CI redeploy.
- Deliberately **no generated fake historical photographs**; initials stand in for portraits until sourced archival art can be checked for identity, permission and provenance.
- Pushkin casebook is an **initial seven-event evidence sample**, not an exhaustive research record. The 88 benchmark exercises are separately stored and must never be shown as independent eyewitness testimony.
- No real 3D runtime, simulated certainty or background API billing on the client.

## Deployment

1. Merge PR containing app.
2. GitHub repository **Settings → Pages → Build and deployment → Source → GitHub Actions**. This account-level setting may require owner activation.
3. Monitor `Deploy Detective Board to GitHub Pages` workflow. Once successful, expected address is `https://conradipui-glitch.github.io/deductionwizzard/`.
4. API key `DECIS_API` is NOT used in the frontend.

## Future design

- Correctly linked primary-source card labels; verified portrait assets.
- Rich analytical map and a hypothesis heatmap with evidence-quality rubrics; accessibility and keyboard board navigation.
- Case editor / CRUD flows with server-backed auth, git change proposals and history.
- Ancient cultures graph using uncertain time spans, source provenance, historical vs mythic identity proposals.
