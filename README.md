# Root Reach Calculator

A faction picker for the [Root](https://ledergames.com/products/root-a-game-of-woodland-might-and-right) board game that tracks reach values and shows which factions are still viable for the current player count.

Live at **https://rutsest.github.io/root-reach-calculator/**

> Unofficial fan-made tool, not affiliated with Leder Games.

## How to use

- **Ban vs Pick** — Ban marks factions out of the draft without adding reach; Pick selects them and adds their reach to the total. Switch with the Ban/Pick toggle.
- **Players vs bots** — Choose a player count (2–6) for standard games, or **1 Bot** / **2 Bots** for Clockwork-style setups. The reach target updates with the mode.
- **Official rules** — Reach targets for player counts follow [Root](https://ledergames.com/products/root-a-game-of-woodland-might-and-right) / Leder Games. Bot (Clockwork) thresholds in this tool are **unofficial estimates**, not from the Clockwork rulebook.
- **Encoded special rules** — Second Vagabond is only available after the first is picked; Knaves of the Deepwood and either Vagabond are mutually exclusive. Factions that cannot still meet the reach target are grayed out.

## Development

```bash
npm start        # dev server at localhost:3000
npm test         # unit tests
```

## Deploy

Always build explicitly — the `predeploy` hook is unreliable when the dev server is running:

```bash
npm run build && npx gh-pages -d build
```

Verify the faction images are present in `build/static/media/` before deploying. GitHub Pages CDN can take a few minutes to propagate.

## Analytics

Privacy-friendly visit tracking via [GoatCounter](https://www.goatcounter.com/) (no cookies, no consent banner). Dashboard: https://ruts.goatcounter.com
