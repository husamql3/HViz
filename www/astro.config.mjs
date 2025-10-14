// @ts-nocheck
import { defineConfig, envField, fontProviders } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import react from "@astrojs/react";
import node from '@astrojs/node';
import cloudflare from '@astrojs/cloudflare';

// https://astro.build/config
export default defineConfig({
  output: 'server',
  adapter: node({
    mode: 'standalone'
  }),
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
  env: {
    schema: {
      SUPABASE_URL: envField.string({
        context: "server",
        access: "secret"
      }),
      SUPABASE_ANON_KEY: envField.string({
        context: "server",
        access: "secret"
      }),
    }
  },
  adapter: cloudflare({
    platformProxy: {
      enabled: true,
      configPath: 'wrangler.toml',
    }
  })
});