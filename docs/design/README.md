# Design sources

The banner and the dashboard picture of the README are HTML pages laid out from
the real card screenshots.

Needs Playwright (`npm i -g playwright` and `npx playwright install chromium`).

1. `npm run dev`, then capture the cards (`npm run docs:shots`): it writes
   `docs/assets/cards/*.png` and `*-light.png` from the preview pages.
2. `python3 docs/design/crop.py`: cuts the page margin off each screenshot and
   rounds its corners into `docs/design/crops/` (not committed).
3. `node docs/design/render.mjs`: renders `banner.html` and `showcase.html` to
   `docs/assets/banner.png` and `docs/assets/showcase.png` (2×).
