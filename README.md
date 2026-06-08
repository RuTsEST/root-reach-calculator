# Root Reach Calculator

A faction picker for the [Root](https://ledergames.com/products/root-a-game-of-woodland-might-and-right) board game that tracks reach values and shows which factions are still viable for the current player count.

Live at **https://rutsest.github.io/root-reach-calculator/**

> Unofficial fan-made tool, not affiliated with Leder Games.

## Development

```bash
npm start        # dev server at localhost:3000
npm test         # unit tests
npm run test:cypress  # e2e tests
```

## Deploy

Always build explicitly — the `predeploy` hook is unreliable when the dev server is running:

```bash
npm run build && npx gh-pages -d build
```

Verify the faction images are present in `build/static/media/` before deploying. GitHub Pages CDN can take a few minutes to propagate.
