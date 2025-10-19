import path from "node:path";
import { fileURLToPath } from "node:url";
import { serveStatic } from "@hono/node-server/serve-static";
import type { ErdResult } from "@viz/cli/src/types/erd.type";
import { Hono } from "hono";

export const PORT = 2000;

// path for the build client to serve static files
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const distPath = process.env.VIEW_BUILD_PATH || path.resolve(__dirname, "../view-build");

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
