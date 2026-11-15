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
4. `node docs/design/render-headers.mjs`: renders the header picture of every
   documentation page (`page-header.html`, filled from `headers.json`) to
   `docs/assets/headers/<page>.jpg`, 2000 px wide.
5. `node docs/design/render-headers.mjs --ecosystem`: renders `ecosystem.html`,
   the "Vivid Pilot builds, Vivid Cards shows" picture, to
   `docs/assets/ecosystem.png`. It reads crops from both repositories, so clone
   [vivid-pilot](https://github.com/Florian-BARRE/vivid-pilot) next to this one
   and run its crop step first.

`page-header.html`, `render-headers.mjs` and `ecosystem.html` are the same
files in both repositories: change them in both, so the two documentations keep
one look.

A new page gets its header by adding an entry to `headers.json` (`name`,
`kicker`, `title`, `text`, up to three `images`) and running step 4.
