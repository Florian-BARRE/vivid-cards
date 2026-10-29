// Captures the card screenshots of the documentation from the preview pages.
// Run `npm run dev` first, then `npm run docs:shots` (both themes, English).
import path from 'node:path';
import { createRequire } from 'node:module';

// Playwright is not a dependency of the cards: install it once (`npm i -g playwright`).
const { chromium } = createRequire(import.meta.url)('playwright');

const OUT = path.join(import.meta.dirname, '..', 'docs', 'assets', 'cards') + path.sep;
const base = process.env.VIVID_DEV_URL ?? 'http://localhost:5173/dev/';
const jobs = [
  ['energy.html?hourly=20&only=1', 'vivid-bill-card', 'bill'],
  ['energy.html?hourly=20&only=2', 'vivid-bill-card', 'bill-line'],
  ['energy.html?hourly=20&only=3', 'vivid-bills-card', 'bills'],
  ['energy.html?hourly=20&only=4', 'vivid-bill-ring', 'bill-ring'],
  ['energy.html?hourly=20&only=5', 'vivid-bill-ring', 'bill-ring-off-peak'],
  ['energy.html?hourly=20&only=6', 'vivid-energy-calendar', 'energy-calendar', 'calendar'],
  ['energy.html?hourly=20&only=7', 'vivid-energy-flow', 'energy-flow'],
  ['energy.html?hourly=20&only=8', 'vivid-energy-ranking', 'energy-ranking'],
  ['energy.html?hourly=20&only=9', 'vivid-load-curve', 'load-curve'],
  ['energy.html?hourly=20&only=0', '.stage > div', 'energy-badges'],
  ['focus.html?only=0', 'vivid-fan-card', 'fan'],
  ['focus.html?only=1', 'vivid-hdmi-card', 'hdmi'],
  ['focus.html?only=2', 'vivid-pi-card', 'pi'],
  ['focus.html?only=3', 'vivid-screen-card', 'screen'],
  ['focus.html?only=4', 'vivid-light-card', 'light-wled'],
  ['focus.html?only=5', 'vivid-light-card', 'light'],
  ['focus.html?only=6', 'vivid-power-card', 'power'],
  ['focus.html?only=7', 'vivid-climate-card', 'climate'],
  ['focus.html?only=8', 'vivid-climate-card', 'climate-humidity'],
];

const HIDE = '.stage h2, h3, .toolbar { visibility: hidden !important; }';

async function capture(page, selector, file, pad) {
  const box = await page.locator(selector).first().boundingBox();
  await page.screenshot({
    path: `${OUT}${file}.png`,
    clip: {
      x: Math.max(0, box.x - pad),
      y: Math.max(0, box.y - pad),
      width: box.width + 2 * pad,
      height: box.height + 2 * pad,
    },
  });
}

await (async () => {
  const browser = await chromium.launch();
  for (const theme of ['dark', 'light']) {
    const suffix = theme === 'light' ? '-light' : '';
    for (const [page, selector, name, action] of jobs) {
      const tab = await browser.newPage({
        viewport: { width: 520, height: 1600 },
        deviceScaleFactor: 2,
      });
      await tab.goto(`${base}${page}&lang=en&theme=${theme}&width=480`);
      await tab.waitForTimeout(2500);
      await tab.addStyleTag({ content: HIDE });
      if (action === 'calendar') {
        // Opens the day before yesterday, to show its hours.
        await tab
          .locator(selector)
          .first()
          .evaluate((card) => {
            const cells = [...card.shadowRoot.querySelectorAll('.grid button')].filter(
              (cell) => !cell.disabled,
            );
            cells[cells.length - 2]?.click();
          });
        await tab.waitForTimeout(600);
      }
      await capture(tab, selector, `${name}${suffix}`, 14);
      await tab.close();
    }
    let tab = await browser.newPage({
      viewport: { width: 520, height: 900 },
      deviceScaleFactor: 2,
    });
    await tab.goto(`${base}room-header.html?only=0&lang=en&theme=${theme}`);
    await tab.waitForTimeout(2500);
    await capture(tab, 'vivid-room-header', `room-header${suffix}`, 14);
    await tab.close();
    tab = await browser.newPage({ viewport: { width: 760, height: 1400 }, deviceScaleFactor: 2 });
    await tab.goto(`${base}badges.html?lang=en&theme=${theme}`);
    await tab.waitForTimeout(3000);
    await tab.addStyleTag({ content: HIDE });
    for (const [index, name] of [
      [3, 'climate-badges'],
      [2, 'status-badges'],
    ]) {
      const box = await tab.locator('section .bar').nth(index).boundingBox();
      await tab.screenshot({
        path: `${OUT}${name}${suffix}.png`,
        clip: { x: box.x - 12, y: box.y - 12, width: box.width + 24, height: box.height + 24 },
      });
    }
    await tab.close();
    console.info(theme, 'done');
  }
  await browser.close();
})();
