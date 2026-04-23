import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import { getServerEnv } from "../lib/env";
import {
  activeSessionResponseSchema,
  issueTokenResponseSchema,
  meetingListResponseSchema,
  meetingMetadataResponseSchema,
  meetingResponseSchema,
} from "../lib/schema";

const joinRequestSchema = z.object({
  meetingId: z.string().min(1),
  userId: z.string().min(1),
  userName: z.string().min(1).max(20),
});

const meetingMetadataParamsSchema = z.object({
  meetingId: z.string().min(1),
});

const adminAuthSchema = z.object({
  authorization: z.string().optional(),
});

const createMeetingRequestSchema = z.object({
  title: z.string().trim().min(1).max(80),
});

const manageMeetingParamsSchema = z.object({
  meetingId: z.string().min(1),
});

const cloudflareRealtimeKitUrl = (
  accountId: string,
  appId: string,
  path = "",
) =>
  `https://api.cloudflare.com/client/v4/accounts/${accountId}/realtime/kit/${appId}${path}`;

function realtimeKitHeaders(apiToken: string) {
  return {
    Authorization: `Bearer ${apiToken}`,
    "Content-Type": "application/json",
  };
}

function verifyAdmin(c: { req: { header: (name: string) => string | undefined }; env: Env }) {
  const { ADMIN_TOKEN } = getServerEnv(c.env);

  if (!ADMIN_TOKEN) {
    return { ok: false as const, response: cJson(500, "未配置 ADMIN_TOKEN") };
  }

  const authHeader = adminAuthSchema.parse({
    authorization: c.req.header("Authorization"),
  }).authorization;
  const token = authHeader?.startsWith("Bearer ")
    ? authHeader.slice("Bearer ".length).trim()
    : "";

  if (token !== ADMIN_TOKEN) {
    return { ok: false as const, response: cJson(401, "管理密码不正确") };
  }

  return { ok: true as const };
}

function cJson(status: 401 | 500, error: string) {
  return new Response(JSON.stringify({ error }), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

export const meetingRoute = new Hono<{ Bindings: Env }>()
  .get(
    "/meeting/:meetingId/metadata",
    zValidator("param", meetingMetadataParamsSchema),
    async (c) => {
      const { meetingId } = c.req.valid("param");
      const { CLOUDFLARE_ACCOUNT_ID, REALTIME_APP_ID, REALTIME_API_TOKEN } =
        getServerEnv(c.env);

      const meetingRes = await fetch(
        cloudflareRealtimeKitUrl(
          CLOUDFLARE_ACCOUNT_ID,
          REALTIME_APP_ID,
          `/meetings/${meetingId}`,
        ),
        { headers: realtimeKitHeaders(REALTIME_API_TOKEN) },
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
        cloudflareRealtimeKitUrl(
          CLOUDFLARE_ACCOUNT_ID,
          REALTIME_APP_ID,
          `/meetings/${meetingId}/active-session`,
        ),
        { headers: realtimeKitHeaders(REALTIME_API_TOKEN) },
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
  .get("/admin/meetings", async (c) => {
    const admin = verifyAdmin(c);
    if (!admin.ok) return admin.response;

    const { CLOUDFLARE_ACCOUNT_ID, REALTIME_APP_ID, REALTIME_API_TOKEN } =
      getServerEnv(c.env);

    const meetingsRes = await fetch(
      cloudflareRealtimeKitUrl(
        CLOUDFLARE_ACCOUNT_ID,
        REALTIME_APP_ID,
        "/meetings",
      ),
      { headers: realtimeKitHeaders(REALTIME_API_TOKEN) },
    );

    if (!meetingsRes.ok) {
      const err = await meetingsRes.json();
      return c.json({ error: "获取会议列表失败", details: err }, 500);
    }

    const meetingsData = meetingListResponseSchema.parse(await meetingsRes.json());

    return c.json({
      meetings: meetingsData.data.map((meeting) => ({
        meetingId: meeting.id,
        meetingTitle: meeting.title ?? null,
        status: meeting.status ?? null,
        createdAt: meeting.created_at ?? null,
      })),
    });
  })
  .post(
    "/admin/meetings",
    zValidator("json", createMeetingRequestSchema),
    async (c) => {
      const admin = verifyAdmin(c);
      if (!admin.ok) return admin.response;

      const { title } = c.req.valid("json");
      const { CLOUDFLARE_ACCOUNT_ID, REALTIME_APP_ID, REALTIME_API_TOKEN } =
        getServerEnv(c.env);

      const meetingRes = await fetch(
        cloudflareRealtimeKitUrl(
          CLOUDFLARE_ACCOUNT_ID,
          REALTIME_APP_ID,
          "/meetings",
        ),
        {
          method: "POST",
          headers: realtimeKitHeaders(REALTIME_API_TOKEN),
          body: JSON.stringify({ title }),
        },
      );

      if (!meetingRes.ok) {
        const err = await meetingRes.json();
        return c.json({ error: "创建会议失败", details: err }, 500);
      }

      const meetingData = meetingResponseSchema.parse(await meetingRes.json());
      const meeting = meetingData.data;

      return c.json({
        meetingId: meeting.id,
        meetingTitle: meeting.title ?? null,
        status: meeting.status ?? null,
        createdAt: meeting.created_at ?? null,
      });
    },
  )
  .patch(
    "/admin/meetings/:meetingId/deactivate",
    zValidator("param", manageMeetingParamsSchema),
    async (c) => {
      const admin = verifyAdmin(c);
      if (!admin.ok) return admin.response;

      const { meetingId } = c.req.valid("param");
      const { CLOUDFLARE_ACCOUNT_ID, REALTIME_APP_ID, REALTIME_API_TOKEN } =
        getServerEnv(c.env);

      const meetingRes = await fetch(
        cloudflareRealtimeKitUrl(
          CLOUDFLARE_ACCOUNT_ID,
          REALTIME_APP_ID,
          `/meetings/${meetingId}`,
        ),
        {
          method: "PATCH",
          headers: realtimeKitHeaders(REALTIME_API_TOKEN),
          body: JSON.stringify({ status: "INACTIVE" }),
        },
      );

      if (!meetingRes.ok) {
        const err = await meetingRes.json();
        return c.json({ error: "停用会议失败", details: err }, 500);
      }

      const meetingData = meetingResponseSchema.parse(await meetingRes.json());
      const meeting = meetingData.data;

      return c.json({
        meetingId: meeting.id,
        meetingTitle: meeting.title ?? null,
        status: meeting.status ?? null,
        createdAt: meeting.created_at ?? null,
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
        cloudflareRealtimeKitUrl(
          CLOUDFLARE_ACCOUNT_ID,
          REALTIME_APP_ID,
          `/meetings/${meetingId}/participants`,
        ),
        {
          method: "POST",
          headers: realtimeKitHeaders(REALTIME_API_TOKEN),
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
