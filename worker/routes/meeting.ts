import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import { getServerEnv } from "../lib/env";
import {
  activeSessionResponseSchema,
  issueTokenResponseSchema,
  meetingMetadataResponseSchema,
} from "../lib/schema";

const joinRequestSchema = z.object({
  meetingId: z.string().min(1),
  userId: z.string().min(1),
  userName: z.string().min(1).max(20),
});

const meetingMetadataParamsSchema = z.object({
  meetingId: z.string().min(1),
});

export const meetingRoute = new Hono<{ Bindings: Env }>()
  .get(
    "/meeting/:meetingId/metadata",
    zValidator("param", meetingMetadataParamsSchema),
    async (c) => {
      const { meetingId } = c.req.valid("param");
      const { CLOUDFLARE_ACCOUNT_ID, REALTIME_APP_ID, REALTIME_API_TOKEN } =
        getServerEnv(c.env);

      const meetingRes = await fetch(
        `https://api.cloudflare.com/client/v4/accounts/${CLOUDFLARE_ACCOUNT_ID}/realtime/kit/${REALTIME_APP_ID}/meetings/${meetingId}`,
        {
          headers: {
            Authorization: `Bearer ${REALTIME_API_TOKEN}`,
            "Content-Type": "application/json",
          },
        },
      );

      if (!meetingRes.ok) {
        const err = await meetingRes.json();
        return c.json({ error: "获取会议信息失败", details: err }, 500);
      }

      const meetingData = meetingMetadataResponseSchema.parse(
        await meetingRes.json(),
      );
      const meetingMetadata = meetingData.data;

      const activeSessionRes = await fetch(
        `https://api.cloudflare.com/client/v4/accounts/${CLOUDFLARE_ACCOUNT_ID}/realtime/kit/${REALTIME_APP_ID}/meetings/${meetingId}/active-session`,
        {
          headers: {
            Authorization: `Bearer ${REALTIME_API_TOKEN}`,
            "Content-Type": "application/json",
          },
        },
      );

      let liveParticipants = 0;
      let isLive = false;

      if (activeSessionRes.ok) {
        const activeSessionData = activeSessionResponseSchema.parse(
          await activeSessionRes.json(),
        );
        liveParticipants = Math.max(
          0,
          Math.trunc(activeSessionData.data.live_participants),
        );
        isLive = true;
      } else if (activeSessionRes.status !== 404) {
        const err = await activeSessionRes.json();
        return c.json({ error: "获取会议在线状态失败", details: err }, 500);
      }

      return c.json({
        meetingId: meetingMetadata.id,
        meetingTitle: meetingMetadata.title ?? null,
        liveParticipants,
        isLive,
      });
    },
  )
  .post(
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
