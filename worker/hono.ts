import { Hono } from "hono";
import { meetingRoute } from "./routes/meeting";

const app = new Hono<{ Bindings: Env }>().route("/api", meetingRoute);

export type AppType = typeof app;
export default app;
