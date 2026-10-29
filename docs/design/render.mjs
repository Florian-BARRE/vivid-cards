// Renders the design pages of this folder to PNG: node docs/design/render.mjs
import path from 'node:path';
import { createRequire } from 'node:module';

// Playwright is not a dependency of the cards: install it once (`npm i -g playwright`).
const { chromium } = createRequire(import.meta.url)('playwright');
const pages = [
  ['banner.html', '../assets/banner.png', 1280, 640],
  ['showcase.html', '../assets/showcase.png', 1600, 1060],
];
await (async () => {
  const only = process.argv[2];
  const browser = await chromium.launch();
  for (const [file, out, width, height] of pages) {
    if (only && !file.startsWith(only)) continue;
    const page = await browser.newPage({ viewport: { width, height }, deviceScaleFactor: 2 });
    try {
      await page.goto(`file://${path.join(import.meta.dirname, file)}`);
    } catch {
      await page.close();
      continue;
    }
    await page.waitForTimeout(500);
    await page.screenshot({ path: path.join(import.meta.dirname, out) });
    await page.close();
    console.info(out);
  }
  await browser.close();
})();
