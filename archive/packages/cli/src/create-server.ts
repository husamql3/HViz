import { Hono } from 'hono'
import { z } from 'zod'
import { zValidator } from '@hono/zod-validator'
import type { ErdResult } from './generate-erd';
import { serveStatic } from 'hono/bun';
import path from 'path';
import { fileURLToPath } from 'url';

export const PORT = 4000

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

  app.get(
    "/diagram",
    zValidator(
      'query', z.object({
        name: z.string(),
      })
    ),
    (c) => {
      const { name } = c.req.valid('query')
      return c.json({
        message: `Hello! ${name}`,
      })
    }
  )

  // Serve static files from the dist directory
  app.use('/*', serveStatic({ root: distPath }))

  return app;
};

export type AppType = ReturnType<typeof createServer>;
