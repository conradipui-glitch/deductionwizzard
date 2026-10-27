# Deduction Wizard — этап B: Reader & Visual Pack

**Status:** implementation-ready specification, not implemented.
**Repository:** `conradipui-glitch/deductionwizzard`
**Baseline:** v0.4.2, GitHub Pages, React + TypeScript + Vite
**Product compass:** [docs/PRODUCT_COMPASS.md](PRODUCT_COMPASS.md)
**Scope:** Reader layer only. Preserve evidence schema semantics and human-reviewed narrative content.

## Why this stage exists

A user reviewing hypothesis A currently selects a different hypothesis in the left archive and the archive is hidden (the handler in `apps/board-ui/src/main.tsx` contains `setAsideOpen(false)`). Subsequent switching is cumbersome. The StoryReader is attached inside `<main className="stage">`; the application shell and side panels remain visible. Reading defaults to slides and presents each scene in a separate two-column component. `DossierPortrait` is currently a generic SVG silhouette, and `StoryArt` uses a handful of generic SVG templates.

**Desired outcome:** compare prepared versions without reopening navigation; read one flowing, source-linked illustrated historical investigation in comfortable reading mode. The main task remains **evidence-first research**, not procedural story generation.

**Out of scope:** new LLM generation endpoints, automatic rewriting on version toggle, gamification, audio/video, WebGL / true 3D, adding new unsupported historical conclusions.

## B1 — v0.4.3: navigation and long-form reading

### B1.1 Hypothesis switching without navigation penalty

Current code: `apps/board-ui/src/main.tsx`, `hyp-list` hypothesis button:
`onClick={()=>{setActiveHyp(h.id);focusNode(h.id);setAsideOpen(false);}}`

- Desktop (>1080 CSS px): selecting an hypothesis must **never collapse the left pane**. Maintain user-chosen pane state. Note that a 14-inch screen at 1366 CSS px is not necessarily the same as 14 physical inches; use viewport breakpoints.
- Compact tablet/mobile (≤1080 CSS px): archive is a drawer and may dismiss on selection; retain the selected hypothesis in a persistent, easily reached mini-switcher (board header and reader header).
- Add a compact hypothesis chooser (select/popover; keyboard accessible) in the research board's heading, always visible when the archive is collapsed. Choices: “По документам”, “Геккерны”, “Идалия”, “Придворная версия”, optionally “Сравнить…” linking to the comparison step.
- Board selected hypothesis `activeHyp` and reader selection must follow a **single source of truth**. Switching inside reader must update `activeHyp` on return.
- Switching versions never removes citations or changes the curated history corpus. Evidence highlights change while source panel state remains independent.

**Acceptance:**
- At 1366×768 switch H→I→H in ≤2 actions each, without reopening archive.
- At 390×844, after closing the drawer, change version from accessible mini-switcher.
- Keyboard tab/Enter/Escape, focus visible, accessible label and correct selected state.

### B1.2 True immersive Reader

Current code: `StoryReader` is rendered as a child of `<main className="stage">`; `.story-overlay` is positioned absolutely within it.

- Render Reader in a top-level portal (e.g., `createPortal(..., document.body)`) or equivalent full-viewport dialog `position:fixed;inset:0;z-index:...` outside constrained stage/layout stacking contexts.
- On open, hide/inert the app shell from keyboard/assistive technology except the reader. Keep board pan/zoom positions and inspector state unchanged.
- On close, restore the exact board layout and focus to “Читать историю”. Escape closes reader; always show visible close button.
- Compact reader chrome: case/title, version mini-switcher, reading mode toggle, close button; progress/chapter navigation may remain unobtrusive.
- Maintain direct links from paragraphs/chapter to related source and “На доску к событию”; this action closes reader and focuses its node.
- User setting: default `book` (long-form), optional `slides`. Switch does not drop hypothesis selection or scene subset.

**Acceptance:**
- Reader fills viewport at 1366×768, 1440×900, 390×844; no original sidebars visible.
- Escape closes reader and returns user to same viewport position, selected card and pane layout.
- User can switch edition/view without closing the reader.

### B1.3 Coherent long-form narrative

Current content: `cases/pushkin/stories.json` has 14 curated scenes, each with `id`, `event_id`, `title`, `body`, `claim_ids`, `branches`.

- Default reader = a continuous, scrollable historical dossier, **not 14 full-screen cards stacked with repeated chrome**.
- Reuse existing curated scene text; add editorial transitional passages only after human/source review. Show chapter title/date/source links in a restrained footnote/collapsible citation region.
- Image goes **between** chapters or at purposeful act breaks, not a mandatory side-by-side illustration alongside every short paragraph.
- For single-version reading, show only its conditional `branches[hypothesis_id]`, visually distinct from `body`. For multi-version comparison, show each version's note side-by-side on wide screens; stacked/accordion on mobile.
- Optional sticky mini chapter indicator / table of contents, chapter anchors, `scroll-margin-top`, restore scroll when switching versions if possible.
- Story with “По документам” uses documentary `body` only. Never convert a hypothesis into a historical fact.
- Preserve existing slides as optional “Экскурсия” with one scene at a time and keyboard arrow navigation.

**Readability:** line length about 60–75 characters in body text, 16–19px base on laptop, >=16px mobile, line height 1.55–1.8, contrast ≥4.5:1 for standard text, touch targets ~44px, focus indicators, `prefers-reduced-motion`, no horizontal overflow.

