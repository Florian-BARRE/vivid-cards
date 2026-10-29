# Development

Requires Node.js 22.12 or newer.

```bash
npm install
npm run dev      # preview page with a simulated Home Assistant
npm run check    # format, lint, typecheck, tests and build
npm run build    # dist/vivid-cards.js
```

The preview pages run the cards against an in-memory Home Assistant (three
WLED strips with presets, diagnostics and history, two tunable white spots), so you can work on the UI without a
server: `/dev/` for the cards, `/dev/editor.html` for the visual editor in
several situations, `/dev/lamps.html` for the lamp card.

## Testing on your Home Assistant

1. Copy `.env.example` to `.env.local` and set `VIVID_DEPLOY_DIR` to your
   `config/www/vivid-cards` folder (a Samba share works).
2. Run `npm run deploy`: it builds and copies the bundle there.
3. Point your dashboard resource to `/local/vivid-cards/vivid-cards.js` and bump
   its `?v=` query after each deploy so browsers reload it.

## Releasing

1. Update `version` in `package.json` and the changelog.
2. Merge into `main`. The **Auto release** workflow sees a version without a
   tag: it checks the code, builds it, creates the release `vX.Y.Z` with the
   changelog entry as notes and attaches `vivid-cards.js`, which HACS installs.

A version such as `0.12.0-beta.1` is published as a **pre-release**: HACS
offers it only with "Show beta versions" turned on, so betas can be tested
from HACS before the final version.

A release drafted by hand on GitHub works too: the **Release** workflow attaches
the bundle to it.

See [CONTRIBUTING.md](../../CONTRIBUTING.md) for the architecture and conventions.
