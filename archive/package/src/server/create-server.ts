import type { ErdResult } from "@/types/erd.type";
import { serveStatic } from '@hono/node-server/serve-static'
import { Hono } from "hono";
import path from "node:path";
import { fileURLToPath } from "node:url";

export const PORT = 3000

export const createServer = (reactFlowData: ErdResult) => {
  const __dirname = path.dirname(fileURLToPath(import.meta.url));
  const distPath = path.join(__dirname, '../view/dist');

  const app = new Hono()
    .use("*", async (c, next) => {
      c.header("Access-Control-Allow-Origin", "*");
      c.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
      c.header("Access-Control-Allow-Headers", "Content-Type");
      await next();
    })
    .use('/*', serveStatic({ path: distPath }))
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