**Acceptance:** read entire 14-episode storyline using one scroll container, citations readable and openable, no dual nested scrollbars; switch single view in situ.

### B1.4 Tests

- Unit: version-switch function/controlled state; select does not close desktop archive.
- Component/e2e: open/close reader and restore board; mode defaults to book; change hypothesis while reader open; citation opens expected URL; Escape/focus return.
- Visual QA screenshots for 1366×768, 1440×900, 1024×768, 390×844, 375×667, portrait/landscape at 100% and 125% scaling. Check scroll/overflow and focused controls.
- Core Python tests and TypeScript/Vite build must continue to pass.

**Files:** `apps/board-ui/src/main.tsx`, `apps/board-ui/src/StoryReader.tsx`, `apps/board-ui/src/style.css`, `apps/board-ui/src/story.css`; add reusable `HypothesisSwitcher` if helpful.

## B2 — v0.4.4: Pushkin Visual Pack

### B2.1 Unified art direction

**Style:** late-19th-century historical editorial painting / toned etching; warm amber highlights, deep sepia, restrained navy/charcoal shadows, visible paper grain, plausible period costumes and objects. **Avoid** modern photographic cosplay and anachronistic architecture. Keep faces consistent across scenes.

**Identity/provenance is mandatory:**
- `archival_original`: image from authentic archival/artistic work, with archive reference, creator, publication permissions.
- `archival_stylized`: stylized transformation of an identified existing likeness; record original reference/artist/year.
- `reconstruction`: speculative artist/AI rendition of a person for whom no reliable likeness can be established; explicitly say “условная реконструкция”.
- `atmospheric`: non-portrait prop/setting image; no claim to depict a verified event.

**Do not invent appearance and imply historical accuracy.** If identity or precise appearance is unknown, a labeled silhouette or scene without facial details may be more appropriate than a fictional portrait.

### B2.2 First bounded asset pack

**8 priority people:** Александр Пушкин (`pushkin`), Наталья (`natalia`), Жорж Дантес (`dantes`), Луи Геккерн (`heckern`), Идалия Полетика (`idalia`), Николай I (`nicholas1`), Михаил Лермонтов (`lermontov`), Екатерина Гончарова (`ekaterina`). Additional participants retain a tasteful placeholder pending evidence.

**6 priority scene compositions (not all 14 at once):** a letter in the Pushkin residence, a Petersburg salon, receiving the anonymous pasquille, January negotiations/conflict, the Black River duelling ground, poet/letters after the death. Reuse cautiously; show different composition only where it contributes distinct information.

### B2.3 Asset storage and model fields

Recommended locations:
```text
apps/board-ui/public/media/pushkin/portraits/<person-id>.webp
apps/board-ui/public/media/pushkin/scenes/<scene-id>.webp
cases/pushkin/media.json
```

`media.json` schema (example, *not an actual image asset*):
```json
{
  "schema_version": "1",
  "portraits": {
    "pushkin": {
      "path": "media/pushkin/portraits/pushkin.webp",
      "provenance": "archival_stylized",
      "source_ids": [],
      "source_note": "Provide documented visual reference before publishing",
      "caption": "Стилизованный портрет"
    }
  },
  "scenes": {
    "s-1836-pasquille": {
      "path": "media/pushkin/scenes/s-1836-pasquille.webp",
      "provenance": "reconstruction",
      "caption": "Художественная реконструкция, не документальный снимок",
      "event_id": "event-pasquille"
    }
  }
}
```

In UI use `casebook` person/event IDs, not display-name hashes. Fall back to existing `DossierPortrait` and `StoryArt` on missing/error. Use `<picture>` / `<img>` as appropriate, lazy loading below the fold, `decoding="async"`, responsive `srcset` where useful. Target portraits ~512–768px tall and scenes ~1280–1600px wide with optimized WebP/AVIF; set byte budgets after first real generated samples. Cite provenance in details/figcaptions. Never treat scene artwork as documentary evidence.

### B2.4 Review and rollout

- Preview a **contact sheet of portrait style and scene direction** before producing the full pack.
- Validate visual consistency, captions, historical attributes and attribution.
- Implement separately from v0.4.3 and ship behind graceful fallbacks.
- Check Pages asset base paths: repo is served at `/deductionwizzard/`; avoid root-relative asset URLs that break on GitHub Pages.

**Acceptance:** eight portraits and six scene artworks either load with meaningful captions or fall back gracefully; no mislabeled "archival" images; story stays legible at 390px; PNG/WebP failures do not blank the whole React interface.

## Ordered delivery and stop rule

1. B1 mini-switcher and fix desktop automatic archive collapse.
2. B1 full-viewport reader with default continuous reading and accessible navigation.
3. Ship v0.4.3; test on 14-inch laptop **before adding image weight**.
4. Make B2 contact sheet; approve one coherent portrait and one coherent scene visual direction.
5. Produce and integrate bounded image set with provenance/fallback metadata; ship v0.4.4.
6. Only after success return to the evidence research core, source audit and comparative history methodology.

**Non-goals:** no new paid text API, no generated per-click story, no complete cast of all 20 characters before verifying first eight, no extra feature branches.

## Backlog outside this sprint

- Rich independently authored comparative two-column editions;
- editor/publish workflow for new verified hypotheses;
- richer archaeological/anthropological cross-cultural cases;
- animations beyond necessary reader transitions.

