import { readFileSync } from 'node:fs';
import { defineConfig, type Plugin } from 'vite';

/**
 * Preview only: Home Assistant's camera proxy answers with a still picture, so
 * the HyperHDR card shows a captured frame on the dev pages.
 */
const cameraProxy: Plugin = {
  name: 'vivid-dev-camera-proxy',
  apply: 'serve',
  configureServer(server) {
    server.middlewares.use((request, response, next) => {
      if (!request.url?.startsWith('/api/camera_proxy')) return next();
      response.setHeader('Content-Type', 'image/jpeg');
      response.end(readFileSync(new URL('./dev/assets/hyperhdr-frame.jpg', import.meta.url)));
    });
  },
};

const pkg = JSON.parse(readFileSync(new URL('./package.json', import.meta.url), 'utf8')) as {
  version: string;
};

export default defineConfig({
  plugins: [cameraProxy],
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
