import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import type { Context } from "hono";
import {
  createMeetingHandler,
  deactivateMeetingHandler,
  getMeetingMetadataHandler,
  joinMeetingHandler,
  listMeetingsHandler,
} from "../handlers/meeting";
import {
  adminAuthHeaderSchema,
  createMeetingRequestSchema,
  joinRequestSchema,
  manageMeetingParamsSchema,
  meetingMetadataParamsSchema,
} from "./meeting.schema";

function jsonResult<T>(c: Context<{ Bindings: Env }>, body: T) {
  return c.json(body);
}

function adminHeaders(c: { req: { header: (name: string) => string | undefined } }) {
  return adminAuthHeaderSchema.parse({
    authorization: c.req.header("Authorization"),
  });
}

export const meetingRoute = new Hono<{ Bindings: Env }>()
  .get(
    "/meeting/:meetingId/metadata",
    zValidator("param", meetingMetadataParamsSchema),
    async (c) => {
      const result = await getMeetingMetadataHandler(
        c.env,
        c.req.valid("param"),
      );
      return jsonResult(c, result);
    },
  )
  .get("/admin/meetings", async (c) => {
    const result = await listMeetingsHandler(c.env, adminHeaders(c));
    return jsonResult(c, result);
  })
  .post(
    "/admin/meetings",
    zValidator("json", createMeetingRequestSchema),
    async (c) => {
      const result = await createMeetingHandler(
        c.env,
        adminHeaders(c),
        c.req.valid("json"),
      );
      return jsonResult(c, result);
    },
  )
  .patch(
    "/admin/meetings/:meetingId/deactivate",
    zValidator("param", manageMeetingParamsSchema),
    async (c) => {
      const result = await deactivateMeetingHandler(
        c.env,
        adminHeaders(c),
        c.req.valid("param"),
      );
      return jsonResult(c, result);
    },
  )
  .post("/join", zValidator("json", joinRequestSchema), async (c) => {
    const result = await joinMeetingHandler(c.env, c.req.valid("json"));
    return jsonResult(c, result);
  });
