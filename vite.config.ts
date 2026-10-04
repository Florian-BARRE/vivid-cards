import { readFileSync } from 'node:fs';
import { defineConfig } from 'vite';

const pkg = JSON.parse(readFileSync(new URL('./package.json', import.meta.url), 'utf8')) as {
  version: string;
};

export default defineConfig({
  define: {
    __VIVID_VERSION__: JSON.stringify(pkg.version),
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    target: 'es2022',
    minify: true,
    sourcemap: false,
    lib: {
      entry: 'src/vivid-cards.ts',
      formats: ['es'],
      fileName: () => 'vivid-cards.js',
    },
    // Library mode keeps whitespace in ES output for downstream tree-shaking.
    // This bundle is loaded as-is by Home Assistant, so minify it fully.
    rolldownOptions: {
      output: { minify: true },
    },
  },
});
