# Root Reach Calculator — Improvement Priorities

For: Ruudi · Repo: `RuTsEST/root-reach-calculator` · Live: https://rutsest.github.io/root-reach-calculator/

---

## 1. Executive summary

**What it is.** A small Create React App + MUI tool for picking/banning *Root* factions against official (and unofficial Clockwork) reach thresholds. Ban/pick modes, player-count and 1-/2-bot modes, live reach total, and automatic disable of factions that can no longer meet the target. Deployed manually to GitHub Pages via `gh-pages`.

**Overall health.** Product-wise the app is focused and usable: recent cleanup removed dead code and CRA boilerplate README, Homeland factions are live, and unit tests cover the main pick/ban/reach/reset flows. Tech health is solidifying: unused `web-vitals` trimmed and `gh-pages` moved to devDependencies; Jest-only CI on master; Pages deploy via GitHub Actions on master (P1.1 — verified live after Pages source → GitHub Actions). Faction fabs have accessible names/alt and reach status includes a text cue + `aria-live` (#11). Ban mode can target grayed “unavailable” factions (#12). Faction reach badges no longer clip on mobile (P1.8 — [#14](https://github.com/RuTsEST/root-reach-calculator/pull/14)). Cypress and dead PWA logo192/logo512 refs are removed (favicon-only). Lockfile is clean against `registry.npmjs.org`; GoatCounter site `ruts` is live on GitHub Pages. Complexity is still low — keep it that way.

---

## 2. Prioritized backlog

Effort: **S** = hours / small PR · **M** = half-day to a day · **L** = multi-day or architectural.  
Risk to simplicity: **Low** / **Medium** / **High**.

### P0 — Fix first (broken or clearly wrong)

| # | Title | Why it matters | Effort | Risk | Recommended approach |
|---|--------|----------------|--------|------|----------------------|
| P0.0 | **~~Regenerate lockfile against public npm~~ (done)** | Lockfile had non-public `resolved` URLs that broke installs for others. | S | Low | **Done (#8):** Regenerated against `https://registry.npmjs.org`; `typescript@4.9.5` pinned for CRA. Always install with public npm. |
| P0.1 | **~~Remove Cypress entirely~~ (done)** | Suite was rotting (stale reach assertion) and overkill for this small calculator. Confirmed: do not keep or fix e2e — delete deps, scripts, config, `cypress/` tree, and README mentions. Jest/unit tests stay. | S | Low | **Done:** Dropped Cypress deps/scripts/config/tree; Jest/unit tests remain. |
| P0.2 | **~~Drop missing PWA icon refs (favicon-only)~~ (done)** | `public/index.html` and `manifest.json` referenced `logo192.png` / `logo512.png` (and apple-touch-icon), which were not in the repo — 404s on Pages. Confirmed: do not add new icon files. | S | Low | **Done:** Favicon-only; dead logo192/logo512 refs removed. |
| P0.3 | **~~Private visit tracking for GitHub Pages~~ (live)** | Pages has no built-in analytics. Without privacy-friendly counts you cannot tell if the tool is used. | S | Low | **Live:** GoatCounter site `ruts` in `public/index.html` + README; Pages redeployed after #8; `count.js` loads and count beacon returns 200. |

### P1 — High value, still simple

| # | Title | Why it matters | Effort | Risk | Recommended approach |
|---|--------|----------------|--------|------|----------------------|
| P1.1 | **~~GitHub Actions deploy to Pages~~ ([#13](https://github.com/RuTsEST/root-reach-calculator/pull/13))** | README already warns that `predeploy` is unreliable when the dev server is running; manual `npm run build && npx gh-pages -d build` is easy to get wrong. | M | Low–Med | **Done:** Merged #13; Pages source = GitHub Actions; GHA deploy verified live on https://rutsest.github.io/root-reach-calculator/ |
| P1.2 | **~~Accessible faction buttons~~ ([#11](https://github.com/RuTsEST/root-reach-calculator/pull/11))** | Faction `Fab`s are image-only Avatars with no `alt` / accessible name. Screen readers and some automation only see anonymous buttons; `data-cy` does not help real users. | S–M | Low | **Done (#11):** Human `label` per faction → `aria-label` on `Fab` + meaningful `alt` on Avatar. Image-first visually; no captions. |
| P1.3 | **~~Reach / status not color-only~~ ([#11](https://github.com/RuTsEST/root-reach-calculator/pull/11))** | Reach uses green/red text only; picked/banned rely on color + overlay icons that may be easy to miss on small screens. | S | Low | **Done (#11):** Keep colors; “OK” / “Below target” + `aria-live`. Mobile wrap fixed by full-width reach row under Ban/Pick + Reset. |
| P1.4 | **~~README: how to use + rules notes~~ ([#9](https://github.com/RuTsEST/root-reach-calculator/pull/9))** | Current README covers dev/deploy well but not table use, Ban vs Pick, Clockwork being unofficial, or vagabond/knaves mutual exclusion. | S | Low | **Draft PR #9:** Short “How to use” (Ban vs Pick, player/bot modes, Leder/Root link, unofficial Clockwork note, vagabond2 / knaves↔vagabond rules). Deploy/dev sections kept. |
| P1.5 | **~~Trim dead dependency surface~~ ([#10](https://github.com/RuTsEST/root-reach-calculator/pull/10))** | `web-vitals` remained after `reportWebVitals` was removed; `gh-pages` was in `dependencies`. | S | Low | **Draft PR #10:** Removed `web-vitals`; moved `gh-pages` to `devDependencies`; lockfile regenerated against `registry.npmjs.org` only. |
| P1.6 | **~~Ban before “unavailable”~~ ([#12](https://github.com/RuTsEST/root-reach-calculator/pull/12))** | Unavailable factions are `disabled`, so you cannot ban a faction that the reach solver already grayed out — awkward when planning bans first. | S–M | Med | **Draft PR #12:** In ban mode, `IS_NOT_AVAILABLE` fabs stay clickable and keep full size/opacity (pick mode still shrinks/grays/disables). Unit test covers ban-on-grayed + size restore. |
| P1.7 | **~~Minimal CI (unit tests only)~~ ([#10](https://github.com/RuTsEST/root-reach-calculator/pull/10))** | No `.github/workflows`. Reach-logic regressions only show up locally. | S–M | Low | **Draft PR #10:** Workflow runs `npm ci` → `npm test -- --watchAll=false` on push/PR. No Cypress / e2e. |
| P1.8 | **~~Fix faction reach badge clipping (mobile)~~ ([#14](https://github.com/RuTsEST/root-reach-calculator/pull/14))** | On ~375px, top-row Fab reach-number badges are cut off mid-digit by overflow/padding. Pre-existing; called out in PR #11 mobile review. | S–M | Low–Med | **Draft PR #14:** Badge wraps Fab; Fab `z-index: 0` so badges paint above circles; light grid padding/gap for overhang. Evidence: `media/faction-reach-badge-cutoff-mobile.png` → `media/faction-reach-badge-fixed-mobile.png`. |

### P2 — Nice to have (only if P0/P1 are done)

| # | Title | Why it matters | Effort | Risk | Recommended approach |
|---|--------|----------------|--------|------|----------------------|
| P2.1 | **Extract faction + threshold data** | Reach maps and the large faction object live in components (`App.js`, `ChooseFactionButtons.js`), making edits error-prone as expansions land. | S–M | Low | Move `idToValuesMap` and the faction catalog into `src/constants.js` (or `src/data/`). No new frameworks. |
| P2.2 | **Tests for special rules** | Unit tests miss vagabond2-requires-vagabond1, knaves↔vagabond exclusion, and Homeland reach math. | S–M | Low | Add focused tests that pick/ban those combos and assert disabled/`IS_NOT_AVAILABLE` behavior. |
| P2.3 | **Visible faction names (optional)** | Image-only grid is fine for veterans; newcomers may not recognize Homeland art. | M | Med | Optional small caption under buttons, or long-press / tooltip with the name + reach. Do not clutter the grid if it hurts mobile density. |
| P2.4 | **Persist session in `sessionStorage`** | Accidental refresh mid-draft clears picks. | S | Med | Store picks/bans/mode; clear on Reset. Skip if you prefer zero persistence. |
| P2.5 | **Repo metadata** | GitHub `description` / `homepage` / topics are empty despite `package.json` homepage. | S | Low | Set homepage to the Pages URL and a one-line description so the project is discoverable. |
| P2.6 | **LICENSE + disclaimer polish** | Fan tool; no LICENSE file. Unofficial note is only in README. | S | Low | Add a simple license you are comfortable with and repeat the unofficial disclaimer in the app footer (one line). |
| P2.7 | **~~Headless Cypress script~~ (cancelled)** | Cypress is being removed (P0.1); do not add `cypress run` or e2e CI. | — | — | Covered by P0.1 + P1.7 (Jest-only CI). |
| P2.8 | **Mobile faction-grid density / scroll** | Full faction set + sticky footer needs vertical scroll on a phone. May be acceptable for density; felt janky in #11 review. | M | Med | Only if we can reduce scroll without hurting tap targets or adding a redesign. Evidence: `media/faction-grid-scroll-mobile.png`. Prefer small tweaks over a layout rewrite. |

---

## 3. Won’t do / out of scope (preserves simplicity)

- **Do not adopt Google Analytics / ads / heavy tag managers** — conflicts with private, low-friction visit tracking; cookie banners and complexity for a fan tool.
- **Do not replace MUI or eject CRA** for bundle fashion — MUI is already the UI kit; a rewrite costs a lot and buys little for this surface.
- **Do not migrate to Next.js / Vite / TypeScript “for modernity”** unless you hit a hard CRA/Node wall again; keep the stack boring.
- **Do not build accounts, multiplayer sync, or a full rules engine** — the value is a fast table-side picker, not a digital Root client.
- **Do not self-host Umami/Plausible** for this — ops overhead dwarfs GoatCounter’s one script tag.
- **Do not add a design-system / card-heavy marketing shell** around the calculator — keep the full-viewport tool layout.
- **Avoid deep state libraries** (Redux, etc.); local React state is enough.
- **Do not add a replacement e2e framework** after Cypress — unit tests cover the reach/pick/ban logic; keep the test surface small.

---

## 4. Suggested next 1–3 actions

1. **~~P0.0 + P0.3~~** — Done: clean lockfile on master; Pages redeployed; GoatCounter live.
2. **~~P1.2 / P1.3 / P1.4 / P1.5 / P1.6 / P1.7~~** — Merged (#9–#12).
3. **P1.1 done** (Actions deploy verified). **P1.8** (faction reach badge clipping) — [#14](https://github.com/RuTsEST/root-reach-calculator/pull/14); coordinator cleanup of this doc after merge + deploy.

---

## Appendix — Exploration notes (evidence)

| Area | Finding |
|------|---------|
| Architecture | CRA: `src/App.js` + 4 components, `constants.js`, 14 faction PNGs; Cypress under `cypress/` (to be removed per P0.1) |
| README | Project-specific; good deploy caveat; “How to use” added in P1.4 PR (Ban/Pick, bots, Clockwork disclaimer, vagabond/knaves) |
| UX | Header Ban/Pick + reach + reset; scrollable faction grid; sticky player/bot footer — solid mobile shell |
| Deps | React 17, MUI 5, react-scripts 5.0.1; Cypress/`web-vitals` removed; `gh-pages` in `devDependencies`; `typescript@4.9.5` pinned for CRA; `.nvmrc` = 24 |
| Lockfile | Public `registry.npmjs.org` only (#8) |
| CI | `.github/workflows/ci.yml` — `npm ci` + Jest (`--watchAll=false`); no e2e (#10). Separate `deploy-pages.yml` for Pages (#13) |
| Deploy | `homepage` set for project Pages URL; Actions workflow builds + `deploy-pages` on master ([#13](https://github.com/RuTsEST/root-reach-calculator/pull/13)); `gh-pages` kept as local fallback; Ruudi must set Pages source to GitHub Actions once after merge |
| Analytics | GoatCounter site `ruts` live (`data-goatcounter` + `gc.zgo.at/count.js`; count 200); no GA |
| A11y | Reset has `aria-label`; faction fabs have `aria-label` + image `alt` (#11); reach has “OK” / “Below target” + `aria-live` (#11) |
| Ban UX | Ban mode: `IS_NOT_AVAILABLE` fabs clickable at full size/opacity; pick mode still shrinks/grays/disables (#12 draft) |
| Performance | Small asset set (~20–84 KB PNGs); MUI is the main JS weight — acceptable |
| Tests | 7 solid RTL tests in `App.test.js`; Cypress e2e was partially wrong and is being dropped |
| Misc | `isBanMode` gates Fab `disabled` in `ChooseFactionButton` (P1.6); shallow-copy faction updates mutate nested objects (works today, fragile if extended) |
