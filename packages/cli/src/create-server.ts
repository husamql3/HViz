import { Hono } from 'hono'
import type { ErdResult } from './generate-erd';

export const PORT = 3000

export const app = new Hono();

export const createServer = (reactFlowData: ErdResult) => {

  app.use("*", async (c, next) => {
    c.header("Access-Control-Allow-Origin", "*");
    c.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
    c.header("Access-Control-Allow-Headers", "Content-Type");
    await next();
  });

  app.get("/api", (c) => {
    return c.json(reactFlowData);
  });

  return app;
};

export type AppType = ReturnType<typeof createServer>;