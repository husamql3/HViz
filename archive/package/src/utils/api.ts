import { hc } from "hono/client";
import type { AppType } from "@/types/app.type";

export const api = hc<AppType>("http://localhost:3000")