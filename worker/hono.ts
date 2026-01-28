import { Hono } from "hono";
import { realtime } from "./lib/realtime";

const app = new Hono<{ Bindings: Env }>().route("/api", realtime);

export type AppType = typeof app;
export default app;
