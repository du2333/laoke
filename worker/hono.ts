import { Hono } from "hono";
import { roomsRoute } from "./routes/rooms";

const app = new Hono<{ Bindings: Env }>().route("/api/rooms", roomsRoute);

export type AppType = typeof app;
export default app;
