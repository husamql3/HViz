import type { ErdResult } from "@/types/erd.type";
import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { z } from "zod";

export const PORT = 3000

export const createServer = (reactFlowData: ErdResult) => {
  const app = new Hono()
    .use("*", async (c, next) => {
      c.header("Access-Control-Allow-Origin", "*");
      c.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
      c.header("Access-Control-Allow-Headers", "Content-Type");
      await next();
    })
    .get('/', (c) => {
      return c.json(reactFlowData);
    })
    .get(
      "/diagram",
      (c) => {
        return c.json({
          data: reactFlowData,
        })
      }
    )

  return app;
}

// Get the absolute path to the view dist directory
// const __dirname = path.dirname(fileURLToPath(import.meta.url));
// const distPath = path.join(__dirname, '../../view/dist');

// API endpoint to serve the ERD data
// app.get('/api/data', (c) => {
//   return c.json(reactFlowData);
// });
