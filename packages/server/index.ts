import path from "node:path";
import type { ErdResult } from "@viz/cli/src/types/erd.type";
import { Hono } from "hono";
import { serveStatic } from "hono/bun";

export const PORT = 4000;
const distPath = path.resolve(import.meta.dir, "../view/build/client");

export const createServer = (erdData: ErdResult) => {
	const app = new Hono()
		.use("*", async (c, next) => {
			c.header("Access-Control-Allow-Origin", "*");
			c.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
			c.header("Access-Control-Allow-Headers", "Content-Type");
			await next();
		})
		.use("/*", serveStatic({ root: distPath }))
		.get("/api/diagram", (c) => {
			return c.json({
				data: erdData,
			});
		});

	return app;
};
