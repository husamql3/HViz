import { defineConfig } from 'tsup';

export default defineConfig([
  // CLI bundle (executable)
  {
    entry: {
      cli: 'packages/cli/src/index.ts',
    },
    format: ['esm'],
    dts: false,
    clean: true,
    shims: true,
    bundle: true,
    minify: false,
    sourcemap: true,
    external: [
      // Keep heavy deps external to reduce bundle size
      '@prisma/internals',
      '@dbml/core',
      'drizzle-dbml-generator',
    ],
    outDir: 'dist',
    platform: 'node',
    target: 'node20',
    banner: {
      js: '#!/usr/bin/env node',
    },
    esbuildOptions(options) {
      options.banner = {
        js: '#!/usr/bin/env node',
      };
    },
    onSuccess: 'chmod +x dist/cli.js',
  },
  // Library exports (server utilities)
  {
    entry: {
      index: 'packages/server/index.ts',
    },
    format: ['esm'],
    dts: true,
    clean: false,
    bundle: true,
    minify: false,
    sourcemap: true,
    outDir: 'dist',
    platform: 'node',
    target: 'node20',
  },
]);