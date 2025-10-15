import { defineConfig, fontProviders } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import react from "@astrojs/react";

import node from '@astrojs/node';

// https://astro.build/config
export default defineConfig({
  output: 'server',

  vite: {
    plugins: [tailwindcss()],
    ssr: {
      external: ['node:buffer'],
    },
  },

  experimental: {
    fonts: [{
      provider: fontProviders.google(),
      name: "Roboto Mono",
      cssVariable: "--font-roboto-mono"
    }]
  },

  integrations: [react()],

  adapter: node({
    mode: 'standalone',
  }),
});