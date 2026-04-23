import type {
  AdminAuthHeader,
  CreateMeetingRequest,
  JoinRequest,
  ManageMeetingParams,
  MeetingMetadataParams,
} from "../routes/meeting.schema";
import { HTTPException } from "hono/http-exception";
import { getServerEnv } from "../lib/env";
import {
  activeSessionResponseSchema,
  issueTokenResponseSchema,
  meetingListResponseSchema,
  meetingMetadataResponseSchema,
  meetingResponseSchema,
} from "../lib/schema";

type ManagedMeeting = {
  meetingId: string;
  meetingTitle: string | null;
  status: string | null;
  createdAt: string | null;
};

type MeetingMetadataBody = {
  meetingId: string;
  meetingTitle: string | null;
  liveParticipants: number;
  isLive: boolean;
};

type MeetingListBody = { meetings: ManagedMeeting[] };
type JoinMeetingBody = { authToken: string };

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

function mapMeeting(meeting: {
  id: string;
  title?: string | null;
  status?: string | null;
  created_at?: string | null;
}): ManagedMeeting {
  return {
    meetingId: meeting.id,
    meetingTitle: meeting.title ?? null,
    status: meeting.status ?? null,
    createdAt: meeting.created_at ?? null,
  };
}

function jsonError(status: 401 | 500, error: string, details?: unknown): never {
  throw new HTTPException(status, {
    res: Response.json(
      details === undefined ? { error } : { error, details },
      { status },
    ),
  });
}

function verifyAdmin(env: Env, headers: AdminAuthHeader) {
  const { ADMIN_TOKEN } = getServerEnv(env);

  if (!ADMIN_TOKEN) {
    jsonError(500, "未配置 ADMIN_TOKEN");
  }

  const token = headers.authorization?.startsWith("Bearer ")
    ? headers.authorization.slice("Bearer ".length).trim()
    : "";

  if (token !== ADMIN_TOKEN) {
    jsonError(401, "管理密码不正确");
  }
}

async function readErrorResponse(res: Response) {
  return res.json().catch(() => null);
}

export async function getMeetingMetadataHandler(
  env: Env,
  params: MeetingMetadataParams,
): Promise<MeetingMetadataBody> {
  const { CLOUDFLARE_ACCOUNT_ID, REALTIME_APP_ID, REALTIME_API_TOKEN } =
    getServerEnv(env);

  const meetingRes = await fetch(
    cloudflareRealtimeKitUrl(
      CLOUDFLARE_ACCOUNT_ID,
      REALTIME_APP_ID,
      `/meetings/${params.meetingId}`,
    ),
    { headers: realtimeKitHeaders(REALTIME_API_TOKEN) },
  );

  if (!meetingRes.ok) {
    jsonError(500, "获取会议信息失败", await readErrorResponse(meetingRes));
  }

  const meetingData = meetingMetadataResponseSchema.parse(await meetingRes.json());
  const meetingMetadata = meetingData.data;

  const activeSessionRes = await fetch(
    cloudflareRealtimeKitUrl(
      CLOUDFLARE_ACCOUNT_ID,
      REALTIME_APP_ID,
      `/meetings/${params.meetingId}/active-session`,
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
    jsonError(
      500,
      "获取会议在线状态失败",
      await readErrorResponse(activeSessionRes),
    );
  }

  return {
    meetingId: meetingMetadata.id,
    meetingTitle: meetingMetadata.title ?? null,
    liveParticipants,
    isLive,
  };
}

export async function listMeetingsHandler(
  env: Env,
  headers: AdminAuthHeader,
): Promise<MeetingListBody> {
  verifyAdmin(env, headers);

  const { CLOUDFLARE_ACCOUNT_ID, REALTIME_APP_ID, REALTIME_API_TOKEN } =
    getServerEnv(env);

  const meetingsRes = await fetch(
    cloudflareRealtimeKitUrl(CLOUDFLARE_ACCOUNT_ID, REALTIME_APP_ID, "/meetings"),
    { headers: realtimeKitHeaders(REALTIME_API_TOKEN) },
  );

  if (!meetingsRes.ok) {
    jsonError(500, "获取会议列表失败", await readErrorResponse(meetingsRes));
  }

  const meetingsData = meetingListResponseSchema.parse(await meetingsRes.json());

  return { meetings: meetingsData.data.map(mapMeeting) };
}

export async function createMeetingHandler(
  env: Env,
  headers: AdminAuthHeader,
  json: CreateMeetingRequest,
): Promise<ManagedMeeting> {
  verifyAdmin(env, headers);

  const { CLOUDFLARE_ACCOUNT_ID, REALTIME_APP_ID, REALTIME_API_TOKEN } =
    getServerEnv(env);

  const meetingRes = await fetch(
    cloudflareRealtimeKitUrl(CLOUDFLARE_ACCOUNT_ID, REALTIME_APP_ID, "/meetings"),
    {
      method: "POST",
      headers: realtimeKitHeaders(REALTIME_API_TOKEN),
      body: JSON.stringify({ title: json.title }),
    },
  );

  if (!meetingRes.ok) {
    jsonError(500, "创建会议失败", await readErrorResponse(meetingRes));
  }

  const meetingData = meetingResponseSchema.parse(await meetingRes.json());

  return mapMeeting(meetingData.data);
}

export async function deactivateMeetingHandler(
  env: Env,
  headers: AdminAuthHeader,
  params: ManageMeetingParams,
): Promise<ManagedMeeting> {
  verifyAdmin(env, headers);

  const { CLOUDFLARE_ACCOUNT_ID, REALTIME_APP_ID, REALTIME_API_TOKEN } =
    getServerEnv(env);

  const meetingRes = await fetch(
    cloudflareRealtimeKitUrl(
      CLOUDFLARE_ACCOUNT_ID,
      REALTIME_APP_ID,
      `/meetings/${params.meetingId}`,
    ),
    {
      method: "PATCH",
      headers: realtimeKitHeaders(REALTIME_API_TOKEN),
      body: JSON.stringify({ status: "INACTIVE" }),
    },
  );

  if (!meetingRes.ok) {
    jsonError(500, "停用会议失败", await readErrorResponse(meetingRes));
  }

  const meetingData = meetingResponseSchema.parse(await meetingRes.json());

  return mapMeeting(meetingData.data);
}

export async function joinMeetingHandler(
  env: Env,
  json: JoinRequest,
): Promise<JoinMeetingBody> {
  const { CLOUDFLARE_ACCOUNT_ID, REALTIME_APP_ID, REALTIME_API_TOKEN } =
    getServerEnv(env);

  const tokenRes = await fetch(
    cloudflareRealtimeKitUrl(
      CLOUDFLARE_ACCOUNT_ID,
      REALTIME_APP_ID,
      `/meetings/${json.meetingId}/participants`,
    ),
    {
      method: "POST",
      headers: realtimeKitHeaders(REALTIME_API_TOKEN),
      body: JSON.stringify({
        name: json.userName,
        custom_participant_id: json.userId,
        preset_name: "group_call_participant",
      }),
    },
  );

  if (!tokenRes.ok) {
    jsonError(500, "加入失败", await readErrorResponse(tokenRes));
  }

  const tokenData = issueTokenResponseSchema.parse(await tokenRes.json());
  const authToken = tokenData.token ?? tokenData.auth_token ?? tokenData.data?.token;

  if (!authToken) {
    jsonError(500, "获取 token 失败");
  }

  return { authToken };
}
