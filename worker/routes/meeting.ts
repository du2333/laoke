import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import { getServerEnv } from "../lib/env";
import { issueTokenResponseSchema } from "../lib/schema";

const joinRequestSchema = z.object({
  meetingId: z.string().min(1),
  userId: z.string().min(1),
  userName: z.string().min(1).max(20),
});

export const meetingRoute = new Hono<{ Bindings: Env }>().post(
  "/join",
  zValidator("json", joinRequestSchema),
  async (c) => {
    const { meetingId, userId, userName } = c.req.valid("json");
    const { CLOUDFLARE_ACCOUNT_ID, REALTIME_APP_ID, REALTIME_API_TOKEN } =
      getServerEnv(c.env);

    const tokenRes = await fetch(
      `https://api.cloudflare.com/client/v4/accounts/${CLOUDFLARE_ACCOUNT_ID}/realtime/kit/${REALTIME_APP_ID}/meetings/${meetingId}/participants`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${REALTIME_API_TOKEN}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: userName,
          custom_participant_id: userId,
          preset_name: "group_call_participant",
        }),
      },
    );

    if (!tokenRes.ok) {
      const err = await tokenRes.json();
      return c.json({ error: "加入失败", details: err }, 500);
    }

    const tokenData = issueTokenResponseSchema.parse(await tokenRes.json());
    const authToken =
      tokenData.token ?? tokenData.auth_token ?? tokenData.data?.token;

    if (!authToken) {
      return c.json({ error: "获取 token 失败" }, 500);
    }

    return c.json({ authToken });
  },
);
