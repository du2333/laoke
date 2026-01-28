import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import { getServerEnv } from "./env";
import {
  createMeetingResponseSchema,
  issueTokenResponseSchema,
  listPresetsResponseSchema,
} from "./schema";

export const realtime = new Hono<{ Bindings: Env }>()
  .post(
    "/meetings",
    zValidator("json", z.object({ title: z.string() })),
    async (c) => {
      const { title } = c.req.valid("json");
      const { CLOUDFLARE_ACCOUNT_ID, REALTIME_APP_ID, REALTIME_API_TOKEN } =
        getServerEnv(c.env);

      const response = await fetch(
        `https://api.cloudflare.com/client/v4/accounts/${CLOUDFLARE_ACCOUNT_ID}/realtime/${REALTIME_APP_ID}/meetings`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${REALTIME_API_TOKEN}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ title }),
        },
      );

      if (!response.ok) {
        const err = await response.json();
        return c.json(
          {
            error: "Failed to create meeting",
            details: err,
          },
          500,
        );
      }

      const data = await response.json();
      return c.json(createMeetingResponseSchema.parse(data));
    },
  )
  .post(
    "/tokens",
    zValidator(
      "json",
      z.object({
        meetingId: z.string(),
        userId: z.string(),
        userName: z.string().optional(),
        presetName: z.string().optional(),
      }),
    ),
    async (c) => {
      const input = c.req.valid("json");
      const { CLOUDFLARE_ACCOUNT_ID, REALTIME_APP_ID, REALTIME_API_TOKEN } =
        getServerEnv(c.env);

      const response = await fetch(
        `https://api.cloudflare.com/client/v4/accounts/${CLOUDFLARE_ACCOUNT_ID}/realtime/${REALTIME_APP_ID}/meetings/${input.meetingId}/participants`,
        {
          method: "POST",
          headers: {
            authorization: `Bearer ${REALTIME_API_TOKEN}`,
            "content-type": "application/json",
          },
          body: JSON.stringify({
            name: input.userName,
            preset_name: input.presetName,
            custom_participant_id: input.userId,
          }),
        },
      );

      if (!response.ok) {
        const err = await response.json();
        return c.json(
          {
            error: "Failed to issue token",
            details: err,
          },
          500,
        );
      }

      const data = await response.json();
      return c.json(issueTokenResponseSchema.parse(data));
    },
  )
  .get("/presets", async (c) => {
    const { CLOUDFLARE_ACCOUNT_ID, REALTIME_APP_ID, REALTIME_API_TOKEN } =
      getServerEnv(c.env);

    const response = await fetch(
      `https://api.cloudflare.com/client/v4/accounts/${CLOUDFLARE_ACCOUNT_ID}/realtime/${REALTIME_APP_ID}/presets`,
      {
        headers: { authorization: `Bearer ${REALTIME_API_TOKEN}` },
      },
    );

    if (!response.ok) {
      const err = await response.json();
      return c.json(
        {
          error: "Failed to list presets",
          details: err,
        },
        500,
      );
    }

    const data = await response.json();
    const result = listPresetsResponseSchema.parse(data);
    const items = Array.isArray(result)
      ? result
      : (result.result ?? result.data ?? []);

    const presets = Array.isArray(items)
      ? items.map((p) => ({
          id: p.id ?? p.preset_id ?? p.name!,
          name: p.name ?? p.id!,
        }))
      : [];
    return c.json({
      presets,
    });
  });
