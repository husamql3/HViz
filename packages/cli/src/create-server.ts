import { Hono } from 'hono'
import type { ErdResult } from './generate-erd';
import { serveStatic } from 'hono/bun';
import path from 'path';
import { fileURLToPath } from 'url';

export const PORT = 3000

export const createServer = (reactFlowData: ErdResult) => {
  const app = new Hono();

  // Get the absolute path to the view dist directory
  const __dirname = path.dirname(fileURLToPath(import.meta.url));
  const distPath = path.join(__dirname, '../../view/dist');

  app.use("*", async (c, next) => {
    c.header("Access-Control-Allow-Origin", "*");
    c.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
    c.header("Access-Control-Allow-Headers", "Content-Type");
    await next();
  });

  // API endpoint to serve the ERD data
  app.get('/api/data', (c) => {
    return c.json(reactFlowData);
  });

  // Serve static files from the dist directory
  app.use('/*', serveStatic({ root: distPath }))

  return app;
};

export type AppType = ReturnType<typeof createServer>;