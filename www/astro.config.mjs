// @ts-nocheck
import { defineConfig, fontProviders } from 'astro/config';
import cloudflare from '@astrojs/cloudflare';
import tailwindcss from '@tailwindcss/vite';
import react from "@astrojs/react";

// https://astro.build/config
export default defineConfig({
  vite: {
    plugins: [tailwindcss()],
  },

  experimental: {
    fonts: [{
      provider: fontProviders.google(),
      name: "Roboto Mono",
      cssVariable: "--font-roboto-mono"
    }]
  },

  integrations: [react()],
  adapter: cloudflare({
    platformProxy: {
      enabled: true,
      configPath: 'wrangler.toml',
    }
  })
});