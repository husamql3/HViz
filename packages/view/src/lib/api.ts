import { hc } from "hono/client";
import type { AppType } from "../../../cli/src/create-server";

export const api = hc<AppType>("http://localhost:3000") as ReturnType<typeof hc<AppType>>;