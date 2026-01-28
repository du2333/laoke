import { Hono } from "hono";
const app = new Hono<{ Bindings: Env }>().get("/api/hello", (c) =>
  c.json({ message: "Hello Cloudflare Workers!" }),
);

export type AppType = typeof app;
export default app;
