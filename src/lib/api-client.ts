import type { AppType } from "../../worker/hono";
import { hc } from "hono/client";

export const api = hc<AppType>("/");
