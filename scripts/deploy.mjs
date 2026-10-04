// Copies the built bundle into a Home Assistant `www` folder (Samba share,
// mounted volume…). The target comes from VIVID_DEPLOY_DIR, read from the
// environment or from `.env.local`.
import { copyFileSync, existsSync, mkdirSync, readFileSync } from 'node:fs';
import { join, resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..');

function readLocalEnv() {
  const file = join(root, '.env.local');
  if (!existsSync(file)) return {};
  return Object.fromEntries(
    readFileSync(file, 'utf8')
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter((line) => line && !line.startsWith('#') && line.includes('='))
      .map((line) => {
        const index = line.indexOf('=');
        return [
          line.slice(0, index).trim(),
          line
            .slice(index + 1)
            .trim()
            .replace(/^["']|["']$/g, ''),
        ];
      }),
  );
}

const target = process.env.VIVID_DEPLOY_DIR || readLocalEnv().VIVID_DEPLOY_DIR;
if (!target) {
  console.error('VIVID_DEPLOY_DIR is not set. Copy .env.example to .env.local and fill it in.');
  process.exit(1);
}

const bundle = join(root, 'dist', 'vivid-cards.js');
if (!existsSync(bundle)) {
  console.error('dist/vivid-cards.js is missing. Run `npm run build` first.');
  process.exit(1);
}

const { version } = JSON.parse(readFileSync(join(root, 'package.json'), 'utf8'));
mkdirSync(target, { recursive: true });
copyFileSync(bundle, join(target, 'vivid-cards.js'));

console.info(`Copied vivid-cards.js (v${version}) to ${target}`);
console.info(
  `Dashboard resource: /local/vivid-cards/vivid-cards.js?v=${version}-${Date.now()} (JavaScript module)`,
);
