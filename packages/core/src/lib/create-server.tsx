import path from "node:path";
import { fileURLToPath } from "node:url";
import { serveStatic } from "@hono/node-server/serve-static";
import { Hono } from "hono";

import type { ErdResult } from "../types/erd.type";

const getDistPath = () => {
	if (process.env.NODE_ENV === "development") {
		const __dirname = path.dirname(fileURLToPath(import.meta.url));
		return path.resolve(__dirname, "../../view-build");
	}

	const __dirname = path.dirname(fileURLToPath(import.meta.url));
	return path.resolve(__dirname, "../view-build");
};

const distPath = getDistPath();

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
