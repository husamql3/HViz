import type { ErdResult } from "@/types/erd.type";
import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { z } from "zod";

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

  app.get('/', (c) => {
    return c.json(reactFlowData);
  });

  // API endpoint to serve the ERD data
  // app.get('/api/data', (c) => {
  //   return c.json(reactFlowData);
  // });

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

  return app;
}